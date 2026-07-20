# WedBridge Admin Guide

## Accessing the Admin Panel

1. Navigate to `/admin/login`
2. Login with an admin-credential email
3. Your Firestore `users` document must have `role: "admin"`

## Admin Features

### Dashboard
- Platform overview: total users, profiles, vendors, bookings, revenue
- Today's activity: registrations, interests, revenue
- Revenue overview: monthly, premium sales, vendor revenue

### Users
- View all registered users
- Search by name or email
- Toggle premium membership tier
- Toggle verified status
- Delete users

### Profiles
- View all matrimony profiles
- Search by name or religion
- Toggle verified status
- Toggle featured status
- Delete profiles

### Bulk Upload
- Upload CSV file to import profiles
- Columns: name, gender, dob, religion, caste, education, occupation, city, phone
- Duplicate detection by phone number
- Preview before import

### Payments
- View all payment transactions
- Summary: total, verified, total amount
- Payment ID, plan, status, date

### Reports
- Daily, weekly, monthly, yearly reports
- Revenue, users, interests breakdown

### Analytics
- Deep-dive metrics
- Verification rate, profile distribution

### Notifications
- Broadcast notifications to all users
- Target: all, premium, free, or vendors
- View recent broadcasts

### Vendors
- View all wedding service vendors
- Toggle verification status
- View rating, pricing, location

### Bookings
- View all vendor bookings
- Status: pending, confirmed, completed, cancelled

### Settings
- Website name, logo, banner
- Support contact info
- Membership pricing
- Social media links

## Audit Logging

All admin actions (create, update, delete) are logged to the `auditLog` collection with:
- Admin UID and email
- Action type
- Target document ID
- Timestamp
