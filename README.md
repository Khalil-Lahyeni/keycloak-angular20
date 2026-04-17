package com.actia.fleetmanagement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.oidc.web.server.logout.OidcClientInitiatedServerLogoutSuccessHandler;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.HttpStatusServerEntryPoint;
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository;
import org.springframework.security.web.server.util.matcher.PathPatternParserServerWebExchangeMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebFluxSecurity  // ← remplace @EnableWebSecurity
public class SecurityConfig {

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Value("${app.frontend.app-url}")
    private String frontendAppUrl;

    @Bean
    public SecurityWebFilterChain securityFilterChain(  // ← SecurityWebFilterChain
            ServerHttpSecurity http,                     // ← ServerHttpSecurity
            ReactiveClientRegistrationRepository clientRegistrationRepository  // ← Reactive
    ) {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse())  // ← CookieServerCsrf...
            )
            .authorizeExchange(auth -> auth  // ← authorizeExchange (pas authorizeHttpRequests)
                .anyExchange().authenticated()  // ← anyExchange (pas anyRequest)
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(
                    new HttpStatusServerEntryPoint(HttpStatus.UNAUTHORIZED)  // ← HttpStatusServerEntryPoint
                )
            )
            .oauth2Login(oauth2 -> oauth2
                .authenticationSuccessHandler(
                    new RedirectServerAuthenticationSuccessHandler(frontendAppUrl)  // ← RedirectServer...
                )
                .authenticationFailureHandler(
                    new RedirectServerAuthenticationFailureHandler(frontendAppUrl)  // ← RedirectServer...
                )
            )
            .logout(logout -> logout
                .logoutSuccessHandler(oidcLogoutSuccessHandler(clientRegistrationRepository))
                .requiresLogout(new PathPatternParserServerWebExchangeMatcher("/logout"))  // ← ServerWebExchangeMatcher
            );

        return http.build();
    }

    @Bean
    public OidcClientInitiatedServerLogoutSuccessHandler oidcLogoutSuccessHandler(  // ← Server variant
            ReactiveClientRegistrationRepository clientRegistrationRepository
    ) {
        OidcClientInitiatedServerLogoutSuccessHandler handler =
            new OidcClientInitiatedServerLogoutSuccessHandler(clientRegistrationRepository);
        handler.setPostLogoutRedirectUri(frontendBaseUrl);
        return handler;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {  // ← reactive CorsConfigurationSource
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(frontendBaseUrl));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();  // ← reactive package
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
