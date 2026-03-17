server:
  port: 8888

spring:
  application:
    name: api-gateway

  # ── Validation JWT via Keycloak ──
  security:
    oauth2:
      resourceserver:
        jwt:
          # Keycloak publie ses clés publiques ici
          # Le Gateway les utilise pour valider les tokens JWT sans appel réseau
          jwk-set-uri: ${KEYCLOAK_URL:http://localhost:8080}/realms/${KEYCLOAK_REALM:fleet-realm}/protocol/openid-connect/certs

  # ── CORS configuré dans CorsConfig.java ──

# ── Actuator ──
management:
  endpoints:
    web:
      exposure:
        include: health, info
  endpoint:
    health:
      show-details: always

# ── Logs ──
logging:
  level:
    com.fleetmanagement.gateway: DEBUG
    org.springframework.cloud.gateway: INFO
    org.springframework.security: INFO

---
# ══════════════════════════════
# Profil Docker
# ══════════════════════════════
spring:
  config:
    activate:
      on-profile: docker

  security:
    oauth2:
      resourceserver:
        jwt:
          jwk-set-uri: http://keycloak:8080/realms/${KEYCLOAK_REALM:fleet-realm}/protocol/openid-connect/certs
