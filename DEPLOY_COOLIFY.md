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
Coolify will analyze the repository. **You must change the configuration to Static Site:**

*   **Build Pack**: `Nixpacks` (Default)
*   **Base Directory**: `/`
*   **Output Directory**: `out` (Crucial! Next.js exports to 'out')
*   **Port Exposes**: `80` (Standard Web Port)
*   **Deployment Type / Framework**: Select **Static Site** or **Nginx** if asked, otherwise Nixpacks handles static exports if configured correctly.
    *   **Install Command**: `npm ci`
    *   **Build Command**: `npm run build`
    *   **Start Command**: (Leave Empty - Nginx handles this)

### Step 3: Environment Variables
1.  Navigate to **Environment Variables**.
2.  Add your keys:
    ```
    NEXT_PUBLIC_STRAPI_URL=...
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
    ```
3.  **Save**.

### Step 4: Deploy
1.  Click **Deploy**.
2.  Nixpacks will build the app (`npm run build`).
3.  Next.js will generate HTML/JS files into the `out` folder.
4.  Coolify will serve these files using Nginx.

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
