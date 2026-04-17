package actia.api_gateway.security;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.DelegatingServerAuthenticationEntryPoint;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.HttpStatusServerEntryPoint;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationEntryPoint;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.server.WebFilter;

import reactor.core.publisher.Mono;

/**
 * Gateway security configuration.
 *
 * - OAuth2 login via Keycloak (authorization code flow)
 * - Session stored in Redis (cookie SESSION)
 * - Custom GET /logout : invalidates session + redirects to Keycloak end_session
 * - Login error (?error) handled to avoid Spring's default /login?error → 404
 * - Grafana (/grafana/**) bypasses security : Grafana has its own OAuth flow with Keycloak
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private static final String FRONTEND_REDIRECT_ATTR = "FRONTEND_REDIRECT_URI";

    private static final String KEYCLOAK_LOGOUT_URL =
            "http://localhost:8080/realms/fleet-management/protocol/openid-connect/logout";

    private final URI frontendUrl;

    public SecurityConfig(@Value("${app.security.frontend-url:http://localhost:4200}") String frontendUrl) {
        this.frontendUrl = URI.create(frontendUrl);
    }

    // ═══════════════════════════════════════════════════════════════
    //  Main security chain
    // ═══════════════════════════════════════════════════════════════

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers("/actuator/health", "/actuator/info", "/error", "/favicon.ico").permitAll()
                        .pathMatchers("/oauth2/**", "/login/**", "/api/public/**").permitAll()
                        .pathMatchers("/logout").permitAll()
                        .pathMatchers("/grafana/**").permitAll()
                        .anyExchange().authenticated()
                )
                .exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint()))
                .oauth2Login(oauth2 -> oauth2.authenticationSuccessHandler(loginSuccessHandler()))
                .build();
    }

    /**
     * /api/** → 401 JSON, everything else → redirect to Keycloak login.
     */
    private DelegatingServerAuthenticationEntryPoint authenticationEntryPoint() {
        DelegatingServerAuthenticationEntryPoint entryPoint = new DelegatingServerAuthenticationEntryPoint(
                new DelegatingServerAuthenticationEntryPoint.DelegateEntry(
                        new PathPatternParserServerWebExchangeMatcher("/api/**"),
                        new HttpStatusServerEntryPoint(HttpStatus.UNAUTHORIZED))
        );
        entryPoint.setDefaultEntryPoint(
                new RedirectServerAuthenticationEntryPoint("/oauth2/authorization/keycloak"));
        return entryPoint;
    }

    /**
     * After successful login : redirect to the frontend URL the user originally requested
     * (stored in session by frontendRedirectCaptureFilter), fallback to default frontend URL.
     */
    private ServerAuthenticationSuccessHandler loginSuccessHandler() {
        return (webFilterExchange, authentication) -> webFilterExchange.getExchange().getSession()
                .flatMap(session -> {
                    URI target = frontendUrl;
                    Object stored = session.getAttribute(FRONTEND_REDIRECT_ATTR);
                    if (stored instanceof String redirect && StringUtils.hasText(redirect)) {
                        URI candidate = URI.create(redirect);
                        if (isTrustedFrontendRedirect(candidate)) {
                            target = candidate;
                        }
                    }
                    session.getAttributes().remove(FRONTEND_REDIRECT_ATTR);

                    webFilterExchange.getExchange().getResponse().setStatusCode(HttpStatus.FOUND);
                    webFilterExchange.getExchange().getResponse().getHeaders().setLocation(target);
                    return webFilterExchange.getExchange().getResponse().setComplete();
                });
    }

    // ═══════════════════════════════════════════════════════════════
    //  Custom WebFilters
    // ═══════════════════════════════════════════════════════════════

    /**
     * Captures the frontend redirect_uri query param before OAuth2 login,
     * so we can redirect back to it after successful login.
     */
    @Bean
    public WebFilter frontendRedirectCaptureFilter() {
        return (exchange, chain) -> {
            if (!exchange.getRequest().getPath().value().startsWith("/oauth2/authorization/")) {
                return chain.filter(exchange);
            }
            String redirect = exchange.getRequest().getQueryParams().getFirst("redirect_uri");
            if (!StringUtils.hasText(redirect) || !isTrustedFrontendRedirect(URI.create(redirect))) {
                return chain.filter(exchange);
            }
            return exchange.getSession()
                    .doOnNext(s -> s.getAttributes().put(FRONTEND_REDIRECT_ATTR, redirect))
                    .then(chain.filter(exchange));
        };
    }

    /**
     * Handles GET /logout (triggered by Angular via window.location.href).
     *
     * Invalidates the Redis session + clears SESSION cookie + redirects to Keycloak end_session.
     * Works even if the session is already gone (other tab already logged out).
     */
    @Bean
    public WebFilter logoutFilter() {
        return (exchange, chain) -> {
            boolean isGetLogout = exchange.getRequest().getMethod() == HttpMethod.GET
                    && exchange.getRequest().getPath().value().equals("/logout");
            if (!isGetLogout) {
                return chain.filter(exchange);
            }
            return exchange.getSession()
                    .flatMap(session -> session.invalidate())
                    .then(Mono.fromRunnable(() -> {
                        clearSessionCookie(exchange);
                        sendRedirect(exchange, buildKeycloakLogoutUrl());
                    }));
        };
    }

    /**
     * Handles GET /login?error (generated by Spring when OAuth2 state mismatches —
     * typically a 2nd browser tab trying to complete a flow already consumed by tab 1).
     *
     * - Active session → redirect to frontend
     * - No session   → restart a clean Keycloak login
     */
    @Bean
    public WebFilter loginErrorFilter() {
        return (exchange, chain) -> {
            String query = exchange.getRequest().getURI().getQuery();
            boolean isLoginError = exchange.getRequest().getPath().value().equals("/login")
                    && query != null && query.contains("error");
            if (!isLoginError) {
                return chain.filter(exchange);
            }
            return exchange.getSession().flatMap(session -> {
                URI target = session.getAttributes().isEmpty()
                        ? URI.create("/oauth2/authorization/keycloak")
                        : frontendUrl;
                sendRedirect(exchange, target);
                return exchange.getResponse().setComplete();
            });
        };
    }

    // ═══════════════════════════════════════════════════════════════
    //  Helpers
    // ═══════════════════════════════════════════════════════════════

    private URI buildKeycloakLogoutUrl() {
        String postLogout = frontendUrl + "/oauth2/authorization/keycloak";
        String url = KEYCLOAK_LOGOUT_URL
                + "?post_logout_redirect_uri=" + URLEncoder.encode(postLogout, StandardCharsets.UTF_8)
                + "&client_id=actia-app";
        return URI.create(url);
    }

    private void clearSessionCookie(org.springframework.web.server.ServerWebExchange exchange) {
        ResponseCookie cookie = ResponseCookie.from("SESSION", "")
                .path("/")
                .httpOnly(true)
                .maxAge(Duration.ZERO)
                .build();
        exchange.getResponse().addCookie(cookie);
    }

    private void sendRedirect(org.springframework.web.server.ServerWebExchange exchange, URI target) {
        exchange.getResponse().setStatusCode(HttpStatus.FOUND);
        exchange.getResponse().getHeaders().setLocation(target);
    }

    private boolean isTrustedFrontendRedirect(URI candidate) {
        return candidate.getHost() != null
                && candidate.getHost().equalsIgnoreCase(frontendUrl.getHost())
                && normalizePort(candidate) == normalizePort(frontendUrl);
    }

    private int normalizePort(URI uri) {
        if (uri.getPort() != -1) return uri.getPort();
        return "https".equalsIgnoreCase(uri.getScheme()) ? 443 : 80;
    }
}
