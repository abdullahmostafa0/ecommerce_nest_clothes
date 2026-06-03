#!/usr/bin/env bash
# ------------------------------------------------------------
# Deploy NestJS backend to production (https://www.extrachic.cloud/)
# ------------------------------------------------------------

# Remote server configuration
HOST="72.61.192.168"
USER="deploy"               # non‑root deployment user
REMOTE_DIR="/var/www/extrachic/backend"

# Local project directory (assumes script is run from repo root)
LOCAL_DIR="$(pwd)"

# -------------------------------------------------------------------
# 1️⃣ Ensure SSH key is available (uses the default key generated on this host)
# -------------------------------------------------------------------
SSH_KEY="/Users/maryem/.ssh/id_ed25519"
if [[ ! -f "$SSH_KEY" ]]; then
  echo "SSH key not found at $SSH_KEY – generating a new one..."
  ssh-keygen -t ed25519 -f "$SSH_KEY" -N ""
fi

# -------------------------------------------------------------------
# 2️⃣ Sync source code to the remote host (exclude heavy dirs)
# -------------------------------------------------------------------
rsync -avz -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  --exclude "node_modules" \
  --exclude ".git" \
  --exclude "dist" \
  "$LOCAL_DIR/" "$USER@$HOST:$REMOTE_DIR/"

# -------------------------------------------------------------------
# 3️⃣ Remote install, build, and restart
# -------------------------------------------------------------------
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$USER@$HOST" bash <<'EOS'
  set -e
  cd "$REMOTE_DIR"

  # Install production dependencies only
  npm ci --only=production

  # Build the NestJS app (produces dist/main.js)
  npm run build

  # Restart the service – adjust to your process manager
  if command -v pm2 >/dev/null; then
    pm2 reload ecosystem.config.js --env production || pm2 start dist/main.js --name extrachic-backend
  else
    # Fallback: kill any previous node process and start a new one in background
    pkill -f "node dist/main.js" || true
    nohup node dist/main.js > backend.log 2>&1 &
  fi
EOS

echo "✅ Deployment completed successfully."
