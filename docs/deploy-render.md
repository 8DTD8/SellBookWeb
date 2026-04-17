# Triển khai SellBookWeb trên Render

Render dùng **hai service** tách biệt: **Web Service (API, Docker)** và **Static Site (HTML/JS)**. MongoDB dùng **MongoDB Atlas** (free tier).

Nhánh gợi ý: **`Test_cloud`** (theo [deploy-vps.md](deploy-vps.md)).

## Kiến trúc

- Trình duyệt tải SPA từ URL static (CDN).
- Gọi API tại URL backend khác (`https://ten-api.onrender.com`).
- [js/config.js](../SellBookWeb-frontend/js/config.js) dùng placeholder `__SELLBOOK_API_BASE__`; build trên Render chạy [render-build.sh](../SellBookWeb-frontend/render-build.sh) để gán `PUBLIC_API_URL` (ví dụ `https://ten-api.onrender.com/api`).
- Backend cần **CORS** cho đúng origin của static site.

## 1. MongoDB Atlas

1. Tạo cluster (M0 free), database user, network access: **0.0.0.0/0** (demo) hoặc hẹp hơn nếu cần.
2. Lấy connection string `mongodb+srv://.../bookstore?...` và gán vào `SPRING_DATA_MONGODB_URI` trên service API. Giá trị phải **bắt đầu bằng** `mongodb+srv://` hoặc `mongodb://`, **không** có khoảng trắng đầu/cuối, **không** bọc dấu `"` trong ô env (nếu paste nhầm sẽ lỗi `The connection string is invalid`).

## 2. Blueprint hoặc tạo tay trên Dashboard

### Cách A — `render.yaml` (Blueprint)

Trong repo đã có [render.yaml](../render.yaml). Trên Render: **New → Blueprint** → chọn repo → nhập biến bí mật khi được hỏi (`sync: false`).

Blueprint dùng `dockerfilePath` / `dockerContext` / `staticPublishPath` **tương đối gốc repo** (ví dụ `./SellBookWeb-backend/Dockerfile`, `./SellBookWeb-frontend`); không trùng cách nhập tùy chọn “Root directory” trên Dashboard.

### Cách B — Tạo thủ công

**Web Service (API)**

- **Runtime:** Docker  
- **Root directory:** `SellBookWeb-backend`  
- **Dockerfile path:** `Dockerfile`  
- **Health check path:** `/api/health`  
- **Biến môi trường** (tham khảo [.env.example](../.env.example)):

| Biến | Ghi chú |
|------|---------|
| `SPRING_PROFILES_ACTIVE` | `docker` |
| `SPRING_DATA_MONGODB_URI` | Chuỗi Atlas |
| `JWT_SECRET` | Chuỗi dài, ngẫu nhiên (hoặc dùng generate trong Blueprint) |
| `CORS_ALLOWED_ORIGINS` | `https://<ten-static-service>.onrender.com` (không dấu `/` cuối) |
| `FRONTEND_URL` | Cùng URL static (email/link) |
| `SPRING_MAIL_USERNAME` / `SPRING_MAIL_PASSWORD` | Tùy chọn |

**Static Site**

- **Root directory:** `SellBookWeb-frontend`  
- **Build command:** `sh render-build.sh`  
- **Publish directory:** `.`  

**Biến build:**

| Biến | Ghi chú |
|------|---------|
| `PUBLIC_API_URL` | `https://<ten-api-service>.onrender.com/api` (đúng tên service API đã deploy) |

`render-build.sh` thay placeholder trong `js/config.js` bằng giá trị này.

## 3. Thứ tự deploy gợi ý

1. Đặt **tên service** cố định (ví dụ `sellbook-api`, `sellbook-web`) để biết trước URL `https://sellbook-api.onrender.com` và `https://sellbook-web.onrender.com`.
2. Deploy **API** trước, gán Mongo + JWT + `CORS_ALLOWED_ORIGINS` = URL static dự kiến + `FRONTEND_URL` = URL static.
3. Tạo **Static Site**, đặt `PUBLIC_API_URL=https://sellbook-api.onrender.com/api`, build và deploy.
4. Nếu đổi tên service hoặc URL, cập nhật lại CORS / `PUBLIC_API_URL` và deploy lại.

## 4. Port

Backend dùng `server.port=${PORT:8080}` trong [application.properties](../SellBookWeb-backend/src/main/resources/application.properties) để khớp biến `PORT` của Render.

## 5. Free tier

Service có thể **sleep** khi không có traffic; lần mở đầu sau sleep có thể chậm (cold start).

## 6. Upload ảnh

File upload lên đĩa container trên Render **không bền** giữa các lần redeploy. Demo chấp nhận được; production nên dùng object storage / Cloudinary.
