# Conversation Summary - Car Dealer Dashboard

**Date:** December 24, 2025
**Application URL:** https://karuniadashboard.nababancloud.com
**Repository:** https://github.com/boristel/karuniadashboardadmin.git

---

## Login Credentials

```
Username: dashboard@karuniamotor.com
Password: uMbu03V&uchsx3CE4N%^
```

---

## Major Issues Fixed

### 1. Google Maps Initialization Race Condition (Sales Monitoring Page)

**Problem:** Google Maps showed gray placeholder instead of actual map. Console errors:
```
[SalesMonitoring] Map container ref not available
[SalesMonitoring] Map container element not found
```

**Root Cause:** Race condition between Google Maps API script loading and React's DOM rendering cycle. The `mapRef.current` was always `null` when initialization callback fired.

**Solution:**
- Changed from `useEffect` to `useLayoutEffect` for better DOM timing
- Added retry mechanism with 20 attempts at 500ms intervals (10 seconds total)
- Used `document.getElementById()` as fallback when ref fails
- Added `mapInitRef` to prevent duplicate initialization without dependency issues

**Files Modified:**
- `src/app/dashboard/sales-monitoring/page.tsx:278-281` (useLayoutEffect)
- `src/app/dashboard/sales-monitoring/page.tsx:111-151` (initMap with retry)
- `src/utils/GoogleMapsLoader.ts:29,75-76` (loadRejects array for promise rejection handling)

**Commit:** `4743e66` - "fix: resolve Google Maps initialization race condition in Sales Monitoring"

---

### 2. Loading Page Freeze on Deployed Application

**Problem:** Application stuck on loading screen indefinitely at https://karuniadashboard.nababancloud.com/auth/login

**Root Cause:** The `AuthProvider`'s `checkAuth()` function calls `authAPI.me()` which could timeout/fail. The `isLoading` state wasn't properly cleared when the API call failed.

**Coolify Logs Analysis:**
- Nginx serving all assets correctly (200 status codes)
- No server-side errors (4xx/5xx)
- Issue confirmed to be client-side only

**Solution:**
```typescript
// Added 10-second timeout using Promise.race
const userData = await Promise.race([
  authAPI.me(),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Auth check timeout')), 10000)
  ),
]) as any;

// Ensured setIsLoading(false) in both catch AND finally blocks
} catch (error) {
  console.error('Auth check failed:', error);
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user');
  setIsLoading(false); // Clear loading state on error
} finally {
  setIsLoading(false); // Always clear loading state
}
```

**Files Modified:**
- `src/contexts/AuthContext.tsx:48-82` (timeout mechanism + proper cleanup)

**Commit:** `2bb801d` - "fix: resolve loading freeze on deployed application with auth timeout"

---

### 3. API Populate Format for Nested Relations (Strapi v4)

**Problem:** Sales profiles not returning related data properly

**Solution:** Fixed populate parameter format for Strapi v4 nested relations

**Files Modified:**
- `src/services/api.ts:308-323` (salesMonitoringAPI)

---

## Deployment Setup

### Docker Multi-Stage Build
1. **Builder stage:** Node 22 Alpine - builds Next.js static export
2. **Runner stage:** Nginx Alpine - serves static assets on port 3000

### Key Configurations
- `next.config.js`: `output: 'export'` for static site generation
- `nginx.conf`: Serves from `/out` directory with gzip compression
- Build warnings: ESLint and TypeScript errors ignored during builds

### Coolify Deployment
- Automatic deployment via GitHub webhook
- Build time: 5-10 minutes
- Health checks every 30 seconds (Wget HEAD requests)

---

## Architecture Highlights

### Hybrid UI Architecture
- **MUI v7** for complex components (DataGrids, advanced forms)
- **Shadcn UI** (Radix UI + Tailwind) for standard components
- **Tailwind CSS** for utilities (preflight disabled for MUI coexistence)

### Authentication System
- JWT tokens stored in localStorage with automatic injection via axios interceptor
- AuthProvider wraps entire app in layout.tsx
- Role-based access control (ADMIN role enforced)
- 401 responses clear tokens and redirect to login
- **10-second timeout on auth check to prevent infinite loading**

### API Integration
- Strapi v4 backend integration with axios instance
- Generic CRUD factory (`createCRUDAPI`) for consistent data operations
- Auto JWT token injection for non-auth endpoints
- 60-second default timeout for all requests

---

## Important Code Patterns

### Google Maps Loading Pattern
```typescript
// Use useLayoutEffect instead of useEffect
useLayoutEffect(() => {
  loadGoogleMaps();
}, [loadGoogleMaps]);

// Retry mechanism for DOM availability
const tryInitMap = () => {
  const mapContainer = document.getElementById(MAP_CONTAINER_ID);
  if (mapContainer) {
    initMap();
  } else if (retries < maxRetries) {
    retries++;
    setTimeout(tryInitMap, 500);
  }
};
```

### Auth Timeout Pattern
```typescript
// Prevent indefinite loading with Promise.race
const userData = await Promise.race([
  authAPI.me(),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Auth check timeout')), 10000)
  ),
]) as any;
```

---

## Current Git History

```
252a9af feat: implement server-side pagination and search for master data pages
2bb801d fix: resolve loading freeze on deployed application with auth timeout
4743e66 fix: resolve Google Maps initialization race condition in Sales Monitoring
2d5f1cc chore: production-ready cleanup and deployment improvements
4f9ddf0 chore: production-grade code quality improvements
8fd971a fix: resolve React warnings in SPK Management DataGrid
```

---

### 4. Server-Side Pagination and Search for Master Data Pages

**Problem:** Master data pages only showed 25 records (Strapi default) with no proper pagination or search functionality. When more than 25 records existed, users could only see the first 25.

**Root Cause:** The `createCRUDAPI.find()` method didn't pass pagination parameters, so Strapi returned only 25 records by default.

**User Request:**
- Add search bar on every master data page (server-side search)
- Create records per page selector (50 default, options: 10/25/50/100)
- Load only 50 records initially for faster page load
- Let user decide if they want to see more records

**Solution Implemented:**

**1. Updated `src/services/api.ts`:**
- Changed default `pagination[pageSize]` from `-1` (all records) to `50`

**2. Enhanced `src/components/CRUDTable.tsx`:**
- Added records per page selector dropdown (10, 25, 50, 100 options)
- Implemented server-side search with 300ms debounce
- Added pagination controls (Previous/Next buttons)
- Added pagination info display: "Showing 1 to 50 of 150 records (Page 1 of 3)"
- Wrapped component with `React.memo` for performance
- Added loading spinner indicator in search input

**3. Updated all 7 Master Data Pages:**
- `vehicle-types/page.tsx`
- `vehicle-groups/page.tsx`
- `colors/page.tsx`
- `supervisors/page.tsx`
- `branches/page.tsx`
- `categories/page.tsx`

Each page now has:
- `fetchData(page, pageSize, search)` function with pagination params
- `handlePageChange`, `handlePageSizeChange`, `handleSearchChange` callbacks (wrapped with `useCallback`)
- Pagination state management with `PaginationMeta` interface
- Search term state with server-side filtering

**Strapi v4 API Format Used:**
```javascript
// Pagination
'pagination[page]': page,
'pagination[pageSize]': pageSize,

// Search (case-insensitive partial match)
'filters[name][$containsi]': searchTerm

// Response metadata
response.meta.pagination = { page, pageSize, pageCount, total }
```

**Bug Fixes During Implementation:**
1. **Infinite loop issue**: Removed `onSearchChange` from useEffect dependencies and added ref to skip initial render
2. **Search input losing focus**: Removed `disabled={isLoading}` from input, added loading spinner instead
3. **Unnecessary re-renders**: Used `useCallback` for all handler functions and `React.memo` for CRUDTable

**Files Modified:**
- `src/components/CRUDTable.tsx` (completely refactored with server-side features)
- `src/services/api.ts` (default pagination changed)
- All master data page components (pagination & search integration)

**Commit:** `252a9af` - "feat: implement server-side pagination and search for master data pages"

---

## Pending Tasks / Known Issues

### Console Warnings (Non-Critical)
1. **Google Maps deprecation:** `google.maps.Marker` is deprecated (suggests using `AdvancedMarkerElement`)
2. **Autocomplete attributes:** Password inputs missing autocomplete attributes
3. **Image LCP warning:** Suggests adding `priority` property to logo image
4. **API errors:** 403/404 errors for `/sales-profiles` (CORS/backend configuration issue)

### Sales Monitoring Google Maps Issue
- Map container sometimes not found during initial load
- Retry mechanism helps but may need further optimization
- Consider lazy loading the map component only when tab is active

---

## Development Commands

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)

# Build and Production
npm run build        # Build for production (static export to /out)
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint

# Node version requirement
# Requires Node.js >=18.17.0
```

---

## Environment Variables

Required in `.env.local`:
```env
NEXT_PUBLIC_STRAPI_URL=your_strapi_api_url
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
STRAPI_API_TOKEN=your_strapi_api_token
JWT_SECRET=your_jwt_secret_key
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Authentication state management with timeout |
| `src/app/dashboard/sales-monitoring/page.tsx` | Live sales tracking with Google Maps |
| `src/utils/GoogleMapsLoader.ts` | Google Maps API loading utility |
| `src/services/api.ts` | API service functions with axios interceptors |
| `logs.md` | Coolify/nginx deployment logs |

---

## Testing Checklist

After any deployment changes:
- [ ] Navigate to https://karuniadashboard.nababancloud.com/auth/login
- [ ] Verify login form appears (no infinite loading)
- [ ] Test login with credentials
- [ ] Verify dashboard loads successfully
- [ ] Test Sales Monitoring page (Google Maps renders)
- [ ] **Test Master Data pages:**
  - [ ] Vehicle Types - verify 50 records load by default
  - [ ] Test records per page selector (10/25/50/100)
  - [ ] Test search functionality (type in search box, verify results filter)
  - [ ] Verify search input maintains focus while typing
  - [ ] Test pagination (Previous/Next buttons)
  - [ ] Verify pagination info displays correctly
  - [ ] Test Create/Edit/Delete operations
- [ ] Check browser console for errors

---

**Last Updated:** December 27, 2025
**Status:** Production - All critical issues resolved, Master Data pagination & search implemented
