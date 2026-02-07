-- WhatsApp & AI Features Migration
-- Add phone column to users table

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS phone VARCHAR(15);

COMMENT ON COLUMN public.users.phone IS 'Phone number with country code (e.g., 919876543210) for WhatsApp communication';

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'phone';
