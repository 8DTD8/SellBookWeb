# 📚 BOOKSTORE BACKEND - SPRING BOOT & MONGODB

Website bán sách quy mô lớn với đầy đủ tính năng cho khách hàng và admin.

## 🚀 TÍNH NĂNG CHÍNH

### Khách hàng (Customer Portal)
- ✅ Đăng ký, đăng nhập, quên mật khẩu
- ✅ Xem danh sách sách, tìm kiếm, lọc theo danh mục
- ✅ Chi tiết sách với hình ảnh, mô tả, đánh giá
- ✅ Thêm sách vào giỏ hàng
- ✅ Thanh toán (COD, VNPay, MoMo, ZaloPay)
- ✅ Theo dõi đơn hàng
- ✅ Wishlist (danh sách yêu thích)
- ✅ Đánh giá và review sách
- ✅ Quản lý tài khoản, địa chỉ giao hàng
- ✅ Lịch sử mua hàng
- ✅ Áp dụng mã giảm giá

### Quản trị viên (Admin Portal)
- ✅ Dashboard với thống kê tổng quan
- ✅ Quản lý sách (CRUD, upload ảnh)
- ✅ Quản lý danh mục sách
- ✅ Quản lý đơn hàng (xử lý, cập nhật trạng thái)
- ✅ Quản lý người dùng
- ✅ Quản lý coupon/voucher
- ✅ Quản lý đánh giá (duyệt/từ chối)
- ✅ Báo cáo doanh thu, bán hàng
- ✅ Quản lý tồn kho
- ✅ Quản lý nhà cung cấp, đơn nhập hàng

## 📋 YÊU CẦU HỆ THỐNG

- **Java**: JDK 17 trở lên
- **Maven**: 3.8+
- **MongoDB**: 6.0+ (local hoặc MongoDB Atlas)
- **IDE**: IntelliJ IDEA, Eclipse, hoặc VS Code

## 🛠️ CÀI ĐẶT

### 1. Clone hoặc tạo project

```bash
# Nếu dùng Spring Initializr
# Truy cập: https://start.spring.io/
# Chọn:
# - Project: Maven
# - Language: Java
# - Spring Boot: 3.2.2
# - Java: 17
# - Dependencies: Spring Web, Spring Data MongoDB, Spring Security, Lombok, Validation
```

### 2. Cài đặt MongoDB

**Option 1: Cài đặt local**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Windows
# Download từ: https://www.mongodb.com/try/download/community
```

**Option 2: Sử dụng MongoDB Atlas (Cloud - Miễn phí)**
1. Đăng ký tại: https://www.mongodb.com/cloud/atlas
2. Tạo cluster miễn phí
3. Lấy connection string
4. Cập nhật vào `application.properties`

### 3. Cấu hình application.properties

Mở file `src/main/resources/application.properties` và cập nhật:

```properties
# MongoDB (nếu dùng local)
spring.data.mongodb.uri=mongodb://localhost:27017/bookstore

# MongoDB Atlas (nếu dùng cloud)
# spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/bookstore

# JWT Secret (thay đổi trong production)
jwt.secret=YOUR_VERY_LONG_SECRET_KEY_HERE

# Email (nếu dùng Gmail)
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password

# Cloudinary (đăng ký tại cloudinary.com)
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret
```

### 4. Build project

```bash
mvn clean install
```

### 5. Chạy ứng dụng

```bash
mvn spring-boot:run
```

Hoặc chạy từ IDE:
- Mở `BookstoreApplication.java`
- Click "Run"

Ứng dụng sẽ chạy tại: `http://localhost:8080`

## 📖 API DOCUMENTATION

Sau khi chạy ứng dụng, truy cập Swagger UI:

```
http://localhost:8080/swagger-ui.html
```

## 🗂️ CẤU TRÚC DATABASE

### Collections trong MongoDB:

1. **users** - Thông tin người dùng
2. **books** - Danh sách sách
3. **categories** - Danh mục sách
4. **orders** - Đơn hàng
5. **carts** - Giỏ hàng
6. **reviews** - Đánh giá sách
7. **coupons** - Mã giảm giá
8. **payments** - Thanh toán
9. **wishlists** - Danh sách yêu thích
10. **notifications** - Thông báo
11. **inventory_logs** - Lịch sử xuất nhập kho
12. **suppliers** - Nhà cung cấp
13. **purchase_orders** - Đơn nhập hàng
14. **daily_revenue** - Báo cáo doanh thu
15. **book_sales_stats** - Thống kê bán hàng
16. **category_stats** - Thống kê theo danh mục
17. **customer_analytics** - Phân tích khách hàng
18. **traffic_stats** - Thống kê traffic

## 🔑 API ENDPOINTS

### Authentication
```
POST   /api/auth/register          - Đăng ký
POST   /api/auth/login             - Đăng nhập
POST   /api/auth/forgot-password   - Quên mật khẩu
POST   /api/auth/reset-password    - Đặt lại mật khẩu
POST   /api/auth/refresh-token     - Làm mới token
```

### Books (Customer)
```
GET    /api/books                  - Danh sách sách
GET    /api/books/{id}             - Chi tiết sách
GET    /api/books/search           - Tìm kiếm sách
GET    /api/books/category/{id}    - Sách theo danh mục
GET    /api/books/featured         - Sách nổi bật
GET    /api/books/bestseller       - Sách bán chạy
```

### Cart
```
GET    /api/cart                   - Xem giỏ hàng
POST   /api/cart/add               - Thêm vào giỏ
PUT    /api/cart/update/{itemId}   - Cập nhật số lượng
DELETE /api/cart/remove/{itemId}   - Xóa khỏi giỏ
DELETE /api/cart/clear              - Xóa toàn bộ giỏ
```

### Orders
```
POST   /api/orders                 - Tạo đơn hàng
GET    /api/orders                 - Danh sách đơn hàng
GET    /api/orders/{id}            - Chi tiết đơn hàng
PUT    /api/orders/{id}/cancel     - Hủy đơn hàng
```

### Admin - Books
```
GET    /api/admin/books            - Danh sách sách (admin)
POST   /api/admin/books            - Thêm sách mới
PUT    /api/admin/books/{id}       - Cập nhật sách
DELETE /api/admin/books/{id}       - Xóa sách
POST   /api/admin/books/{id}/image - Upload ảnh sách
```

### Admin - Orders
```
GET    /api/admin/orders           - Danh sách đơn hàng
GET    /api/admin/orders/{id}      - Chi tiết đơn hàng
PUT    /api/admin/orders/{id}/status - Cập nhật trạng thái
```

### Admin - Dashboard
```
GET    /api/admin/dashboard/stats          - Thống kê tổng quan
GET    /api/admin/dashboard/revenue        - Doanh thu
GET    /api/admin/dashboard/top-books      - Sách bán chạy
GET    /api/admin/dashboard/recent-orders  - Đơn hàng gần đây
```

### Admin - Reports
```
GET    /api/admin/reports/revenue          - Báo cáo doanh thu
GET    /api/admin/reports/sales            - Báo cáo bán hàng
GET    /api/admin/reports/customers        - Báo cáo khách hàng
GET    /api/admin/reports/export           - Export báo cáo
```

## 🔐 AUTHENTICATION & AUTHORIZATION

### JWT Token Flow:
1. User đăng nhập → nhận Access Token & Refresh Token
2. Access Token: 1 giờ
3. Refresh Token: 7 ngày
4. Gửi Access Token trong header: `Authorization: Bearer <token>`

### Roles:
- **CUSTOMER**: Khách hàng thông thường
- **ADMIN**: Quản trị viên
- **SUPER_ADMIN**: Quản trị viên cấp cao

## 📧 CẤU HÌNH EMAIL

### Sử dụng Gmail:

1. Bật xác thực 2 bước trong Gmail
2. Tạo App Password tại: https://myaccount.google.com/apppasswords
3. Cập nhật vào `application.properties`:

```properties
spring.mail.username=your_email@gmail.com
spring.mail.password=your_16_character_app_password
```

## 💳 TÍCH HỢP PAYMENT GATEWAY

### VNPay:
1. Đăng ký tại: https://vnpay.vn
2. Lấy TMN Code và Hash Secret
3. Cập nhật vào `application.properties`

### MoMo:
1. Đăng ký tại: https://business.momo.vn
2. Lấy Partner Code, Access Key, Secret Key
3. Cập nhật vào `application.properties`

## 🖼️ UPLOAD HÌNH ẢNH

### Option 1: Local Storage
```properties
file.upload.dir=./uploads
```

### Option 2: Cloudinary (Recommended)
1. Đăng ký tại: https://cloudinary.com
2. Lấy thông tin Cloud Name, API Key, API Secret
3. Cập nhật vào `application.properties`

## 🧪 TESTING

### Chạy tests:
```bash
mvn test
```

### Test với Postman:
- Import Postman collection (sẽ cung cấp)
- Test các endpoints

## 📦 DEPLOY

### Deploy lên Railway:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Deploy lên Heroku:
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create bookstore-api

# Deploy
git push heroku main
```

### Environment Variables cần set:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🎯 NEXT STEPS

### Hoàn thiện Backend:
1. ✅ Tạo tất cả models
2. ✅ Tạo repositories
3. ⏳ Implement authentication & JWT (cấu hình sẵn, cần hoàn thiện)
4. ✅ Tạo services
5. ✅ Tạo controllers
6. ✅ Testing

### Tích hợp Frontend:
1. React.js / Vue.js / Angular
2. Responsive design
3. Admin dashboard
4. Customer portal
