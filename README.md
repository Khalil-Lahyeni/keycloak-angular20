La bonne approche — une base par service
Il y a deux façons de faire :
Option A — Plusieurs bases dans la même instance PostgreSQL (simple, suffisant pour le dev)
postgres (conteneur unique)
    ├── keycloak_db   ← base dédiée Keycloak
    ├── alertes_db    ← base dédiée ms-alertes
     └ ── autres_db     ← base dédiée ms-...

On crée les bases via un script SQL d'initialisation :

postgres:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: fleet_user
    POSTGRES_PASSWORD: fleet_pass
    POSTGRES_DB: keycloak_db       # base principale
  volumes:
    - ./data/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql

Et dans init.sql :
CREATE DATABASE keycloak_db;
CREATE DATABASE alertes_db;
CREATE DATABASE collecte_db;	

Puis chaque service pointe vers sa propre base :
keycloak:
  environment:
    KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak_db

ms-alertes:
  environment:
    SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/alertes_db
```
Remarque pour option A c’est faux : 
postgres (conteneur unique)
    └── fleet_db  ← une seule base
          ├── tables Keycloak
           └── tables ms-alertes  ← tout mélangé ❌
---
Option B— Une instance PostgreSQL par service (vrai isolement, recommandé en production)
postgres-keycloak (conteneur dédié)  → keycloak_db
postgres-alertes  (conteneur dédié)  → alertes_db
postgres-collecte (conteneur dédié)  → collecte_db

Docker-compose: 

postgres-keycloak:
  image: postgres:16-alpine
  container_name: fleet-postgres-keycloak
  environment:
    POSTGRES_DB: keycloak_db
    POSTGRES_USER: keycloak_user
    POSTGRES_PASSWORD: keycloak_pass

postgres-alertes:
  image: postgres:16-alpine
  container_name: fleet-postgres-alertes
  
environment:
    POSTGRES_DB: alertes_db
    POSTGRES_USER: alertes_user
    POSTGRES_PASSWORD: alertes_pass
<img width="879" height="500" alt="image" src="https://github.com/user-attachments/assets/bf332a6c-c3b1-4664-a272-9e0d2bff7343" />
