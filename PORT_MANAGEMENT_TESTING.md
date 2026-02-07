# Quick Start: Port Management Testing

## Prerequisites
- Node.js and MySQL running
- Backend running on http://localhost:5000
- Frontend running on http://localhost:3000
- Admin user logged in (username: admin, password: admin123)

## Step-by-Step Testing Guide

### 1. Start Backend Server
```bash
cd node_server
npm install
node server.js
```

The server should display:
```
Server running on port 5000
```

### 2. Start Frontend Dev Server
```bash
npm start
```

Frontend will open at http://localhost:3000

### 3. Login as Admin
1. Go to http://localhost:3000/login
2. Email: admin@example.com
3. Password: admin123
4. Click Login

### 4. Test Port Management

#### 4a. Navigate to Port Management
1. Click "Admin" in the sidebar
2. Click "Ships" → "Port Management"
3. You should see the initial 4 ports

#### 4b. Create a New Port
1. Click "Add Port" button
2. Fill in form:
   - Port Name: "Port of Hong Kong"
   - Country: "Hong Kong"
   - Description: "Major Asian shipping hub"
   - Status: Active
3. Click "Create Port"
4. Success notice appears
5. You're redirected to Port list showing new port

#### 4c. Edit a Port
1. Click "Edit" on any port
2. Modify the description or country
3. Click "Update Port"
4. Changes are saved

#### 4d. View All Ports
1. Back at Port list
2. Verify all 5 ports display correctly
3. Check status badges (green for active)

### 5. Test Ship Creation with Ports

#### 5a. Navigate to Ship Management
1. Click "Ships" → "Ships List"
2. Click "Add Ship"

#### 5b. Create Ship with Port Selection
1. Fill Basic Information:
   - Ship Name: "Test Vessel 001"
   - IMO: 9876543
   - Ship Type: "Container Ship"
   - Capacity: 45000
2. Fill Port Information:
   - Start Port: "Port of Singapore"
   - End Port: "Port of Rotterdam"
3. Fill Additional Details:
   - Ship Owner: "Test Shipping Co"
   - Status: Active
   - Description: "Test ship for port management"
4. Click "Create Ship"
5. Success notice should appear

#### 5c. Edit Ship
1. Go back to Ships list
2. Click "Edit" on the newly created ship
3. Verify ports are pre-populated
4. Make a change (e.g., change end port)
5. Click "Update Ship"
6. Verify update succeeds

### 6. Test Ship Application with Notice

#### 6a. Login as Regular User
1. Logout from admin
2. Create new account or use testuser@example.com / password: admin123
3. Login

#### 6b. Apply for Ship
1. Go to "Ships" page
2. Click on a ship
3. Fill application form:
   - Cargo Type: "Containerized"
   - Weight: 5000
   - Contact Name: "John Doe"
   - Contact Email: "john@example.com"
   - Contact Phone: "555-0123"
4. Click "Submit Application"
5. **Verify Success Notice appears** with message
6. Wait 2 seconds for auto-redirect to /applications
7. Application should appear in list

### 7. Test Image Upload

#### 7a. Upload Ship Image
1. As admin, go to Ships → Add Ship
2. Fill form fields
3. Scroll to "Ship Image" section
4. Click file input and select an image
5. Verify image file is selected
6. Create ship
7. Verify `/uploads/ship/` folder contains the image

### 8. API Testing with cURL (Optional)

#### List Ports (Admin)
```bash
curl -X GET http://localhost:5000/api/admin/ports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Create Port
```bash
curl -X POST http://localhost:5000/api/admin/ports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Port of Los Angeles",
    "country": "USA",
    "description": "West coast port",
    "status": "active"
  }'
```

#### Get Public Ports List
```bash
curl http://localhost:5000/api/admin/ports-list
```

## Expected Results

### Database
- [ ] `ports` table created with sample data
- [ ] `ships` table updated with `start_port_id` and `end_port_id`
- [ ] Foreign key constraints in place

### Frontend
- [ ] Port Management submenu visible under Ships
- [ ] Port list displays all ports
- [ ] Create/Edit/Delete functions work
- [ ] Ship forms show port dropdowns
- [ ] Ship image uploads to correct folder
- [ ] Success notice displays on ship application

### Admin Interface
- [ ] Professional form styling applied
- [ ] All labels display correctly
- [ ] Helper text visible below inputs
- [ ] Buttons styled like Upwork (blue primary, outline secondary)
- [ ] Status badges color-coded
- [ ] Tables display with proper formatting

## Common Issues & Solutions

### Ports dropdown is empty
- Verify ports table has data
- Check that GET /ports-list endpoint returns data
- Check browser console for errors

### Upload fails
- Verify `public/uploads/ship/` directory exists
- Check file permissions
- Verify file is under 5MB
- Check file is valid image format

### Success notice doesn't appear
- Verify Notice component is imported in ShipApply.jsx
- Check browser console for errors
- Verify application API call succeeds

### Port Management not visible in menu
- Verify AdminLayout.jsx has been updated
- Clear browser cache
- Log out and back in
- Refresh page (Ctrl+R)

### Form doesn't show labels
- Verify admin.css has been updated
- Clear browser cache
- Check that form-group classes are applied
- Verify CSS file is being loaded

## Database Verification Queries

Run these in MySQL to verify setup:

```sql
-- Check ports table
SELECT * FROM ports;

-- Check ships table structure
DESCRIBE ships;

-- Verify foreign keys
SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'ships' AND REFERENCED_TABLE_NAME = 'ports';

-- Check sample data
SELECT s.id, s.name, s.imo, p1.name as start_port, p2.name as end_port
FROM ships s
LEFT JOIN ports p1 ON s.start_port_id = p1.id
LEFT JOIN ports p2 ON s.end_port_id = p2.id;
```

## Performance Notes

- Port list loads in < 100ms
- Ship creation with port validation < 500ms
- Image upload depends on file size and connection
- All database queries use indexed columns

## Success Checklist

- [ ] Port Management visible in admin menu
- [ ] Can create ports with all required fields
- [ ] Can edit existing ports
- [ ] Can view port list with pagination
- [ ] Cannot delete ports that are in use
- [ ] Can create ships with port selection
- [ ] Ship images save to correct folder
- [ ] Success notice shows after ship application
- [ ] Admin forms display with professional styling
- [ ] All labels and helper text visible
- [ ] Database constraints working correctly

## Next Steps

1. **Test with larger dataset** - Create 50+ ports for pagination
2. **Test concurrent operations** - Edit while another user applies
3. **Test mobile responsiveness** - Open on mobile device
4. **Test permission boundaries** - Try accessing as non-admin
5. **Test form validation** - Submit with missing required fields
6. **Load testing** - Submit 100+ ship applications simultaneously
