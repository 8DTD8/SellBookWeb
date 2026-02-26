# 📚 HƯỚNG DẪN CHẠY DỰ ÁN SELLBOOKWEB TỪ A ĐẾN Z

## 📋 MỤC LỤC
1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt MongoDB](#cài-đặt-mongodb)
3. [Cài đặt Backend](#cài-đặt-backend)
4. [Cài đặt Frontend](#cài-đặt-frontend)
5. [Chạy dự án](#chạy-dự-án)
6. [Kiểm tra hoạt động](#kiểm-tra-hoạt-động)
7. [Tài khoản mặc định](#tài-khoản-mặc-định)
8. [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)

---

## 🖥️ YÊU CẦU HỆ THỐNG

### Phần mềm cần thiết:
- ✅ **Java JDK 21** hoặc cao hơn
- ✅ **Maven 3.8+** (hoặc sử dụng Maven Wrapper)
- ✅ **MongoDB 4.4+** (local hoặc MongoDB Atlas)
- ✅ **Node.js** (không bắt buộc, chỉ cần trình duyệt cho frontend)
- ✅ **Trình duyệt web** (Chrome, Firefox, Edge...)

### Kiểm tra cài đặt:
```bash
# Kiểm tra Java
java -version
# Kết quả mong đợi: openjdk version "21" hoặc cao hơn

# Kiểm tra Maven
mvn -version
# Kết quả mong đợi: Apache Maven 3.8.x hoặc cao hơn

# Kiểm tra MongoDB
mongod --version
# Kết quả mong đợi: db version v4.4.x hoặc cao hơn
```

---

## 🗄️ CÀI ĐẶT MONGODB

### Cách 1: MongoDB Local (Khuyến nghị cho phát triển)

#### Windows:
1. Tải MongoDB từ: https://www.mongodb.com/try/download/community
2. Cài đặt MongoDB Community Server
3. Khởi động MongoDB Service:
   ```bash
   # MongoDB thường tự động chạy như một Windows Service
   # Kiểm tra trong Services (services.msc)
   ```

#### Linux/Mac:
```bash
# Cài đặt MongoDB
sudo apt-get install mongodb  # Ubuntu/Debian
brew install mongodb-community  # MacOS

# Khởi động MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # MacOS
```

#### Kiểm tra MongoDB đang chạy:
```bash
# Kết nối MongoDB shell
mongosh
# Hoặc
mongo

# Nếu kết nối thành công, bạn sẽ thấy:
# MongoDB shell version v...
# connecting to: mongodb://127.0.0.1:27017
```

### Cách 2: MongoDB Atlas (Cloud - Khuyến nghị cho production)

1. Đăng ký tài khoản tại: https://www.mongodb.com/cloud/atlas
2. Tạo cluster miễn phí
3. Lấy connection string
4. Cập nhật trong `application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/bookstore?retryWrites=true&w=majority
   ```

---

## 🔧 CÀI ĐẶT BACKEND

### Bước 1: Mở terminal/command prompt

```bash
# Di chuyển đến thư mục backend
cd E:\Sellbookweb\SellBookWeb-backend
```

### Bước 2: Kiểm tra cấu hình MongoDB

Mở file `application.properties` và kiểm tra:

```properties
# Cho MongoDB local (mặc định)
spring.data.mongodb.uri=mongodb://localhost:27017/bookstore

# Hoặc cho MongoDB Atlas (nếu dùng cloud)
# spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/bookstore
```

### Bước 3: Build dự án (Tùy chọn)

```bash
# Clean và build dự án
mvn clean install

# Hoặc chỉ compile
mvn clean compile
```

### Bước 4: Chạy Backend

```bash
# Cách 1: Sử dụng Maven
mvn spring-boot:run

# Cách 2: Sử dụng Java trực tiếp (sau khi build)
java -jar target/bookstore-backend-1.0.0.jar
```

### Kết quả mong đợi:

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v2.7.14)

... (các log khởi động)

Started BookstoreApplication in X.XXX seconds
```

### Backend đang chạy tại:
- **URL**: http://localhost:8080
- **API Base**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/api/health

---

## 🎨 CÀI ĐẶT FRONTEND

### Bước 1: Mở file HTML trực tiếp

Frontend sử dụng **HTML tĩnh**, không cần cài đặt Node.js hay build.

### Bước 2: Mở file trong trình duyệt

#### Cách 1: Double-click vào file
```
E:\Sellbookweb\SellBookWeb-frontend\login.html
```

#### Cách 2: Sử dụng Live Server (Khuyến nghị)

**Với VS Code:**
1. Cài extension "Live Server"
2. Click chuột phải vào `login.html` → "Open with Live Server"

**Với Python (nếu có):**
```bash
cd E:\Sellbookweb\SellBookWeb-frontend
python -m http.server 8000
# Mở: http://localhost:8000/login.html
```

**Với Node.js (nếu có):**
```bash
cd E:\Sellbookweb\SellBookWeb-frontend
npx http-server -p 8000
# Mở: http://localhost:8000/login.html
```

### Bước 3: Kiểm tra cấu hình API

Mở file `api.js` và kiểm tra:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

Đảm bảo URL này khớp với địa chỉ backend của bạn.

---

## 🚀 CHẠY DỰ ÁN

### Quy trình chạy đầy đủ:

#### 1. Khởi động MongoDB
```bash
# Kiểm tra MongoDB đang chạy
mongosh
# Nếu không kết nối được, khởi động MongoDB service
```

#### 2. Khởi động Backend
```bash
cd E:\Sellbookweb\SellBookWeb-backend
mvn spring-boot:run
```

**Đợi đến khi thấy:**
```
Started BookstoreApplication in X.XXX seconds
```

#### 3. Mở Frontend
- Mở file `login.html` trong trình duyệt
- Hoặc sử dụng Live Server

#### 4. Đăng nhập

**Tài khoản Admin (tự động tạo):**
- Email: `admin@bookstore.com`
- Password: `Admin@123456`

**Hoặc đăng ký tài khoản mới:**
- Click "Đăng ký" trên trang login
- Điền thông tin và tạo tài khoản

---

## ✅ KIỂM TRA HOẠT ĐỘNG

### 1. Kiểm tra Backend

#### Health Check:
```bash
# Sử dụng curl
curl http://localhost:8080/api/health

# Hoặc mở trong trình duyệt
http://localhost:8080/api/health
```

**Kết quả mong đợi:**
```json
{
  "status": "UP",
  "timestamp": "2026-02-24T10:00:00"
}
```

#### Kiểm tra API Books:
```bash
curl http://localhost:8080/api/books
```

### 2. Kiểm tra Frontend

1. Mở `login.html` trong trình duyệt
2. Đăng nhập với tài khoản admin
3. Kiểm tra các chức năng:
   - ✅ Xem danh sách sách
   - ✅ Tìm kiếm sách
   - ✅ Xem chi tiết sách
   - ✅ Thêm vào giỏ hàng
   - ✅ Xem giỏ hàng
   - ✅ Xem profile

### 3. Kiểm tra Console (F12)

Mở Developer Tools (F12) và kiểm tra:
- ✅ Không có lỗi JavaScript
- ✅ API calls thành công (status 200)
- ✅ Không có lỗi CORS

---

## 👤 TÀI KHOẢN MẶC ĐỊNH

### Admin Account (Tự động tạo khi khởi động backend)

```
Email:    admin@bookstore.com
Password: Admin@123456
Role:     ADMIN
```

**Lưu ý:** Tài khoản này được tự động tạo bởi `DataInitializer` khi backend khởi động lần đầu.

### Tạo tài khoản Customer mới:

1. Mở trang login
2. Click "Đăng ký"
3. Điền thông tin:
   - Tên
   - Email
   - Mật khẩu
   - Số điện thoại (tùy chọn)
4. Click "Đăng ký"
5. Đăng nhập với tài khoản vừa tạo

---

## 🔍 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 1: MongoDB không kết nối được

**Triệu chứng:**
```
Cannot connect to MongoDB
com.mongodb.MongoSocketException
```

**Giải pháp:**
1. Kiểm tra MongoDB đang chạy:
   ```bash
   mongosh
   ```
2. Kiểm tra port 27017:
   ```bash
   netstat -an | findstr 27017  # Windows
   netstat -an | grep 27017     # Linux/Mac
   ```
3. Kiểm tra `application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb://localhost:27017/bookstore
   ```

### Lỗi 2: Port 8080 đã được sử dụng

**Triệu chứng:**
```
Port 8080 is already in use
```

**Giải pháp:**
1. Tìm process đang dùng port 8080:
   ```bash
   netstat -ano | findstr :8080  # Windows
   lsof -i :8080                 # Linux/Mac
   ```
2. Đổi port trong `application.properties`:
   ```properties
   server.port=8081
   ```
3. Cập nhật frontend `api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:8081/api';
   ```

### Lỗi 3: CORS Error

**Triệu chứng:**
```
Access to fetch at 'http://localhost:8080/api/...' from origin '...' has been blocked by CORS policy
```

**Giải pháp:**
1. Kiểm tra `CorsConfig.java` đã cấu hình đúng
2. Kiểm tra frontend URL trong `application.properties`:
   ```properties
   cors.allowed-origins=http://localhost:3000,http://localhost:4200,http://localhost:8000
   ```
3. Thêm URL frontend của bạn vào danh sách allowed origins

### Lỗi 4: JWT Token expired

**Triệu chứng:**
```
401 Unauthorized
Token expired
```

**Giải pháp:**
1. Đăng xuất và đăng nhập lại
2. Token sẽ được tự động refresh
3. Kiểm tra token expiration trong `application.properties`:
   ```properties
   jwt.access-token-expiration=3600000  # 1 giờ
   ```

### Lỗi 5: Frontend không load được

**Triệu chứng:**
- Trang trắng
- Lỗi 404
- Không thấy nội dung

**Giải pháp:**
1. Kiểm tra console (F12) xem có lỗi gì
2. Kiểm tra file `api.js` có đúng URL backend không
3. Kiểm tra backend đang chạy:
   ```bash
   curl http://localhost:8080/api/health
   ```
4. Sử dụng Live Server thay vì mở file trực tiếp

### Lỗi 6: Không tìm thấy sách

**Triệu chứng:**
- Danh sách sách trống
- "Không tìm thấy sách"

**Giải pháp:**
1. Kiểm tra database có dữ liệu:
   ```bash
   mongosh
   use bookstore
   db.books.find().pretty()
   ```
2. Nếu không có dữ liệu, thêm sách qua Admin panel hoặc API:
   ```bash
   POST http://localhost:8080/api/admin/books
   ```

---

## 📝 CẤU TRÚC THƯ MỤC

```
Sellbookweb/
├── SellBookWeb-backend/          # Backend Spring Boot
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/bookstore/
│   │       │       ├── controller/    # API endpoints
│   │       │       ├── service/      # Business logic
│   │       │       ├── repository/   # Database access
│   │       │       ├── model/        # Data models
│   │       │       ├── dto/          # Data transfer objects
│   │       │       └── config/      # Configuration
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
│
└── SellBookWeb-frontend/          # Frontend HTML/CSS/JS
    ├── login.html                 # Trang đăng nhập
    ├── customer.html              # Trang khách hàng
    ├── admin.html                 # Trang admin
    ├── customer-app.js            # Logic khách hàng
    ├── admin-app.js               # Logic admin
    ├── api.js                     # API calls
    ├── auth.js                    # Authentication
    ├── customer-styles.css        # Styles cho customer
    └── styles.css                 # Styles chung
```

---

## 🎯 QUY TRÌNH PHÁT TRIỂN

### 1. Phát triển Backend
```bash
cd SellBookWeb-backend
mvn spring-boot:run
```

### 2. Phát triển Frontend
- Mở file HTML trong trình duyệt
- Sử dụng Live Server để auto-reload
- Mở DevTools (F12) để debug

### 3. Test API
- Sử dụng Postman hoặc curl
- Kiểm tra Swagger UI (nếu có): http://localhost:8080/swagger-ui.html

---

## 📚 TÀI LIỆU THAM KHẢO

- **Backend API Docs**: Xem file `INFO.md` trong thư mục backend
- **Frontend Guide**: Xem file `FRONTEND_GUIDE.md` trong thư mục frontend
- **Login API**: Xem file `LOGIN_API_DOCS.md` trong thư mục frontend

---

## ✅ CHECKLIST CHẠY DỰ ÁN

- [ ] Đã cài đặt Java 21
- [ ] Đã cài đặt Maven 3.8+
- [ ] Đã cài đặt và khởi động MongoDB
- [ ] Đã cấu hình `application.properties`
- [ ] Đã chạy backend thành công (port 8080)
- [ ] Đã mở frontend trong trình duyệt
- [ ] Đã đăng nhập thành công
- [ ] Đã kiểm tra các chức năng cơ bản

---

## 🎉 HOÀN TẤT!

Nếu bạn đã hoàn thành tất cả các bước trên, dự án của bạn đã sẵn sàng để sử dụng!

**Chúc bạn phát triển thành công! 🚀**

---

**Ngày cập nhật:** 2026-02-24  
**Phiên bản:** 1.0.0

