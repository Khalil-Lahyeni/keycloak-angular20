@startuml Architecture_TelesurveillanceMaintenance

!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

' ── Apparence ──
LAYOUT_TOP_DOWN()
LAYOUT_WITH_LEGEND()

skinparam backgroundColor #080c14
skinparam defaultFontColor #e2eeff
skinparam defaultFontName "Arial"
skinparam defaultFontSize 12
skinparam rectangleBorderColor #1e3a5f
skinparam arrowColor #00d4ff
skinparam arrowFontColor #5a7a9e
skinparam arrowFontSize 10

title Télé-Surveillance & Maintenance Prédictive — Architecture C4 (Container)

' ══════════════════════════════════════════════
' PERSONNES / ACTEURS
' ══════════════════════════════════════════════
Person(operateur,   "Opérateur",          "Surveille les équipements\net consulte les alertes")
Person(technicien,  "Technicien",         "Reçoit les ordres de\nmaintenance prédictive")
Person(admin,       "Administrateur",     "Gère les utilisateurs,\nles équipements et les rôles")

' ══════════════════════════════════════════════
' SYSTÈME EXTERNE — TERRAIN IoT
' ══════════════════════════════════════════════
System_Ext(equipements, "Équipements Terrain", "Capteurs, Automates (PLC),\nPasserelles IoT Edge\n[Protocole : MQTT / TLS]")

' ══════════════════════════════════════════════
' SYSTÈME PRINCIPAL
' ══════════════════════════════════════════════
System_Boundary(sys, "Plateforme Télé-Surveillance & Maintenance Prédictive") {

    ' ── FRONTEND ──
    Container(angular, "Angular Application", "Angular 17 / TypeScript", "SPA — Dashboard temps réel,\ngestion équipements,\nvisualisation Grafana embarquée")

    ' ── IAM ──
    Container(keycloak, "Keycloak IAM", "Keycloak / Docker", "Authentification & Autorisation\nOAuth2 · OIDC · RBAC · SSO\nGestion des rôles et tokens JWT")

    ' ── API GATEWAY ──
    Container(gateway, "API Gateway", "Kong / Spring Cloud Gateway", "Point d'entrée unique\nRoutage, Rate Limiting,\nValidation JWT, Load Balancing")

    ' ── MESSAGERIE EXTERNE ──
    Container(mqtt_broker, "MQTT Broker", "Mosquitto / EMQX / Docker", "Communication avec les équipements\nTopics hiérarchiques\nQoS 0 / 1 / 2")

    ' ── BUS INTERNE ──
    Container(bus_interne, "Bus de Messagerie Interne", "À définir (Kafka / RabbitMQ)", "Communication asynchrone\nentre micro-services\nÉvénements & Streams")

    ' ── MICRO-SERVICES ──
    Container(ms_collecte,     "MS Collecte / Ingestion",      "Spring Boot / Node.js",  "Réception données IoT\nNormalisation & validation\nStockage métriques")
    Container(ms_alertes,      "MS Alertes & Notifications",   "Spring Boot / Node.js",  "Évaluation des seuils\nGénération alertes\nNotifications push / email")
    Container(ms_ml,           "MS ML / Maintenance Prédictive","Python / FastAPI",       "Modèles prédictifs\nDétection d'anomalies\nScore de dégradation équipements")

    ' ── BASES DE DONNÉES ──
    ContainerDb(db_timeseries, "Base Time-Series",   "À définir (InfluxDB / TimescaleDB)", "Métriques capteurs\nDonnées historiques temps réel")
    ContainerDb(db_relationnelle, "Base Relationnelle", "PostgreSQL",                    "Équipements, utilisateurs\nOrdres de maintenance\nConfiguration alertes")
    ContainerDb(cache,         "Cache",              "Redis",                             "Sessions, états actifs\nDonnées chaudes temps réel")

    ' ── OBSERVABILITÉ ──
    Container(grafana,    "Grafana",    "Grafana / Docker",    "Dashboards & graphiques\nVisualisation métriques\nAlerting intégré")
    Container(prometheus, "Prometheus", "Prometheus / Docker", "Collecte métriques système\nHealth checks services\nScraping endpoints")

}

' ══════════════════════════════════════════════
' RELATIONS — UTILISATEURS → SYSTÈME
' ══════════════════════════════════════════════
Rel(operateur,  angular,   "Utilise",          "HTTPS")
Rel(technicien, angular,   "Utilise",          "HTTPS")
Rel(admin,      angular,   "Administre",       "HTTPS")
Rel(admin,      keycloak,  "Configure IAM",    "HTTPS")

' ── AUTHENTIFICATION ──
Rel(angular,  keycloak, "Login / SSO\nValidation token",  "OAuth2 / OIDC")
Rel(gateway,  keycloak, "Valide JWT\nIntrospection token", "HTTPS")

' ── FRONTEND → GATEWAY ──
Rel(angular,  gateway,  "Appels API REST",  "HTTPS / WebSocket")

' ── ÉQUIPEMENTS → MQTT ──
Rel(equipements, mqtt_broker, "Publie données capteurs", "MQTT / TLS")
Rel(mqtt_broker, bus_interne, "Bridge / Forward events", "Connecteur MQTT")

' ── GATEWAY → MICRO-SERVICES ──
Rel(gateway, ms_collecte, "Route",  "REST")
Rel(gateway, ms_alertes,  "Route",  "REST")
Rel(gateway, ms_ml,       "Route",  "REST")

' ── BUS INTERNE → MICRO-SERVICES ──
Rel(bus_interne, ms_collecte, "Événements IoT",          "Subscribe")
Rel(bus_interne, ms_alertes,  "Événements métriques",    "Subscribe")
Rel(bus_interne, ms_ml,       "Stream données capteurs", "Subscribe")

Rel(ms_collecte, bus_interne, "Publie données normalisées", "Publish")
Rel(ms_alertes,  bus_interne, "Publie alertes générées",    "Publish")
Rel(ms_ml,       bus_interne, "Publie prédictions",         "Publish")

' ── MICRO-SERVICES → BASES ──
Rel(ms_collecte, db_timeseries,    "Écrit métriques",      "TCP")
Rel(ms_collecte, cache,            "Cache données chaudes","Redis Protocol")
Rel(ms_alertes,  db_relationnelle, "Lit/Écrit alertes",    "SQL")
Rel(ms_ml,       db_timeseries,    "Lit historique",       "TCP")
Rel(ms_ml,       db_relationnelle, "Écrit prédictions",    "SQL")

' ── OBSERVABILITÉ ──
Rel(grafana,    db_timeseries,    "Lit métriques",         "DataSource API")
Rel(grafana,    prometheus,       "Lit métriques système", "PromQL")
Rel(prometheus, ms_collecte,      "Scrape /metrics",       "HTTP")
Rel(prometheus, ms_alertes,       "Scrape /metrics",       "HTTP")
Rel(prometheus, ms_ml,            "Scrape /metrics",       "HTTP")
Rel(angular,    grafana,          "Embed dashboards",      "iFrame / SDK")

@enduml
