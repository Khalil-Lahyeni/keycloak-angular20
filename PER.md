# ══════════════════════════════════════════════
#  Fleet-Management — Makefile
# ══════════════════════════════════════════════

.PHONY: up down down-clean export-realm logs ps

# Démarrer tous les services
up:
	docker compose up -d
	@echo "✅ Services démarrés"
	@echo "   Frontend  → http://localhost:4200"
	@echo "   Keycloak  → http://localhost:8080"
	@echo "   Grafana   → http://localhost:3000"
	@echo "   Kafka UI  → http://localhost:8090"
	@echo "   InfluxDB  → http://localhost:8086"

# Arrêter sans supprimer les volumes (données conservées)
down:
	docker compose down
	@echo "✅ Services arrêtés — données conservées"

# Arrêter ET supprimer les volumes (export automatique avant)
down-clean: export-realm
	docker compose down -v
	@echo "⚠️  Volumes supprimés — realm exporté et commité avant suppression"

# Export manuel du realm Keycloak
export-realm:
	@echo "📤 Export du realm Keycloak..."
	@chmod +x ./export-realm.sh
	@./export-realm.sh
	@git add ./iam/keycloak/realm-export.json
	@git commit -m "chore: auto-export keycloak realm $$(date '+%Y-%m-%d %H:%M')" || echo "ℹ️  Rien à commiter"
	@echo "✅ Realm commité sur Git"

# Voir les logs
logs:
	docker compose logs -f

# Voir l'état des conteneurs
ps:
	docker compose ps
