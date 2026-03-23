# Test Authentication: Keycloak <-> API Gateway

Ce guide montre les commandes a lancer pour tester l'authentification entre Keycloak et API Gateway.

## Prerequis

- Docker Desktop demarre
- PowerShell ouvert dans:
  - `C:\Users\khali\Desktop\actia project\fleet management`

## 1) Demarrer la stack

```powershell
docker compose up --build -d
```

Verifier l'etat:

```powershell
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Tu dois voir au minimum:
- `fleet-keycloak` (healthy)
- `fleet-api-gateway` (up)
- `fleet-micro-service` (up)
- `fleet-postgres` (healthy)
- `fleet-redis` (up)

## 2) Test rapide sans login

Endpoint public du gateway:

```powershell
curl.exe -i http://localhost:8888/actuator/health
```

Endpoint protege (doit rediriger vers login):

```powershell
curl.exe -i http://localhost:8888/api/Micro-service/test
```

Attendu: `HTTP/1.1 302 Found` avec `Location: /oauth2/authorization/keycloak`

## 3) Test complet avec navigateur

1. Ouvre une fenetre privee
2. Va sur:
   - `http://localhost:8888/api/Micro-service/test`
3. Connecte-toi sur Keycloak avec:
   - Username: `test`
   - Password: `Fleet12345`
4. Apres login, la route doit repondre:
   - `Micro-service is up`

## 4) Test complet en ligne de commande (sans navigateur)

Tous les fichiers temporaires sont places dans `.tmp/`.

```powershell
curl.exe -s -L -c .tmp\e2e.txt -b .tmp\e2e.txt "http://localhost:8888/oauth2/authorization/keycloak" -o .tmp\e2e_login.html

$line = Select-String -Path .tmp\e2e_login.html -Pattern 'action="([^"]+)"' | Select-Object -First 1
$action = [System.Net.WebUtility]::HtmlDecode($line.Matches[0].Groups[1].Value)

curl.exe -s -D .tmp\e2e_post_headers.txt -o NUL -c .tmp\e2e.txt -b .tmp\e2e.txt -X POST "$action" -H "Content-Type: application/x-www-form-urlencoded" --data "username=test&password=Fleet12345&credentialId="

$callback = (Select-String -Path .tmp\e2e_post_headers.txt -Pattern '^Location:\s*(.*)$' | Select-Object -First 1).Matches[0].Groups[1].Value.Trim()

curl.exe -s -o NUL -c .tmp\e2e.txt -b .tmp\e2e.txt "$callback"

curl.exe -i -c .tmp\e2e.txt -b .tmp\e2e.txt "http://localhost:8888/api/Micro-service/test"
```

Attendu a la fin:
- `HTTP/1.1 200 OK`
- body: `Micro-service is up`

## 5) Logs utiles en cas de probleme

Gateway:

```powershell
docker logs fleet-api-gateway --tail=200
```

Keycloak:

```powershell
docker logs fleet-keycloak --tail=200
```

## 6) Arreter la stack

```powershell
docker compose down
```
