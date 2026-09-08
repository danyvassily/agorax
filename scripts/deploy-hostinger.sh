#!/usr/bin/env bash
set -euo pipefail

HOST="187.77.172.250"
USER="root"
REMOTE_DIR="/var/www/agorax"
APP_NAME="agorax"

echo "🚀 [Hostinger Deployment] Cible : $USER@$HOST ($REMOTE_DIR)"

# 1. Vérification SSH
echo "📡 Vérification de la connexion SSH..."
ssh -o BatchMode=yes -o ConnectTimeout=10 "$USER@$HOST" "echo '✅ Connecté à \$(hostname)'"

# 2. Déploiement distant
echo "📦 Mise à jour distante, installation, build et restart PM2..."
ssh "$USER@$HOST" << 'EOF'
  set -euo pipefail
  cd /var/www/agorax
  echo "📥 [1/4] Git pull origin main..."
  git pull origin main
  echo "📦 [2/4] npm install..."
  npm install
  echo "🔨 [3/4] npm run build..."
  npm run build
  echo "🔄 [4/4] pm2 restart agorax..."
  pm2 restart agorax
  sleep 2
  echo "🩺 Contrôle de santé local..."
  curl -fsS -I http://127.0.0.1:3000 > /dev/null
  echo "✅ Serveur local actif et fonctionnel !"
EOF

echo "🎉 Déploiement Hostinger achevé avec succès ! Site accessible sur https://agorax.online"
