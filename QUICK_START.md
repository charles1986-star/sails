# Quick Start Guide - Authentication & Admin System

## 🚀 Getting Started in 5 Minutes

### Step 1: Start the Backend Server
```bash
cd node_server
npm start
```
Server will run on `http://localhost:5000`

### Step 2: Start the Frontend Application
```bash
# In a new terminal from root directory
npm start
```
Frontend will run on `http://localhost:3000`

### Step 3: Create Admin User (One-time Setup)

Option A: Direct Database Insert
```sql
-- Connect to your MySQL database
INSERT INTO users (username, email, password, role) 
VALUES ('admin', 'admin@example.com', '$2a$10$...hash...', 'admin');
```

Option B: Using a Tool (Recommended for first time)
1. Use MySQL Workbench or PHPMyAdmin
2. Connect to `gameportal` database
3. Insert a user with role = 'admin'

For bcryptjs hashed password, use this Node.js snippet:
```javascript
// In node_server directory
import bcrypt from 'bcryptjs';
const hashed = await bcrypt.hash('admin123', 10);
console.log(hashed); // Copy this hash to database
```

## ✅ Test the Features

### Test Signup
1. Visit `http://localhost:3000/signup`
2. Fill form:
   - Username: `testuser` (min 3 chars)
   - Email: `test@example.com` (valid email)
   - Password: `password123` (min 6 chars)
   - Confirm: `password123` (must match)
3. Click "Sign Up"
4. Should see success notice and redirect to login

### Test Login
1. Visit `http://localhost:3000/login`
2. Enter:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign in"
4. Should see success notice and redirect to home

### Test Admin Panel
1. Login with admin account
2. Navigate to `http://localhost:3000/admin`
3. Should see admin dashboard with tabs

### Test CRUD Operations
**Create**: Click tab → Fill form → Click "Add"
**Read**: Tab shows all records in table
**Update**: Click "Edit" on table row → Modify → Click "Update"
**Delete**: Click "Delete" → Confirm in dialog

## 📋 Sample Test Data

### Admin User
```
Username: admin
Email: admin@example.com
Password: admin123
Role: admin
```

### Regular User
```
Username: user1
Email: user@example.com
Password: password123
Role: user
```

## 🔍 Key Files Modified/Created

| File | Status | Purpose |
|------|--------|---------|
| `src/pages/Login.jsx` | ✏️ Modified | Login with Notice alerts |
| `src/pages/Signup.jsx` | ✏️ Modified | Signup with validation & Notice |
| `src/pages/Admin.jsx` | ✨ New | Admin CRUD dashboard |
| `src/styles/admin.css` | ✨ New | Admin dashboard styling |
| `src/utils/auth.js` | ✏️ Modified | JWT token integration |
| `src/App.js` | ✏️ Modified | Added admin route |
| `node_server/server.js` | ✏️ Modified | Complete auth & CRUD API |

## 🎨 Features Overview

### Login Page
- ✅ Email validation
- ✅ Password field
- ✅ Notice alerts
- ✅ Link to signup

### Signup Page
- ✅ Username validation (min 3)
- ✅ Email validation
- ✅ Password validation (min 6)
- ✅ Password confirmation
- ✅ Notice alerts
- ✅ Input validation

### Admin Dashboard
- ✅ 5 CRUD modules: Transactions, Books, Media, Articles, Shops
- ✅ Create forms with validation
- ✅ Data tables with edit/delete
- ✅ Notice alerts for all actions
- ✅ Admin-only access protection
- ✅ Responsive design

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot connect to server" | Check if backend running on port 5000 |
| "Token required" error | Login again and refresh page |
| "Admin access required" | User must have role='admin' in database |
| Notice not showing | Check Notice component in imports |
| Form won't submit | Check browser console for validation errors |
| Database not found | Create 'gameportal' database in MySQL |

## 📝 Validation Errors You'll See

```
// Signup errors
"All fields are required"
"Username must be at least 3 characters"
"Please enter a valid email address"
"Password must be at least 6 characters"
"Passwords do not match"
"Email or username already exists"

// Login errors
"Email and password required"
"Invalid email or password"

// Admin form errors
"User ID, amount, and type are required"
"Amount must be a positive number"
"Title, author, and price are required"
"Title and media type are required"
"Title and content are required"
"Shop name is required"
```

## 🔐 Security Implemented

- JWT token authentication (7-day expiration)
- Bcryptjs password hashing (10 rounds)
- Role-based access control
- Input validation (frontend & backend)
- CORS protection
- Admin-only endpoint verification

## 📊 Database Tables

Auto-created on first server start:
- `users` (id, username, email, password, role, score)
- `transactions` (id, user_id, amount, type, description, status)
- `books` (id, title, author, price, category, description, status)
- `media` (id, title, media_type, file_url, category, status)
- `articles` (id, title, content, author_id, category, status, views)
- `shops` (id, name, owner_id, category, description, status)

## 🎯 Next Steps

1. ✅ Ensure MySQL is running
2. ✅ Create admin user in database
3. ✅ Start backend server
4. ✅ Start frontend application
5. ✅ Test signup/login
6. ✅ Login as admin
7. ✅ Access admin panel at `/admin`
8. ✅ Test CRUD operations

## 💡 Pro Tips

- Keep browser DevTools open (F12) to see logs and errors
- Check Network tab to see API requests
- Notice auto-dismisses after 4.5 seconds
- Click X button to close Notice early
- Table updates automatically after CRUD operation
- Edit form can be cancelled without saving

## 🆘 Need Help?

Check these files for implementation details:
- `IMPLEMENTATION_GUIDE.md` - Complete documentation
- `node_server/server.js` - Backend API code
- `src/pages/Admin.jsx` - Admin dashboard code
- `src/utils/auth.js` - Authentication utilities

---

**Version**: 1.0.0  
**Last Updated**: February 2, 2026  
**Status**: ✅ Ready for Testing
