#!/usr/bin/env bash
# Deploy backend changes from commit 93ad380 (excludes scripts/ folder)
set -euo pipefail

HOST="${DEPLOY_HOST:-72.61.192.168}"
USER="${DEPLOY_USER:-root}"
REMOTE_DIR="${DEPLOY_DIR:-/var/www/nestjs-app}"
PASSWORD="${DEPLOY_PASSWORD:-Mo@1234567891234}"
COMMIT="${DEPLOY_COMMIT:-93ad3800b7bc0a5329b77fe5d85bbd576a536ea2}"

LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"

if ! command -v sshpass &>/dev/null; then
  echo "❌ sshpass is required. Install with: brew install sshpass"
  exit 1
fi

SSH_OPTS=(-o StrictHostKeyChecking=no -o PreferredAuthentications=password -o PubkeyAuthentication=no)
SCP_OPTS=(-o StrictHostKeyChecking=no -o PreferredAuthentications=password -o PubkeyAuthentication=no)

run_ssh() {
  sshpass -p "$PASSWORD" ssh "${SSH_OPTS[@]}" "${USER}@${HOST}" "$@"
}

run_scp() {
  sshpass -p "$PASSWORD" scp "${SCP_OPTS[@]}" "$@"
}

# Files changed in commit 93ad380, excluding scripts/
DEPLOY_FILES=(
  package.json
  src/DB/models/Order/order.model.ts
  src/User/Cart/cart.service.ts
  src/User/Order/DTO/index.ts
  src/User/Order/order.controller.ts
  src/User/Order/order.interface.ts
  src/User/Order/order.service.ts
  src/Payment/paymob.service.ts
  src/app.module.ts
  src/main.ts
)

echo "🚀 Deploying backend commit ${COMMIT:0:7} to ${USER}@${HOST}:${REMOTE_DIR}"
echo "   (scripts/ folder is excluded)"

for file in "${DEPLOY_FILES[@]}"; do
  if [[ ! -f "$LOCAL_DIR/$file" ]]; then
    echo "❌ Missing local file: $file"
    exit 1
  fi
done

for file in "${DEPLOY_FILES[@]}"; do
  remote_path="${REMOTE_DIR}/${file}"
  remote_parent="$(dirname "$remote_path")"
  echo "📤 $file"
  run_ssh "mkdir -p '$remote_parent'"
  run_scp "$LOCAL_DIR/$file" "${USER}@${HOST}:${remote_path}"
done

echo "🔨 Building and restarting on server..."
run_ssh bash <<EOS
  set -e
  cd "$REMOTE_DIR"
  npm run build
  pm2 restart all
EOS

echo "✅ Backend deployment completed."
