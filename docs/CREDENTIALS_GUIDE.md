# Credentials Configuration Guide

This document explains all the credentials needed to run the Car Dealer Dashboard application.

## 1. Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```bash
# Strapi Backend Configuration
NEXT_PUBLIC_STRAPI_URL=http://192.168.0.122:1337
# STRAPI_API_TOKEN=your_strapi_api_token_here (optional)

# Google Maps Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Application Configuration
NEXT_PUBLIC_APP_NAME=Car Dealer Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0

# JWT Configuration (for auth tokens)
JWT_SECRET=car_dealer_dashboard_secret_key_2024
JWT_EXPIRES_IN=7d

# Optional: External API endpoints
NEXT_PUBLIC_API_BASE_URL=http://192.168.0.122:1337/api
```

## 2. Required Credentials

### A. Strapi Backend URL
- **Required**: Yes
- **Format**: `http://<ip>:<port>` or `http://<domain>`
- **Example**: `http://192.168.0.122:1337`
- **How to get**: Your Strapi backend URL
- **Notes**: Replace with your actual Strapi instance URL

### B. Google Maps API Key
- **Required**: For maps functionality
- **Format**: String API key
- **How to get**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create a new project or select existing
  3. Enable "Maps JavaScript API" and "Places API"
  4. Go to "Credentials" → "Create Credentials" → "API Key"
  5. Copy the API key
  6. **Important**: Restrict the API key to your domain for security

### C. Strapi API Token (Optional)
- **Required**: No (but recommended for production)
- **Format**: String token
- **How to get**:
  1. Go to your Strapi admin panel
  2. Navigate to "Settings" → "API Tokens"
  3. Click "Create new API Token"
  4. Give it a name and select the appropriate permissions
  5. Copy the token

### D. JWT Secret
- **Required**: Yes
- **Format**: Any strong string
- **Purpose**: For signing JWT tokens
- **Recommendation**: Use a random 32+ character string

## 3. Step-by-Step Setup

### Step 1: Configure Strapi Connection
1. Ensure your Strapi backend is running
2. Update `NEXT_PUBLIC_STRAPI_URL` with your Strapi URL
3. Test connection by visiting `http://your-strapi-url/api/vehicle-types`

### Step 2: Set up Google Maps (Optional but recommended)
1. Get your Google Maps API key (see above)
2. Add it to `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
3. The maps will work in:
   - Branch management (location pinning)
   - Sales monitoring (live tracking)

### Step 3: Configure Authentication
1. The app uses Strapi's built-in authentication
2. Create content types as described in `STRAPI_SETUP.md`
3. Ensure proper permissions are set in Strapi admin panel

## 4. Testing Your Configuration

### Test Backend Connection
```bash
# In your browser
http://your-strapi-url/api/vehicle-types
```

### Test Authentication
1. Try to register a new user at http://localhost:3000/auth/register
2. Check if the user appears in Strapi admin panel
3. Try to login with the registered user

### Test Maps (if configured)
1. Go to Dashboard → Master Data → Branches
2. Try to add a new branch
3. The map should load if API key is valid

## 5. Security Best Practices

### Environment Variables
- Never commit `.env.local` to version control
- Use different values for development and production
- Regularly rotate your API keys and secrets

### Google Maps API Key
- Restrict your API key to specific domains
- Set up usage quotas and alerts
- Monitor API usage dashboard

### Strapi Security
- Use HTTPS in production
- Configure proper CORS settings
- Use API tokens for external integrations
- Regularly update Strapi version

## 6. Troubleshooting

### "Network Error" or "Connection Timed Out"
- Check if Strapi is running
- Verify `NEXT_PUBLIC_STRAPI_URL` is correct
- Check firewall settings

### "Google Maps Loading Error"
- Verify API key is correct
- Check if Maps JavaScript API is enabled
- Look at browser console for specific errors

### "Authentication Failed"
- Check Strapi user permissions
- Verify email/password combination
- Check if user is confirmed/blocked

### CORS Errors
- Add your frontend URL to Strapi CORS config
- Check both development and production URLs

## 7. Production Configuration

For production deployment, create a `.env.production` file with:

```bash
# Production Strapi URL
NEXT_PUBLIC_STRAPI_URL=https://api.your-domain.com

# Production Google Maps Key (domain-restricted)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_api_key

# Production JWT Secret (use a very strong random string)
JWT_SECRET=your_production_jwt_secret_32_chars_or_more

# Other production-specific settings
NEXT_PUBLIC_APP_NAME=Your Production App Name
```

Remember to:
- Use HTTPS URLs
- Secure all API keys
- Set up monitoring
- Configure backup systems