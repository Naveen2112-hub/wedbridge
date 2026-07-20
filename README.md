# WedBridge

Tamil Nadu's premier matrimony and wedding marketplace platform. Find your perfect life partner with AI-powered matching, and book trusted wedding vendors across 20+ categories.

## Features

### Matrimony
- User registration and authentication (email/password + Google)
- Profile creation with detailed preferences
- AI-powered compatibility matching
- Advanced search with filters (religion, caste, city, education, etc.)
- Interest system (send, accept, reject)
- Membership plans (Premium & Gold)

### Wedding Marketplace
- 20+ wedding service categories
- Vendor profiles with gallery, packages, and reviews
- Booking system with date/time/guest management
- Vendor dashboard for managing bookings and packages
- My Bookings page for customers

### Super Admin Panel
- Admin authentication with role-based access
- Dashboard with real-time analytics
- User management (block, activate, verify, delete)
- Profile management (approve, reject, feature, verify)
- Bulk CSV upload with duplicate detection
- OCR import for documents (PDF, JPG, PNG)
- Payment verification and refunds
- Revenue reports (daily, weekly, monthly, yearly)
- Broadcast notifications to targeted segments
- Site settings management
- Audit logging for all admin actions

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Icons**: Lucide React
- **PWA**: Manifest, offline support, app icons

## Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in Firebase credentials
3. Run `npm install`
4. Run `npm run dev` to start the development server
5. Open `http://localhost:3000`

## Documentation

- [Installation Guide](INSTALL.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Admin Guide](ADMIN_GUIDE.md)
- [User Guide](USER_GUIDE.md)
- [Firebase Setup](FIREBASE_SETUP.md)

## License

Proprietary. All rights reserved.
