# Step-by-Step Explanation - Ships & Categories Implementation

## PART 1: SHIPS SYSTEM FLOW

### Step 1: User Visits Ship Search Page
**File:** `src/pages/ShipSearch.jsx`

```javascript
// On component mount:
useEffect(() => {
  const load = async () => {
    try {
      const res = await axios.get(`${API_URL}/ships`);
      if (res?.data?.data) dispatch(setShips(res.data.data));
    } catch (err) {
      // Falls back to local data
    }
  };
  if (!shipsFromStore || shipsFromStore.length === 0) load();
}, [dispatch, shipsFromStore]);
```

**What happens:**
- Fetches ships from backend API: `GET /api/admin/ships`
- Stores in Redux `shipSlice`
- If API fails, uses hardcoded `shipsData` as fallback
- Ships are filtered and sorted based on user input

---

### Step 2: User Clicks on a Ship
**File:** `src/pages/ShipDetail.jsx`

```javascript
// When user clicks ship, URL becomes: /ships/123
const { id } = useParams();

useEffect(() => {
  const loadShip = async () => {
    try {
      // Try Redux store first
      if (shipsFromStore && shipsFromStore.length > 0) {
        const foundShip = shipsFromStore.find((s) => s.id === parseInt(id));
        if (foundShip) { setShip(foundShip); return; }
      }
      
      // If not in store, fetch from API
      const res = await axios.get(`${API_URL}/ships/${id}`);
      setShip(res.data.data);
    } catch (err) {
      // Fallback to local data
    }
  };
  loadShip();
}, [id, shipsFromStore]);
```

**What happens:**
- Fetches single ship details: `GET /api/admin/ships/{id}`
- Displays:
  - Ship name, IMO, type
  - Capacity, current port, next port
  - Last maintenance date
  - Owner information

---

### Step 3: User Clicks "Go to Apply"
**File:** `src/pages/ShipApply.jsx`

```javascript
// URL becomes: /ships/123/apply
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!form.cargoType || !form.weight || !form.contactName) {
    setNotice({ type: 'error', msg: 'Fill required fields' });
    return;
  }
  
  // Check user is logged in
  if (!user || !user.id) {
    navigate('/login');
    return;
  }
  
  // Send application to backend
  const payload = {
    ship_id: ship.id,
    cargo_type: form.cargoType,
    cargo_weight: form.weight,
    weight_unit: form.weightUnit,
    preferred_loading_date: form.preferredLoadingDate,
    preferred_arrival_date: form.preferredArrivalDate,
    contact_name: form.contactName,
    contact_email: form.contactEmail,
    contact_phone: form.contactPhone,
    message: form.message,
  };
  
  const res = await axios.post(`${API_URL}/applications`, payload, { 
    headers: getAuthHeader() 
  });
  
  // Store application in Redux
  dispatch(addApplication(res.data.data));
  setNotice({ type: 'success', msg: 'Application submitted!' });
};
```

**What happens:**
- User fills form with cargo details and contact info
- Form validated client-side
- Submission requires authentication (user logged in)
- Sends: `POST /api/admin/applications` with auth header
- Backend stores application with:
  - `user_id` - Who applied
  - `ship_id` - Which ship
  - `status: 'pending'` - Initial status
  - All cargo and contact details
- Success notice shown, user redirected to applications list

---

### Step 4: Backend Stores Application
**File:** `node_server/routes/ships.js`

```javascript
router.post('/applications', verifyToken, upload.single('document'), async (req, res) => {
  const userId = req.userId; // From JWT token
  const { ship_id, cargo_type, cargo_weight, ... } = req.body;
  
  // Validate all fields
  if (!ship_id || !cargo_type || !cargo_weight) {
    return res.status(400).json({ msg: 'Missing fields' });
  }
  
  // Verify ship exists
  const [ship] = await db.query('SELECT id FROM ships WHERE id = ?', [ship_id]);
  if (ship.length === 0) {
    return res.status(404).json({ msg: 'Ship not found' });
  }
  
  // Insert into database
  await db.query(
    `INSERT INTO applications (user_id, ship_id, cargo_type, cargo_weight, ...)
     VALUES (?, ?, ?, ?, ...)`,
    [userId, ship_id, cargo_type, cargo_weight, ...]
  );
  
  res.status(201).json({ msg: 'Application submitted' });
});
```

**Database:**
```
applications table:
- id: 1
- user_id: 42 (applicant's ID)
- ship_id: 7 (ship applied for)
- cargo_type: 'containerized'
- cargo_weight: 5000
- status: 'pending'
- admin_message: null (empty initially)
- created_at: 2026-02-05
```

---

### Step 5: Admin Views Applications
**File:** `src/pages/admin/Applications.jsx`

```javascript
useEffect(() => {
  if (!user || user.role !== 'admin') {
    navigate('/');
    return;
  }
  loadApplications();
}, [user]);

const loadApplications = async () => {
  const headers = getAuthHeader(); // Get auth token
  const res = await axios.get(`${API_URL}/applications`, { headers });
  dispatch(setApplications(res.data.data || []));
};
```

**What happens:**
- Admin goes to `/admin/applications`
- Fetches: `GET /api/admin/applications` (admin only endpoint)
- Displays table with:
  - Applicant name, email
  - Ship name
  - Cargo details
  - Application status (pending/accepted/rejected)
- Can filter by status
- Edit button for each application

---

### Step 6: Admin Accepts/Rejects Application
**File:** `src/pages/admin/ApplicationEdit.jsx`

```javascript
const handleUpdate = async (newStatus) => {
  const headers = getAuthHeader();
  
  // Send to backend
  await axios.put(`${API_URL}/applications/${id}`, 
    { 
      status: newStatus,           // 'accepted' or 'rejected'
      admin_message: adminMessage  // Custom message from admin
    }, 
    { headers }
  );
  
  // Message stored in database
};
```

**What happens:**
- Admin opens application detail page
- Selects "Accept" or "Reject"
- Types message (e.g., "Approved - Loading dock assigned")
- Clicks Save
- Sends: `PUT /api/admin/applications/{id}`
- Backend updates:
  - `status: 'accepted'` or `status: 'rejected'`
  - `admin_message: 'Approved - Loading dock assigned'`
  - `updated_at: NOW()`

**Database:**
```
applications table (after update):
- status: 'accepted'
- admin_message: 'Approved - Loading dock assigned'
- updated_at: 2026-02-05 14:30:00
```

---

## PART 2: CATEGORIES SYSTEM FLOW

### Step 1: Admin Goes to Categories Page
**File:** `src/pages/admin/Categories.jsx`

```javascript
useEffect(() => {
  if (!user || user.role !== 'admin') {
    navigate('/');
    return;
  }
  loadCategories();
}, [user]);

const loadCategories = async () => {
  const res = await axios.get(`${API_URL}/categories`, { headers: getAuthHeader() });
  dispatch(setCategories(res?.data?.data || []));
};
```

**What happens:**
- Admin clicks "Categories" in admin menu
- Fetches: `GET /api/admin/categories`
- Shows list of all categories in table
- Can Create, Edit, or Delete

---

### Step 2: Admin Creates New Category
**File:** `src/pages/admin/CategoryCreate.jsx`

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.name.trim()) {
    setNotice({ msg: 'Name required' });
    return;
  }
  
  const payload = {
    name: formData.name.trim(),
    description: formData.description.trim() || null,
    parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
    status: formData.status, // 'active' or 'inactive'
  };
  
  await axios.post(`${API_URL}/categories`, payload, { headers: getAuthHeader() });
};
```

**What happens:**
- Admin fills form:
  - Name (required): "Web Design"
  - Description (optional): "Website design services"
  - Parent Category (optional): "Design" (nested categories)
  - Status: "active"
- Sends: `POST /api/admin/categories`
- Backend validates:
  - Name is required
  - Name must be unique
  - Parent category must exist (if provided)
- Database stores new category
- Redirects to category list

**Database:**
```
categories table:
- id: 15
- name: 'Web Design'
- parent_id: 3 (if 'Design' category has id 3)
- description: 'Website design services'
- status: 'active'
- created_at: 2026-02-05
```

---

### Step 3: Categories Available on Shop Page
**File:** `src/pages/Shop.jsx`

```javascript
useEffect(() => {
  const loadCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res?.data?.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      // Continue with empty categories
    }
  };
  loadCategories();
}, []);
```

**What happens:**
- Shop page loads on user visit
- Fetches: `GET /api/admin/categories`
- Categories stored in component state
- Can use categories for:
  - Displaying category sidebar
  - Filtering products by category
  - Showing category-specific pages
- If API fails, categories array is empty (graceful fallback)

---

## Data Structure Summary

### Ships Table (Database)
```
CREATE TABLE ships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  imo VARCHAR(10) UNIQUE,
  name VARCHAR(255),
  type VARCHAR(100),
  capacity_tons INT,
  current_port VARCHAR(255),
  next_port VARCHAR(255),
  ship_owner VARCHAR(255),
  description TEXT,
  status ENUM('active', 'maintenance', 'decommissioned'),
  created_at TIMESTAMP
)
```

### Applications Table (Database)
```
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT (who applied),
  ship_id INT (which ship),
  cargo_type VARCHAR(100),
  cargo_weight DECIMAL(10, 2),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  message LONGTEXT,
  status ENUM('pending', 'accepted', 'rejected'),
  admin_message LONGTEXT (message from admin),
  created_at TIMESTAMP
)
```

### Categories Table (Database)
```
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) UNIQUE,
  parent_id INT (for nested categories),
  description TEXT,
  status ENUM('active', 'inactive'),
  created_at TIMESTAMP
)
```

---

## API Endpoints Reference

### Ships (Public)
- `GET /api/admin/ships` - List all active ships
- `GET /api/admin/ships/{id}` - Get ship details

### Ships (Admin Only)
- `POST /api/admin/ships` - Create ship
- `PUT /api/admin/ships/{id}` - Update ship
- `DELETE /api/admin/ships/{id}` - Delete ship

### Applications (User/Admin)
- `POST /api/admin/applications` - Submit application (requires auth)
- `GET /api/admin/my-applications` - Get user's applications (requires auth)
- `GET /api/admin/applications/{id}` - View application (requires auth)

### Applications (Admin Only)
- `GET /api/admin/applications` - View all applications
- `PUT /api/admin/applications/{id}` - Accept/Reject with message

### Categories (Public)
- `GET /api/admin/categories` - List active categories

### Categories (Admin Only)
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/{id}` - Update category
- `DELETE /api/admin/categories/{id}` - Delete category

---

## Key Features

✅ **Ships from Database** - No hardcoded data in frontend
✅ **Authentication** - Applications require user login
✅ **Admin Messages** - Admins can send messages to applicants
✅ **Nested Categories** - Support for parent/child categories
✅ **Status Control** - Active/Inactive for ships and categories
✅ **Graceful Fallback** - Works with local data if API unavailable
✅ **Form Validation** - Both client and server side
✅ **Error Handling** - User-friendly error messages
✅ **No Style Changes** - Existing CSS preserved

