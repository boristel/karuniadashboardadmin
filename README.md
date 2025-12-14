# Car Dealer Dashboard

A comprehensive Next.js 14 application for managing a car dealership with authentication, master data management, sales monitoring, and SPK order management with PDF generation.

## Features

### 🔐 Authentication System
- Login and Register pages with email/password authentication
- Protected routes with client-side authentication
- User session management

### 📊 Dashboard Overview
- Real-time statistics dashboard
- Quick access cards to all modules
- Recent activity feed
- Responsive design with mobile support

### 🗂️ Master Data Management
- **Vehicle Groups**: Categorize vehicles
- **Vehicle Types**: Manage specific models with pricing
- **Colors**: Track available vehicle colors
- **Supervisors (SPV)**: Manage sales supervisors
- **Branches**: Manage branch locations with Google Maps integration

### 🗺️ Sales Monitoring
- Live map view of all sales staff locations
- Real-time location tracking with color-coded markers
  - Green: Updated less than 30 minutes ago
  - Red: Updated more than 30 minutes ago
- Sales staff details and performance metrics
- Filter by branch location
- Daily visit tracking

### 📄 SPK Management
- Data table with advanced filtering:
  - Date range filter
  - Sales name filter
  - SPK number search
- Order status management (ON PROGRESS / FINISH)
- Editable flag toggle for orders
- **PDF Generation**: Generate professional SPK documents
  - Exact replica layout with borders and grid
  - Three-part header (Logo | Company Info | SPK Details)
  - Customer and Sales information
  - Vehicle details grid
  - Payment terms (Cash/Credit)
  - Footer with disclaimer
  - Signature boxes

### 🎨 UI/UX Features
- Built with Shadcn UI components
- Tailwind CSS for styling
- Dark mode support
- Responsive design for all screen sizes
- Professional and modern interface

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **PDF Generation**: @react-pdf/renderer
- **Maps**: Google Maps API
- **Authentication**: Custom auth with localStorage
- **Table Management**: TanStack Table
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure

```
src/
├── app/
│   ├── auth/                # Authentication pages
│   │   ├── login/          # Login page
│   │   └── register/       # Registration page
│   ├── dashboard/          # Protected dashboard pages
│   │   ├── master-data/    # Master data management
│   │   │   ├── vehicle-types/
│   │   │   ├── vehicle-groups/
│   │   │   ├── colors/
│   │   │   ├── supervisors/
│   │   │   └── branches/   # With Google Maps integration
│   │   ├── sales-monitoring/  # Live sales tracking
│   │   ├── spk-management/    # Order management with PDF
│   │   └── page.tsx       # Dashboard overview
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout with AuthProvider
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── SpkDocument.tsx     # PDF document component
│   ├── DashboardLayout.tsx # Main dashboard layout
│   ├── CRUDTable.tsx       # Reusable CRUD table
│   └── ProtectedRoute.tsx  # Authentication wrapper
├── contexts/
│   └── AuthContext.tsx     # Authentication context
└── utils/
    └── pdfGenerator.ts     # PDF utilities

```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Authentication
1. Register a new account or login with existing credentials
2. After login, you'll be redirected to the dashboard

### Master Data Management
1. Navigate to Master Data from the sidebar
2. Select any module (Vehicle Types, Branches, etc.)
3. Add, edit, or delete records as needed
4. For branches, use the map to pin exact locations

### Sales Monitoring
1. Navigate to Sales Monitoring
2. View live locations of all sales staff
3. Filter by branch location
4. Click on markers to see staff details

### SPK Management
1. Navigate to SPK Management
2. Use filters to find specific orders
3. Click the actions menu to:
   - Preview PDF
   - Download PDF
   - Change order status
   - Toggle editability

### PDF Generation
The SPK PDF includes:
- Company logo and information
- Customer and sales details
- Vehicle specifications
- Payment terms
- Signatures

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Customization

### Company Information
Update in `src/components/SpkDocument.tsx`:
```typescript
<Text style={styles.companyInfo}>
  PT. YOUR COMPANY NAME
</Text>
<Text style={styles.companyInfo}>
  Your Company Address
</Text>
```

### Google Maps
1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API
3. Add the API key to your environment variables

### Styling
- Modify Tailwind configuration in `tailwind.config.js`
- Customize colors in `src/app/globals.css`
- Adjust component styles as needed

## API Integration (Future Enhancement)

Currently using mock data. To integrate with Strapi v5:

1. Create API service functions
2. Replace mock data with API calls
3. Add proper error handling
4. Implement optimistic updates

## Build

To build the application for production:

```bash
npm run build
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Security Notes

- Password hashing should be implemented for production
- Add CSRF protection
- Implement rate limiting
- Use HTTPS in production
- Validate all inputs on the server side