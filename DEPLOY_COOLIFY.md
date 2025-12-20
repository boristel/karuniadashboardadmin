# Deploying to Coolify (Static Site / SPA)

This guide details how to deploy your **Next.js Dashboard Application** to Coolify as a **Static Site (SPA)**. This is the most stable and performant method for this dashboard.

## 1. Preparation

Before deploying, ensure you have the following ready:

1.  **Repository URL**: `https://github.com/boristel/karuniadashboardadmin`
2.  **Branch**: `main`
3.  **Environment Variables**:
    *   `NEXT_PUBLIC_STRAPI_URL`: The URL of your Strapi Backend.
    *   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: For the Sales Monitoring Map.

---

## 2. Deployment Steps in Coolify

### Step 1: Create New Resource
1.  Go to your project in Coolify.
2.  Click **+ New**.
3.  Select **Public Repository**.
4.  Enter the URL: `https://github.com/boristel/karuniadashboardadmin`.
5.  Click **Check Repository**.

### Step 2: Configuration
Coolify will analyze the repository. **You must change the configuration to use the Dockerfile:**

*   **Build Pack**: Select **Docker / Dockerfile** (NOT Nixpacks).
    *   Coolify should automatically detect the `Dockerfile` in the root.
*   **Docker File Location**: `/Dockerfile` (Default).
*   **Port Exposes**: `3000` (Matches standard Next.js port).

### Step 3: Environment Variables
1.  Navigate to **Environment Variables**.
2.  Add your keys (These are needed during the *Build Stage* in Docker):
    ```
    NEXT_PUBLIC_STRAPI_URL=...
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
    ```
3.  **Save**.

### Step 4: Deploy
1.  Click **Deploy**.
2.  Docker will:
    *   Pull Node 22.
    *   Build the app.
    *   Copy files to Nginx.
    *   Serve on Port 80.

---

## 3. Post-Deployment Verification

### Domain Setup
1.  Go to **Settings**.
2.  Set your **FQDN** (Domain), e.g., `https://dashboard.yourdomain.com`.
3.  Wait for SSL configuration.

### Verify Application
1.  Open your domain.
2.  **Hard Refresh** (Ctrl+F5) to ensure you aren't seeing cached errors.
3.  Verify the Dashboard loads (Data might take a second to fetch).
