# Donation Creation & Display Verification Guide

## Overview
This guide helps verify that donations are being created and stored in the database correctly, and that they appear in the listings.

## Flow Summary

### 1. **Donation Creation Flow**
```
User fills form → Frontend (create/page.jsx)
  ↓
POST /api/donations (with FormData)
  ↓
Backend (routes/donations.js) - verifyToken middleware
  ↓
Controller (donationController.js) - createDonation()
  ↓
- Validates required fields
- Uploads image to Supabase Storage
- Inserts into donations table
- Creates verification_event
  ↓
Returns success → Frontend redirects to /donations
```

### 2. **Donation Display Flow**
```
User visits /donations → Frontend (donations/page.jsx)
  ↓
GET /api/donations (or /api/donations/mine)
  ↓
Backend (donationController.js) - listDonations() or listMyDonations()
  ↓
Queries Supabase donations table
  ↓
Returns donations array → Frontend displays in grid
```

## Verification Steps

### Step 1: Check Backend Server is Running
```bash
# In backend directory
npm start
# Should see: "Server running on port 3001"
```

### Step 2: Check Environment Variables
Verify these are set in `backend/.env`:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

Verify in `project/.env.local`:
- `NEXT_PUBLIC_API_URL=http://localhost:3001`

### Step 3: Test Donation Creation

1. **Login as a donor user**
2. **Navigate to** `/donations/create`
3. **Fill out the form:**
   - Title: "Test Donation"
   - Category: "Produce"
   - Quantity: 10
   - Unit: "lbs"
   - Location: "123 Test St"
   - Expiry Date: (future date)
   - (Optional) Upload image
   - (Optional) Notes
4. **Submit the form**
5. **Check browser console** for any errors
6. **Check Network tab** in DevTools:
   - Look for POST request to `/api/donations`
   - Status should be `201 Created`
   - Response should have: `{ message: "Donation created successfully", id: "..." }`

### Step 4: Verify Database Storage

**Option A: Check via Backend Logs**
- After creating donation, check backend console for any errors
- Should see successful insert

**Option B: Check Supabase Dashboard**
1. Go to Supabase Dashboard → Table Editor
2. Open `donations` table
3. Look for your new donation
4. Verify fields:
   - `donor_id` matches your user ID
   - `status` is `available`
   - `title`, `category`, `quantity_lbs`, etc. are correct

### Step 5: Verify Display

1. **Navigate to** `/donations`
2. **Check Network tab:**
   - Look for GET request to `/api/donations`
   - Status should be `200 OK`
   - Response should have `{ donations: [...] }` array
3. **Verify the donation appears** in the list
4. **Try filtering:**
   - Click "Show only my donations" (if donor)
   - Filter by status (available, claimed, etc.)

## Common Issues & Solutions

### Issue 1: Donation Not Saving
**Symptoms:** Form submits but no donation appears

**Check:**
- Backend server is running
- `NEXT_PUBLIC_API_URL` is correct
- Backend `.env` has correct Supabase credentials
- Check backend console for errors
- Check browser console for network errors

**Solution:**
- Verify backend is accessible at the API URL
- Check Supabase service role key is valid
- Ensure database connection is working

### Issue 2: Donation Saved But Not Displaying
**Symptoms:** Donation exists in database but doesn't show in list

**Check:**
- Network request to `/api/donations` succeeds
- Response contains donations array
- Check browser console for JavaScript errors
- Verify RLS policies allow viewing (backend uses service role, so should bypass)

**Solution:**
- Check if donations query is filtering correctly
- Verify `status` field - might be filtered out
- Check if `scope` filter is set to "mine" when viewing all

### Issue 3: Image Upload Failing
**Symptoms:** Donation saves but image doesn't appear

**Check:**
- Supabase Storage bucket `donations` exists
- Storage policies allow uploads
- Image file size < 5MB
- Check backend logs for upload errors

**Solution:**
- Verify storage bucket is created
- Check storage policies in Supabase dashboard
- Ensure `SUPABASE_SERVICE_ROLE_KEY` has storage access

### Issue 4: Authentication Errors
**Symptoms:** 401 Unauthorized errors

**Check:**
- User is logged in
- Token is being sent in Authorization header
- Token is valid (not expired)
- Backend JWT_SECRET matches token signing

**Solution:**
- Logout and login again
- Check token in localStorage: `localStorage.getItem('greenchain:auth')`
- Verify backend JWT_SECRET matches

## Database Schema Reference

### donations table
- `id` (uuid) - Primary key
- `donor_id` (uuid) - Foreign key to users
- `title` (text) - Required
- `category` (text) - Required
- `quantity_lbs` (numeric) - Required
- `unit` (text) - Default: 'lbs'
- `expiry_date` (timestamptz) - Required
- `status` (text) - Default: 'available'
- `location` (text) - Required
- `image_url` (text) - Optional
- `notes` (text) - Optional
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## API Endpoints Reference

### Create Donation
```
POST /api/donations
Headers: Authorization: Bearer <token>
Body: FormData
  - title (required)
  - category (required)
  - quantity_lbs (required)
  - unit (default: 'lbs')
  - expiry_date (required)
  - location (required)
  - notes (optional)
  - image (optional file)
```

### List All Donations
```
GET /api/donations?status=available&limit=50&offset=0
Headers: Authorization: Bearer <token> (optional for public view)
```

### List My Donations (Donor only)
```
GET /api/donations/mine
Headers: Authorization: Bearer <token>
```

### List Available Donations
```
GET /api/donations/available?limit=50
Headers: Authorization: Bearer <token>
```

## Testing Checklist

- [ ] Backend server running on port 3001
- [ ] Frontend can reach backend (check Network tab)
- [ ] User logged in as donor
- [ ] Can access `/donations/create`
- [ ] Form submission succeeds (201 response)
- [ ] Donation appears in Supabase database
- [ ] Can view donations at `/donations`
- [ ] New donation appears in list
- [ ] Image uploads successfully (if provided)
- [ ] Filtering works (status, scope)
- [ ] "Show only my donations" works for donors

## Debug Commands

### Check if donation was created
```sql
-- Run in Supabase SQL Editor
SELECT * FROM donations 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check user's donations
```sql
-- Replace <user_id> with actual user ID
SELECT * FROM donations 
WHERE donor_id = '<user_id>'
ORDER BY created_at DESC;
```

### Check verification events
```sql
SELECT * FROM verification_events 
ORDER BY created_at DESC 
LIMIT 10;
```

