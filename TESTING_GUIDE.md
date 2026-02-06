# Testing Guide - Ships & Categories

## Prerequisites

1. **Backend Running:**
   ```bash
   cd node_server
   node server.js
   ```
   Server should be on `http://localhost:5000`

2. **Frontend Running:**
   ```bash
   npm start
   ```
   Frontend should be on `http://localhost:3000`

3. **MySQL Running** with "gameportal" database

---

## Testing Ships System

### Test 1: View Ships on Search Page

**Steps:**
1. Go to http://localhost:3000/ships or click "Ship Search" in nav
2. Wait for ships to load

**Expected:**
- Ships loaded from database (not hardcoded)
- Can search by ship name, type, port
- Can filter by type
- Ship list displays with: Name, IMO, Type, Capacity

**Check in Console:**
- Network tab → Check `GET /api/admin/ships` request
- Should return JSON array with ships from database

---

### Test 2: View Ship Details

**Steps:**
1. From ship search page, click any ship
2. URL should change to `/ships/{id}` (e.g., `/ships/1`)

**Expected:**
- Ship detail page loads
- Shows ship information from database:
  - Name, IMO, Type
  - Capacity in tons
  - Current port, Next port
  - Last maintenance date
  - Owner information

**Check in Console:**
- Network tab → Check `GET /api/admin/ships/{id}` request
- Should return single ship object from database

---

### Test 3: Apply to Ship (Without Login)

**Steps:**
1. Click "Go to apply page" button
2. Try to submit form without filling fields

**Expected:**
- Error notice: "Please fill required fields"
- Form not submitted

**Steps:**
1. Fill all required fields (cargo type, weight, name, email)
2. Click Submit

**Expected:**
- Since not logged in, redirected to login page
- Message: "You must be logged in to apply"

---

### Test 4: Apply to Ship (With Login)

**Steps:**
1. Go to /signup, create test account
2. Go to /login, login with that account
3. Go to ship search, click ship, click apply
4. Fill form completely:
   - Cargo Type: "Containerized"
   - Weight: "5000"
   - Name: "John Doe"
   - Email: "john@example.com"
   - Phone: "555-1234"
   - Message: "Need urgent delivery"
5. Click Submit

**Expected:**
- Success notice: "Application submitted successfully!"
- Redirected to applications list after 2 seconds
- Application stored in database

**Check in Database:**
```sql
SELECT * FROM applications WHERE status = 'pending';
-- Should see your new application
```

**Check in Console:**
- Network tab → `POST /api/admin/applications`
- Request body should have all form data
- Response should be successful

---

### Test 5: Admin Views Applications

**Steps:**
1. Create admin account OR login with existing admin
   - Go to `/admin/dashboard`
   - Go to `/admin/applications`

**Expected:**
- See table of all applications
- Shows: Applicant name, Ship name, Status, etc.
- Can filter by status (pending, accepted, rejected)

**Check:**
- Should see the application you just created
- Status should be "pending"

---

### Test 6: Admin Accepts Application with Message

**Steps:**
1. In admin applications list, click Edit on an application
2. URL should be `/admin/applications/{id}/edit`
3. Type in message box: "Application approved. Cargo confirmed for loading on Feb 10."
4. Click Accept button

**Expected:**
- Success notice: "Application updated"
- Redirected to applications list
- Application status changed to "accepted"

**Check in Database:**
```sql
SELECT status, admin_message FROM applications WHERE id = 1;
-- status: 'accepted'
-- admin_message: 'Application approved. Cargo confirmed...'
```

---

### Test 7: Admin Creates Ship

**Steps:**
1. Go to `/admin/ships`
2. Click "+ Create Ship" button
3. Fill form:
   - Name: "Test Cargo 2000"
   - IMO: "IMO9999999"
   - Type: "Container"
   - Capacity: "8000"
   - Current Port: "Singapore"
   - Next Port: "Dubai"
   - Owner: "Test Shipping Co"
4. Click Create Ship

**Expected:**
- Success notice: "Ship created successfully"
- Redirected to ships list
- New ship appears in table

**Check:**
- Go to `/ships` as regular user
- New ship should appear in search results

---

### Test 8: Admin Edits Ship

**Steps:**
1. In `/admin/ships` list, click Edit on the ship you created
2. URL should be `/admin/ships/{id}/edit`
3. Change Capacity to "9000"
4. Click Update

**Expected:**
- Success notice: "Ship updated"
- Capacity changed in ship list

**Check:**
- Go to `/ships/{id}` as regular user
- New capacity should be "9000"

---

### Test 9: Admin Deletes Ship

**Steps:**
1. In `/admin/ships`, click Delete on a ship
2. Confirm deletion

**Expected:**
- Confirmation dialog appears
- Success notice after deletion
- Ship removed from list

**Check:**
- Ship should not appear in public search anymore

---

## Testing Categories System

### Test 10: Admin Views Categories

**Steps:**
1. Go to `/admin/categories`

**Expected:**
- See table of all categories
- Shows: Name, Description, Status, Actions

**Check:**
- If first time, might be empty (no categories yet)

---

### Test 11: Admin Creates Category

**Steps:**
1. Click "+ Create Category"
2. Fill form:
   - Name: "Custom Design"
   - Description: "Custom design services"
   - Parent Category: (leave empty)
   - Status: "Active"
3. Click Create Category

**Expected:**
- Success notice: "Category created successfully!"
- Redirected to categories list
- New category appears in table

**Check in Database:**
```sql
SELECT * FROM categories WHERE name = 'Custom Design';
-- Should see your new category
```

---

### Test 12: Admin Creates Nested Category

**Steps:**
1. Click "+ Create Category"
2. Fill form:
   - Name: "Logo Design"
   - Description: "Professional logo design"
   - Parent Category: Select "Custom Design" (created above)
   - Status: "Active"
3. Click Create

**Expected:**
- Category created with parent_id set to "Custom Design"

**Check in Database:**
```sql
SELECT id, name, parent_id FROM categories;
-- Should see parent_id for "Logo Design" pointing to "Custom Design"
```

---

### Test 13: Shop Page Loads Categories

**Steps:**
1. Go to `/shop`
2. Wait for page to load completely

**Expected:**
- Shop page works normally
- Categories loaded from API

**Check in Console:**
- Network tab → `GET /api/admin/categories`
- Should return array of categories
- Check component state to see categories loaded

---

### Test 14: Admin Edits Category

**Steps:**
1. Go to `/admin/categories`
2. Click Edit on a category
3. Change description to "Updated description"
4. Click Update Category

**Expected:**
- Success notice
- Description updated in list

---

### Test 15: Admin Cannot Delete Category with Subcategories

**Steps:**
1. Try to delete "Custom Design" category (which has "Logo Design" as child)
2. Click Delete

**Expected:**
- Error: "Cannot delete category with subcategories"
- Category not deleted

**Check:**
- Delete should only work for categories without children

---

### Test 16: Admin Can Delete Leaf Category

**Steps:**
1. Try to delete "Logo Design" category (no children)
2. Click Delete and confirm

**Expected:**
- Success notice
- Category removed from list

---

## Troubleshooting

### "Ship not found" on detail page
- **Check:** Backend running and MySQL has data
- **Check:** Ship ID in URL is numeric and exists in database

### "Failed to load ships" error
- **Check:** Backend URL is `http://localhost:5000`
- **Check:** CORS is enabled in Express
- **Check:** No CORS errors in console

### "You must be logged in" when applying
- **Check:** User is actually logged in (check Auth token in localStorage)
- **Check:** Token is being sent in request headers

### "Admin access required" error
- **Check:** User role is "admin" in database users table
- **Check:** Auth token contains admin role

### Applications not saving
- **Check:** Database connection working (`SELECT * FROM applications;`)
- **Check:** user_id exists in users table
- **Check:** ship_id exists in ships table

### Categories not loading on Shop page
- **Check:** Categories endpoint working: `http://localhost:5000/api/admin/categories`
- **Check:** No 404 errors in network tab

---

## Database Validation Queries

**Check Ships:**
```sql
SELECT * FROM ships WHERE status = 'active';
```

**Check Applications:**
```sql
SELECT a.*, u.username, s.name as ship_name 
FROM applications a
JOIN users u ON a.user_id = u.id
JOIN ships s ON a.ship_id = s.id
ORDER BY a.created_at DESC;
```

**Check Categories:**
```sql
SELECT * FROM categories WHERE status = 'active';
```

**Check with Nested Categories:**
```sql
SELECT c1.name as parent, c2.name as child 
FROM categories c1
JOIN categories c2 ON c1.id = c2.parent_id;
```

---

## API Testing with curl

### Get all ships:
```bash
curl http://localhost:5000/api/admin/ships
```

### Get categories:
```bash
curl http://localhost:5000/api/admin/categories
```

### Get applications (requires admin token):
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/admin/applications
```

### Create category (requires admin token):
```bash
curl -X POST http://localhost:5000/api/admin/categories \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","description":"Test category","status":"active"}'
```

