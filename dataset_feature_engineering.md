# Dataset Feature Engineering — Prédiction d'alertes de panne (Trains)

## Architecture des données (diagramme de classes)

Le diagramme de classes révèle l'architecture réelle du système :

- **Train** est l'entité centrale, liée à tout le reste
- **TrainSystemStatus** porte les statuts santé (`pacisStatus`, `cctvStatus`, `rearViewStatus`) avec l'enum `SystemHealthStatus` → source principale des signaux de panne
- **TrainAlert** est l'entité alerte déjà existante (`callState`, `type`, `alertTime`) → peut servir de **ground truth** pour les labels
- **TrainLocation** est historisée (`createdAt`) → plusieurs snapshots dans le temps sont possibles
- **MediaVersion** a une `activationDate` → on peut calculer des deltas temporels
- **TrainConfiguration** (`visible`, `ccu1Ip`, `ccu2Ip`) → contexte statique

---

## Logique de fenêtre temporelle (Time Window)

Un snapshot statique ne suffit pas pour prédire des pannes. Il faut construire, pour chaque train à chaque instant `t`, un **vecteur de features agrégées sur une fenêtre [t-X, t]**.

```
Timeline pour un train T-001 :

t-X ────────────────────────────────────────► t   (predict)
  |  snapshot 1 | snapshot 2 | ... | snapshot N |
  └──────────── fenêtre historique X ──────────┘
```

---

## Features à construire par catégorie

### Catégorie 1 — Santé des sous-systèmes (`TrainSystemStatus`)

Pour chaque sous-système (`pacis`, `cctv`, `rearView`), sur la fenêtre X :

| Feature | Description | Pourquoi |
|---|---|---|
| `pacis_failure_rate` | % de snapshots avec `FAILURE` | Fréquence de panne |
| `pacis_comm_lost_rate` | % de snapshots avec `COMMUNICATION_LOST` | Fréquence de perte comms |
| `pacis_ok_rate` | % de snapshots avec `OK` | Stabilité |
| `pacis_last_status` | Statut au dernier snapshot | Signal récent |
| `pacis_consecutive_failures` | Nombre de snapshots consécutifs en échec | Panne persistante |
| `pacis_status_changes` | Nombre de changements d'état sur X | Instabilité / oscillation |
| `pacis_time_since_last_ok` | Durée depuis le dernier `OK` (en minutes) | Criticité temporelle |

> **Répéter les 7 mêmes features pour `cctv_` et `rearView_`** → 21 features au total pour cette catégorie.

---

### Catégorie 2 — Localisation (`TrainLocation`)

| Feature | Description | Pourquoi |
|---|---|---|
| `nb_stations_visited` | Nombre de stations visitées sur X | Train actif ou bloqué ? |
| `is_stuck` | 1 si `currentStation` identique sur tous les snapshots | Train immobilisé |
| `station_change_rate` | Fréquence de changement de station | Fluidité du trajet |

---

### Catégorie 3 — Versions media (`MediaVersion`)

| Feature | Description | Pourquoi |
|---|---|---|
| `nb_active_versions` | Nombre de versions `active=true` au dernier snapshot | > 1 = anomalie |
| `days_since_last_activation` | Jours depuis la dernière activation | Vieillissement |
| `has_version_conflict` | 1 si plusieurs versions actives simultanément | Conflit logiciel |
| `is_legacy_model` | 1 si `name` contient "Legacy" | Modèle obsolète |
| `version_major` | Numéro majeur de la version active (ex: 2 ou 3) | Génération logicielle |

---

### Catégorie 4 — Contexte statique (`Train` + `TrainConfiguration`)

Ces features ne changent pas dans le temps mais **modulent la criticité** :

| Feature | Description | Pourquoi |
|---|---|---|
| `mission_type` | Local / Express / Freight (encodé) | Express = plus critique |
| `diversity_level` | Low / Medium / High (encodé 0/1/2) | Low = moins résilient |
| `update_status` | Updated / Pending | Pending = risque logiciel |
| `baseline_version` | Version encodée | Corrélation avec pannes |
| `is_visible` | Train visible dans le dashboard | Monitoring actif ? |

---

### Catégorie 5 — Messages diffusés (`TrainMessage`)

Les messages envoyés dans les trains (audio, LED, vidéo) reflètent l'état opérationnel et peuvent précéder ou accompagner des pannes :

| Feature | Description | Pourquoi |
|---|---|---|
| `nb_messages_total` | Nombre total de messages sur X | Activité du système |
| `nb_messages_audio` | Nombre de messages `AUDIO` | Annonces actives |
| `nb_messages_led` | Nombre de messages `LED` | Alertes visuelles actives |
| `nb_messages_tft_video` | Nombre de messages `TFT_VIDEO` | Affichage passagers actif |
| `has_critical_message` | 1 si un message contient des mots-clés comme "Failure", "Brake", "Engine" | Contenu critique détecté |
| `message_type_diversity` | Nombre de types distincts utilisés sur X | Variété des canaux actifs |

---

### Catégorie 6 — Alertes passées (`TrainAlert`)

C'est la catégorie **la plus puissante** pour prédire une future alerte :

| Feature | Description | Pourquoi |
|---|---|---|
| `nb_alerts_window` | Nombre d'alertes sur la fenêtre X | Historique d'incidents |
| `nb_alerts_type1` | Alertes système (incendie, panne) | Criticité type |
| `nb_alerts_type2` | Appels passagers (PEI) | Fréquence humaine |
| `time_since_last_alert` | Durée depuis la dernière alerte | Récence |
| `alert_rate` | Alertes par heure sur X | Densité d'incidents |
| `has_recent_alert` | 1 si alerte dans les dernières N minutes | Signal fort immédiat |

---

## Structure finale d'une ligne du dataset

```
train_id | window_start | window_end | [features...] | label
  T-001  | 2025-10-01   | 2025-10-08 | 0.3, 0.1, ... |   1
```

Chaque ligne représente un train sur une fenêtre temporelle donnée. Le label (défini à l'étape 2) indique si une alerte s'est produite dans la période suivant la fenêtre.

---

## Questions clés avant de générer le dataset

Avant de coder la génération du dataset, deux paramètres doivent être définis :

1. **Fréquence de collecte des snapshots** — toutes les minutes ? 5 min ? 1h ?
2. **Durée de la fenêtre X** — 1h, 24h, 7 jours ?

Ces deux paramètres déterminent la granularité de toutes les features temporelles.

---

## Récapitulatif — Nombre de features par catégorie

| Catégorie | Nombre de features |
|---|---|
| Santé sous-systèmes (pacis + cctv + rearView) | 21 |
| Localisation | 3 |
| Versions media | 5 |
| Contexte statique | 5 |
| Messages diffusés | 6 |
| Alertes passées | 6 |
| **Total** | **46** |
