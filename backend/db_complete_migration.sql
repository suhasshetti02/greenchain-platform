-- MASTER MIGRATION SCRIPT
-- Run this to fix "Column does not exist" errors and "0 Data" issues.
-- It works safely even if you ran some parts before (IF NOT EXISTS).

-- 1. Update USERS table (Location)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS latitude FLOAT,
ADD COLUMN IF NOT EXISTS longitude FLOAT,
ADD COLUMN IF NOT EXISTS address TEXT;

CREATE INDEX IF NOT EXISTS idx_users_location ON public.users (latitude, longitude);

-- 2. Update DONATIONS table (Location & Pickup)
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS latitude FLOAT,
ADD COLUMN IF NOT EXISTS longitude FLOAT,
ADD COLUMN IF NOT EXISTS pickup_window_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pickup_window_end TIMESTAMP WITH TIME ZONE;

-- 3. Update DONATIONS table (AI & Logistics - Fixes "food_type does not exist")
ALTER TABLE public.donations
ADD COLUMN IF NOT EXISTS food_type TEXT,
ADD COLUMN IF NOT EXISTS storage TEXT DEFAULT 'room_temp',
ADD COLUMN IF NOT EXISTS prepared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS priority_score FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS risk_score FLOAT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_donations_priority_score ON public.donations (priority_score);

-- 4. Verify RLS (Optional - ensures you can see your own data)
-- Use this if you still see 0 data after fixing columns.
-- DROP POLICY IF EXISTS "Donors can view their own donations" ON public.donations;
-- CREATE POLICY "Donors can view their own donations" ON public.donations FOR SELECT USING (auth.uid() = donor_id);
