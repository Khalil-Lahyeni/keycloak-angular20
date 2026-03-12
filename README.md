version: "3.9"

# ══════════════════════════════════════════════════════════════
#  Fleet-Management — Docker Compose
#  Télé-Surveillance & Maintenance Prédictive
# ══════════════════════════════════════════════════════════════

networks:
  fleet-network:
    driver: bridge

volumes:
  postgres_data:
  influxdb_data:
  zookeeper_data:
  kafka_data:
  mosquitto_data:
  mosquitto_logs:
  keycloak_data:
  grafana_data:

services:

  # ════════════════════════════════
  # 1. BASES DE DONNÉES
  # ════════════════════════════════

  postgres:
    image: postgres:16-alpine
    container_name: fleet-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-fleet_db}
      POSTGRES_USER: ${POSTGRES_USER:-fleet_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-fleet_pass}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - fleet-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-fleet_user}"]
      interval: 10s
      timeout: 5s
      retries: 5

  influxdb:
    image: influxdb:2.7-alpine
    container_name: fleet-influxdb
    restart: unless-stopped
    environment:
      DOCKER_INFLUXDB_INIT_MODE: setup
      DOCKER_INFLUXDB_INIT_USERNAME: ${INFLUXDB_USER:-admin}
      DOCKER_INFLUXDB_INIT_PASSWORD: ${INFLUXDB_PASSWORD:-adminpassword}
      DOCKER_INFLUXDB_INIT_ORG: ${INFLUXDB_ORG:-fleet-org}
      DOCKER_INFLUXDB_INIT_BUCKET: ${INFLUXDB_BUCKET:-fleet-metrics}
      DOCKER_INFLUXDB_INIT_ADMIN_TOKEN: ${INFLUXDB_TOKEN:-my-super-secret-token}
    ports:
      - "8086:8086"
    volumes:
      - influxdb_data:/var/lib/influxdb2
    networks:
      - fleet-network
    healthcheck:
      test: ["CMD", "influx", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ════════════════════════════════
  # 2. MQTT BROKER
  # ════════════════════════════════

  mosquitto:
    image: eclipse-mosquitto:2.0
    container_name: fleet-mosquitto
    restart: unless-stopped
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./messaging/mqtt/mosquitto.conf:/mosquitto/config/mosquitto.conf
      - mosquitto_data:/mosquitto/data
      - mosquitto_logs:/mosquitto/log
    networks:
      - fleet-network

  # ════════════════════════════════
  # 3. KAFKA + ZOOKEEPER
  # ════════════════════════════════

  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.0
    container_name: fleet-zookeeper
    restart: unless-stopped
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    volumes:
      - zookeeper_data:/var/lib/zookeeper/data
    networks:
      - fleet-network

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    container_name: fleet-kafka
    restart: unless-stopped
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
    volumes:
      - kafka_data:/var/lib/kafka/data
    networks:
      - fleet-network
    healthcheck:
      test: ["CMD", "kafka-broker-api-versions", "--bootstrap-server", "localhost:9092"]
      interval: 15s
      timeout: 10s
      retries: 5

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: fleet-kafka-ui
    restart: unless-stopped
    depends_on:
      - kafka
    ports:
      - "8090:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: fleet-cluster
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:29092
    networks:
      - fleet-network

  # ════════════════════════════════
  # 4. KEYCLOAK IAM
  # ════════════════════════════════

  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    container_name: fleet-keycloak
    restart: unless-stopped
    command: start-dev --import-realm
    environment:
      KEYCLOAK_ADMIN: ${KEYCLOAK_ADMIN:-admin}
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD:-admin}
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB:-fleet_db}
      KC_DB_USERNAME: ${POSTGRES_USER:-fleet_user}
      KC_DB_PASSWORD: ${POSTGRES_PASSWORD:-fleet_pass}
      KC_HOSTNAME_STRICT: "false"
      KC_HTTP_ENABLED: "true"
    ports:
      - "8080:8080"
    volumes:
      - ./iam/keycloak/realm-export.json:/opt/keycloak/data/import/realm-export.json
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - fleet-network

  # ════════════════════════════════
  # 5. API GATEWAY
  # ════════════════════════════════

  api-gateway:
    build:
      context: ./api-gateway
      dockerfile: Dockerfile
    container_name: fleet-api-gateway
    restart: unless-stopped
    ports:
      - "8888:8888"
    environment:
      KEYCLOAK_URL: http://keycloak:8080
      KEYCLOAK_REALM: ${KEYCLOAK_REALM:-fleet-realm}
      MS_COLLECTE_URL: http://ms-collecte:8081
      MS_ALERTES_URL: http://ms-alertes:8082
      MS_ML_URL: http://ms-ml:8083
      SPRING_PROFILES_ACTIVE: docker
    depends_on:
      - keycloak
      - ms-collecte
      - ms-alertes
      - ms-ml
    networks:
      - fleet-network

  # ════════════════════════════════
  # 6. MICRO-SERVICES
  # ════════════════════════════════

  ms-collecte:
    build:
      context: ./services/ms-collecte
      dockerfile: Dockerfile
    container_name: fleet-ms-collecte
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      SERVER_PORT: 8081
      SPRING_PROFILES_ACTIVE: docker
      KAFKA_BOOTSTRAP_SERVERS: kafka:29092
      MQTT_BROKER_URL: tcp://mosquitto:1883
      INFLUXDB_URL: http://influxdb:8086
      INFLUXDB_TOKEN: ${INFLUXDB_TOKEN:-my-super-secret-token}
      INFLUXDB_ORG: ${INFLUXDB_ORG:-fleet-org}
      INFLUXDB_BUCKET: ${INFLUXDB_BUCKET:-fleet-metrics}
    depends_on:
      kafka:
        condition: service_healthy
      influxdb:
        condition: service_healthy
      mosquitto:
        condition: service_started
    networks:
      - fleet-network

  ms-alertes:
    build:
      context: ./services/ms-alertes
      dockerfile: Dockerfile
    container_name: fleet-ms-alertes
    restart: unless-stopped
    ports:
      - "8082:8082"
    environment:
      SERVER_PORT: 8082
      SPRING_PROFILES_ACTIVE: docker
      KAFKA_BOOTSTRAP_SERVERS: kafka:29092
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB:-fleet_db}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER:-fleet_user}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD:-fleet_pass}
    depends_on:
      kafka:
        condition: service_healthy
      postgres:
        condition: service_healthy
    networks:
      - fleet-network

  ms-ml:
    build:
      context: ./services/ms-ml
      dockerfile: Dockerfile
    container_name: fleet-ms-ml
    restart: unless-stopped
    ports:
      - "8083:8083"
    environment:
      PORT: 8083
      KAFKA_BOOTSTRAP_SERVERS: kafka:29092
      INFLUXDB_URL: http://influxdb:8086
      INFLUXDB_TOKEN: ${INFLUXDB_TOKEN:-my-super-secret-token}
      INFLUXDB_ORG: ${INFLUXDB_ORG:-fleet-org}
      INFLUXDB_BUCKET: ${INFLUXDB_BUCKET:-fleet-metrics}
      POSTGRES_URL: postgresql://${POSTGRES_USER:-fleet_user}:${POSTGRES_PASSWORD:-fleet_pass}@postgres:5432/${POSTGRES_DB:-fleet_db}
    depends_on:
      kafka:
        condition: service_healthy
      influxdb:
        condition: service_healthy
      postgres:
        condition: service_healthy
    networks:
      - fleet-network

  # ════════════════════════════════
  # 7. FRONTEND — ANGULAR
  # ════════════════════════════════

  frontend:
    build:
      context: ./frontend/angular-app
      dockerfile: Dockerfile
    container_name: fleet-frontend
    restart: unless-stopped
    ports:
      - "4200:80"
    environment:
      API_GATEWAY_URL: http://api-gateway:8888
      KEYCLOAK_URL: http://localhost:8080
      KEYCLOAK_REALM: ${KEYCLOAK_REALM:-fleet-realm}
      KEYCLOAK_CLIENT_ID: ${KEYCLOAK_CLIENT_ID:-fleet-frontend}
      GRAFANA_URL: http://localhost:3000
    depends_on:
      - api-gateway
    networks:
      - fleet-network

  # ════════════════════════════════
  # 8. GRAFANA
  # ════════════════════════════════

  grafana:
    image: grafana/grafana:10.4.0
    container_name: fleet-grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_USER: ${GRAFANA_USER:-admin}
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}
      GF_AUTH_GENERIC_OAUTH_ENABLED: "true"
      GF_AUTH_GENERIC_OAUTH_NAME: Keycloak
      GF_AUTH_GENERIC_OAUTH_CLIENT_ID: grafana
      GF_AUTH_GENERIC_OAUTH_AUTH_URL: http://localhost:8080/realms/${KEYCLOAK_REALM:-fleet-realm}/protocol/openid-connect/auth
      GF_AUTH_GENERIC_OAUTH_TOKEN_URL: http://keycloak:8080/realms/${KEYCLOAK_REALM:-fleet-realm}/protocol/openid-connect/token
      GF_INSTALL_PLUGINS: grafana-clock-panel,grafana-simple-json-datasource
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
      - ./monitoring/grafana/grafana.ini:/etc/grafana/grafana.ini
    depends_on:
      - influxdb
    networks:
      - fleet-network
