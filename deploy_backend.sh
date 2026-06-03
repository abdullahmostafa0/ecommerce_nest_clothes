#!/usr/bin/env bash
# Deploys the NestJS backend to the remote server.
# Requires sshpass (installed locally via brew).

HOST="72.61.192.168"
USER="root"
PASS="Mo@1234567891234"
REMOTE_DIR="/var/www/extrachic/backend"
LOCAL_DIR="$(pwd)"

# 1. Sync files (exclude node_modules, .git, and local env files)
sshpass -p "$PASS" rsync -az --delete \
  --exclude "node_modules" \
  --exclude ".git" \
  --exclude ".env*" \
  "$LOCAL_DIR/" "$USER@$HOST:$REMOTE_DIR"

# 2. Install dependencies & build on the remote host
sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no "$USER@$HOST" <<'EOF'
  cd "$REMOTE_DIR"
  npm ci
  npm run build
  # Restart the app (adjust if you use pm2 or systemd)
  if command -v pm2 >/dev/null 2>&1; then
    pm2 restart "ecommerce_nest" || pm2 start dist/main.js --name "ecommerce_nest"
  else
    # Simple fallback: kill old node process and start a new one
    pkill -f "node dist/main.js" || true
    nohup node dist/main.js > out.log 2>&1 &
  fi
EOF

echo "✅ Backend deployed successfully."
