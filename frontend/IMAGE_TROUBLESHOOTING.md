# Image Display Troubleshooting Guide

## Issue: Images Not Showing in Donations List

### ✅ Fixed: Next.js Image Configuration

The main issue was that Next.js Image component requires external image domains to be whitelisted. Supabase storage URLs were not included in the configuration.

**Fix Applied:**
- Updated `next.config.mjs` to include Supabase storage domain pattern
- Added pattern: `*.supabase.co` with path `/storage/v1/object/public/**`

### Additional Checks

#### 1. Verify Image Upload is Working

**Check Backend Logs:**
```bash
# When creating a donation, check backend console for:
# - "Image upload error:" messages
# - Any Supabase storage errors
```

**Check Database:**
```sql
-- Run in Supabase SQL Editor
SELECT id, title, image_url, created_at 
FROM donations 
ORDER BY created_at DESC 
LIMIT 10;
```

**Expected:** `image_url` should contain a URL like:
```
https://[project-ref].supabase.co/storage/v1/object/public/donations/[userId]/[timestamp]-[filename]
```

#### 2. Verify Image URL Format

The image URL should be a public URL from Supabase storage. Check:
- URL starts with `https://`
- Contains `supabase.co`
- Path includes `/storage/v1/object/public/donations/`

#### 3. Check Browser Console

Open browser DevTools (F12) → Console tab:
- Look for image loading errors
- Check for CORS errors
- Verify image URLs are accessible

#### 4. Test Image URL Directly

1. Copy the `image_url` from database
2. Paste in browser address bar
3. Image should load directly
4. If it doesn't, check:
   - Storage bucket exists: `donations`
   - Storage bucket is public
   - File actually exists at that path

#### 5. Verify Storage Bucket Configuration

**In Supabase Dashboard:**
1. Go to Storage → Buckets
2. Check `donations` bucket exists
3. Verify it's marked as **Public**
4. Check bucket policies allow public read access

**Storage Policies Should Include:**
```sql
-- Public can read donation images
CREATE POLICY "Public can read donation images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'donations');
```

#### 6. Check Image Component Usage

The donations page uses Next.js `Image` component:
```jsx
<Image
  src={donation.image_url}
  alt={donation.title}
  fill
  className="object-cover"
/>
```

**Requirements:**
- `image_url` must not be null/undefined
- URL must be whitelisted in `next.config.mjs`
- Image must be accessible (public URL)

#### 7. Debug Steps

**Step 1: Check if image_url exists**
```javascript
// In browser console on /donations page
console.log(donations.map(d => ({ title: d.title, image_url: d.image_url })));
```

**Step 2: Test image URL**
```javascript
// If image_url exists, test it
const testUrl = donations[0].image_url;
console.log('Testing URL:', testUrl);
// Open in new tab to verify it loads
```

**Step 3: Check Next.js Image errors**
- Look for errors like: "Invalid src prop" or "hostname not configured"
- These indicate Next.js config issue (should be fixed now)

#### 8. Common Issues & Solutions

**Issue: image_url is null**
- **Cause:** Image upload failed silently
- **Solution:** Check backend logs, verify file size < 5MB, check storage permissions

**Issue: Image URL returns 404**
- **Cause:** File doesn't exist at that path
- **Solution:** Verify upload succeeded, check storage bucket, verify file path

**Issue: CORS errors**
- **Cause:** Storage bucket not configured for public access
- **Solution:** Check storage bucket is public, verify policies

**Issue: "hostname not configured" error**
- **Cause:** Next.js config missing Supabase domain
- **Solution:** ✅ Fixed - restart Next.js dev server after config change

#### 9. Restart Required

After updating `next.config.mjs`, you **must restart** the Next.js dev server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

#### 10. Verify Fix

1. **Restart Next.js server** (important!)
2. **Create a new donation** with an image
3. **Check database** - verify `image_url` is saved
4. **View donations list** - image should appear
5. **Check browser console** - no image errors

### Testing Checklist

- [ ] Next.js config includes Supabase domain
- [ ] Next.js dev server restarted after config change
- [ ] Storage bucket `donations` exists and is public
- [ ] Storage policies allow public read
- [ ] Image upload succeeds (check backend logs)
- [ ] `image_url` saved in database (not null)
- [ ] Image URL is accessible (test in browser)
- [ ] No console errors in browser
- [ ] Images display in donations list

### Still Not Working?

If images still don't show after these checks:

1. **Check actual image_url value:**
   ```sql
   SELECT image_url FROM donations WHERE image_url IS NOT NULL LIMIT 1;
   ```

2. **Test URL directly:**
   - Copy URL from database
   - Paste in browser
   - If it doesn't load, the issue is with storage/upload
   - If it loads, the issue is with Next.js Image component

3. **Check Network tab:**
   - Open DevTools → Network tab
   - Filter by "Img"
   - Look for failed image requests
   - Check status codes (404, 403, etc.)

4. **Verify Supabase project:**
   - Check SUPABASE_URL in backend .env
   - Verify it matches the URL in image_url
   - Ensure storage is enabled for the project

