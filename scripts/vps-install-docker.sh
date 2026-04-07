#!/usr/bin/env bash
# Ubuntu 22.04+ — cài Docker Engine + Compose plugin và firewall cơ bản cho VPS SellBookWeb.
# Chạy: sudo bash scripts/vps-install-docker.sh

set -euo pipefail

if [[ "${EUID:-0}" -ne 0 ]]; then
  echo "Chạy với sudo: sudo bash $0"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg ufw

ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
echo "y" | ufw enable || true

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${VERSION_CODENAME:-stable}") stable" \
  > /etc/apt/sources.list.d/docker.list

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable docker
systemctl start docker

echo "Docker: $(docker --version)"
echo "Compose: $(docker compose version)"
echo "UFW:"
ufw status verbose

echo "Hoàn tất. Thêm user vào nhóm docker (tùy chọn): usermod -aG docker \$USER"
