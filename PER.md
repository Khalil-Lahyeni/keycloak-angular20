package com.fleetmanagement.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RouteConfig {

    /**
     * Définition des routes vers les micro-services :
     *
     *  /api/collecte/**  →  ms-collecte:8081
     *  /api/alertes/**   →  ms-alertes:8082
     *  /api/ml/**        →  ms-ml:8083
     *
     * Le filtre StripPrefix=2 supprime le préfixe /api/xxx
     * avant de transmettre la requête au micro-service.
     *
     * Exemple :
     *   GET /api/collecte/metrics  →  ms-collecte:8081/metrics
     */
    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder) {
        return builder.routes()

            // ── MS Collecte / Ingestion ──
            .route("ms-collecte", route -> route
                .path("/api/collecte/**")
                .filters(filter -> filter.stripPrefix(2))
                .uri("http://ms-collecte:8081")
            )

            // ── MS Alertes & Notifications ──
            .route("ms-alertes", route -> route
                .path("/api/alertes/**")
                .filters(filter -> filter.stripPrefix(2))
                .uri("http://ms-alertes:8082")
            )

            // ── MS ML / Maintenance Prédictive ──
            .route("ms-ml", route -> route
                .path("/api/ml/**")
                .filters(filter -> filter.stripPrefix(2))
                .uri("http://ms-ml:8083")
            )

            .build();
    }
}
