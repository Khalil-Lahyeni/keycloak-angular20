package com.fleetmanagement.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    /**
     * Configuration de la sécurité :
     * - Les endpoints publics (actuator/health, actuator/info) sont accessibles sans token
     * - Tous les autres endpoints nécessitent un JWT valide émis par Keycloak
     * - Le JWT est validé via la clé publique de Keycloak (jwk-set-uri dans application.yml)
     */
    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)

            .authorizeExchange(exchanges -> exchanges
                // Endpoints publics
                .pathMatchers("/actuator/health", "/actuator/info").permitAll()
                // Tout le reste nécessite une authentification
                .anyExchange().authenticated()
            )

            // Validation JWT via Keycloak (jwk-set-uri configuré dans application.yml)
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> {}) // utilise spring.security.oauth2.resourceserver.jwt.jwk-set-uri
            );

        return http.build();
    }
}
