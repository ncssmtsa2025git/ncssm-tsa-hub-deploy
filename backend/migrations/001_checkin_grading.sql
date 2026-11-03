-- Check-in approval + grading columns.
-- Run once in Supabase Dashboard > SQL Editor. Safe to re-run.
ALTER TABLE checkins
  ADD COLUMN IF NOT EXISTS approved boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS score integer CHECK (score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS feedback text,
  ADD COLUMN IF NOT EXISTS graded_at timestamptz;

-- Make the Supabase API pick up the new columns immediately
NOTIFY pgrst, 'reload schema';
