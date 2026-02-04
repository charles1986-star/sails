# 🚀 Quick Start Guide - Ship Management System Complete

## Installation & Setup (5 Minutes)

### 1. Start the Backend Server
```bash
cd d:\RUS\sails\node_server
npm install  # if not already installed
node server.js
```
✅ Server should start on http://localhost:5000

### 2. Start the Frontend
```bash
cd d:\RUS\sails
npm start
```
✅ Frontend should open on http://localhost:3000

### 3. Login as Admin
- Email: `admin@example.com`
- Password: `admin123`

---

## Admin Tasks (First Time Setup)

### Step 1: Create a Ship ⛵

1. Click "Admin" link in navbar (orange button)
2. Go to Admin Dashboard → Ships
3. Fill the form:
   - **Ship Name**: MS Ocean
   - **IMO Number**: 9876543210 (must be unique)
   - **Type**: Cargo
   - **Capacity**: 50000
   - **Current Port**: Shanghai
   - **Next Port**: Rotterdam
   - **Owner**: Global Shipping
4. Upload a ship image
5. Click "Add Ship"

✅ Ship is now created and visible in the table

### Step 2: User Applies for Ship (Simulate)

1. Logout (top right)
2. Login as regular user OR create new account
3. Go to "Ships" in main menu
4. Click on the ship you created
5. Click "Apply" button
6. Fill application form:
   - Cargo Type: Containerized
   - Weight: 10000 tons
   - Contact Name: John Doe
   - Email: john@example.com
   - Phone: +1234567890
7. Click "Submit Application"

✅ Application is submitted

### Step 3: Review Application (Admin)

1. Logout
2. Login as admin again
3. Click "Admin" → Applications
4. You should see the application you just submitted
5. Click "View" button
6. See full details including:
   - Ship info & image
   - Applicant contact info
   - Cargo details
7. Write a message (optional)
8. Click "Accept" or "Reject"

✅ Application is reviewed and status updated

---

## Key Features to Try

### Admin Dashboard
- Shows all management sections
- Click any card to go to that section
- 📋 Applications, 💳 Transactions, 📚 Books, etc.

### Ships Management
- ✏️ Click "Edit" to update ship info
- 🗑️ Click "Delete" to remove ship
- 📄 Paginate through ships (10 per page)
- 🖼️ View ship images in table

### Applications Management
- 🔍 Filter by status (Pending/Accepted/Rejected)
- 👁️ View full application details in popup
- 🖼️ See ship image in application modal
- 💬 Send messages with accept/reject
- 📊 See count of applications by status

---

## Important URLs

```
Frontend:       http://localhost:3000
Admin Dashboard: http://localhost:3000/admin/dashboard
Ships Management: http://localhost:3000/admin/ships
Applications:   http://localhost:3000/admin/applications
API Base:       http://localhost:5000/api
```

---

## Database Tables Created Automatically

Tables are automatically created on first server start:
- ✅ users - User accounts
- ✅ ships - Ship information
- ✅ applications - User applications
- ✅ transactions - Transaction history
- ✅ books - Library books
- ✅ media - Media files
- ✅ articles - Articles
- ✅ shops - Shops
- ✅ games - Games

No manual database setup needed!

---

## Troubleshooting

### Admin Link Not Showing?
- Clear localStorage: `localStorage.clear()`
- Logout and login again
- Check browser console (F12) for errors

### Can't Upload Ship Image?
- Max size is 5MB
- Allowed formats: JPG, PNG, GIF, WebP
- Check uploads folder exists: `/node_server/uploads/`

### Applications Not Showing?
- Make sure you submitted an application as a user
- Check database: applications should be in MySQL
- Refresh the page

### Database Errors?
- Ensure MySQL is running
- Check connection in `/node_server/server.js`
- Verify database name is "gameportal"

---

## Code Files Modified/Created

### Backend
- ✅ `/node_server/server.js` - Updated with ships & applications tables
- ✅ `/node_server/routes/ships.js` - Complete CRUD endpoints
- ✅ `/node_server/middleware/auth.js` - Authentication

### Frontend - Redux
- ✅ `/src/redux/slices/shipSlice.js` - NEW
- ✅ `/src/redux/slices/applicationSlice.js` - NEW
- ✅ `/src/redux/slices/transactionSlice.js` - NEW
- ✅ `/src/redux/store.js` - Updated with new slices

### Frontend - Admin Pages
- ✅ `/src/pages/admin/Dashboard.jsx` - Updated with applications
- ✅ `/src/pages/admin/Ships.jsx` - Complete management page
- ✅ `/src/pages/admin/Applications.jsx` - NEW complete management

### Frontend - Components
- ✅ `/src/components/Navbar.jsx` - Added admin link
- ✅ `/src/App.js` - Updated routes & added debug logging

### Styles
- ✅ `/src/styles/admin.css` - Enhanced with forms, tables, pagination
- ✅ `/src/styles/navbar.css` - Added admin link styling

### Documentation
- ✅ `SHIP_SYSTEM_GUIDE.md` - Complete system documentation
- ✅ `IMPLEMENTATION_COMPLETE.md` - Full feature list
- ✅ `TROUBLESHOOTING_GUIDE.md` - Debugging tips
- ✅ `ADMIN_ACCESS_FIX.md` - Admin access details

---

## API Endpoints Quick Reference

### Ships
```
GET    /api/admin/ships             - List all ships
POST   /api/admin/ships             - Create ship (admin)
GET    /api/admin/ships/:id         - Get ship by ID
PUT    /api/admin/ships/:id         - Update ship (admin)
DELETE /api/admin/ships/:id         - Delete ship (admin)
```

### Applications
```
GET    /api/admin/applications      - List all (admin)
GET    /api/admin/my-applications   - List user's
POST   /api/admin/applications      - Create application
PUT    /api/admin/applications/:id  - Update status (admin)
GET    /api/admin/applications/:id  - Get single
```

---

## What's Included

### Backend Features
- ✅ Complete Ship CRUD with image upload
- ✅ Application management system
- ✅ Role-based access control
- ✅ JWT authentication
- ✅ Input validation & error handling
- ✅ MySQL database integration

### Frontend Features
- ✅ Redux state management
- ✅ Admin dashboard
- ✅ Ships management page (create/edit/delete)
- ✅ Applications management page
- ✅ Pagination on all lists
- ✅ Filter/search functionality
- ✅ Modal popups for details
- ✅ Professional UI with animations

### Database Features
- ✅ Ships table with all required fields
- ✅ Applications table with relationships
- ✅ Proper indexes for performance
- ✅ Timestamps for audit trail
- ✅ Foreign key constraints

---

## Admin Credentials

**For Testing:**
```
Email: admin@example.com
Password: admin123
Role: admin
```

**To Add More Admins:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'new_admin@example.com';
```

---

## File Upload Locations

Ship images are saved to:
```
/node_server/uploads/
```

Access via URL:
```
http://localhost:5000/uploads/filename.jpg
```

---

## Debug Mode

To see debug logs:
1. Open Browser DevTools (F12)
2. Go to Console tab
3. Look for "ProtectedRoute check" logs
4. Shows user role verification details

---

## Browser Storage

User data is stored in localStorage:
```javascript
sails_current_user   // User object with role
sails_auth_token     // JWT token
```

Clear if having issues:
```javascript
localStorage.clear()
```

---

## Environment Setup

Create `.env` in `/node_server/`:
```
JWT_SECRET=your_secret_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=gameportal
PORT=5000
```

---

## What NOT to Do

- ❌ Don't modify `/src/styles/` files (styling preserved)
- ❌ Don't delete `/node_server/uploads/` folder
- ❌ Don't share admin password
- ❌ Don't make IMO numbers non-unique
- ❌ Don't upload files larger than 5MB

---

**Ready to Go! 🎉**

You now have a complete Ship Management System running.  
Start with the tutorial above and explore all features.

For detailed documentation, see:
- `SHIP_SYSTEM_GUIDE.md` - Full system guide
- `IMPLEMENTATION_COMPLETE.md` - All features listed
- `TROUBLESHOOTING_GUIDE.md` - Problem solving
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
