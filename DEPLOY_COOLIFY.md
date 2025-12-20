# Deploying to Coolify with Nixpacks

This guide details how to deploy your **Next.js Dashboard Application** to a VPS managed by **Coolify**, utilizing **Nixpacks** as the build pack.

Although this application behaves like a **SPA** (Single Page Application), it is built with Next.js App Router, which requires a **Node.js runtime** to handle features like:
*   **Image Optimization** (`<Image />` component)
*   **Server Side Rendering** (Initial load performance)
*   **Dynamic Routing**

Therefore, in Coolify, we will deploy this as a **Server-Side Application** (Node.js) rather than a purely Static Site, while maintaining the Nixpacks preference.

---

## 1. Preparation

Before deploying, ensure you have the following ready:

1.  **Repository URL**: `https://github.com/boristel/karuniadashboardadmin`
2.  **Branch**: `main`
3.  **Environment Variables**:
    *   `NEXT_PUBLIC_STRAPI_URL`: The URL of your Strapi Backend (e.g., `https://api.yourdomain.com`).
    *   `STRAPI_API_TOKEN`: Your Strapi API Token (if used server-side, though this app primarily fetches client-side).
    *   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: For the Sales Monitoring Map.

> **Important**: This project uses `npm` and standard Next.js scripts (`dev`, `build`, `start`).

---

## 2. Deployment Steps in Coolify

### Step 1: Create New Resource
1.  Go to your project in Coolify.
2.  Click **+ New**.
3.  Select **Public Repository**.
4.  Enter the URL: `https://github.com/boristel/karuniadashboardadmin`.
5.  Click **Check Repository**.

### Step 2: Configuration
Coolify will analyze the repository. Configure the settings as follows:

*   **Build Pack**: `Nixpacks` (Selected by default)
*   **Port Exposes**: `3000` (Default for Next.js)
*   **Install Command**: `npm install` (or leave empty, Nixpacks detects it)
*   **Build Command**: `npm run build` (or leave empty, Nixpacks detects it)
*   **Start Command**: `npm start` (or leave empty, Nixpacks detects it)

> **Note**: Nixpacks is smart enough to auto-detect Next.js projects. It will automatically run `npm run build` and start the server.

### Step 3: Environment Variables
1.  Navigate to the **Environment Variables** tab of your new application.
2.  Add the key-value pairs sourced from your local configuration:

```bash
NEXT_PUBLIC_STRAPI_URL=https://api.your-strapi-domain.com
STRAPI_API_TOKEN=your_secure_token_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
# Ensure NO trailing slashes in NEXT_PUBLIC_STRAPI_URL if possible,
# or ensure your code handles them (we added logic to handle this, but cleaner is better).
```

3.  **Save** the variables.

### Step 4: Deploy
1.  Click **Deploy**.
2.  Watch the build logs.
    *   Nixpacks will install Node.js.
    *   It will run `npm ci` (install dependencies).
    *   It will run `npm run build`.
    *   Finally, it will start the service on port 3000.

---

## 3. Post-Deployment Verification

### Domain Setup
1.  Go to the **Service** / **Settings** tab.
2.  Set your **FQDN** (Domain), e.g., `https://dashboard.yourdomain.com`.
3.  Coolify will automatically configure the SSL/Traefik proxy.

### Verify Application
1.  Open your domain in a browser.
2.  **Check Images**: Ensure the logo and user avatars load. If they break, verify `NEXT_PUBLIC_STRAPI_URL` is set correctly.
3.  **Check Maps**: Go to "Sales Monitoring" to verify the Google Maps integration.

---

## 4. Troubleshooting

### "502 Bad Gateway"
*   **Cause**: The application failed to start or isn't listening on the expected port.
*   **Fix**:
    *   Check **Logs**.
    *   Ensure the port in Coolify Settings matches the app port (Next.js defaults to `3000`).
    *   Wait 1-2 minutes; Next.js can take a moment to boot.

### Image Optimization Errors
*   **Cause**: Next.js requires a running server for the default Image component.
*   **Fix**: Do **NOT** change the deployment type to "Static Site". Keep it as "Application" (Node.js). If you strictly need a static site, you must update `next.config.js` to set `output: 'export'` and `images: { unoptimized: true }`, but this is **not recommended** for this dashboard.

### "Build Failed" (Nixpacks)
*   **Fix**:
    *   Check for strict Type info errors in the build log. (We verified `npm run build` locally, so this should pass).
    *   Ensure `lockfile` (`package-lock.json`) is in the repo (We pushed it).

---

## 5. Why "Application" instead of "Static Site"?
You mentioned "SPA". In Coolify/Nixpacks terms:
*   **Static Site**: Serves pre-built HTML files via Nginx.
    *   *Pros*: Fast, simple CDN.
    *   *Cons*: Breaks `next/image`, API rewrites, and dynamic SSR.
*   **Application (Nixpacks)**: Runs the real Node.js server.
    *   *Pros*: Full Next.js feature support (optimized images, caching).
    *   *Cons*: Requires slightly more RAM (Node process).

**Recommendation**: Use **Application** mode (the default for Next.js) to ensure all features including the Image component work correctly.
