-- Migration to add Location Tracking and Pickup Window features

-- Add columns for Location (Geolocation)
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS latitude FLOAT,
ADD COLUMN IF NOT EXISTS longitude FLOAT;

-- Add columns for Pickup Window
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS pickup_window_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pickup_window_end TIMESTAMP WITH TIME ZONE;
