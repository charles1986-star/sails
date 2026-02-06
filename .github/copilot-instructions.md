# Sails Game Portal - AI Coding Agent Instructions

## Architecture Overview

**Sails** is a full-stack gaming marketplace and content platform combining React frontend with Node.js backend. The system has two distinct layers:

- **Frontend (React + Redux)**: User-facing portal with authentication, shopping, games, articles, library, ship management
- **Backend (Node.js + Express + MySQL)**: RESTful API with JWT authentication, admin CRUD operations, and database management

**Key insight**: This is NOT a monolithic CRA app. It's a separated frontend/backend with distinct concerns. The frontend (`src/`) connects to backend API at `http://localhost:5000/api`.

## Authentication & Authorization Pattern

**Auth flow** (critical to understand):
1. User signup/login via `src/pages/Login.jsx` or `Signup.jsx`
2. Backend validates and returns JWT token + user object
3. Token stored in localStorage via `src/utils/auth.js` (keys: `sails_auth_token`, `sails_current_user`)
4. Redux `authSlice` synced from localStorage on app mount via `initializeAuth()`
5. Protected routes check Redux `isLoggedIn` state
6. Admin routes verify `role === 'admin'` in Redux + backend JWT payload

**Token structure**: JWT contains `userId` and `role` ('user' or 'admin'). Default expiration: 7 days. Backend verifies with middleware `verifyToken` + `verifyAdmin`.

**Important**: Always attach token via `getAuthHeader()` helper when calling admin APIs. Example: `axios.get(url, { headers: getAuthHeader() })`.

## Database Schema

Auto-created tables on server startup (see `node_server/server.js` line ~60):
- `users`: id, username, email, password (bcrypt hashed), role (enum), score, created_at
- `transactions`: id, user_id, amount, type (purchase|payment|refund), description, status, created_at
- `books`: id, title, author, description, price, category, cover_image, status (active|inactive)
- `media`: id, title, description, media_type (image|video|audio), file_url, category, status
- `articles`: id, user_id, title, content, category, status, created_at
- `shops`: id, name, description, owner_id, rating, status, created_at

**Data flow**: All CRUD operations route through admin panel → API → database. No direct DB queries from React. Status fields (active/inactive) control entity visibility.

## Project Conventions & Patterns

### Component Organization
- **Pages** (`src/pages/`): Top-level route components. Admin pages in `admin/` subfolder
- **Components** (`src/components/`): Reusable UI components (not route-scoped)
- **Redux slices** (`src/redux/slices/`): One file per domain (auth, ships, applications, transactions)
- **Styles**: Separate `.css` files per major component/page (e.g., `admin.css`, `games.css`, `articleview.css`)

### Admin CRUD Pattern (Replicate for new entities)
1. **List page** (`src/pages/admin/EntityName.jsx`): Fetch all via GET /api/admin/entity, display table, edit/delete buttons
2. **Create page** (`src/pages/admin/EntityCreate.jsx`): Form with validation, POST to `/api/admin/entity`
3. **Edit page** (`src/pages/admin/EntityEdit.jsx`): Pre-populate form from URL params, PUT to update
4. **Backend route** (`node_server/routes/entity.js`): Implements GET/POST/PUT/DELETE with validation

**Example validation pattern** (from transactions route):
```javascript
if (!user_id || !amount || !type) return res.status(400).json({ msg: 'All fields required', type: 'error' });
if (isNaN(amount) || amount <= 0) return res.status(400).json({ msg: 'Amount must be positive', type: 'error' });
```

### Error Handling
- Frontend: Use `Notice` component (auto-dismiss, success/error types). See [src/components/Notice.jsx](src/components/Notice.jsx)
- Backend: Return JSON with `{ msg, type: 'success'|'error', data? }` format
- Never throw unhandled errors; wrap in try/catch and return 500 with descriptive message

### Styling Conventions
- Global styles: [src/styles/global.css](src/styles/global.css)
- Use CSS classes with domain prefix (e.g., `.admin-container`, `.game-card`)
- Mobile-first responsive approach (check existing media queries)
- Avoid inline styles; exceptions only for dynamic values computed in React

## Key Files & Their Responsibilities

| File | Purpose | 300-line limit? |
|------|---------|-----------------|
| [src/redux/store.js](src/redux/store.js) | Redux store config; all slices registered | YES |
| [src/utils/auth.js](src/utils/auth.js) | Auth helpers (login, logout, token mgmt) | YES |
| [node_server/server.js](node_server/server.js) | Express app, DB init, auth middleware | 462 lines (core entry, ok to exceed) |
| [node_server/routes/transactions.js](node_server/routes/transactions.js) | Transaction CRUD endpoints | YES |
| [src/pages/admin/Dashboard.jsx](src/pages/admin/Dashboard.jsx) | Admin panel entry point | YES |

## Build & Runtime

**Frontend**: 
- `npm start` runs on http://localhost:3000 (CRA dev server)
- `npm run build` bundles for production

**Backend**:
- Located in `node_server/` directory
- Run with `node node_server/server.js` or `node node_server/index.js`
- Requires MySQL running on localhost, database "gameportal" (auto-created)
- Server runs on http://localhost:5000
- ENV vars: `JWT_SECRET`, `NODE_ENV`

**Key dependency versions**: React 19, Redux Toolkit 1.9, Express 4.22, MySQL2 3.16, JWT 9.0

## External Dependencies & Integration Points

- **axios**: All API calls use axios (see imports in [src/utils/auth.js](src/utils/auth.js))
- **redux-react**: State mgmt; slices auto-dispatch from async thunks
- **react-router-dom v7**: Dynamic routing; check [src/App.js](src/App.js) for route config
- **bcryptjs**: Password hashing (10 rounds) on backend
- **multer**: File upload support (uncommented in some routes; not fully integrated UI-side)
- **socket.io**: Installed but not actively used; available for real-time features

## Testing & Verification

- Frontend tests: `npm test` (CRA test runner)
- Manual API testing: See [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) for curl examples
- Database: [DATABASE_SETUP.sql](DATABASE_SETUP.sql) contains schema + sample data
- All admin modules tested for CRUD completeness (verify in [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md))

## Common Tasks

**Adding a new admin entity** (e.g., Categories):
1. Create table migration in [DATABASE_SETUP.sql](DATABASE_SETUP.sql) + add CREATE TABLE to [node_server/server.js](node_server/server.js#L60)
2. Create route file `node_server/routes/categories.js` following transaction pattern
3. Import + mount route in [node_server/server.js](node_server/server.js#L17)
4. Create Redux slice in `src/redux/slices/categoriesSlice.js`
5. Create admin pages: `src/pages/admin/{Categories, CategoryCreate, CategoryEdit}.jsx`
6. Add route to [src/App.js](src/App.js) admin routes section
7. Link from admin dashboard nav

**Fixing validation errors**: Check backend first (route validation), then frontend (form component). Both must validate independently—never trust client-side alone.

**Deploying**: See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for production steps. Key: update API_URL in [src/utils/auth.js](src/utils/auth.js) to production server, set JWT_SECRET env var on backend.

## Documentation References

- [START_HERE.md](START_HERE.md) — Feature overview & deliverables
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) — Detailed API & component docs
- [API_TESTING_GUIDE.md](API_TESTING_GUIDE.md) — Endpoint testing with curl
- [QUICK_START.md](QUICK_START.md) — Local dev setup
