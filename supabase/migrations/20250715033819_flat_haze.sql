/*
  # Admin/User Separation and Contest Phases

  1. New Tables
    - `admin_users` - Stores admin user information
    - `contest_phases` - Defines team building and contest phases
  
  2. Changes
    - Add `is_admin` column to users table
    - Add `team_building_end_time` to contests table
    - Add `is_disqualified` to contest_participants
  
  3. Security
    - Add RLS policies for admin access
    - Update contest and team policies
*/

-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login TIMESTAMPTZ
);

-- Add team_building_end_time to contests table
ALTER TABLE contests ADD COLUMN IF NOT EXISTS team_building_end_time TIMESTAMPTZ;

-- Add is_disqualified to contest_participants
ALTER TABLE contest_participants ADD COLUMN IF NOT EXISTS is_disqualified BOOLEAN DEFAULT false;
ALTER TABLE contest_participants ADD COLUMN IF NOT EXISTS disqualification_reason TEXT;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if contest is in team building phase
CREATE OR REPLACE FUNCTION is_in_team_building_phase(contest_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  team_building_end TIMESTAMPTZ;
BEGIN
  SELECT team_building_end_time INTO team_building_end
  FROM contests
  WHERE id = contest_id;
  
  RETURN now() < team_building_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if today is a trading day (Mon-Fri)
CREATE OR REPLACE FUNCTION is_trading_day()
RETURNS BOOLEAN AS $$
DECLARE
  day_of_week INTEGER;
BEGIN
  day_of_week := EXTRACT(DOW FROM now());
  -- 0 = Sunday, 6 = Saturday
  RETURN day_of_week BETWEEN 1 AND 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update contest RLS policies
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create contests" ON contests;
DROP POLICY IF EXISTS "Contest creators can update their contests" ON contests;
DROP POLICY IF EXISTS "Contest creators can delete their contests" ON contests;

-- Create new policies
CREATE POLICY "Anyone can view contests" 
ON contests FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Only admins can create contests" 
ON contests FOR INSERT 
TO authenticated 
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update contests" 
ON contests FOR UPDATE 
TO authenticated 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete contests" 
ON contests FOR DELETE 
TO authenticated 
USING (is_admin() AND current_participants = 0);

-- Update contest_participants policies
ALTER TABLE contest_participants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can join contests" ON contest_participants;
DROP POLICY IF EXISTS "Users can leave contests before start" ON contest_participants;

-- Create new policies
CREATE POLICY "Users can join contests during team building phase" 
ON contest_participants FOR INSERT 
TO authenticated 
WITH CHECK (
  is_in_team_building_phase(contest_id) AND 
  is_trading_day() AND
  uid() = user_id
);

CREATE POLICY "Users can update their team during team building phase" 
ON contest_participants FOR UPDATE 
TO authenticated 
USING (uid() = user_id)
WITH CHECK (
  uid() = user_id AND
  is_in_team_building_phase(contest_id) AND
  is_trading_day()
);

CREATE POLICY "Users can leave contests during team building phase" 
ON contest_participants FOR DELETE 
TO authenticated 
USING (
  (uid() = user_id) AND 
  (EXISTS (
    SELECT 1 FROM contests
    WHERE (
      contests.id = contest_participants.contest_id AND
      is_in_team_building_phase(contests.id)
    )
  ))
);

-- Create function to disqualify users without teams
CREATE OR REPLACE FUNCTION disqualify_users_without_teams()
RETURNS TRIGGER AS $$
BEGIN
  -- Disqualify users who haven't submitted a team
  UPDATE contest_participants
  SET 
    is_disqualified = true,
    disqualification_reason = 'No team submitted before deadline'
  WHERE 
    contest_id = NEW.id AND
    team_id IS NULL;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to disqualify users when contest starts
CREATE TRIGGER trigger_disqualify_users_without_teams
AFTER UPDATE OF status ON contests
FOR EACH ROW
WHEN (NEW.status = 'live' AND OLD.status = 'upcoming')
EXECUTE FUNCTION disqualify_users_without_teams();

-- Create function to validate contest creation time
CREATE OR REPLACE FUNCTION validate_contest_creation()
RETURNS TRIGGER AS $$
DECLARE
  one_day_from_now TIMESTAMPTZ := now() + INTERVAL '1 day';
  nine_am_contest_day TIME := '09:00:00';
  market_close_time TIME := '15:30:00';
BEGIN
  -- Ensure team_building_end_time is set and before start_time
  IF NEW.team_building_end_time IS NULL THEN
    NEW.team_building_end_time := NEW.start_time - INTERVAL '30 minutes';
  ELSIF NEW.team_building_end_time >= NEW.start_time THEN
    RAISE EXCEPTION 'Team building phase must end before contest start time';
  END IF;
  
  -- Ensure contest is created at least one day in advance
  IF NEW.start_time < one_day_from_now THEN
    RAISE EXCEPTION 'Contests must be created at least one day in advance';
  END IF;
  
  -- Ensure team building ends by 9:00 AM on contest day
  IF EXTRACT(HOUR FROM NEW.team_building_end_time) > 9 OR 
     (EXTRACT(HOUR FROM NEW.team_building_end_time) = 9 AND EXTRACT(MINUTE FROM NEW.team_building_end_time) > 0) THEN
    RAISE EXCEPTION 'Team building must end by 9:00 AM on contest day';
  END IF;
  
  -- Ensure results are displayed after 3:30 PM (market close)
  IF EXTRACT(HOUR FROM NEW.end_time) < 15 OR 
     (EXTRACT(HOUR FROM NEW.end_time) = 15 AND EXTRACT(MINUTE FROM NEW.end_time) < 30) THEN
    RAISE EXCEPTION 'Contest must end after market close (3:30 PM)';
  END IF;
  
  -- Ensure contest is on a weekday (Monday to Friday)
  IF EXTRACT(DOW FROM NEW.start_time) = 0 OR EXTRACT(DOW FROM NEW.start_time) = 6 THEN
    RAISE EXCEPTION 'Contests can only be held on weekdays (Monday to Friday)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for contest validation
CREATE TRIGGER trigger_validate_contest_creation
BEFORE INSERT OR UPDATE ON contests
FOR EACH ROW
EXECUTE FUNCTION validate_contest_creation();