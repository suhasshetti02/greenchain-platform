-- Add location fields to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Ensure users have a reliable location for queries
CREATE INDEX IF NOT EXISTS users_location_idx ON users (latitude, longitude);
