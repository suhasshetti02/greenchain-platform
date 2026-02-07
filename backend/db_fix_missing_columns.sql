-- Migration to add missing AI and logistics columns to donations table

ALTER TABLE public.donations
ADD COLUMN IF NOT EXISTS food_type TEXT,
ADD COLUMN IF NOT EXISTS storage TEXT DEFAULT 'room_temp',
ADD COLUMN IF NOT EXISTS prepared_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS priority_score FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS risk_score FLOAT DEFAULT 0;

-- Optional: Add index for priority_score if sorting heavily relies on it
CREATE INDEX IF NOT EXISTS idx_donations_priority_score ON public.donations (priority_score);
