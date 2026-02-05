-- ================================================
-- Migration: Guest Voting System & Avatars
-- Description: Adds avatar support to profiles and
--              enables guest participation in Planning Poker
-- ================================================

-- 1. Add avatar column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar TEXT
CHECK (avatar IN ('sloth-default', 'sloth-happy', 'sloth-sleepy', 'sloth-cool', 'sloth-heart', 'sloth-star', 'sloth-coffee', 'sloth-zen'))
DEFAULT 'sloth-default';

-- 2. Create guest_voters table for anonymous Planning Poker participants
CREATE TABLE IF NOT EXISTS guest_voters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES voting_sessions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar TEXT CHECK (avatar IN ('sloth-default', 'sloth-happy', 'sloth-sleepy', 'sloth-cool', 'sloth-heart', 'sloth-star', 'sloth-coffee', 'sloth-zen')) DEFAULT 'sloth-default',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Modify votes table to support guest voters
-- Add guest_id column (nullable, for guest voters)
ALTER TABLE votes
ADD COLUMN IF NOT EXISTS guest_id UUID REFERENCES guest_voters(id) ON DELETE CASCADE;

-- Make user_id nullable (for guest voters)
ALTER TABLE votes
ALTER COLUMN user_id DROP NOT NULL;

-- Drop the old unique constraint
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_session_id_user_id_key;

-- Add new constraint that allows either user_id or guest_id
ALTER TABLE votes
ADD CONSTRAINT votes_unique_voter
CHECK (
    (user_id IS NOT NULL AND guest_id IS NULL) OR
    (user_id IS NULL AND guest_id IS NOT NULL)
);

-- Add unique constraints for both types of voters
CREATE UNIQUE INDEX IF NOT EXISTS votes_session_user_unique
ON votes(session_id, user_id) WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS votes_session_guest_unique
ON votes(session_id, guest_id) WHERE guest_id IS NOT NULL;

-- 4. Enable RLS on guest_voters
ALTER TABLE guest_voters ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for guest_voters (public access for voting sessions)
-- Anyone can create a guest voter for a session
CREATE POLICY "Anyone can create guest voters"
ON guest_voters FOR INSERT
WITH CHECK (true);

-- Anyone can view guest voters in a session
CREATE POLICY "Anyone can view guest voters"
ON guest_voters FOR SELECT
USING (true);

-- 6. Update votes policies to allow guest voting
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can vote in sessions" ON votes;
DROP POLICY IF EXISTS "Users can view votes" ON votes;

-- Allow authenticated users and guests to vote
CREATE POLICY "Anyone can vote in sessions"
ON votes FOR INSERT
WITH CHECK (true);

-- Allow anyone to view votes (needed for Planning Poker reveal)
CREATE POLICY "Anyone can view votes"
ON votes FOR SELECT
USING (true);

-- Allow users to update their own votes
CREATE POLICY "Users can update own votes"
ON votes FOR UPDATE
USING (
    (user_id IS NOT NULL AND auth.uid() = user_id) OR
    (guest_id IS NOT NULL)
);

-- ================================================
-- ROLLBACK (if needed):
-- ================================================
-- ALTER TABLE profiles DROP COLUMN avatar;
-- DROP TABLE guest_voters;
-- ALTER TABLE votes DROP COLUMN guest_id;
-- ALTER TABLE votes ALTER COLUMN user_id SET NOT NULL;
