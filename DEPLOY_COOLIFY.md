# Deploying to Coolify (Static Site / SPA)

This guide details how to deploy your **Next.js Dashboard Application** to Coolify as a **Static Site (SPA)**. This is the most stable and performant method for this dashboard.

## 1. Preparation

Before deploying, ensure you have the following ready:

1.  **Repository URL**: `https://github.com/boristel/karuniadashboardadmin`
2.  **Branch**: `main`
3.  **Environment Variables**:
    *   `NEXT_PUBLIC_STRAPI_URL`: The URL of your Strapi Backend
    *   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: For the Sales Monitoring Map
    *   `STRAPI_API_TOKEN`: (Optional) API token for Strapi authentication
    *   `JWT_SECRET`: (Optional) Secret key for JWT token signing

---

## 2. Deployment Steps in Coolify

### Step 1: Create New Resource
1.  Go to your project in Coolify
2.  Click **+ New**
3.  Select **Public Repository**
4.  Enter the URL: `https://github.com/boristel/karuniadashboardadmin`
5.  Click **Check Repository**

### Step 2: Configuration
Coolify will analyze the repository. **You must change the configuration to use the Dockerfile:**

*   **Build Pack**: Select **Docker / Dockerfile** (NOT Nixpacks)
    *   Coolify should automatically detect the `Dockerfile` in the root
*   **Docker File Location**: `/Dockerfile` (Default)
*   **Port Exposes**: `3000` (Matches standard Next.js port)

### Step 3: Build Arguments & Environment Variables
1.  Navigate to **Environment Variables**
2.  Add your keys (These are needed during the *Build Stage* in Docker):

    **Build Arguments** (required during build):
    ```
    NEXT_PUBLIC_STRAPI_URL=your_strapi_url
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
    ```

    **Runtime Environment Variables** (optional):
    ```
    STRAPI_API_TOKEN=your_api_token
    JWT_SECRET=your_jwt_secret
    ```

3.  **Save**

### Step 4: Deploy
1.  Click **Deploy**
2.  Docker will:
    *   Pull Node 22 Alpine
    *   Install dependencies and build the app
    *   Copy static files to Nginx Alpine
    *   Serve on Port 3000 with non-root user
    *   Enable health checks

---

## 3. Dockerfile Features

The production Dockerfile includes:

- **Multi-stage build**: Separates dependencies, builder, and runner stages
- **Security**: Runs as non-root user (nginx-app)
- **Optimization**: Caches dependencies, removes source files after build
- **Health checks**: Automated health monitoring via wget
- **Signal handling**: Uses dumb-init for proper process management

---

## 4. Post-Deployment Verification

### Domain Setup
1.  Go to **Settings**
2.  Set your **FQDN** (Domain), e.g., `https://dashboard.yourdomain.com`
3.  Wait for SSL configuration

### Verify Application
1.  Open your domain
2.  **Hard Refresh** (Ctrl+F5) to ensure you aren't seeing cached errors
3.  Verify the Dashboard loads (Data might take a second to fetch)
4.  Check health status in Coolify dashboard

### Troubleshooting
- **Blank page**: Check browser console for API errors
- **CORS errors**: Verify Strapi URL is correct and accessible
- **Map not loading**: Verify Google Maps API key is valid
- **Health check failing**: Check nginx logs in Coolify

---

## 5. Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_STRAPI_URL` | Yes | Strapi backend URL (e.g., `https://api.example.com`) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Google Maps JavaScript API key |
| `STRAPI_API_TOKEN` | No | Strapi API token for authenticated requests |
| `JWT_SECRET` | No | Secret key for JWT token signing/validation |
