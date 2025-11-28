# Donation Flow Upgrade Summary

## Overview
This document summarizes the upgrades made to the Create Donation flow, including availability duration, claim validation, auto-expiration, and loading animations.

## 1. Availability Duration on Create Donation

### Implementation
- **Location**: `app/donations/create/page.jsx`
- **Features**:
  - Quick-select duration buttons: 2, 4, 6, 12 hours
  - Custom expiry date/time picker option
  - Real-time calculation of expiry date based on selected duration
  - Clear messaging: "After this time, your donation will automatically expire"

### How It Works
1. **Default Behavior**: User selects a duration (default: 4 hours)
2. **Calculation**: Frontend computes `expiry_date = Date.now() + durationInHours`
3. **Custom Override**: User can switch to custom datetime picker
4. **Form Submission**: `expiry_date` is set in FormData before sending to backend

### Code Flow
```javascript
// User selects duration (e.g., 4 hours)
selectedDuration = 4

// On submit, calculate expiry
expiryDate = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()

// Set in FormData
formData.set("expiry_date", expiryDate)
```

## 2. Make Donation Unavailable After Claim

### Backend Changes
- **Location**: `backend/controllers/donationController.js`
- **Function**: `claimDonation()`

### Validation Logic
1. **Status Check**: Verifies `status === "available"`
2. **Expiry Check**: Verifies `expiry_date > now()`
3. **Auto-Expire**: If expired, marks donation as "expired" before rejecting
4. **Status Update**: After successful claim, sets `status = "claimed"`

### Frontend Changes
- **Location**: `app/donations/[id]/page.jsx`
- **Behavior**: After successful claim, redirects to donations list after 2 seconds
- **User Feedback**: Shows success message and updates UI immediately

### Code Flow
```javascript
// Backend validation
if (donation.status !== "available") throw error
if (expiryDate <= now) {
  await markAsExpired(id)
  throw error("Donation has expired")
}

// After successful claim
await updateDonationStatus(id, "claimed")
```

## 3. Auto-Expire Donation After Duration

### Backend Implementation
- **Location**: `backend/controllers/donationController.js`
- **Functions**: `listDonations()`, `listAvailableDonations()`

### Auto-Expiration Logic
1. **Cleanup Step**: Before listing donations, marks expired ones:
   ```sql
   UPDATE donations 
   SET status = 'expired' 
   WHERE status = 'available' 
   AND expiry_date < NOW()
   ```

2. **Filtering**: Only returns donations where:
   - `status === "available"`
   - `expiry_date > NOW()`

### Frontend Safety Filter
- **Location**: `app/donations/page.jsx`
- **Purpose**: Additional client-side filtering as safety measure
- **Logic**: Filters out expired donations even if backend misses them

### Code Flow
```javascript
// Backend: Before listing
await markExpiredDonations()

// Backend: Query
SELECT * FROM donations 
WHERE status = 'available' 
AND expiry_date > NOW()

// Frontend: Additional filter
donations.filter(d => {
  if (d.status === 'expired') return false
  if (d.status === 'available' && new Date(d.expiry_date) <= now) return false
  return true
})
```

## 4. Loading Animations & Micro-interactions

### Loading States

#### Initial Loading (initializing)
- **Location**: `app/donations/create/page.jsx`
- **Features**:
  - Skeleton blocks with `animate-pulse`
  - Structured layout matching actual form
  - Smooth fade-in animations

#### Submission Loading (submitting)
- **Features**:
  - Overlay with backdrop blur
  - Spinning loader with nested animation
  - Disabled form inputs
  - Progress message: "Saving your donation..."

### Micro-interactions

1. **Form Container**: Fade-in and slide-up animation on mount
   ```css
   animate-in fade-in slide-in-from-bottom-4 duration-500
   ```

2. **Submit Button**: 
   - Hover scale: `hover:scale-[1.02]`
   - Active scale: `active:scale-[0.98]`
   - Spinner during submission

3. **Image Upload Area**:
   - Scale transition on hover: `hover:scale-[1.01]`
   - Smooth border color transitions
   - Preview fade-in when image selected

4. **Duration Buttons**:
   - Active state with teal background
   - Smooth transitions: `transition-all duration-200`
   - Icon color changes on selection

## 5. Donor Dashboard Updates

### Expired Status Display
- **Location**: `app/dashboard/donor/page.jsx`
- **Changes**:
  - Shows "Expired" badge for expired donations
  - Status badge uses "delayed" status for expired items
  - Visual distinction with amber color

## Database Migration

### New Migration
- **File**: `supabase/migrations/20251128000000_add_expired_status.sql`
- **Purpose**: Adds "expired" to the status CHECK constraint
- **Action Required**: Run this migration in Supabase

```sql
ALTER TABLE donations 
  ADD CONSTRAINT donations_status_check 
  CHECK (status IN ('available', 'claimed', 'in_transit', 'completed', 'expired'));
```

## Testing Guide

### Test Availability Duration

1. **Create New Donation**:
   - Navigate to `/donations/create`
   - Select different duration buttons (2h, 4h, 6h, 12h)
   - Verify expiry date updates in real-time
   - Switch to custom expiry and set a specific date
   - Submit and verify expiry_date in database

2. **Edit Existing Donation**:
   - Edit a donation
   - Verify custom expiry is pre-filled
   - Change duration and verify it updates

### Test Claim Validation

1. **Valid Claim**:
   - As receiver, view available donations
   - Claim a donation with future expiry
   - Verify it disappears from available list
   - Verify status changes to "claimed" in database

2. **Expired Donation**:
   - Create donation with expiry in the past (via custom expiry)
   - Try to claim it as receiver
   - Verify error: "This donation has expired"
   - Verify donation status is "expired"

3. **Already Claimed**:
   - Claim a donation
   - Try to claim same donation again
   - Verify error: "Donation is no longer available"

### Test Auto-Expiration

1. **Create Expired Donation**:
   - Create donation with expiry 1 hour ago
   - View donations list
   - Verify it doesn't appear in "available" list
   - Check database: status should be "expired"

2. **Real-time Expiration**:
   - Create donation with 2-hour duration
   - Wait 2+ hours (or manually set expiry in DB)
   - Refresh donations list
   - Verify donation is marked as expired
   - Verify it doesn't appear in available donations

### Test Loading Animations

1. **Initial Load**:
   - Navigate to create donation page
   - Verify skeleton loading appears
   - Verify smooth transition to form

2. **Submission**:
   - Fill form and submit
   - Verify overlay appears with spinner
   - Verify form is disabled during submission
   - Verify success message appears

3. **Micro-interactions**:
   - Hover over submit button (should scale slightly)
   - Hover over image upload area (should scale)
   - Click duration buttons (should highlight smoothly)

## Files Modified

### Frontend
- `app/donations/create/page.jsx` - Duration UI, loading animations
- `app/donations/page.jsx` - Client-side expired filter
- `app/donations/[id]/page.jsx` - Claim redirect and feedback
- `app/dashboard/donor/page.jsx` - Expired status display

### Backend
- `backend/controllers/donationController.js` - Expiry validation, auto-expire logic

### Database
- `supabase/migrations/20251128000000_add_expired_status.sql` - Add expired status

## Key Points

1. **Duration → Expiry**: Frontend calculates expiry from duration, backend receives expiry_date
2. **Auto-Expiration**: Backend marks expired donations before listing
3. **Claim Validation**: Both status and expiry are checked before allowing claim
4. **User Experience**: Smooth animations, clear feedback, immediate UI updates

## Next Steps

1. **Run Database Migration**: Execute the new migration in Supabase
2. **Test End-to-End**: Follow testing guide above
3. **Monitor**: Check backend logs for any expiry-related errors
4. **Optional Enhancements**:
   - Add notification when donation is about to expire
   - Add cron job for batch expiry updates (if needed)
   - Add analytics for expired vs claimed donations

