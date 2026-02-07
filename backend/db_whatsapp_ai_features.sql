-- Migration: Add phone field for WhatsApp integration
-- Date: 2026-01-18

-- Add phone column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone VARCHAR(15);

-- Add comment for documentation
COMMENT ON COLUMN public.users.phone IS 'Phone number with country code (e.g., 919876543210) for WhatsApp communication';

-- Note: Phone is nullable to allow existing users without breaking changes
-- Validation will be handled at application level
