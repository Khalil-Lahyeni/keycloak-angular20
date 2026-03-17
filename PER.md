# ══════════════════════════════════════════════
#  nginx.conf — Frontend Angular
# ══════════════════════════════════════════════

server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # ── Compression ──
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # ── Angular SPA ──
    # Toutes les routes Angular sont redirigées vers index.html
    # (nécessaire pour le routing côté client)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ── Proxy vers API Gateway ──
    # Les appels /api/** sont redirigés vers le Gateway
    # au lieu d'appeler directement le Gateway depuis Angular
    location /api/ {
        proxy_pass http://api-gateway:8888;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ── Cache des assets statiques ──
    location ~* \.(js|css|png|jpg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
