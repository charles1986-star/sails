# Sails Game Portal - Authentication & Admin System Implementation

## Overview
Complete integration of login/signup authentication with Node.js backend and admin panel with CRUD operations for transactions, books, media, articles, and shops.

## Features Implemented

### 1. **Authentication System**
- **JWT Token-based Authentication**: Secure token generation and validation
- **Login Page** (`src/pages/Login.jsx`):
  - Email validation
  - Password validation
  - Loading states
  - Notice alerts with success/error messages
  - Redirect to home after successful login

- **Signup Page** (`src/pages/Signup.jsx`):
  - Username validation (min 3 characters)
  - Email format validation
  - Password validation (min 6 characters)
  - Password confirmation check
  - Notice alerts for all validation errors
  - Auto-redirect to login after successful signup

- **Auth Utilities** (`src/utils/auth.js`):
  - `signupUser()`: Register new users with validation
  - `loginUser()`: Authenticate users with JWT tokens
  - `logoutUser()`: Clear authentication data
  - `getCurrentUser()`: Retrieve logged-in user info
  - `getAuthToken()`: Get JWT token
  - `isAuthenticated()`: Check authentication status
  - `getAuthHeader()`: Get authorization header for API calls

### 2. **Backend API (Node.js Server)**
Located in `node_server/server.js`

#### Authentication Endpoints
- **POST `/api/signup`**
  - Validates: username (3+ chars), email format, password (6+ chars), confirm password
  - Returns: Success message or validation error
  - Creates user with 'user' role by default

- **POST `/api/login`**
  - Validates: email and password
  - Returns: JWT token, user object with id, username, email, role, score
  - Token expires in 7 days

#### Admin Middleware
- **verifyToken**: Checks JWT token validity
- **verifyAdmin**: Verifies admin role (blocks non-admin users)

#### CRUD API Endpoints (Admin Only)

**Transactions** (`/api/admin/transactions`)
- GET: Retrieve all transactions with user info
- POST: Create new transaction
  - Validates: user_id, amount (positive number), type
  - Status: pending, completed, failed
- PUT: Update transaction
- DELETE: Delete transaction

**Books** (`/api/admin/books`)
- GET: Retrieve all books
- POST: Create new book
  - Validates: title, author, price (positive)
  - Fields: category, description, status (active/inactive)
- PUT: Update book details
- DELETE: Delete book

**Media** (`/api/admin/media`)
- GET: Retrieve all media files
- POST: Create media entry
  - Validates: title, media_type (image/video/audio)
  - Fields: file_url, category, description, status
- PUT: Update media details
- DELETE: Delete media

**Articles** (`/api/admin/articles`)
- GET: Retrieve all articles with author info
- POST: Create article
  - Validates: title, content
  - Fields: category, status (draft/published)
  - Author: Auto-assigned from logged-in user
- PUT: Update article
- DELETE: Delete article

**Shops** (`/api/admin/shops`)
- GET: Retrieve all shops with owner info
- POST: Create shop
  - Validates: name required
  - Fields: description, category, owner_id, status (active/inactive)
- PUT: Update shop details
- DELETE: Delete shop

### 3. **Admin Dashboard** (`src/pages/Admin.jsx`)
- Protected route (admin only)
- Tabbed interface for each resource type
- **Features**:
  - Create, Read, Update, Delete operations
  - Form validation for all inputs
  - Loading states
  - Success/error notices
  - Responsive data table
  - Edit mode with cancel option
  - Delete confirmation dialog

### 4. **Styling**
- **Admin CSS** (`src/styles/admin.css`):
  - Modern gradient design
  - Responsive grid layouts
  - Smooth transitions and hover effects
  - Mobile-optimized interface
  - Professional color scheme (purple/blue)

- **Notice Component** (`src/components/Notice.jsx`):
  - Auto-dismiss notifications
  - Success and error message types
  - Close button included
  - Professional styling preserved

## Database Schema

### Tables Created
1. **users**
   - id, username (unique), email (unique), password (hashed), role, score, created_at

2. **transactions**
   - id, user_id (FK), amount, type, description, status, created_at

3. **books**
   - id, title, author, description, price, category, cover_image, status, created_at

4. **media**
   - id, title, description, media_type, file_url, category, status, created_at

5. **articles**
   - id, title, content, author_id (FK), category, status, views, created_at

6. **shops**
   - id, name, description, category, owner_id (FK), status, created_at

## Installation & Setup

### Backend Setup
1. Navigate to `node_server/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure MySQL is running with database: `gameportal`
4. Update `server.js` connection details if needed:
   ```javascript
   host: "localhost",
   user: "root",
   password: "", // Add your password
   database: "gameportal"
   ```
5. Start server:
   ```bash
   npm start
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup
1. Navigate to root directory
2. Install dependencies (if needed):
   ```bash
   npm install axios
   ```
3. Start React app:
   ```bash
   npm start
   ```
4. Frontend runs on `http://localhost:3000`

## Usage

### User Authentication Flow
1. **Sign Up**: 
   - Go to `/signup`
   - Fill form with username, email, password
   - Confirm password
   - Success notice shows, redirects to login

2. **Login**:
   - Go to `/login`
   - Enter email and password
   - Success notice shows, redirects to home
   - Token stored in localStorage

3. **Logout**:
   - Click logout in navbar
   - Token and user data cleared

### Admin Operations
1. **Access Admin Panel**:
   - Must be logged in as admin user
   - Navigate to `/admin`
   - Non-admins redirected to home

2. **CRUD Operations**:
   - Click tab to select resource (Transactions, Books, Media, Articles, Shops)
   - Fill form and click "Add" to create
   - Click "Edit" on table row to modify
   - Click "Delete" to remove record
   - All actions show success/error notices

## Validation Rules

### Authentication
- Username: 3+ characters, unique
- Email: Valid email format, unique
- Password: 6+ characters minimum
- Passwords must match during signup

### Transactions
- User ID: Required, must exist
- Amount: Required, positive number
- Type: Required (purchase/payment/refund)

### Books
- Title: Required, non-empty
- Author: Required, non-empty
- Price: Required, positive number

### Media
- Title: Required, non-empty
- Media Type: Required (image/video/audio)

### Articles
- Title: Required, non-empty
- Content: Required, non-empty

### Shops
- Name: Required, non-empty

## Notice System
All actions (create, update, delete) display notices:
- **Success**: Green notice with message
- **Error**: Red notice with error details
- **Validation**: Error notices for form validation
- Auto-dismiss after 4.5 seconds or click X to close

## Security Features
1. **JWT Tokens**: Secure authentication with expiration
2. **Password Hashing**: bcryptjs for secure password storage
3. **Role-Based Access Control**: Admin-only endpoints protected
4. **Input Validation**: All inputs validated on frontend and backend
5. **CORS**: Cross-origin requests handled safely

## Environment Variables
Create `.env` file in `node_server/`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gameportal
JWT_SECRET=your_secret_key_here
```

## File Structure
```
src/
├── pages/
│   ├── Login.jsx          (Updated with Notice integration)
│   ├── Signup.jsx         (Updated with Notice integration)
│   └── Admin.jsx          (New - Admin dashboard)
├── components/
│   └── Notice.jsx         (Existing - used for alerts)
├── styles/
│   ├── auth.css           (Existing - styling preserved)
│   └── admin.css          (New - Admin dashboard styling)
└── utils/
    └── auth.js            (Updated - Node.js integration)

node_server/
├── server.js              (Complete rewrite with all endpoints)
├── db.js                  (Database connection)
├── package.json           (With jwt and bcryptjs)
└── index.js               (Entry point)
```

## API Response Format
All responses follow this structure:
```json
{
  "msg": "Success message or error message",
  "type": "success" | "error",
  "data": [...],          // For GET requests
  "token": "jwt_token",   // For login
  "user": {...}           // For login
}
```

## Testing Checklist
- [ ] Signup with valid data
- [ ] Signup with invalid email
- [ ] Signup with password mismatch
- [ ] Login with correct credentials
- [ ] Login with wrong email/password
- [ ] Admin can access admin panel
- [ ] Non-admin can't access admin panel
- [ ] Create transaction
- [ ] Edit transaction
- [ ] Delete transaction
- [ ] Create book with price validation
- [ ] Create media with type validation
- [ ] Create article
- [ ] Create shop
- [ ] Notice alerts show correctly
- [ ] Token persists on page refresh
- [ ] Logout clears all data

## Troubleshooting

### "Token required" error
- Login again to refresh token
- Clear localStorage if needed

### Database connection error
- Ensure MySQL service is running
- Check connection details in server.js
- Verify database `gameportal` exists

### CORS errors
- Ensure frontend runs on `http://localhost:3000`
- Ensure backend runs on `http://localhost:5000`
- Check `cors()` middleware in server.js

### Notice not showing
- Check Notice component is imported
- Verify state update triggers re-render
- Check CSS is loaded from `admin.css` or `auth.css`

## Future Enhancements
- Email verification
- Password reset functionality
- Admin user management panel
- Dashboard statistics/analytics
- Export data to CSV
- Search and filter functionality
- Pagination for large datasets
- Profile image uploads
