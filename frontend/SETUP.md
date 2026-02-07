# GreenChain Setup Guide

## Project Structure

```
project/
├── app/                    # Next.js frontend (React 19)
├── backend/                # Node/Express API server
├── components/             # React components (Navbar, Button, etc.)
├── lib/                    # Utilities (api.js wrapper)
├── hooks/                  # useAuth custom hook
├── contexts/               # AuthProvider
└── .env                    # Environment variables (frontend)
```

## Prerequisites

- Node.js 18+ and npm
- Supabase project (already configured)

## Installation

### 1. Install Frontend Dependencies
```bash
npm install
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

## Environment Setup

### Frontend (.env - already configured)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Backend (backend/.env - already configured)
```
PORT=3001
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET=...
```

## Running the Application

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

Expected output:
```
✓ GreenChain backend running on port 3001
  API: http://localhost:3001/api
  Health check: http://localhost:3001/api/health
```

### Terminal 2: Start Frontend
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Database

The Supabase database is already set up with:
- `users` table (email, password_hash, name, role)
- `donations` table (title, category, quantity_lbs, status, image_url, etc.)
- `claims` table (when receivers claim donations)
- `verification_events` table (for blockchain integration)
- `storage.objects` table (donation images in "donations" bucket)

All tables have Row Level Security (RLS) enabled.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password

### Donations
- `GET /api/donations` - List all available donations
- `GET /api/donations/:id` - Get donation details
- `POST /api/donations` - Create new donation (requires auth, multipart/form-data with image)
- `POST /api/donations/:id/claim` - Claim a donation (requires auth)

### Verification
- `GET /api/verify/:eventId` - Get verification event details
- `POST /api/verify/:eventId/verify` - Record verification on-chain

## Features Implemented

### Authentication
- ✅ User registration (donor, receiver, volunteer)
- ✅ Email/password login with JWT
- ✅ Password hashing with bcryptjs
- ✅ Token stored in localStorage
- ✅ Protected routes

### Donations
- ✅ Create donations with image upload to Supabase Storage
- ✅ List available donations
- ✅ View donation details
- ✅ Claim donations (receivers only)
- ✅ Status tracking (available, claimed, in_transit, completed)
- ✅ Expiry date management

### Verification
- ✅ View verification events
- ✅ Record on-site verification
- ✅ Mock transaction hash generation (placeholder for blockchain)
- ✅ TODO blockchain: recordDonation hook in backend

### UI/UX
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Error handling and validation
- ✅ Loading states
- ✅ Success/error messages
- ✅ Skeleton loaders
- ✅ Status badges
- ✅ Dark mode support

## Blockchain Integration Points

The following are marked with TODO comments for future blockchain integration:

### Backend: `backend/routes/verify.js`
```javascript
// TODO blockchain: recordDonation(verificationEvent.donation_id, dataHash)
```

This is where you'll call your blockchain service to record the donation verification.

### Frontend: `app/donations/create/page.jsx`
Image uploads are stored in Supabase Storage, and only the public URLs are saved to the database.

## Testing the Flow

### 1. Create an Account
- Go to `http://localhost:3000/register`
- Fill in name, email, password, and select role (donor/receiver/volunteer)
- Click "Create Account"

### 2. Create a Donation (as donor)
- Go to `http://localhost:3000/donations/create`
- Fill in title, category, quantity, location, expiry date
- Upload a reference photo
- Click "Create Donation"

### 3. View Donations
- Go to `http://localhost:3000/donations`
- See all available donations
- Click "View details" on any donation

### 4. Claim a Donation (as receiver)
- Go to donation detail page
- If available and you're logged in as receiver, click "Claim Donation"
- Check success message

### 5. Verify a Donation
- Get a donation's verification code (generated when donation is created)
- Go to `/verify/[verification-code]`
- Click "Confirm Verification" to record it

## Troubleshooting

### Backend won't start
- Check that port 3001 is available
- Verify Supabase credentials in `backend/.env`
- Run `npm install` in backend folder

### Frontend API calls failing
- Ensure backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `.env`
- Check browser console for CORS errors

### Images not uploading
- Verify Supabase storage bucket "donations" exists
- Check Supabase Storage policies allow authenticated uploads

### Database errors
- Run migrations: check Supabase dashboard
- Verify RLS policies are enabled
- Check table permissions in Supabase console

## Production Deployment

For production:
1. Update `NEXT_PUBLIC_API_URL` to your production backend URL
2. Change `JWT_SECRET` to a strong random key
3. Set `NODE_ENV=production` in backend
4. Configure CORS origins in backend `server.js`
5. Set proper Supabase credentials for production
6. Run `npm run build` to build Next.js

## Next Steps: Blockchain Integration

1. Implement blockchain recording in `backend/routes/verify.js`
2. Replace mock `tx_hash` generation with real contract calls
3. Add contract deployment details to documentation
4. Update verification UI to show real blockchain transactions
