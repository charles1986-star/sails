# Implementation Guide - Ships & Categories

## PART 1: SHIPS IMPLEMENTATION (COMPLETED)

### What Changed:
1. **Frontend now fetches ships from backend API** instead of hardcoded data
2. **ShipSearch.jsx** - Loads ships from API and falls back to local data
3. **ShipDetail.jsx** - Fetches individual ship by ID from API
4. **ShipApply.jsx** - Fetches ship and submits application with authentication

### Frontend Pages Updated:
- `src/pages/ShipSearch.jsx` - Loads all active ships from `/api/admin/ships`
- `src/pages/ShipDetail.jsx` - Loads ship by ID from `/api/admin/ships/{id}`
- `src/pages/ShipApply.jsx` - Submits application to `/api/admin/applications` with user auth

### Backend API Endpoints (Already Exist):

**Ships:**
- GET `/api/admin/ships` - Get all active ships
- GET `/api/admin/ships/:id` - Get single ship
- POST `/api/admin/ships` - Create ship (admin + file upload)
- PUT `/api/admin/ships/:id` - Update ship (admin)
- DELETE `/api/admin/ships/:id` - Delete ship (admin)

**Applications:**
- GET `/api/admin/applications` - Get all applications (admin only)
- GET `/api/admin/my-applications` - Get user's applications (authenticated)
- POST `/api/admin/applications` - Submit new application (authenticated)
- PUT `/api/admin/applications/:id` - Accept/Reject application with message (admin)
- GET `/api/admin/applications/:id` - Get single application details

## PART 2: ADMIN PAGES NEEDED

Create the following admin pages:

### Ships Management:
1. **src/pages/admin/Ships.jsx** - List all ships with Edit/Delete
2. **src/pages/admin/ShipCreate.jsx** - Form to create new ship
3. **src/pages/admin/ShipEdit.jsx** - Form to edit existing ship

### Applications Management:
1. **src/pages/admin/Applications.jsx** - List all applications with status
2. **src/pages/admin/ApplicationEdit.jsx** - Accept/Reject application with message

## PART 3: CATEGORIES IMPLEMENTATION (TO DO)

### Database:
Create `categories` table in server.js (auto-created on startup):
- id (INT, PK, AI)
- name (VARCHAR 255)
- parent_id (INT, FK - for nested categories)
- status (ENUM: active, inactive)
- created_at

### Backend Routes:
`node_server/routes/categories.js` - CRUD endpoints

### Frontend:
- Redux slice: `src/redux/slices/categoriesSlice.js`
- Admin CRUD pages: Categories.jsx, CategoryCreate.jsx, CategoryEdit.jsx
- Update Shop.jsx to fetch categories from API

## Integration Points:

### Ships:
- Ships marked as "active" status show in public list
- When user applies, application is stored with user_id + ship_id
- Admin can accept/reject with message in Applications page

### Products/Categories:
- Products will have category field (foreign key to categories)
- Shop page filters by category from API
- Admin can manage categories in admin panel

### Flow:
User → ShipSearch → ShipDetail → ShipApply → Backend stores application
Admin → Applications list → Accept/Reject with message → Message stored in db

## Key API URLs:
- Frontend API: http://localhost:5000/api/admin
- Requires auth token in Authorization header for protected routes
- Use `getAuthHeader()` helper from src/utils/auth.js
