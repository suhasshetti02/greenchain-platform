-- Feature Expansion Migration
-- Adds Reputation tracking and Scheduled Pickups
-- Adapts Master Prompt requirements to existing schema (latitude/longitude/address)

-- 1. Users Table (Reputation)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS successful_pickups INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS no_shows INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reliability_score INTEGER DEFAULT 100; -- 0-100

-- 2. Claims Table (Verification)
-- 'status' already exists (pending/claimed). Will add 'confirmed' and 'no_show' values dynamically.
ALTER TABLE public.claims
ADD COLUMN IF NOT EXISTS scheduled_pickup TIMESTAMP WITH TIME ZONE;

-- 3. Donations Table (Donor Location)
-- Existing columns: latitude, longitude, location (address text)
-- Ensuring they exist just in case (already covered by previous migration)
ALTER TABLE public.donations
ADD COLUMN IF NOT EXISTS donor_location_label TEXT; 
-- Start using 'donor_location_label' or map existing 'location' to it. 
-- For now, we'll keep 'location' as the primary address field to avoid breaking changes.
-- This script only adds truly new missing fields.
