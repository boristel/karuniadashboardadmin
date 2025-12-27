# Karunia Dashboard Application Documentation

## 1. Overview
**Karunia Dashboard** is a high-performance admin dashboard for managing automotive dealer operations. It is built using **Next.js 14** (App Router) as a Static Site (SPA) for speed, utilizing a Dockerized Nginx setup for production stability.

### Key Screens

#### Login Screen
Features a secure, branded login interface with role-based validation (ADMIN only).
![Login Screen](docs/images/login.png)

#### Admin Dashboard
Provides real-time sales overview, recent activity tracking, and quick access to management modules.
![Dashboard Overview](docs/images/dashboard.png)

#### Master Data Pages
Server-side paginated and searchable data management for all master data entities (Vehicle Types, Vehicle Groups, Colors, Supervisors, Branches, Categories).
Features 50 records per page by default with configurable page size (10/25/50/100) and debounced search.

---

## 2. Architecture & Tech Stack

### Frontend Core
*   **Framework**: Next.js 14 (SPA / Static Export)
*   **Language**: TypeScript
*   **State**: React Context (`AuthContext`) + TanStack Query
*   **UI Library**: Shadcn UI + Tailwind CSS + MUI v7 (DataGrids)
*   **Routing**: Next.js App Router (Client-side usage)
*   **Tables**: TanStack Table v8 (CRUDTable) + MUI X DataGrid v8

### Integration
*   **Backend**: Strapi CMS (`NEXT_PUBLIC_STRAPI_URL`)
*   **Maps**: Google Maps JS API for Sales Monitoring
*   **PDF**: `@react-pdf/renderer` for SPK Generation
*   **Pagination**: Server-side pagination with Strapi v4 (`pagination[page]`, `pagination[pageSize]`)

### Deployment Strategy (Dockerized SPA)
To solve environment mismatches, we use a custom **Docker build process**:
1.  **Container**: `node:22-alpine` runs the build.
2.  **Output**: `npm run build` generates static files in `out/`.
3.  **Serving**: `nginx:alpine` serves `out/` on **Port 3000**.
4.  **Routing**: Nginx handles SPA fallbacks (404 -> index.html).

---

## 3. Directory Structure

```
/
├── docs/images/            # Documentation Assets
├── public/                 # Web Assets (favicon, logos)
├── src/
│   ├── app/                # Application Routes
│   │   ├── auth/           # Login Logic
│   │   ├── dashboard/      # Protected Admin Routes
│   │   │   ├── master-data/ # CRUD Modules (Vehicle Types, Groups, Colors, etc.)
│   │   │   ├── sales-monitoring/ # Live Sales Tracking
│   │   │   └── spk-management/ # Order Management
│   │   └── layout.tsx      # Root Provider Setup
│   ├── components/         # Shared UI Components
│   │   ├── ui/             # Shadcn UI Components
│   │   ├── CRUDTable.tsx   # Server-side Paginated Table
│   │   ├── MUIDataGrid.tsx # MUI X DataGrid Wrapper
│   │   ├── ProtectedRoute.tsx # Auth Guard
│   │   └── DashboardLayout.tsx # Sidebar/Header
│   ├── contexts/           # Auth State Management
│   ├── providers/          # React Query Provider
│   ├── hooks/              # Custom React Hooks
│   ├── services/           # Axios API Layer
│   └── types/              # TypeScript Models
├── Dockerfile              # Production Build Config
├── nginx.conf              # SPA Routing Config
└── DEPLOY_COOLIFY.md       # Deployment Instructions
```

---

## 4. Operational Flows

### Authentication & Security
*   **Login**: Authenticates against Strapi. Checks for `role_custom === 'ADMIN'`.
*   **Token**: JWT stored in localStorage.
*   **Interceptor**: automatically adds `Authorization` headers.
*   **Guard**: `ProtectedRoute` prevents unauthorized access to `/dashboard`.
*   **Timeout**: Dashboard data fetching has a 15s safety timeout to prevent hanging.

### Master Data CRUD Features
All master data pages (Vehicle Types, Vehicle Groups, Colors, Supervisors, Branches, Categories) feature:

*   **Server-Side Pagination**: Default 50 records per page
*   **Records Per Page Selector**: User can choose 10, 25, 50, or 100 records
*   **Server-Side Search**: Case-insensitive search with 300ms debounce
*   **Loading Indicators**: Visual feedback during data fetching
*   **Pagination Info**: "Showing 1 to 50 of 150 records (Page 1 of 3)"
*   **Create/Edit/Delete Modal Dialogs**: For all CRUD operations

**Strapi v4 Pagination Format:**
```javascript
// Request parameters
'pagination[page]': 1,
'pagination[pageSize]': 50,

// Response metadata
response.meta.pagination = {
  page: 1,
  pageSize: 50,
  pageCount: 3,
  total: 150
}
```

**Strapi v4 Search Format:**
```javascript
// Case-insensitive partial match
'filters[name][$containsi]': 'searchTerm'
```

**Performance Optimizations:**
- `useCallback` hooks for stable function references
- `React.memo` wrapper on CRUDTable to prevent re-renders
- Search input maintains focus during typing (no disabled state toggle)

### Deployment (Coolify)
**Crucial**: Do not use "Nixpacks". Use **Dockerfile** build pack.
*   **Port**: 3000
*   **Command**: (Handled by Dockerfile)

---

## 5. Development Guide
### Prerequisite
*   Node.js 22+
*   Backend API Running (Strapi)

### Quick Start
```bash
# Install Dependencies
npm install

# Run Development Server
npm run dev
# Access: http://localhost:3000
```

### Production Build (Local Test)
```bash
npm run build
# Check 'out' folder for static files
```
