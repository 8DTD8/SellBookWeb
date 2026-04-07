# Triển khai SellBookWeb lên VPS (Docker Compose)

Repo: `https://github.com/8DTD8/SellBookWeb.git` — làm việc trên nhánh **`Test_cloud`**.

## 1. VPS và Docker

Trên Ubuntu 22.04+:

```bash
sudo bash scripts/vps-install-docker.sh
sudo usermod -aG docker "$USER"
# đăng xuất / SSH lại để nhóm docker có hiệu lực
```

Mở cổng **22**, **80**, **443** (script đã cấu hình `ufw`).

## 2. Lấy mã nguồn

```bash
git clone -b Test_cloud https://github.com/8DTD8/SellBookWeb.git
cd SellBookWeb
cp .env.example .env
nano .env   # điền CORS_ALLOWED_ORIGINS, JWT_SECRET, FRONTEND_URL, (tùy chọn) mail
```

## 3. Chạy stack

Mongo **trong** Docker (mặc định, port 27017 **không** mở ra internet):

```bash
bash scripts/deploy-compose.sh
```

Hoặc: `docker compose up -d --build`

Kiểm tra: trình duyệt `http://IP_VPS` hoặc `curl http://127.0.0.1:8080/api/health`.

## 4. HTTPS và tên miền

1. Trỏ DNS **A** record tên miền → IP VPS.
2. Trong `.env`, đặt `CORS_ALLOWED_ORIGINS` và `FRONTEND_URL` thành `https://ten-mien-cua-ban` (có thể thêm `https://www...`).
3. Cài [Caddy](https://caddyserver.com/) hoặc Nginx + Certbot trên host, reverse proxy tới `127.0.0.1:80` (container frontend). Tham khảo [docker/caddy/Caddyfile.example](../docker/caddy/Caddyfile.example).

## 5. MongoDB Atlas (tùy chọn)

1. Tạo cluster Atlas, user DB, whitelist IP VPS.
2. `.env`: `SPRING_DATA_MONGODB_URI=mongodb+srv://...`
3. Chạy **không** có container mongo:

```bash
docker compose -f docker-compose.atlas.yml up -d --build
```

## 6. Biến môi trường quan trọng

| Biến | Mô tả |
|------|--------|
| `SPRING_DATA_MONGODB_URI` | Chuỗi kết nối Mongo (compose mặc định dùng `mongo:27017`) |
| `CORS_ALLOWED_ORIGINS` | Danh sách origin HTTPS, cách nhau dấu phẩy |
| `JWT_SECRET` | Chuỗi dài, ngẫu nhiên trên production |
| `FRONTEND_URL` | URL public của site |
| `SPRING_MAIL_USERNAME` / `SPRING_MAIL_PASSWORD` | Gmail SMTP (tùy chọn) |

Không commit file `.env`.

## 7. Remote Git (push)

```bash
git remote add origin https://github.com/8DTD8/SellBookWeb.git
git checkout Test_cloud
git push -u origin Test_cloud
```
