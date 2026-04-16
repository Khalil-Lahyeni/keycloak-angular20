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
