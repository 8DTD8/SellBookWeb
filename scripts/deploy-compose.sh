#!/usr/bin/env bash
# Build và chạy stack (Compose mặc định có Mongo trong Docker).
# Từ thư mục gốc repo: bash scripts/deploy-compose.sh

set -euo pipefail
cd "$(dirname "$0")/.."

docker compose up -d --build

echo "Đợi backend khởi động..."
sleep 5
if curl -sf "http://127.0.0.1:8080/api/health" >/dev/null; then
  echo "OK: GET /api/health"
else
  echo "Cảnh báo: /api/health chưa phản hồi — xem log: docker compose logs backend"
fi

echo "Frontend: http://127.0.0.1:80  |  Backend trực tiếp: http://127.0.0.1:8080"
