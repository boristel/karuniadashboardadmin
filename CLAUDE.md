# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Car Dealer Dashboard built with Next.js 14, TypeScript, and Tailwind CSS. It's a comprehensive management system for car dealerships with authentication, master data management, sales monitoring, and SPK (Surat Pesanan Kendaraan) order management with PDF generation capabilities.

## Development Commands

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)

# Build and Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS with Shadcn UI components
- **State Management**: React Context (AuthContext)
- **PDF Generation**: @react-pdf/renderer for SPK document generation
- **Maps**: Google Maps API for branch and sales tracking
- **Tables**: TanStack Table for data management
- **Authentication**: JWT-based with localStorage persistence

### Project Structure
```
src/
├── app/                     # Next.js App Router pages
│   ├── auth/               # Authentication routes (login, register)
│   ├── dashboard/          # Protected dashboard routes
│   │   ├── master-data/    # CRUD modules for entities
│   │   ├── sales-monitoring/  # Live sales tracking with maps
│   │   └── spk-management/    # Order management with PDF generation
│   ├── layout.tsx          # Root layout with AuthProvider
│   └── globals.css         # Global styles and Tailwind imports
├── components/
│   ├── ui/                 # Shadcn UI components
│   ├── CRUDTable.tsx       # Reusable CRUD operations table
│   ├── DashboardLayout.tsx # Main dashboard navigation
│   ├── ProtectedRoute.tsx  # Authentication wrapper
│   ├── SpkDocument.tsx     # PDF document template
│   └── PDFRenderer.tsx     # PDF generation utilities
├── contexts/
│   └── AuthContext.tsx     # Authentication state management
├── services/
│   └── api.ts              # API service functions
├── types/
│   └── index.ts            # TypeScript type definitions
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
└── utils/                  # Additional utilities
```

### Authentication System
- Uses JWT tokens stored in localStorage
- AuthProvider wraps the entire app in layout.tsx
- Protected routes use ProtectedRoute component
- Auto-verification of stored tokens on app load
- Login/register forms in /auth routes

### Key Features Implementation

#### Master Data Management
All master data modules (vehicle-types, vehicle-groups, colors, supervisors, branches) follow a consistent pattern:
- Use CRUDTable component for standard operations
- Shared modal patterns for create/edit forms
- Branch management includes Google Maps integration for location pinning

#### Sales Monitoring
- Real-time location tracking with Google Maps
- Color-coded markers based on last update time
- Filtering capabilities by branch
- Uses Google Maps JavaScript API

#### SPK Management
- Advanced data table with filtering (date range, sales name, SPK number)
- PDF generation using @react-pdf/renderer
- Exact replica layout of physical SPK documents
- Three-part header structure with company info

### Path Aliases
The project uses path aliases configured in tsconfig.json:
- `@/*` maps to `./src/*`
- Common aliases from components.json: `@/components`, `@/lib`, `@/hooks`, etc.

### Environment Variables
Required environment variables in `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Development Guidelines

### Component Patterns
- Use Shadcn UI components from `@/components/ui`
- Follow the existing CRUDTable pattern for data management
- Maintain consistent styling with Tailwind classes
- Use TypeScript interfaces for all data structures

### API Integration
Currently uses mock data, but structured for easy backend integration:
- API functions in `src/services/api.ts`
- Type definitions in `src/types/index.ts`
- Error handling implemented for API failures

### PDF Generation
SPK PDFs are generated using SpkDocument.tsx component:
- Follows exact physical document layout
- Includes company branding, customer info, vehicle details
- Use PDFRenderer.tsx for generation utilities

### Google Maps Integration
- Branch locations use map picker for pinning
- Sales monitoring shows live tracking
- API key must be configured in environment variables