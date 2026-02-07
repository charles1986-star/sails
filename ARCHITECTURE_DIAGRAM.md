# Architecture Diagram - Category Tree & Upload System

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SAILS GAME PORTAL                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │   Frontend       │              │    Backend       │    │
│  │   React/Redux    │              │  Node/Express    │    │
│  └──────────────────┘              └──────────────────┘    │
│                                                              │
│        Admin Pages          API Endpoints       Database    │
│   ├─ BookCreate      ────► ├─ /api/admin/books    MySQL    │
│   ├─ MediaCreate     ────► ├─ /api/admin/media     │       │
│   ├─ GameCreate      ────► ├─ /api/admin/games     │       │
│   ├─ ArticleCreate   ────► ├─ /api/admin/articles  ├─ ships│
│   ├─ ShipCreate      ────► ├─ /api/admin/ships     ├─ books│
│   └─ Categories      ────► └─ /api/admin/categories├─media │
│                              └─ /api/uploads/      ├─ games│
│                                                     └─ cats │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema - Tree Structure

```
CATEGORIES TABLE (Tree Structure)
╔════════════════════════════════════════════╗
║ id │ name              │ parent_id │ status ║
╠════╪═══════════════════╪═══════════╪════════╣
║ 1  │ Technology        │ NULL      │ active ║
║ 2  │ Web Development   │ 1         │ active ║  ← Child of #1
║ 3  │ Mobile Dev        │ 1         │ active ║  ← Child of #1
║ 4  │ Shipping Types    │ NULL      │ active ║
║ 5  │ Container Ships   │ 4         │ active ║  ← Child of #4
║ 6  │ Tanker Ships      │ 4         │ active ║  ← Child of #4
╚════════════════════════════════════════════╝

Visual Hierarchy:
    Technology (1)
    ├── Web Development (2)
    └── Mobile Dev (3)
    
    Shipping Types (4)
    ├── Container Ships (5)
    └── Tanker Ships (6)
```

---

## Product-Category Relationships

```
SHIPS TABLE
╔═════════════════════════════════════════╗
║ id │ name        │ category_id │ image ║
╠════╪═════════════╪═════════════╪═══════╣
║ 1  │ MS Ocean    │ 5 (Cont.)   │ path  ║
║ 2  │ MS Classic  │ 6 (Tanker)  │ path  ║
╚════════════════════════════════════════╝
        │
        ├──► category_id 5 ──► CATEGORIES (id=5, parent_id=4)
        │                       ├─ name: "Container Ships"
        │                       └─ parent_id: 4 (Shipping Types)
        │
        └──► category_id 6 ──► CATEGORIES (id=6, parent_id=4)
                                ├─ name: "Tanker Ships"
                                └─ parent_id: 4 (Shipping Types)

SAME PATTERN FOR:
├─ BOOKS (category_id → CATEGORIES)
├─ MEDIA (category_id → CATEGORIES)
├─ GAMES (category_id → CATEGORIES)
└─ ARTICLES (category_id → CATEGORIES)
```

---

## File Upload Flow

```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN USER CREATES PRODUCT WITH FILE                        │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────┐
         │ React Form Component           │
         ├────────────────────────────────┤
         │ ├─ Input: title                │
         │ ├─ Input: description          │
         │ ├─ Select: category (dropdown) │
         │ └─ Input: file (type=file)     │
         └────────────────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────┐
         │ FormData (multipart/form-data) │
         ├────────────────────────────────┤
         │ ├─ title: "Book Title"         │
         │ ├─ category_id: 3              │
         │ └─ cover_image: <File>         │
         └────────────────────────────────┘
                          │
                          ▼
   POST /api/admin/books
   Authorization: Bearer JWT_TOKEN
                          │
                          ▼
   ┌──────────────────────────────────┐
   │ Express Backend                  │
   ├──────────────────────────────────┤
   │ 1. Verify JWT token              │
   │ 2. Check admin role              │
   │ 3. Validate inputs               │
   │ 4. Process file with multer      │
   │ 5. Save to /public/uploads/book/ │
   │ 6. Insert into database          │
   └──────────────────────────────────┘
                          │
                          ▼
   ┌──────────────────────────────────┐
   │ File System                      │
   ├──────────────────────────────────┤
   │ /public/uploads/book/            │
   │ └─ 1707129600000-cover.jpg       │
   └──────────────────────────────────┘
                          │
                          ▼
   ┌──────────────────────────────────┐
   │ Database - BOOKS Table           │
   ├──────────────────────────────────┤
   │ id | title | cover_image | cat_id│
   │ 5  | Book  | /uploads/.. │   3   │
   └──────────────────────────────────┘
                          │
                          ▼
   HTTP Response (JSON)
   {
     "msg": "Book created successfully",
     "type": "success"
   }
                          │
                          ▼
   ┌──────────────────────────────────┐
   │ React Success Notice             │
   │ "Book created successfully"      │
   │ (Auto-dismiss in 4.5 seconds)    │
   └──────────────────────────────────┘
```

---

## Directory Structure - Upload Folders

```
/public/
├── uploads/
│   ├── ship/                    ← Ship images
│   │   ├── 1707129600000-MS-Ocean.jpg
│   │   ├── 1707129600100-MS-Classic.jpg
│   │   └── ... (more ship images)
│   │
│   ├── book/                    ← Book covers & PDFs
│   │   ├── 1707129600200-cover1.jpg
│   │   ├── 1707129600300-ebook.pdf
│   │   └── ... (more book files)
│   │
│   └── media/                   ← Media files
│       ├── 1707129600400-video.mp4
│       ├── 1707129600500-audio.mp3
│       ├── 1707129600600-image.jpg
│       └── ... (more media files)
```

---

## Category Tree Query Pattern

```
QUERY: Get all shipping categories
┌─────────────────────────────────────────┐
│ SELECT * FROM categories                │
│ WHERE parent_id IS NOT NULL             │
│ ORDER BY parent_id, name                │
└─────────────────────────────────────────┘
         │
         ▼
RESULT:
├─ Cargo Ships (parent_id: 4)
├─ Tanker Ships (parent_id: 4)
├─ Container Ships (parent_id: 4)
└─ Bulk Carriers (parent_id: 4)

---

QUERY: Get all root categories
┌─────────────────────────────────────────┐
│ SELECT * FROM categories                │
│ WHERE parent_id IS NULL                 │
│ ORDER BY name                           │
└─────────────────────────────────────────┘
         │
         ▼
RESULT:
├─ Technology
├─ Business
├─ Shipping Types
└─ Art & Design

---

QUERY: Get category with children (tree structure)
┌──────────────────────────────────────────────┐
│ SELECT * FROM categories c1                  │
│ LEFT JOIN categories c2 ON c2.parent_id = c1.id
│ WHERE c1.id = 4                              │
└──────────────────────────────────────────────┘
         │
         ▼
RESULT:
Parent: Shipping Types (id: 4, parent_id: NULL)
├─ Child: Cargo Ships (id: 5, parent_id: 4)
├─ Child: Tanker Ships (id: 6, parent_id: 4)
└─ Child: Bulk Carriers (id: 7, parent_id: 4)
```

---

## Admin Interface Flow

```
┌──────────────────────────────────────────┐
│ ADMIN DASHBOARD                          │
├──────────────────────────────────────────┤
│ ├─ Ships Management          ──┐         │
│ ├─ Books Management          ──┤         │
│ ├─ Media Management          ──┼─► Create Product
│ ├─ Games Management          ──┤     └─► Select Category
│ ├─ Articles Management       ──┤     └─► Upload File
│ ├─ Categories Management     ──┘         └─► Submit
│ │   ├─ View Tree Structure
│ │   ├─ Create Category
│ │   ├─ Edit Category
│ │   └─ Delete Category
│ └─ Transactions
└──────────────────────────────────────────┘
```

---

## Authentication & Authorization

```
┌─────────────────────────────────────────┐
│ USER LOGIN                              │
└─────────────────────────────────────────┘
                  │
                  ▼
    POST /api/signup OR /api/login
    {email, password}
                  │
                  ▼
    ┌─────────────────────────────────────┐
    │ Database: users table               │
    │ ├─ password: bcrypted               │
    │ └─ role: 'admin' or 'user'          │
    └─────────────────────────────────────┘
                  │
                  ▼
    JWT TOKEN ISSUED (7 day expiration)
    {userId, role, exp}
                  │
                  ▼
    Store in localStorage:
    ├─ sails_auth_token
    └─ sails_current_user
                  │
                  ▼
    Protected Routes Check:
    GET /api/admin/* → Requires JWT + Admin Role
                  │
                  ▼
    ┌─────────────────────────────────────┐
    │ Authorization Middleware            │
    ├─────────────────────────────────────┤
    │ 1. Extract token from header        │
    │ 2. Verify JWT signature             │
    │ 3. Check if admin (role='admin')    │
    │ 4. Allow/Deny access               │
    └─────────────────────────────────────┘
```

---

## Error Handling Flow

```
ERROR SCENARIO: User uploads 15MB file for book

                  │
                  ▼
    multer sees file > 10MB limit
                  │
                  ▼
    ┌─────────────────────────────────────┐
    │ Error: File too large               │
    │ Status: 400 (Bad Request)           │
    │ Response:                           │
    │ {                                   │
    │   "msg": "File exceeds limit",      │
    │   "type": "error"                   │
    │ }                                   │
    └─────────────────────────────────────┘
                  │
                  ▼
    Frontend receives error
                  │
                  ▼
    ┌─────────────────────────────────────┐
    │ React Notice Component              │
    │ Shows: "File exceeds limit"         │
    │ Color: Red (error)                  │
    │ Auto-dismisses: 4.5 seconds         │
    └─────────────────────────────────────┘
```

---

## Performance Considerations

```
OPTIMIZATION STRATEGIES

1. Database Indexes
   ├─ categories.id (primary key)
   ├─ categories.parent_id (for tree queries)
   ├─ books.category_id (for lookups)
   ├─ ships.category_id (for lookups)
   └─ media.category_id (for lookups)

2. File Upload Limits
   ├─ ship/: 5MB (images)
   ├─ book/: 10MB (PDFs)
   └─ media/: 50MB (videos)

3. Redux Caching
   ├─ Categories loaded once on mount
   ├─ Stored in Redux store
   └─ Reused across components

4. Query Optimization
   ├─ Fetch with category info in JOIN
   ├─ Limit results with pagination
   └─ Use indexed columns in WHERE
```

---

## Data Flow Summary

```
┌──────────────┐
│ User Action  │
└──────────────┘
       │
       ├─ Click "Create Book"
       │
       ▼
┌──────────────────────┐
│ Admin Form Opens     │
│ - Load categories    │
│ - Show form inputs   │
└──────────────────────┘
       │
       ├─ Fill: title, author, price
       ├─ Select: category from dropdown
       ├─ Upload: cover image file
       │
       ▼
┌──────────────────────┐
│ Form Submission      │
│ Create FormData obj  │
│ Append all fields    │
└──────────────────────┘
       │
       ├─ POST /api/admin/books
       │
       ▼
┌──────────────────────┐
│ Backend Processing   │
│ - Verify JWT         │
│ - Check admin role   │
│ - Validate inputs    │
│ - Save file          │
│ - Insert to DB       │
└──────────────────────┘
       │
       ├─ File: /public/uploads/book/*
       ├─ Database: books table
       │
       ▼
┌──────────────────────┐
│ Success Response     │
│ "Book created ok"    │
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ Frontend Success     │
│ Show notice          │
│ Redirect to list     │
└──────────────────────┘
```

---

**Architecture Status**: ✅ Complete & Production Ready

