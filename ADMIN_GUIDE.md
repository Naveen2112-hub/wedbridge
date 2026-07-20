# Admin Guide

## Accessing the Admin Panel

1. Navigate to `/admin/login`
2. Sign in with an admin account (users with `role = "admin"` in Firestore)
3. Non-admin users are automatically redirected to the login page

## Dashboard

The dashboard provides an overview of:
- Total Users, Male/Female Profiles
- Premium/Gold Members
- Verified Profiles, Wedding Vendors
- Today's Registrations, Interests, Revenue
- Monthly Revenue
- Quick Analytics (New Users, Profile Views, AI Matches, Interests Sent, Premium Sales, Vendor Revenue)

## User Management

### Actions Available
- **Search**: Filter by name or email
- **Filter**: All, Active, Blocked, Verified, Unverified
- **View**: See user details in a modal
- **Block/Activate**: Toggle user status
- **Verify**: Mark user as verified
- **Reset Password**: Trigger password reset
- **Delete**: Permanently remove user

## Profile Management

### Actions Available
- **Approve**: Move profile from pending to approved
- **Reject**: Mark profile as rejected
- **Hide/Show**: Toggle profile visibility
- **Mark Premium**: Toggle premium status
- **Verify**: Toggle verified badge
- **Feature**: Toggle featured status
- **Delete**: Permanently remove profile

## Bulk Upload

1. Prepare a CSV file with columns: `name, gender, religion, caste, education, occupation, phone, district, dob`
2. Upload the file
3. Preview the data with duplicate detection (highlighted by phone number)
4. Click "Import" to save all profiles
5. Click "Rollback" to clear the preview before saving

## OCR Upload

1. Upload a PDF, JPG, or PNG document
2. The system extracts: Name, DOB, Religion, Caste, Education, Occupation, Phone, District
3. Review and edit the extracted data
4. Click "Save Profile" to create the profile with `createdBy = "admin"`

## Payments

- View all transactions
- Search by user or plan
- Filter by status (Pending, Verified, Refunded, Failed)
- Verify pending payments
- Refund verified payments
- View total revenue

## Reports

- View revenue reports by period (Daily, Weekly, Monthly, Yearly)
- Bar chart visualization of revenue breakdown
- Summary cards for total revenue, period, and record count

## Notifications

- Broadcast notifications to targeted segments:
  - All Users
  - Premium Members
  - Free Members
  - Vendors
- Enter title and message
- Click "Send Broadcast"

## Settings

- **General**: Website name, logo URL, banner URL
- **Support**: Support phone and email
- **Social Links**: Facebook, Instagram, Twitter, YouTube
- **Membership Pricing**: Premium and Gold plan prices
- **Homepage Banners**: Add/remove banner URLs

## Audit Log

Every admin action is automatically logged to the `auditLog` Firestore collection, including:
- Admin UID and email
- Action type
- Target document ID
- Timestamp
- Additional details (JSON)
