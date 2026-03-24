package com.fleetmanagement.gateway.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class UserInfoController {

    /**
     * Endpoint appelé par Angular pour récupérer les infos utilisateur.
     *
     * Angular envoie son cookie SESSION → Gateway lit la session Redis
     * → retourne les infos du JWT sans jamais exposer le JWT à Angular.
     *
     * Réponse :
     * {
     *   "sub":                "uuid-keycloak",
     *   "preferred_username": "john",
     *   "email":              "john@example.com",
     *   "given_name":         "John",
     *   "family_name":        "Doe",
     *   "roles":              ["OPERATEUR", "..."]
     * }
     */
    @GetMapping("/userinfo")
    public Mono<Map<String, Object>> userInfo(
        @AuthenticationPrincipal OidcUser oidcUser
    ) {
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("sub",                oidcUser.getSubject());
        userInfo.put("preferred_username", oidcUser.getPreferredUsername());
        userInfo.put("email",              oidcUser.getEmail());
        userInfo.put("given_name",         oidcUser.getGivenName());
        userInfo.put("family_name",        oidcUser.getFamilyName());

        // Extraction des rôles depuis le token Keycloak
        Map<String, Object> claims = oidcUser.getClaims();
        if (claims.containsKey("realm_access")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> realmAccess = (Map<String, Object>) claims.get("realm_access");
            userInfo.put("roles", realmAccess.get("roles"));
        }

        return Mono.just(userInfo);
    }

    /**
     * Endpoint de login — déclenche la redirection OAuth2 vers Keycloak.
     * Appelé par le Guard Angular quand la session est expirée.
     */
    @GetMapping("/login")
    public Mono<Void> login() {
        // Spring Security intercepte cette route et redirige vers Keycloak
        // si l'utilisateur n'est pas authentifié (configuré dans SecurityConfig)
        return Mono.empty();
    }
}
