# API Testing Guide - Postman/cURL Examples

## 🔐 Authentication Endpoints

### 1. Sign Up
```bash
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Expected Response (Success):**
```json
{
  "msg": "Account created successfully! Please login.",
  "type": "success"
}
```

**Expected Response (Error):**
```json
{
  "msg": "Username must be at least 3 characters",
  "type": "error"
}
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Expected Response (Success):**
```json
{
  "msg": "Login successful!",
  "type": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "score": 1000
  }
}
```

**Store the token for authenticated requests:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📊 Transaction Endpoints

### 3. Get All Transactions (Admin Only)
```bash
curl -X GET http://localhost:5000/api/admin/transactions \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Create Transaction
```bash
curl -X POST http://localhost:5000/api/admin/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "user_id": 2,
    "amount": 49.99,
    "type": "purchase",
    "description": "Purchased premium book package"
  }'
```

**Validation:**
- `user_id`: Required (must exist in database)
- `amount`: Required, must be positive number
- `type`: Required (purchase, payment, refund)

### 5. Update Transaction
```bash
curl -X PUT http://localhost:5000/api/admin/transactions/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 59.99,
    "type": "payment",
    "description": "Updated description",
    "status": "completed"
  }'
```

### 6. Delete Transaction
```bash
curl -X DELETE http://localhost:5000/api/admin/transactions/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "msg": "Transaction deleted successfully!",
  "type": "success"
}
```

---

## 📚 Book Endpoints

### 7. Get All Books
```bash
curl -X GET http://localhost:5000/api/admin/books \
  -H "Authorization: Bearer $TOKEN"
```

### 8. Create Book
```bash
curl -X POST http://localhost:5000/api/admin/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Advanced JavaScript",
    "author": "Kyle Simpson",
    "description": "Deep dive into JavaScript concepts",
    "price": 49.99,
    "category": "Programming"
  }'
```

**Validation:**
- `title`: Required, non-empty
- `author`: Required, non-empty
- `price`: Required, positive number
- `category`: Optional
- `description`: Optional

### 9. Update Book
```bash
curl -X PUT http://localhost:5000/api/admin/books/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Advanced JavaScript 2nd Edition",
    "author": "Kyle Simpson",
    "price": 59.99,
    "category": "Programming",
    "status": "active"
  }'
```

### 10. Delete Book
```bash
curl -X DELETE http://localhost:5000/api/admin/books/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎬 Media Endpoints

### 11. Get All Media
```bash
curl -X GET http://localhost:5000/api/admin/media \
  -H "Authorization: Bearer $TOKEN"
```

### 12. Create Media
```bash
curl -X POST http://localhost:5000/api/admin/media \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Tutorial Video",
    "description": "Complete tutorial for beginners",
    "media_type": "video",
    "file_url": "/videos/tutorial.mp4",
    "category": "Education"
  }'
```

**Validation:**
- `title`: Required, non-empty
- `media_type`: Required (image, video, audio)
- `file_url`: Optional
- `category`: Optional

### 13. Update Media
```bash
curl -X PUT http://localhost:5000/api/admin/media/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Advanced Tutorial",
    "media_type": "video",
    "file_url": "/videos/advanced.mp4",
    "status": "active"
  }'
```

### 14. Delete Media
```bash
curl -X DELETE http://localhost:5000/api/admin/media/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📰 Article Endpoints

### 15. Get All Articles
```bash
curl -X GET http://localhost:5000/api/admin/articles \
  -H "Authorization: Bearer $TOKEN"
```

### 16. Create Article
```bash
curl -X POST http://localhost:5000/api/admin/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Getting Started with Node.js",
    "content": "Node.js is a JavaScript runtime built on Chromes V8 JavaScript engine. It allows developers to use JavaScript to write command-line tools and server-side applications.",
    "category": "Backend",
    "status": "published"
  }'
```

**Validation:**
- `title`: Required, non-empty
- `content`: Required, non-empty
- `category`: Optional
- `status`: draft or published

### 17. Update Article
```bash
curl -X PUT http://localhost:5000/api/admin/articles/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Advanced Node.js Patterns",
    "content": "Updated content here...",
    "category": "Backend",
    "status": "published"
  }'
```

### 18. Delete Article
```bash
curl -X DELETE http://localhost:5000/api/admin/articles/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🛍️ Shop Endpoints

### 19. Get All Shops
```bash
curl -X GET http://localhost:5000/api/admin/shops \
  -H "Authorization: Bearer $TOKEN"
```

### 20. Create Shop
```bash
curl -X POST http://localhost:5000/api/admin/shops \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Tech Marketplace",
    "description": "Best place to buy tech products",
    "category": "Electronics",
    "owner_id": 2
  }'
```

**Validation:**
- `name`: Required, non-empty
- `owner_id`: Optional
- `category`: Optional
- `description`: Optional

### 21. Update Shop
```bash
curl -X PUT http://localhost:5000/api/admin/shops/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Premium Tech Store",
    "description": "Premium electronics and gadgets",
    "category": "Electronics",
    "status": "active"
  }'
```

### 22. Delete Shop
```bash
curl -X DELETE http://localhost:5000/api/admin/shops/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧪 Test Scenarios

### Scenario 1: Complete User Signup & Login Flow
```bash
# Step 1: Sign up
curl -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "pass1234",
    "confirmPassword": "pass1234"
  }'

# Step 2: Login with new account
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "pass1234"
  }'
```

### Scenario 2: Admin CRUD Operations
```bash
# 1. Login as admin
TOKEN=$(curl -s -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }' | jq -r '.token')

# 2. Create book
curl -X POST http://localhost:5000/api/admin/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"New Book","author":"Author","price":29.99}'

# 3. Get all books
curl -X GET http://localhost:5000/api/admin/books \
  -H "Authorization: Bearer $TOKEN"

# 4. Update book (ID 1)
curl -X PUT http://localhost:5000/api/admin/books/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Updated Title","price":39.99}'

# 5. Delete book (ID 1)
curl -X DELETE http://localhost:5000/api/admin/books/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## ⚠️ Error Responses

### 400 - Bad Request (Validation Error)
```json
{
  "msg": "Title, author, and price are required",
  "type": "error"
}
```

### 401 - Unauthorized
```json
{
  "msg": "Token required",
  "type": "error"
}
```

### 403 - Forbidden
```json
{
  "msg": "Admin access required",
  "type": "error"
}
```

### 500 - Server Error
```json
{
  "msg": "Server error",
  "type": "error"
}
```

---

## 📋 Postman Collection Template

Import this JSON into Postman:

```json
{
  "info": {
    "name": "Sails Game Portal API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Signup",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/signup",
            "body": {
              "mode": "raw",
              "raw": "{\"username\":\"test\",\"email\":\"test@test.com\",\"password\":\"pass123\",\"confirmPassword\":\"pass123\"}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## 💡 Testing Tips

1. **Store Token**: Save token from login response for authenticated requests
2. **Use Postman Variables**: Set `{{token}}` variable for easy management
3. **Test with Real Data**: Verify relationships between tables
4. **Check Status Codes**: HTTP 200/201 for success, 400+ for errors
5. **Validate Responses**: Ensure msg, type, and data fields are present
6. **Test Edge Cases**: Empty fields, invalid types, missing required fields

---

## ✅ Validation Test Cases

### Test Cases for Signup
| Input | Expected | Result |
|-------|----------|--------|
| Valid all fields | Success | ✅ |
| Username < 3 chars | Error | ✅ |
| Invalid email | Error | ✅ |
| Password < 6 chars | Error | ✅ |
| Password mismatch | Error | ✅ |
| Duplicate email | Error | ✅ |

### Test Cases for Book Creation
| Input | Expected | Result |
|-------|----------|--------|
| Valid all required | Success | ✅ |
| Missing title | Error | ✅ |
| Missing author | Error | ✅ |
| Negative price | Error | ✅ |
| Non-numeric price | Error | ✅ |

---

**Last Updated**: February 2, 2026  
**API Version**: 1.0.0
