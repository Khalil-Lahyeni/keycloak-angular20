import org.springframework.security.web.server.authentication.logout.ServerLogoutHandler;
import org.springframework.security.web.server.authentication.logout.SecurityContextServerLogoutHandler;
import org.springframework.security.web.server.authentication.logout.WebSessionServerLogoutHandler;
import org.springframework.http.ResponseCookie;
import reactor.core.publisher.Mono;



logoutHandler(deleteCookiesLogoutHandler())

@Bean
public ServerLogoutHandler deleteCookiesLogoutHandler() {
    return new DelegatingServerLogoutHandler(
        new WebSessionServerLogoutHandler(),       // invalide la session (= invalidateHttpSession)
        new SecurityContextServerLogoutHandler(),  // clear le SecurityContext
        cookiesClearingLogoutHandler("JSESSIONID", "grafana_session", "grafana_session_expiry")
    );
}

private ServerLogoutHandler cookiesClearingLogoutHandler(String... cookieNames) {
    return (exchange, authentication) -> {
        ServerHttpResponse response = exchange.getExchange().getResponse();

        for (String cookieName : cookieNames) {
            ResponseCookie expiredCookie = ResponseCookie.from(cookieName, "")
                .maxAge(Duration.ZERO)   // expire immédiatement
                .path("/")
                .httpOnly(false)
                .build();
            response.addCookie(expiredCookie);
        }

        return Mono.empty();
    };
}
