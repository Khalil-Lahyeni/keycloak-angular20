package actia.api_gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.server.WebFilter;
import org.springframework.context.annotation.Bean;

@Configuration
public class RouteConfig {

    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder) {
        return builder.routes()

                // ── Collector Service - Trains ──────────────────────────
                .route("Trains", route -> route
                        .path("/api/trains/**")
                        .filters(filter -> filter
                                .stripPrefix(2)
                                .tokenRelay()
                        )
                        .uri("http://localhost:8881")
                )

                // ── Grafana ─────────────────────────────────────────────
                // Le header X-WEBAUTH-USER est injecté par le WebFilter
                // grafanaAuthHeaderFilter() ci-dessous
                .route("Grafana", route -> route
                        .path("/grafana/**")
                        .filters(filter -> filter
                                .stripPrefix(1)
                                .removeRequestHeader("Cookie")
                        )
                        .uri("http://localhost:3000")
                )

                .build();
    }

    /**
     * WebFilter qui intercepte toutes les requêtes vers /grafana/**
     * et injecte le username de la session Gateway dans le header X-WEBAUTH-USER.
     *
     * Grafana lit ce header (auth.proxy) et connecte l'utilisateur directement.
     * → Pas de session Grafana indépendante
     * → Logout Gateway = Grafana inaccessible immédiatement ✅
     */
    @Bean
    public WebFilter grafanaAuthHeaderFilter() {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getPath().value();

            // Applique uniquement sur les routes /grafana/**
            if (!path.startsWith("/grafana/") && !path.equals("/grafana")) {
                return chain.filter(exchange);
            }

            return ReactiveSecurityContextHolder.getContext()
                    .map(ctx -> ctx.getAuthentication())
                    .flatMap(auth -> {
                        String username = auth.getName();

                        // Mutate la requête pour ajouter le header X-WEBAUTH-USER
                        var mutatedRequest = exchange.getRequest()
                                .mutate()
                                .header("X-WEBAUTH-USER", username)
                                .build();

                        var mutatedExchange = exchange.mutate()
                                .request(mutatedRequest)
                                .build();

                        return chain.filter(mutatedExchange);
                    })
                    // Si pas d'auth (ne devrait pas arriver car /grafana est protégé)
                    .switchIfEmpty(chain.filter(exchange));
        };
    }
}
