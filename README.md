private ServerLogoutSuccessHandler oidcAndLocalLogoutHandler() {
    OidcClientInitiatedServerLogoutSuccessHandler oidc =
            new OidcClientInitiatedServerLogoutSuccessHandler(clientRegistrationRepository);

    oidc.setPostLogoutRedirectUri("{baseUrl}");

    return (exchange, authentication) -> {
        // Log 1 : Vérifier le type d'authentication
        System.out.println("=== LOGOUT DEBUG ===");
        System.out.println("Authentication type: " + (authentication != null ? authentication.getClass().getName() : "NULL"));

        if (authentication instanceof org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken oauthToken) {
            System.out.println("Principal type: " + oauthToken.getPrincipal().getClass().getName());

            if (oauthToken.getPrincipal() instanceof org.springframework.security.oauth2.core.oidc.user.OidcUser oidcUser) {
                String idToken = oidcUser.getIdToken().getTokenValue();
                System.out.println("id_token PRESENT: " + (idToken != null));
                System.out.println("id_token (premiers 50 chars): " + (idToken != null ? idToken.substring(0, Math.min(50, idToken.length())) : "NULL"));
            } else {
                System.out.println("WARNING: Principal is NOT OidcUser -> pas de id_token !");
            }
        } else {
            System.out.println("WARNING: Authentication is NOT OAuth2AuthenticationToken !");
        }

        // Log 2 : Vérifier la session
        return exchange.getExchange().getSession()
                .doOnNext(session -> {
                    System.out.println("Session ID: " + session.getId());
                    System.out.println("Session attributes: " + session.getAttributes().keySet());
                    session.getAttributes().forEach((key, value) ->
                            System.out.println("  " + key + " -> " + value.getClass().getName()));
                })
                .then(oidc.onLogoutSuccess(exchange, authentication))
                .then(exchange.getExchange().getSession()
                        .flatMap(WebSession::invalidate))
                .then(Mono.fromRunnable(() -> {
                    exchange.getExchange().getResponse().addCookie(
                            ResponseCookie.from("SESSION", "")
                                    .path("/")
                                    .maxAge(0)
                                    .httpOnly(true)
                                    .build());
                }));
    };
}
