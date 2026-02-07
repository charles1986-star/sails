# Port Management System - Architecture & Flow Diagrams

## Database Relationships

```
┌─────────────────────────────────────────────────────┐
│                    PORTS TABLE                      │
├─────────────────────────────────────────────────────┤
│ id (PK)           │ Unique identifier               │
│ name              │ Port name (UNIQUE)              │
│ country           │ Country location                │
│ description       │ Port details                    │
│ status            │ active / inactive               │
│ created_at        │ Creation timestamp              │
└─────────────────────────────────────────────────────┘
          ▲                              ▲
          │ (1 to Many)                  │ (1 to Many)
          │                              │
    ┌─────┴──────────────┬───────────────┴──────┐
    │                    │                      │
    │                    │                      │
    │              ┌─────────────────────────────────────┐
    │              │        SHIPS TABLE                 │
    │              ├─────────────────────────────────────┤
    │              │ id (PK)                             │
    │              │ imo (UNIQUE)                        │
    │              │ name                                │
    │              │ type                                │
    │              │ capacity_tons                       │
    │──────────────│ start_port_id (FK → ports.id)       │
    │              │ end_port_id (FK → ports.id)         │
    │              │ ship_owner                          │
    │              │ image_url                           │
    │              │ last_maintenance_date               │
    │              │ status                              │
    │              │ description                         │
    │              │ created_at / updated_at             │
    │              └─────────────────────────────────────┘
    │                    ▲
    │                    │ (1 to Many)
    │                    │
    │              ┌──────────────────────────────────┐
    │              │ APPLICATIONS TABLE               │
    │              ├──────────────────────────────────┤
    │              │ id (PK)                          │
    │              │ user_id (FK → users)             │
    │              │ ship_id (FK → ships)             │
    │──────────────│ (indirectly linked via ships)    │
    │              │ cargo_type                       │
    │              │ cargo_weight                     │
    │              │ status (pending/accepted/rejected)│
    │              └──────────────────────────────────┘
    │
    └─ Each port can be START or END port for multiple ships
```

## Admin UI Navigation Flow

```
┌──────────────────────────────────────────────────────┐
│         ADMIN DASHBOARD (Main Entry)                 │
└──────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
   Transactions      Ships           Applications
                      │
        ┌─────────────┼──────────────┐
        │             │              │
        ▼             ▼              ▼
   Ships List   Port Management   Games
   
   ┌─────────────────────────────────┐
   │  PORT MANAGEMENT SUBMENU        │
   ├─────────────────────────────────┤
   │ > Port List                     │
   │   - View all ports              │
   │   - Edit / Delete buttons       │
   │   - Add Port button             │
   │   - Pagination (10 per page)    │
   │                                 │
   │ > Add Port (Create form)        │
   │   - Port Name*                  │
   │   - Country*                    │
   │   - Description                 │
   │   - Status                      │
   │                                 │
   │ > Edit Port (Update form)       │
   │   - Same fields as Add Port     │
   │   - Pre-populated data          │
   │   - Duplicate name check        │
   └─────────────────────────────────┘
   
   ┌─────────────────────────────────┐
   │  SHIP MANAGEMENT FORM           │
   ├─────────────────────────────────┤
   │ ┌─ Basic Information            │
   │ │  - Ship Name*                 │
   │ │  - IMO Number*                │
   │ │  - Ship Type                  │
   │ │  - Capacity                   │
   │ │                               │
   │ ├─ Port Information ◄── NEW    │
   │ │  - Start Port* (dropdown)     │
   │ │  - End Port* (dropdown)       │
   │ │    (populated from ports db)  │
   │ │                               │
   │ ├─ Additional Details           │
   │ │  - Ship Owner                 │
   │ │  - Last Maintenance Date      │
   │ │  - Status                     │
   │ │  - Description                │
   │ │  - Ship Image (to /uploads/)  │
   │ └                               │
   └─────────────────────────────────┘
```

## Ship Application Flow (User Side)

```
┌───────────────────────────────────────────────────────┐
│  USER BROWSING SHIPS                                  │
└───────────────────────────────────────────────────────┘
              │
              ▼
    ┌─────────────────────┐
    │  Ship Detail Page   │
    │  - Shows:           │
    │    * Ship name      │
    │    * IMO            │
    │    * Start port ◄── Loaded from ports table
    │    * End port ◄─── Loaded from ports table
    │    * Capacity       │
    │    * [Apply Button] │
    └─────────────────────┘
              │
              ▼
    ┌──────────────────────────────┐
    │ APPLY FORM                   │
    ├──────────────────────────────┤
    │ Cargo Details Section        │
    │ - Type (required)            │
    │ - Weight (required)          │
    │                              │
    │ Preferred Dates              │
    │ - Loading Date               │
    │ - Arrival Date               │
    │                              │
    │ Contact Information          │
    │ - Name (required)            │
    │ - Email (required)           │
    │ - Phone                      │
    │                              │
    │ [Submit Application]         │
    └──────────────────────────────┘
              │
              ▼
    ┌──────────────────────────────┐
    │ SUBMISSION LOGIC             │
    ├──────────────────────────────┤
    │ 1. Validate form (client)    │
    │ 2. Submit to API             │
    │ 3. Server validates          │
    │ 4. Save to database          │
    │ 5. Return response           │
    └──────────────────────────────┘
              │
              ▼
    ┌──────────────────────────────┐
    │ SHOW SUCCESS NOTICE          │ ◄─── NEW Feature
    ├──────────────────────────────┤
    │ ✓ "Application submitted!" │
    │                              │
    │ Auto-dismisses in 2 seconds  │
    │ Redirects to /applications   │
    └──────────────────────────────┘
              │
              ▼
    ┌──────────────────────────────┐
    │ APPLICATIONS PAGE            │
    │ - Shows submitted apps       │
    └──────────────────────────────┘
```

## API Request/Response Flow

```
┌─────────────────────────────────────────────────────┐
│               FRONTEND (React)                      │
├─────────────────────────────────────────────────────┤
│ Admin clicks "Add Port" → PortCreate Component     │
│ Loads ports via Redux dispatch                      │
└────────────────┬──────────────────────────────────┘
                 │
         (HTTP POST/PUT/DELETE)
         (JWT Token in Header)
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│               BACKEND (Express)                     │
├─────────────────────────────────────────────────────┤
│ Route Handler: POST /api/admin/ports               │
│   │                                                 │
│   ├─ Middleware: verifyToken (check JWT)           │
│   ├─ Middleware: verifyAdmin (check role)          │
│   ├─ Validate request body                         │
│   ├─ Check for duplicate port names                │
│   ├─ INSERT into database                          │
│   │                                                 │
│   └─ Return: { data: port, msg: "...", type: "..." }
└────────────────┬──────────────────────────────────┘
                 │
         (JSON Response)
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│               REDUX STATE (Frontend)                │
├─────────────────────────────────────────────────────┤
│ Dispatch: addPort(portData)                        │
│   ↓                                                 │
│ Redux Reducer: ports.push(newPort)                 │
│   ↓                                                 │
│ UI Updates: Component re-renders with new port    │
│   ↓                                                 │
│ Show Notice: "Port created successfully!"         │
│   ↓                                                 │
│ Navigate: /admin/ports (list page)                │
└─────────────────────────────────────────────────────┘
```

## Form Validation Flow

```
┌────────────────────────────────────────────────────┐
│        USER SUBMITS FORM                           │
└────────────────────────────────────────────────────┘
              │
              ▼
    ┌─────────────────────────────┐
    │ CLIENT-SIDE VALIDATION      │
    ├─────────────────────────────┤
    │ Check:                      │
    │ - Required fields present?  │
    │ - Name format valid?        │
    │ - All ports selected?       │
    │                             │
    │ If invalid → Show error     │
    │ If valid → Continue...      │
    └─────────────────────────────┘
              │
              ▼
    ┌─────────────────────────────┐
    │ SEND TO API                 │
    └─────────────────────────────┘
              │
              ▼
    ┌─────────────────────────────┐
    │ SERVER-SIDE VALIDATION      │
    ├─────────────────────────────┤
    │ Verify:                     │
    │ - JWT token valid?          │
    │ - User is admin?            │
    │ - Required fields present?  │
    │ - Name is unique?           │
    │ - Ports exist in DB?        │
    │                             │
    │ If invalid → 400 error      │
    │ If valid → Process request  │
    └─────────────────────────────┘
              │
              ├─ INVALID ────→ Error Response
              │                (msg + type)
              │
              ├─ VALID ──────→ Database INSERT
                               Success Response
                               Return new data
```

## Professional UI/UX Flow

```
┌──────────────────────────────────────────┐
│  FORM WITH PROFESSIONAL STYLING          │
├──────────────────────────────────────────┤
│                                          │
│  ━━━━━ FORM SECTION ━━━━━               │
│  ┌─ Port Information                    │
│  │                                      │
│  │  Port Name *                         │
│  │  ┌──────────────────────────────┐   │
│  │  │ Enter official port name  │   │
│  │  └──────────────────────────────┘   │
│  │  Hint: Use full port name             │
│  │                                      │
│  │  Country *                           │
│  │  ┌──────────────────────────────┐   │
│  │  │ e.g., Singapore            │   │
│  │  └──────────────────────────────┘   │
│  │  Hint: Country of port location      │
│  │                                      │
│  │  Description                         │
│  │  ┌──────────────────────────────┐   │
│  │  │ Port facilities, size, etc. │   │
│  │  │                              │   │
│  │  └──────────────────────────────┘   │
│  │  Hint: Optional - Add port details   │
│  │                                      │
│  └─ Status                              │
│     ┌──────────────────────────────┐   │
│     │ Active         ▼              │   │
│     │ ├─ Active                    │   │
│     │ └─ Inactive                  │   │
│     └──────────────────────────────┘   │
│                                          │
│  ━━━━━ ACTION BUTTONS ━━━━━             │
│  ┌────────────────┐  ┌──────────────┐  │
│  │ Create Port    │  │ Cancel       │  │
│  │ (Blue/Solid)   │  │ (Outline)    │  │
│  └────────────────┘  └──────────────┘  │
│                                          │
└──────────────────────────────────────────┘

User Experience:
✓ Clear labels for each field
✓ Helper text explains purpose
✓ Professional spacing and layout
✓ Color-coded buttons
✓ Visual feedback on interaction
✓ Error messages if validation fails
```

## Data Flow: Creating a Ship with Ports

```
1. ADMIN ACCESSES SHIP CREATE FORM
   ├─ Page loads ShipCreate component
   ├─ useEffect fires
   └─ loadPorts() called via API

2. LOAD PORTS FROM DATABASE
   ├─ GET /api/admin/ports-list
   ├─ Backend queries: SELECT id, name, country FROM ports
   ├─ Returns 4 ports (Singapore, Shanghai, Rotterdam, Dubai)
   └─ setState({ ports: [...] })

3. ADMIN FILLS FORM
   ├─ Ship Name: "MV Harmony"
   ├─ IMO: 9876543
   ├─ Type: "Container Ship"
   ├─ Capacity: 54000
   ├─ Start Port: Port of Singapore (id: 1) ◄─── From dropdown
   ├─ End Port: Port of Rotterdam (id: 3) ◄─── From dropdown
   ├─ Owner: "Major Shipping Co"
   ├─ Image: photo.jpg (→ /uploads/ship/[timestamp]-photo.jpg)
   └─ Status: Active

4. FORM SUBMISSION
   ├─ Client validates all fields
   ├─ Creates FormData with all fields
   ├─ POST /api/admin/ships (multipart/form-data)
   └─ Header: Authorization: Bearer [JWT]

5. SERVER PROCESSING
   ├─ verifyToken() - checks JWT valid
   ├─ verifyAdmin() - checks user is admin
   ├─ Validate required: name, imo, start_port_id, end_port_id
   ├─ Check IMO unique in ships table
   ├─ Verify ports exist:
   │  ├─ SELECT FROM ports WHERE id = 1
   │  └─ SELECT FROM ports WHERE id = 3
   ├─ Save image file to /uploads/ship/
   ├─ INSERT INTO ships (...)
   └─ Return: { data: shipData, msg: "...", type: "success" }

6. FRONTEND UPDATES
   ├─ Response received successfully
   ├─ dispatch(addShip(shipData))
   ├─ Redux state updated
   ├─ Show Notice: "Ship created successfully!"
   ├─ Redirect to /admin/ships
   └─ User sees new ship in list

7. DATABASE STATE
   ├─ ships table: New row with start_port_id=1, end_port_id=3
   ├─ Storage: /uploads/ship/1705123456-photo.jpg
   ├─ Relationships: Ports are linked via foreign keys
   └─ Ready for users to apply!
```

## Success Notice Flow

```
USER APPLICATION SUBMISSION

Step 1: Form Submitted
├─ Validate form data
├─ POST /api/admin/applications
└─ Add application to Redux

Step 2: Successful Response
├─ Server returns: { data: app, type: "success" }
└─ Frontend receives response

Step 3: Show Notice
├─ setNotice({ 
│     message: "Application submitted successfully!", 
│     type: "success" 
│   })
└─ Notice component renders

Step 4: Visual Display
├─ Green notification appears at top
├─ Icon: ✓
├─ Message displays for 2 seconds
└─ Auto-dismisses

Step 5: Auto-Redirect
├─ setTimeout(..., 2000)
├─ navigate('/applications')
└─ User sees their application in list
```

## Database Integrity

```
FOREIGN KEY RELATIONSHIP

When Ship.start_port_id = Port.id
├─ Ship MUST reference valid port
├─ Deleting port → ship start_port_id = NULL (SET NULL)
├─ Prevents: orphaned ships
└─ Ensures: data consistency

When Ship.end_port_id = Port.id
├─ Same constraints as start_port_id
├─ Multiple ships can share same port
└─ Efficient data structure

Port Deletion Safety
├─ Before deletion: Check if port in use
│  └─ SELECT COUNT(*) FROM ships 
│     WHERE start_port_id = ? OR end_port_id = ?
├─ If in use: Return error to admin
├─ If not in use: Allow deletion
└─ Result: No orphaned data
```

This architecture ensures:
✅ Data integrity via foreign keys
✅ Professional UI consistent with Upwork
✅ Secure API with JWT authentication
✅ Proper error handling and validation
✅ Smooth user experience with feedback
✅ Scalable database design
