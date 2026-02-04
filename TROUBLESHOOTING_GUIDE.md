# Troubleshooting Guide & Important Notes

## ✅ What Was Fixed

### 1. Admin Access Issue
**Problem:** Admin users couldn't access admin pages  
**Solution:** 
- Added debug logging to ProtectedRoute component
- Ensured role is properly passed from backend to frontend
- Redux properly restores user data on page refresh
- Added visible "Admin" link in navbar (orange color)

### 2. Role-Based Access Control
**Problem:** No role verification on protected routes  
**Solution:**
- Implemented ProtectedRoute component in App.js
- Added console logging to verify role checking
- Backend properly includes role in JWT token
- Frontend checks user.role before allowing access

### 3. Admin Navigation
**Problem:** No way to access admin pages  
**Solution:**
- Created Admin Dashboard at `/admin/dashboard`
- Added "Admin" link to navbar (only visible for admins)
- Dashboard shows all admin sections as clickable cards

---

## 🔍 Current Implementation Status

### ✅ Working Features

1. **Admin Login**
   - Admin can login with admin@example.com / admin123
   - Role is properly set to "admin" in database
   - JWT token includes role information

2. **Admin Navigation**
   - Orange "Admin" link appears in navbar for admin users
   - Clicking leads to admin dashboard
   - All admin pages are protected and accessible

3. **Ships Management**
   - Create ships with all required fields
   - Edit existing ships
   - Delete ships
   - Upload ship images
   - Paginated table display
   - IMO uniqueness validation

4. **Applications Management**
   - View all applications (admin only)
   - Filter by status
   - View application details in modal
   - Accept/reject applications
   - Send admin messages
   - Pagination support

5. **Redux State Management**
   - Ships data stored globally
   - Applications data stored globally
   - Transactions data tracked
   - Easy access from any component

---

## ⚠️ Important Notes Before Running

### Database Setup
The database tables are created automatically on server start. No manual setup is needed.

However, if you need to reset:
```bash
# Stop server
# Delete the tables:
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS ships;
# Restart server - tables will be recreated
```

### File Uploads
- Ship images are stored in: `/node_server/uploads/`
- Maximum file size: 5MB
- Allowed formats: JPG, JPEG, PNG, GIF, WebP
- Access URL: `http://localhost:5000/uploads/{filename}`

### Admin User
Default admin user is created on first run:
- Email: `admin@example.com`
- Password: `admin123`
- Role: `admin`

You can create more admin users by directly updating the database:
```sql
UPDATE users SET role = 'admin' WHERE id = X;
```

---

## 🐛 Known Issues & Solutions

### Issue 1: "Admin access required" error
**Cause:** User is not admin in database  
**Solution:** 
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

### Issue 2: IMO number already exists error
**Cause:** Trying to create/update with duplicate IMO  
**Solution:** Use a unique IMO number. IMO must be exactly 10 digits.

### Issue 3: Ship image not displaying
**Cause:** Server not running or file path incorrect  
**Solution:** 
- Ensure server is running on port 5000
- Check that uploads folder exists: `/node_server/uploads/`
- Check browser console for actual error

### Issue 4: Can't access admin pages after login
**Cause:** Role not properly saved in Redux  
**Solution:**
1. Clear browser localStorage: `localStorage.clear()`
2. Logout and login again
3. Check browser console for role verification logs

### Issue 5: Applications table appears empty
**Cause:** No applications created yet  
**Solution:** Users need to submit applications through the normal flow:
- User logs in
- Goes to Ships page
- Clicks Apply button
- Submits application form

---

## 🔧 Debugging Tips

### 1. Check Browser Console
- Open DevTools (F12)
- Go to Console tab
- Look for ProtectedRoute logs
- Shows: `isLoggedIn`, `user`, `requiredRole`, `user.role`

### 2. Check Browser Storage
- Open DevTools → Application/Storage
- Look at localStorage:
  - `sails_current_user` - Should contain user object with role
  - `sails_auth_token` - Should contain JWT token

### 3. Check Redux State
- Install Redux DevTools extension
- Open Redux tab in DevTools
- Check auth slice: user object should have role field
- Check ships/applications slices: data should be populated

### 4. Check Network Requests
- Open DevTools → Network tab
- Watch API calls
- Check response bodies for errors
- Look for role field in user responses

### 5. Server Logs
- Check node_server console output
- Look for database errors
- Check JWT verification logs

---

## 📋 Before Going Live

Make sure to:

1. **Change Admin Password**
```sql
-- Hash new password with bcryptjs first, then:
UPDATE users SET password = '$2a$10$...' WHERE email = 'admin@example.com';
```

2. **Update JWT Secret**
In `node_server/server.js`:
```javascript
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION';
```

3. **Set Environment Variables**
Create `.env` in node_server/:
```
JWT_SECRET=your_secure_secret_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gameportal
PORT=5000
```

4. **Enable HTTPS**
Use a reverse proxy like Nginx with SSL certificates

5. **Set Up Database Backups**
Regular backups of MySQL database

6. **Configure Upload Limits**
Adjust multer file size limits based on your needs

7. **Test All Features**
Run through complete user flows:
- User registration
- Admin login
- Ship creation
- Application submission
- Application review

---

## 📞 Troubleshooting Contact Points

### If Admin Can't Access Pages:
1. Check role in database: `SELECT role FROM users WHERE email = 'admin@example.com';`
2. Check browser console for ProtectedRoute logs
3. Check Redux DevTools for auth slice
4. Clear localStorage and try again

### If Ships Don't Appear:
1. Check ships table exists: `SHOW TABLES;`
2. Check ships in database: `SELECT COUNT(*) FROM ships;`
3. Check if ships have status='active'
4. Check server logs for errors

### If Applications Can't Be Submitted:
1. Verify user is logged in
2. Check applications table exists
3. Check that selected ship exists in database
4. Look at server console for validation errors

### If Images Don't Upload:
1. Check uploads folder exists
2. Check file permissions on uploads folder
3. Check file size (max 5MB)
4. Check file format (jpg, png, gif, webp only)
5. Check server disk space

---

## 🚀 Performance Tips

1. **Pagination**
   - Set appropriate items per page
   - Default is 10, adjust if needed
   - Reduces memory usage

2. **Database Indexes**
   - Indexes are already set on:
     - ships.imo
     - ships.status
     - applications.user_id
     - applications.status
     - applications.created_at

3. **Redux Caching**
   - Data is cached in Redux
   - Prevents unnecessary API calls
   - Refresh manually if data needs updates

4. **Image Optimization**
   - Recommended: compress images before upload
   - Max size: 5MB (adjustable)
   - Use modern formats: WebP when possible

---

## 🔐 Security Checklist

- ✅ JWT authentication enabled
- ✅ Role-based access control implemented
- ✅ Input validation on all endpoints
- ✅ File upload validation
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS configured
- ✅ Error messages don't leak sensitive info
- ⚠️ TODO: HTTPS/SSL in production
- ⚠️ TODO: Rate limiting
- ⚠️ TODO: CSRF protection
- ⚠️ TODO: Helmet.js for security headers

---

## 📊 Database Schema Review

All tables have been created with:
- ✅ Proper data types
- ✅ Foreign key constraints
- ✅ Unique constraints (IMO)
- ✅ Indexes for performance
- ✅ Timestamps for audit trail
- ✅ Appropriate column sizes

---

## 🎯 What Each Component Does

### Backend (Node.js/Express)
- Routes handle HTTP requests
- Middleware checks authentication & authorization
- Database queries validated & sanitized
- Multer handles file uploads
- JWT tokens validate user sessions

### Frontend (React)
- App.js manages routing & ProtectedRoute
- Redux slices manage global state
- Admin pages display management interfaces
- Components handle UI rendering
- Axios makes API calls

### Database (MySQL)
- Users table: authentication
- Ships table: ship data
- Applications table: user applications
- Proper relationships & constraints

---

## 💾 Data Flow

### User Creation/Login
```
Frontend Form → API /api/signup or /api/login
→ Backend validation → Password hashing/comparison
→ JWT token generation → Frontend stores token & user
→ Redux updated with user data
→ Navbar shows Admin link if user.role === 'admin'
```

### Ship Creation (Admin)
```
Admin Form → API /api/admin/ships
→ Backend validation (IMO unique, required fields)
→ Image upload via Multer
→ Database INSERT
→ Redux updated with new ship
→ Table refreshes with new ship
```

### Application Submission (User)
```
User Form → API /api/admin/applications
→ Backend validates & creates record
→ Ships associated with application
→ Admin notified
→ User sees application in list
```

### Application Review (Admin)
```
Admin views Application → Clicks "View"
→ Modal shows full details with image
→ Admin writes message & accepts/rejects
→ API /api/admin/applications PUT
→ Redux updated
→ Table refreshes with new status
```

---

## ✅ Final Verification Steps

Before declaring complete, verify:

1. **Backend API**
   - ✅ Ships endpoints working
   - ✅ Applications endpoints working
   - ✅ Authentication working
   - ✅ Authorization working

2. **Frontend**
   - ✅ Login/Logout working
   - ✅ Admin link appears for admins
   - ✅ Admin dashboard accessible
   - ✅ Ships management working
   - ✅ Applications management working

3. **Database**
   - ✅ Tables created
   - ✅ Admin user exists
   - ✅ Data persists after refresh
   - ✅ Relationships working

4. **Security**
   - ✅ Non-admins can't access admin pages
   - ✅ JWT validation working
   - ✅ File upload validation working
   - ✅ Error messages safe

---

**Last Updated:** February 3, 2026  
**Status:** Complete & Ready for Testing  
**Reviewed:** All components verified functional
