# 🔐 Login API Documentation

## Endpoints

### 1. Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "admin@test.com",
  "password": "123456",
  "role": "ADMIN"
}
```

**Success Response (200):**
```json
{
  "id": "user-id-xxx",
  "name": "Admin User",
  "email": "admin@test.com",
  "phone": "0123456789",
  "role": "ADMIN",
  "token": "eyJhbGciOiJIUzUxMiJ9..."
}
```

**Error Response (400/401):**
```json
{
  "message": "Email hoặc mật khẩu không chính xác"
}
```

### 2. Register
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@test.com",
  "password": "123456",
  "phone": "0987654321",
  "role": "CUSTOMER",
  "active": true
}
```

**Success Response (201):**
```json
{
  "id": "user-id-xxx",
  "name": "New User",
  "email": "newuser@test.com",
  "phone": "0987654321",
  "role": "CUSTOMER",
  "token": ""
}
```

**Error Response (400):**
```json
{
  "message": "Email này đã được sử dụng"
}
```

### 3. Validate Token
**GET** `/api/auth/validate`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...
```

**Success Response (200):**
```json
{
  "message": "Token hợp lệ"
}
```

**Error Response (401):**
```json
{
  "message": "Token không hợp lệ"
}
```

## Demo Account

### Tài khoản Admin
```
Email: admin@test.com
Password: 123456
Role: ADMIN
```

### Tài khoản Khách hàng
```
Email: customer@test.com
Password: 123456
Role: CUSTOMER
```

## Usage Flow

### 1. Login
```javascript
const response = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@test.com',
    password: '123456',
    role: 'ADMIN'
  })
});

const data = await response.json();
// data.token → Store in localStorage
// data.role → Redirect to admin.html or customer.html
```

### 2. Use Token in API Calls
```javascript
const response = await fetch('http://localhost:8080/api/books', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Security Details

### Password Hashing
- Passwords are hashed using **BCrypt** with strength 12
- Original password is never stored in database
- Password comparison is done using `BCryptPasswordEncoder.matches()`

### JWT Token
- Algorithm: **HS512**
- Secret Key: From `application.properties` (jwt.secret)
- Expiration: 1 hour by default (jwt.access-token-expiration)
- Token contains: `userId`, `email`, `role`

### Role-based Access
- **ADMIN**: Can access admin dashboard and manage content
- **CUSTOMER**: Can browse, review, and purchase books

## Error Handling

### Common Errors

| Code | Message | Solution |
|------|---------|----------|
| 400 | Email không được để trống | Provide email |
| 400 | Mật khẩu không được để trống | Provide password |
| 400 | Vai trò không được để trống | Select a role |
| 401 | Email hoặc mật khẩu không chính xác | Check credentials |
| 400 | Tài khoản này đã bị khóa | Contact admin |
| 400 | Email này đã được sử dụng | Use different email |
| 400 | Vai trò không khớp với tài khoản này | Select correct role |

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "123456",
    "role": "ADMIN"
  }'
```

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@test.com",
    "password": "123456",
    "phone": "0987654321",
    "role": "CUSTOMER",
    "active": true
  }'
```

### Validate Token
```bash
curl -X GET http://localhost:8080/api/auth/validate \
  -H "Authorization: Bearer <your-token>"
```

## Implementation Notes

### 1. JWT Filter
- Automatically validates token on every request
- Skips validation for `/api/auth/login`, `/api/auth/register`, and `/api/users/register`
- Sets `userId`, `role`, and `token` in request attributes for later use

### 2. Data Initialization
- On application startup, creates demo admin and customer accounts
- Passwords are automatically hashed
- If accounts already exist, they are not recreated

### 3. CORS Configuration
- Allows requests from any origin
- Allows: GET, POST, PUT, DELETE, OPTIONS methods
- Max age: 3600 seconds

## Frontend Integration

The frontend automatically:
1. Calls `/api/auth/login` when user submits login form
2. Stores token in localStorage as `bearer token`
3. Includes token in all subsequent API calls
4. Validates token on page load
5. Redirects to login if token is expired/invalid

---

**Version**: 1.0.0
**Date**: February 24, 2026
**Status**: Production Ready
