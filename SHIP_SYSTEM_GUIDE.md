# Complete Ship Management System - Implementation Guide

## Overview
This guide documents the comprehensive Ship Management System implementation including ships management, applications handling, and admin features.

---

## 1. DATABASE STRUCTURE

### Ships Table
```sql
CREATE TABLE ships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  imo VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  capacity_tons INT NOT NULL,
  current_port VARCHAR(255),
  next_port VARCHAR(255),
  ship_owner VARCHAR(255),
  image_url VARCHAR(255),
  last_maintenance_date DATE,
  status ENUM('active', 'maintenance', 'decommissioned') DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_imo (imo),
  INDEX idx_status (status),
  INDEX idx_imo (imo)
)
```

**Fields:**
- `imo` - International Maritime Organization number (unique)
- `name` - Ship name
- `type` - Ship type (Cargo, Tanker, Container, etc.)
- `capacity_tons` - Cargo capacity in tons
- `current_port` - Current location
- `next_port` - Next destination
- `ship_owner` - Owner name
- `image_url` - Ship image path
- `last_maintenance_date` - Last maintenance date
- `status` - Ship status (active/maintenance/decommissioned)
- `description` - Additional details

### Applications Table
```sql
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ship_id INT NOT NULL,
  ship_imo VARCHAR(10),
  cargo_type VARCHAR(100),
  cargo_weight DECIMAL(10, 2),
  weight_unit VARCHAR(20),
  preferred_loading_date DATE,
  preferred_arrival_date DATE,
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  message LONGTEXT,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  admin_message LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ship_id) REFERENCES ships(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_ship_id (ship_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
)
```

---

## 2. BACKEND API ENDPOINTS

### Ship Endpoints

#### GET /api/admin/ships
- **Access:** Public (displays active ships)
- **Returns:** List of all active ships
- **Response:**
```json
{
  "data": [...],
  "msg": "Ships fetched",
  "type": "success"
}
```

#### GET /api/admin/ships/:id
- **Access:** Public
- **Returns:** Single ship details by ID
- **Params:** `id` (ship database ID)

#### GET /api/admin/ships/imo/:imo
- **Access:** Public
- **Returns:** Ship details by IMO number
- **Params:** `imo` (IMO number)

#### POST /api/admin/ships
- **Access:** Admin only (requires token + admin role)
- **Requires:** Form data with image upload
- **Fields:**
  - `name` (required)
  - `imo` (required, unique)
  - `type` (required)
  - `capacity_tons` (required)
  - `current_port` (optional)
  - `next_port` (optional)
  - `ship_owner` (optional)
  - `description` (optional)
  - `last_maintenance_date` (optional)
  - `image` (file, optional)
- **Response:**
```json
{
  "msg": "Ship created successfully",
  "type": "success"
}
```

#### PUT /api/admin/ships/:id
- **Access:** Admin only
- **Fields:** Same as POST (all optional for update)
- **Returns:** Updated ship success message

#### DELETE /api/admin/ships/:id
- **Access:** Admin only
- **Returns:** Delete success message

---

### Application Endpoints

#### GET /api/admin/applications
- **Access:** Admin only
- **Returns:** All applications with user and ship details
- **Response:**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "ship_id": 10,
      "ship_name": "MS Ocean",
      "imo": "1234567",
      "username": "john_doe",
      "contact_name": "John Doe",
      "contact_email": "john@example.com",
      "cargo_type": "containerized",
      "cargo_weight": 5000,
      "weight_unit": "tons",
      "status": "pending",
      "created_at": "2024-02-03T10:30:00Z"
    }
  ],
  "msg": "Applications fetched",
  "type": "success"
}
```

#### GET /api/admin/my-applications
- **Access:** Authenticated users
- **Returns:** User's own applications

#### POST /api/admin/applications
- **Access:** Authenticated users
- **Requires:** 
  - `ship_id` (required)
  - `cargo_type` (required)
  - `cargo_weight` (required)
  - `contact_name` (required)
  - `contact_email` (required)
  - `weight_unit` (optional, default: "tons")
  - `preferred_loading_date` (optional)
  - `preferred_arrival_date` (optional)
  - `contact_phone` (optional)
  - `message` (optional)
- **Response:** Success message with application created

#### PUT /api/admin/applications/:id
- **Access:** Admin only
- **Fields:**
  - `status` (pending/accepted/rejected)
  - `admin_message` (optional response to applicant)
- **Returns:** Updated status success message

#### GET /api/admin/applications/:id
- **Access:** Admin or applicant user
- **Returns:** Single application details with authorization check

---

## 3. FRONTEND STRUCTURE

### Redux Slices

#### `src/redux/slices/shipSlice.js`
**Actions:**
- `setShips(ships)` - Set all ships
- `setSelectedShip(ship)` - Set current selected ship
- `addShip(ship)` - Add new ship
- `updateShip(ship)` - Update ship
- `deleteShip(id)` - Delete ship
- `setLoading(boolean)` - Set loading state
- `setError(error)` - Set error message

#### `src/redux/slices/applicationSlice.js`
**Actions:**
- `setApplications(apps)` - Set all applications (admin)
- `setMyApplications(apps)` - Set user's applications
- `setSelectedApplication(app)` - Set current application
- `addApplication(app)` - Add new application
- `updateApplication(app)` - Update application
- `deleteApplication(id)` - Delete application
- `setLoading(boolean)` - Set loading state

#### `src/redux/slices/transactionSlice.js`
**Actions:**
- `setTransactions(transactions)` - Set all transactions
- `setPagination(pagination)` - Set pagination info
- `addTransaction(transaction)` - Add transaction
- `updateTransaction(transaction)` - Update transaction
- `setLoading(boolean)` - Set loading state

---

### Admin Pages

#### `/admin/dashboard`
- Main admin dashboard showing all management sections
- Display applications, transactions, books, media, articles, shops, ships, games
- Cards are clickable to navigate to management page

#### `/admin/applications`
- View all ship applications
- Filter by status (pending/accepted/rejected)
- View application details (ship info, applicant info, cargo details)
- Accept/reject applications
- Send admin messages to applicants
- Pagination support (10 items per page)

#### `/admin/ships`
- Manage all ships
- Create new ships with all required fields
- Edit existing ships
- Delete ships
- Upload ship images
- Display ships in table with pagination
- IMO uniqueness validation

---

## 4. FRONTEND FEATURES

### Ship Management (Admin)
- ✅ Create ships with IMO, type, capacity, ports, owner
- ✅ Edit ship information
- ✅ Delete ships
- ✅ Upload ship images
- ✅ Display ships in paginated table
- ✅ Validation for required fields
- ✅ Status management (active/maintenance/decommissioned)

### Application Management (Admin)
- ✅ View all applications with filters
- ✅ Modal popup showing full application details
- ✅ Ship image display in application modal
- ✅ Accept/reject applications
- ✅ Send admin messages
- ✅ Pagination support
- ✅ Status color coding
- ✅ Application count by status

### User Applications
- ✅ Submit applications for ships
- ✅ View own applications
- ✅ See application status updates
- ✅ Receive admin messages

---

## 5. HOW TO USE

### For Admin Users

#### Adding a Ship:
1. Login as admin (admin@example.com / admin123)
2. Navigate to Admin → Ships
3. Fill all required fields:
   - Ship Name
   - IMO Number (must be unique)
   - Type (e.g., Cargo, Tanker)
   - Capacity (tons)
4. Optional: Add ports, owner, description, image
5. Click "Add Ship"

#### Managing Applications:
1. Go to Admin → Applications
2. View applications filtered by status
3. Click "View" on any application
4. See full details including:
   - Ship information with image
   - Applicant contact info
   - Cargo details
   - Original application message
5. Write admin message (optional)
6. Click "Accept" or "Reject"

### For Regular Users

#### Applying for a Ship:
1. Browse ships in `/ships` page
2. Click on a ship to view details
3. Click "Apply" button
4. Fill application form:
   - Select cargo type
   - Enter cargo weight
   - Dates (loading/arrival)
   - Contact information
   - Message (optional)
5. Submit application

#### Tracking Applications:
1. Go to "My Applications" or account page
2. View all your applications
3. See status: Pending, Accepted, or Rejected
4. Read admin messages if available

---

## 6. DATABASE INITIALIZATION

The database tables are automatically created on server start. No manual setup required.

To manually reset:
```sql
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS ships;
-- Server will recreate on next restart
```

---

## 7. ERROR HANDLING

### Common Issues & Solutions

**Issue:** "IMO number already exists"
- **Solution:** Use a unique IMO number when creating ships

**Issue:** "Required fields missing"
- **Solution:** Ensure name, IMO, type, and capacity_tons are provided

**Issue:** "Admin access required"
- **Solution:** Login with admin account (role must be 'admin' in database)

**Issue:** "Unauthorized" on applications
- **Solution:** Users can only view/manage their own applications

---

## 8. AUTHENTICATION & AUTHORIZATION

### Role-Based Access Control:
- **Public:** View ships, ship details, submit applications
- **Authenticated Users:** View own applications, submit applications
- **Admin:** Manage ships, manage applications, create/edit/delete

### Verification Flow:
1. JWT token extracted from Authorization header
2. Token verified with JWT_SECRET
3. Role extracted from token payload
4. Route middleware checks role before proceeding

---

## 9. FILE UPLOADS

**Ship Images:**
- **Location:** `/node_server/uploads/`
- **Formats:** JPG, JPEG, PNG, GIF, WebP
- **Size Limit:** 5MB
- **Access:** Via `http://localhost:5000/uploads/{filename}`

---

## 10. PAGINATION

Implemented on admin pages:
- Ships: 10 items per page
- Applications: 10 items per page
- Previous/Next navigation buttons
- Current page display

---

## 11. REDUX STATE MANAGEMENT

All data is stored in Redux for global access:
- Ships data accessible from any component
- Applications data shared across admin pages
- Prevents unnecessary API calls
- Faster UI updates

---

## 12. NEXT STEPS / FEATURES TO ADD

1. Email notifications for application status changes
2. Ship search and filtering by type/capacity
3. Bulk import ships from CSV
4. Application timeline/history
5. Document upload for applications
6. Payment integration for ship services
7. Real-time notifications
8. Advanced reporting/analytics

---

## 13. API TESTING

### Test with cURL:

**Get all ships:**
```bash
curl http://localhost:5000/api/admin/ships
```

**Create a ship (as admin):**
```bash
curl -X POST http://localhost:5000/api/admin/ships \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=MS Ocean" \
  -F "imo=1234567" \
  -F "type=Cargo" \
  -F "capacity_tons=50000" \
  -F "image=@ship.jpg"
```

**Get applications (as admin):**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/applications
```

---

## Configuration

### Environment Variables
Create `.env` file in `node_server/`:
```
JWT_SECRET=your_jwt_secret_key_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=gameportal
PORT=5000
```

---

**Last Updated:** February 3, 2026
**System:** Sails Game Portal - Ship Management Module
