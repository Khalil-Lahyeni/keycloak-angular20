Dev simple (comme la doc officielle) :
 
Mais dans cette configuration il y a des problèmes : 
1-base de données (Dev avec persistance)
Par défaut, start-dev utilise une base H2 en mémoire ce qui veut dire que toute ta config Keycloak est perdue à chaque redémarrage du conteneur 
on connecte Keycloak à PostgreSQL pour persister les données. 
C'est pour ça qu'on a le depends_on: postgres
 


2- le volume realm-export.json (Dev avec import automatique)
Par défaut, quand Keycloak démarre il crée uniquement le realm master mais dans notre projet on a besoin d'un realm personnalisé fleet-realm avec les rôles, clients Angular, clients Grafana déjà configurés. Donc au lieu de tout reconfigurer manuellement à chaque docker compose up, on exporte la config dans un fichier JSON et --import-realm dit à Keycloak de l'importer automatiquement au démarrage.
 
Imagine ce scénario sans --import-realm
Chaque fois que tu fais docker compose up tu dois :
1.	Ouvrir http://localhost:8080
2.	Se connecter en admin
3.	Créer le realm fleet-realm manuellement
4.	Créer les rôles : OPERATEUR, TECHNICIEN, ADMIN
5.	Créer les clients : fleet-frontend, grafana
6.	Créer les utilisateurs de test
7.	Recommencer à chaque docker compose down

Conclusion 
En réalité, on utilise les DEUX :
KC_DB + --import-realm  ←  combinaison idéale
 
Voici le flux complet:
 
 
Deuxième docker compose up
 


