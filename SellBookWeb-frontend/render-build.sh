#!/usr/bin/env sh
# Gọi từ Render Static Site (buildCommand). Thiết lập biến PUBLIC_API_URL trong dashboard.
# Ví dụ: https://sellbook-api.onrender.com/api
set -e
cd "$(dirname "$0")"
if [ -z "${PUBLIC_API_URL:-}" ]; then
  echo "WARN: PUBLIC_API_URL chưa đặt — giữ placeholder, SPA sẽ dùng localhost:8080 (chỉ phù hợp dev)."
  exit 0
fi
sed -i "s|__SELLBOOK_API_BASE__|${PUBLIC_API_URL}|g" js/config.js
echo "Đã inject PUBLIC_API_URL vào js/config.js"
