@startuml
!theme cerulean

title Architecture Clean Micro-services: Télé-surveillance Ferroviaire

skinparam component {
  BackgroundColor<<Microservice>> LightGreen
  BackgroundColor<<Database>> LightBlue
  BackgroundColor<<Bus>> LightHex(FDFD96)
  BorderColor Black
  FontName Arial
}
skinparam database {
  BackgroundColor LightBlue
}
skinparam node {
  BackgroundColor LightGray
}

package "Source" {
  [Train Device] as TD <<Hardware>>
}

package "Ingestion" {
  queue "Kafka Message Bus" as Kafka <<Bus>>
}

package "Security" {
  [Keycloak IAM (OAuth2/JWT)] as Keycloak <<Identity Provider>>
}

package "Business Logic" {
  frame "Spring Boot Ecosystem" {
    [Gestion & Analyse Service] as GA <<Microservice>>
    [Alertes Service] as AS <<Microservice>>
  }

  [Redis (Speed Layer)] as Redis <<Database>>
  database "PostgreSQL (Batch Layer)" as Postgres <<Database>>

  [Model IA (Python/FastAPI)] as IA <<Microservice>>
}

package "Communication" {
  interface "REST API" as REST
  interface "WebSockets (STOMP/SockJS)" as WS
  [API Gateway (Spring Cloud Gateway)] as Gateway <<Gateway>>
}

package "Presentation" {
  [Angular Frontend] as Angular <<Web App>>
  [Grafana (Visualisation)] as Grafana <<Dashboard>>
}

' --- FUX DE DONNÉES ET CONNEXIONS ---

' Ingestion
TD --> Kafka : MQTT/HTTP Data Ingestion

' Sécurité Transversale
Keycloak -down-> Gateway : Validate JWT
Keycloak -down-> Angular : Authenticate (OIDC)
Keycloak -down-> Grafana : Authenticate (OAuth2)

' Business Logic et Stockage
GA --(0- Kafka : Consume raw data
AS --(0- Kafka : Consume raw data / Produce alerts

GA --> Redis : Write current state
GA --> Postgres : Write history

AS --> Kafka : Produce Alerts

' IA
IA --(0- Kafka : Consume raw data
Postgres -up-> IA : Read historical data (Training)
IA --> Kafka : Produce Predictions (RUL)

' Communication et API
Gateway --> REST
Gateway --> WS

REST --> GA : Fleet management / CRUD
REST --> Postgres : Historical reports
WS --> GA : Live data subscription
WS --> AS : Live alerts

' Présentation
Angular -down-> REST : Fetch data
Angular -down-> WS : Subscribe for live updates
Grafana -down-> REST : Query time-series
Grafana -down-> Postgres : Historical analytics
Angular ..> Grafana : Embed/Link

@enduml