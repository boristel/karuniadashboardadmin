# Strapi Backend Setup Guide

This guide will help you set up Strapi v5 for the Car Dealer Dashboard.

## 1. Install Strapi CLI

```bash
npm install strapi@latest -g
```

## 2. Create New Strapi Project

```bash
npx create-strapi-app@latest car-dealer-backend --quickstart
# or
yarn create strapi-app car-dealer-backend --quickstart
```

## 3. Configure Environment Variables

Create `.env` file in your Strapi project root:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your_app_keys_here
API_TOKEN_SALT=your_api_token_salt_here
ADMIN_JWT_SECRET=your_admin_jwt_secret_here
TRANSFER_TOKEN_SALT=your_transfer_token_salt_here
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=./data/app.db
JWT_SECRET=your_jwt_secret_here
```

## 4. Content Types Setup

After starting Strapi, create the following content types in the admin panel:

### SPK (surat-pesanan-kendaraan)
- **Fields:**
  - `spkNumber` (Text, Unique)
  - `date` (Date)
  - `customerName` (Text)
  - `customerPhone` (Text)
  - `customerEmail` (Email, Optional)
  - `customerAddress` (Text, Long, Optional)
  - `customerKtp` (Text, Optional)
  - `vehicleType` (Text)
  - `vehicleColor` (Text)
  - `noRangka` (Text, Optional)
  - `noMesin` (Text, Optional)
  - `tahun` (Number, Optional)
  - `totalPrice` (Number)
  - `paymentType` (Enumeration: cash, credit)
  - `dp` (Number)
  - `tenor` (Number, Optional)
  - `angsuran` (Number, Optional)
  - `bunga` (Number, Optional)
  - `salesName` (Text)
  - `salesEmail` (Email, Optional)
  - `salesPhone` (Text, Optional)
  - `status` (Enumeration: "ON PROGRESS", FINISH)
  - `isEditable` (Boolean, Default: true)
  - `notes` (Rich Text, Optional)

### Vehicle Type
- **Fields:**
  - `name` (Text, Unique)
  - `brand` (Text)
  - `model` (Text)
  - `category` (Enumeration: Matic, Sport, Bebek, Naked)
  - `year` (Number)
  - `status` (Enumeration: active, inactive, Default: active)
  - `price` (Number)

### Vehicle Group
- **Fields:**
  - `name` (Text, Unique)
  - `description` (Rich Text, Optional)

### Color
- **Fields:**
  - `name` (Text, Unique)
  - `hexCode` (Text, Optional)
  - `status` (Enumeration: active, inactive, Default: active)

### Supervisor
- **Fields:**
  - `name` (Text)
  - `email` (Email, Unique)
  - `phone` (Text)
  - `branch` (Text, Optional)
  - `status` (Enumeration: active, inactive, Default: active)

### Branch
- **Fields:**
  - `name` (Text, Unique)
  - `address` (Text, Long)
  - `city` (Text)
  - `province` (Text)
  - `postalCode` (Text)
  - `phone` (Text)
  - `email` (Email)
  - `latitude` (Number, Decimal)
  - `longitude` (Number, Decimal)
  - `status` (Enumeration: active, inactive, Default: active)
  - `manager` (Text)

### Sales Staff
- **Fields:**
  - `name` (Text)
  - `email` (Email, Unique)
  - `phone` (Text)
  - `branch` (Text, Relation with Branch)
  - `status` (Enumeration: online, offline, Default: offline)
  - `lastUpdated` (DateTime)
  - `latitude` (Number, Decimal, Optional)
  - `longitude` (Number, Decimal, Optional)
  - `currentLocation` (Text, Optional)
  - `todayVisits` (Number, Default: 0)
  - `monthlyTarget` (Number)
  - `monthlyAchievement` (Number, Default: 0)

## 5. Set Permissions

1. Go to Settings → Roles
2. Edit the "Public" role:
   - Allow: `auth` endpoint (register, login)
   - Allow: All content types (find, findOne)

3. Edit the "Authenticated" role:
   - Allow: All permissions for all content types
   - Allow: `users-permissions` user me endpoint

4. Create API Token (Optional):
   - Go to Settings → API Tokens
   - Generate a token with full access
   - Add to `.env.local` as `STRAPI_API_TOKEN`

## 6. Create Admin User

1. Go to http://localhost:1337/admin
2. Register your admin account
3. Add sample data through the admin panel

## 7. Test API Endpoints

```bash
# Test connection
curl http://localhost:1337/api/vehicle-types

# Test auth
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@example.com","password":"your_password"}'
```

## 8. Configure CORS

In `config/plugins.js`, add:

```javascript
module.exports = ({ env }) => ({
  cors: {
    enabled: true,
    config: {
      origin: ['http://localhost:3000', 'http://192.168.0.122:3000'],
      headers: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true
    }
  }
});
```

## 9. Run Strapi

```bash
cd car-dealer-backend
npm run develop
```

Your Strapi backend will be available at:
- Admin: http://localhost:1337/admin
- API: http://localhost:1337/api

## Troubleshooting

### Database Issues
If you encounter database errors:
1. Delete the `.sqlite` file in the `data` folder
2. Restart Strapi

### Permission Issues
If you get 403 errors:
1. Check role permissions in admin panel
2. Ensure content types are published

### CORS Issues
If you get CORS errors:
1. Verify CORS configuration in `config/plugins.js`
2. Check that your frontend URL is in the allowed origins

### API Token Issues
If you get authentication errors:
1. Generate a new API token
2. Add it to your frontend `.env.local`
3. Ensure the token has proper permissions