-- ================================================
-- Migration: Guest Voting Policies
-- Description: Allows anonymous users to access voting sessions
-- ================================================

-- Allow anyone to view voting sessions (for guests)
CREATE POLICY "Anyone can view voting sessions"
ON voting_sessions FOR SELECT
USING (true);

-- Allow anyone to view tasks (for showing task title in voting)
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
CREATE POLICY "Anyone can view tasks"
ON tasks FOR SELECT
USING (true);
