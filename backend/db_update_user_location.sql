-- Migration to add Location Tracking for Users (Receivers/Donors)

-- Add columns for Location (Geolocation) to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS latitude FLOAT,
ADD COLUMN IF NOT EXISTS longitude FLOAT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Index for faster geospatial queries (optional but good for future)
CREATE INDEX IF NOT EXISTS idx_users_location ON public.users (latitude, longitude);
