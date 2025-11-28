/*
  # Add 'expired' status to donations table

  This migration adds 'expired' as a valid status for donations.
  Expired donations are automatically marked when their expiry_date passes.
*/

-- Drop the existing check constraint
ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_status_check;

-- Add the new check constraint with 'expired' status
ALTER TABLE donations 
  ADD CONSTRAINT donations_status_check 
  CHECK (status IN ('available', 'claimed', 'in_transit', 'completed', 'expired'));

