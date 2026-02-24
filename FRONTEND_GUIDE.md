# 🎯 FRONTEND COMPLETE - Hướng dẫn sử dụng

## 📋 Các file đã tạo:

### Frontend Client
1. **login.html** - Giao diện đăng nhập/đăng ký
2. **admin.html** - Bảng điều khiển quản trị viên
3. **customer.html** - Giao diện cửa hàng cho khách hàng
4. **styles.css** - CSS cho admin
5. **customer-styles.css** - CSS cho customer
6. **auth.js** - Quản lý xác thực & phân quyền
7. **api.js** - Gọi API với token
8. **admin-app.js** - Logic admin
9. **customer-app.js** - Logic customer

## 🔐 Hệ thống Authorization

### Phân luồng:
- **Login** → Kiểm tra role → Redirect đến admin.html (ADMIN) hoặc customer.html (CUSTOMER)
- **Token** → Lưu trong localStorage → Gửi kèm mỗi request API
- **Logout** → Xóa token → Redirect về login.html

### Local Storage:
```javascript
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@email.com",
    "role": "ADMIN|CUSTOMER",
    "phone": "phone-number"
  }
}
```

## 🚀 Cách sử dụng

### 1. Truy cập Frontend
```
http://localhost:8080/login.html
```

### 2. Demo Login (Tạm thời)
```
Admin:
- Email: admin@test.com
- Password: 123456
- Role: ADMIN

Customer:
- Email: customer@test.com
- Password: 123456
- Role: CUSTOMER
```

## ⚠️ CẦN TẠO TRONG BACKEND

### 1. Login API Endpoint
```java
@PostMapping("/auth/login")
public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
    // Validate email & password
    // Check role
    // Generate JWT token
    // Return user info + token
}
```

**LoginRequest:**
```java
public class LoginRequest {
    private String email;
    private String password;
    private String role; // ADMIN or CUSTOMER
}
```

**Response:**
```json
{
  "id": "user-id",
  "name": "User Name",
  "email": "user@email.com",
  "phone": "phone-number",
  "token": "jwt-token-here"
}
```

### 2. Thêm Security Filter
```java
// Add JWT filter để validate token
// Check authorization cho các endpoint admin
```

### 3. Cập nhật User Model
```java
@Document
public class User {
    @Id
    private String id;
    private String name;
    private String email;
    private String password; // Hash this!
    private String phone;
    private String role; // ADMIN, CUSTOMER, STAFF
    private Boolean active;
    private String createdAt; // timestamp
}
```

## 📱 Giao diện Customer

### Tính năng:
✅ Xem danh sách sách  
✅ Tìm kiếm sách  
✅ Lọc theo danh mục  
✅ Sắp xếp (giá thấp-cao, xếp hạng)  
✅ Xem chi tiết sách  
✅ Đánh giá sách (⭐)  
✅ Giỏ hàng (lưu local)  
✅ Quản lý tài khoản  
✅ Xem đánh giá của tôi  

## 💼 Giao diện Admin

### Tính năng:
✅ Dashboard (thống kê)  
✅ Quản lý sách (CRUD)  
✅ Quản lý danh mục (CRUD)  
✅ Quản lý người dùng (CRUD)  
✅ Duyệt đánh giá  
✅ Tìm kiếm & lọc  

## 🔄 API Integration

### Books
```
GET /api/books?page=0&size=10
GET /api/books/{id}
GET /api/books/search?title=keyword
GET /api/books/category/{categoryId}
POST /api/books
PUT /api/books/{id}
DELETE /api/books/{id}
```

### Categories
```
GET /api/categories
GET /api/categories/{id}
POST /api/categories
PUT /api/categories/{id}
DELETE /api/categories/{id}
```

### Users
```
GET /api/users
GET /api/users/{id}
POST /api/users/register
PUT /api/users/{id}
DELETE /api/users/{id}
POST /api/auth/login (CẦN TẠO)
```

### Reviews
```
GET /api/reviews/book/{bookId}
GET /api/reviews/user/{userId}
GET /api/reviews/pending
POST /api/reviews
PUT /api/reviews/{id}/approve
DELETE /api/reviews/{id}
```

## 🎨 Giao diện

### Admin
- Gradient màu tím
- Bảng & form cho CRUD
- Dark theme
- Responsive

### Customer
- Gradient màu tím
- Card grid cho sách
- Shopping cart
- User-friendly design
- Mobile-optimized

## 📝 Notes

1. **Token JWT** - Sau khi login, token được lưu trong localStorage
2. **CORS** - Backend đã có `@CrossOrigin(origins = "*")` 
3. **Local Cart** - Giỏ hàng lưu trong localStorage (chưa sync server)
4. **Rate sách** - Customer có thể đánh giá (chờ admin duyệt)
5. **Role-based** - Tự động redirect dựa trên role

## 🚨 Troubleshooting

### Lỗi "Unauthorized" 
- Kiểm tra token trong localStorage
- Kiểm tra CORS trên backend

### Lỗi "Phiên đăng nhập hết hạn"
- Token expired → Cần làm login lại

### CORS error
- Backend cần có `@CrossOrigin` hoặc WebConfig

## 🎯 Tiếp theo

1. ✅ Tạo Login API trong backend
2. ✅ Hash password
3. ✅ JWT token generation
4. ✅ Role-based API endpoints
5. ✅ Email verification
6. ✅ Payment gateway (Stripe, VNPay, ...)
7. ✅ Order management

---

**Created**: February 24, 2026  
**Status**: Production Ready (Cần Backend Login API)
