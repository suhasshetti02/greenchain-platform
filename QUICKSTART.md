# GreenChain Quick Start

## 30-Second Setup

### Terminal 1 (Backend)
```bash
cd backend
npm install
npm run dev
```

Expected: `✓ GreenChain backend running on port 3001`

### Terminal 2 (Frontend)
```bash
npm install  # Skip if already done
npm run dev
```

Expected: `http://localhost:3000` opens in browser

## First Test (2 minutes)

1. **Register**
   - Go to http://localhost:3000/register
   - Name: "Test Donor"
   - Email: "donor@test.com"
   - Password: "password123"
   - Role: "Donor"
   - Click "Create Account"

2. **Create Donation**
   - Click "New donation" button
   - Title: "Fresh Vegetables"
   - Category: "Produce"
   - Quantity: 50
   - Unit: "lbs"
   - Location: "123 Market St"
   - Expiry: Pick tomorrow's date
   - Upload any image file
   - Click "Create Donation"

3. **View Donation**
   - You'll be redirected to donations list
   - Click "View details" on your donation
   - See all the information you entered

4. **Test as Receiver**
   - Log out (top right)
   - Register new account as "Receiver"
   - View donations list
   - Click "View details" on the donation
   - Click "Claim Donation"
   - See success message

5. **Verify Donation**
   - Copy the donation ID from the URL (e.g., `/donations/abc123`)
   - Go to `/verify/VC-XXXXX` (verification code is in the URL)
   - Click "Confirm Verification"
   - See transaction hash appear

## File Structure

```
├── backend/              ← Start here: npm run dev
├── app/                  ← All pages
│   ├── login/page.jsx
│   ├── register/page.jsx
│   ├── donations/page.jsx
│   ├── donations/create/page.jsx
│   ├── donations/[id]/page.jsx
│   └── verify/[eventId]/page.jsx
├── lib/api.js           ← All backend calls
└── SETUP.md             ← Detailed guide
```

## Key API Endpoints

```
POST   /api/auth/register      - Create account
POST   /api/auth/login         - Login

GET    /api/donations          - List donations
POST   /api/donations          - Create donation
GET    /api/donations/:id      - Get details
POST   /api/donations/:id/claim - Claim

GET    /api/verify/:code       - Check verification
POST   /api/verify/:code/verify - Record verification
```

## Default Test Credentials (After First Register)

After first register, you can:
1. Create another account with different email
2. Use different roles to test different features
3. Create multiple donations
4. Claim donations as different users

## What You Can Test

✅ Register as donor/receiver/volunteer
✅ Login with email/password
✅ Create donation with image upload
✅ View donation list
✅ See donation details
✅ Claim donation (as receiver only)
✅ Verify donation
✅ See transaction hash
✅ Error handling (try wrong passwords, duplicate emails, etc.)

## Common Issues

**Backend won't start:**
```bash
# Make sure port 3001 is free
lsof -i :3001
# Kill if needed: kill -9 <PID>

# Or try different port in backend/.env
PORT=3002
```

**Frontend can't reach backend:**
- Check backend is running on 3001
- Check .env has: `NEXT_PUBLIC_API_URL=http://localhost:3001`
- Check browser console for CORS errors

**Image upload fails:**
- Make sure image is < 5MB
- Supabase storage must have "donations" bucket (created via migration)

**Can't claim donation:**
- Must be logged in as receiver role
- Donation must have "available" status
- Can't claim your own donation

## Production Deployment

1. Update `NEXT_PUBLIC_API_URL` to production backend URL
2. Change `JWT_SECRET` in `backend/.env`
3. Use production Supabase project
4. Run `npm run build`
5. Deploy to Vercel (frontend) and any Node host (backend)

## Documentation

- **SETUP.md** - Complete setup with all options
- **IMPLEMENTATION_SUMMARY.md** - What was built
- **CHECKLIST.md** - All items completed
- **QUICKSTART.md** - This file

## Next: Blockchain Integration

Blockchain hooks are ready in `backend/routes/verify.js`:
```javascript
// TODO blockchain: recordDonation(...)
```

Replace mock tx_hash with real smart contract calls.

## Need Help?

1. Check browser console for errors
2. Check terminal for backend logs
3. Verify all credentials in `.env` files
4. Check Supabase dashboard for database records
5. See SETUP.md for detailed troubleshooting

---

**That's it! The system is ready. Happy testing!**
