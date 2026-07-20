# WedBridge - Tamil Nadu Matrimony & Wedding Marketplace

AI-powered matrimony platform connecting Tamil Nadu families with verified profiles, plus a full wedding vendor marketplace.

## Features

- **AI Matchmaking** - Compatibility scoring based on religion, caste, mother tongue, location, education, and more
- **Profile Search** - Cursor-based pagination with filters for religion, district, verified status
- **Wedding Marketplace** - 20 vendor categories (halls, photographers, catering, decorators, etc.)
- **Vendor Bookings** - Request quotes, book services, manage bookings
- **Razorpay Payments** - Premium (₹999) and Gold (₹1999) membership plans
- **Profile Photos** - Firebase Storage upload with 5MB limit
- **Admin Panel** - Full CRUD for users, profiles, vendors, bookings, payments, settings
- **Bulk Upload** - CSV import with duplicate detection
- **Notifications** - Broadcast system for announcements
- **PWA** - Installable app with service worker, manifest, offline support
- **SEO** - sitemap.xml, robots.txt, JSON-LD, Open Graph, Twitter Cards
- **Accessibility** - Skip link, ARIA labels, focus-visible, reduced-motion support
- **Security** - Firestore rules with owner-verified writes, input sanitization, audit logging

## Tech Stack

- Next.js 15 (App Router) + React 19 + TypeScript (strict)
- Firebase (Auth, Firestore, Storage) with IndexedDB persistence
- Tailwind CSS with custom wedding theme (maroon + gold + sage)
- Razorpay checkout for payments
- next/font (Inter + Playfair Display)

## Getting Started

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill in Firebase + Razorpay credentials
3. Run dev server: `npm run dev`
4. Open http://localhost:3000

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript compiler check

## Project Structure

```
src/
  app/              # Next.js App Router pages
  components/       # React components (admin, auth, layout, marketplace, etc.)
  firebase/         # Firebase config + schema types
  lib/              # Service layers (auth, profile, matching, membership, etc.)
public/
  sw.js             # Service worker for PWA
firestore.rules     # Firestore security rules
```

## License

Proprietary - WedBridge 2024
