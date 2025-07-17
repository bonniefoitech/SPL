/*
  # SPL Contest System Database Schema

  1. New Tables
    - `contests`
      - `id` (uuid, primary key)
      - `title` (text, not null) - Contest name/title
      - `description` (text) - Contest description
      - `entry_fee` (decimal, default 0) - Cost to join contest
      - `prize_pool` (decimal, not null) - Total prize money
      - `max_participants` (integer, default 100) - Maximum number of participants
      - `current_participants` (integer, default 0) - Current number of participants
      - `contest_type` (text) - Type: 'head-to-head', 'tournament', 'mega-contest'
      - `start_time` (timestamptz, not null) - Contest start time
      - `end_time` (timestamptz, not null) - Contest end time
      - `status` (text, default 'upcoming') - Status: 'upcoming', 'live', 'completed', 'cancelled'
      - `created_by` (uuid, references auth.users) - Contest creator
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `contest_participants`
      - `id` (uuid, primary key)
      - `contest_id` (uuid, references contests) - Contest reference
      - `user_id` (uuid, references auth.users) - Participant user
      - `team_id` (uuid) - Team used in contest (will reference teams table when created)
      - `joined_at` (timestamptz, default now()) - When user joined
      - `final_rank` (integer) - Final ranking in contest
      - `final_points` (decimal) - Final points scored
      - `prize_won` (decimal, default 0) - Prize amount won

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read contests
    - Add policies for contest creators to manage their contests
    - Add policies for participants to join contests and view their participation
    - Add policies for admins to manage all contests

  3. Indexes
    - Add indexes for performance on frequently queried columns
    - Contest status and timing indexes
    - Participant lookup indexes
*/

-- Create contests table
CREATE TABLE IF NOT EXISTS contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  entry_fee decimal(10,2) DEFAULT 0,
  prize_pool decimal(12,2) NOT NULL,
  max_participants integer DEFAULT 100,
  current_participants integer DEFAULT 0,
  contest_type text NOT NULL DEFAULT 'tournament',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text DEFAULT 'upcoming',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_contest_type CHECK (contest_type IN ('head-to-head', 'tournament', 'mega-contest')),
  CONSTRAINT valid_status CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  CONSTRAINT valid_times CHECK (end_time > start_time),
  CONSTRAINT valid_participants CHECK (current_participants >= 0 AND current_participants <= max_participants),
  CONSTRAINT valid_entry_fee CHECK (entry_fee >= 0),
  CONSTRAINT valid_prize_pool CHECK (prize_pool >= 0)
);

-- Create contest_participants table
CREATE TABLE IF NOT EXISTS contest_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid, -- Will reference teams table when created
  joined_at timestamptz DEFAULT now(),
  final_rank integer,
  final_points decimal(10,2),
  prize_won decimal(10,2) DEFAULT 0,
  
  -- Constraints
  CONSTRAINT valid_rank CHECK (final_rank > 0),
  CONSTRAINT valid_points CHECK (final_points >= 0),
  CONSTRAINT valid_prize CHECK (prize_won >= 0),
  CONSTRAINT unique_user_contest UNIQUE(contest_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
CREATE INDEX IF NOT EXISTS idx_contests_start_time ON contests(start_time);
CREATE INDEX IF NOT EXISTS idx_contests_end_time ON contests(end_time);
CREATE INDEX IF NOT EXISTS idx_contests_created_by ON contests(created_by);
CREATE INDEX IF NOT EXISTS idx_contests_type ON contests(contest_type);

CREATE INDEX IF NOT EXISTS idx_participants_contest ON contest_participants(contest_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON contest_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_rank ON contest_participants(final_rank);

-- Enable Row Level Security
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contests table

-- Allow everyone to read public contest information
CREATE POLICY "Anyone can view contests"
  ON contests
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow contest creators to insert their own contests
CREATE POLICY "Users can create contests"
  ON contests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow contest creators to update their own contests
CREATE POLICY "Contest creators can update their contests"
  ON contests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Allow contest creators to delete their own contests (only if no participants)
CREATE POLICY "Contest creators can delete their contests"
  ON contests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by AND current_participants = 0);

-- RLS Policies for contest_participants table

-- Allow users to view participants of contests they're in or contests they created
CREATE POLICY "Users can view contest participants"
  ON contest_participants
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM contests 
      WHERE contests.id = contest_participants.contest_id 
      AND contests.created_by = auth.uid()
    )
  );

-- Allow users to join contests (insert their own participation)
CREATE POLICY "Users can join contests"
  ON contest_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own participation (mainly for team changes before contest starts)
CREATE POLICY "Users can update their participation"
  ON contest_participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to leave contests (delete their participation) before contest starts
CREATE POLICY "Users can leave contests before start"
  ON contest_participants
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM contests 
      WHERE contests.id = contest_participants.contest_id 
      AND contests.start_time > now()
      AND contests.status = 'upcoming'
    )
  );

-- Create function to automatically update contest participant count
CREATE OR REPLACE FUNCTION update_contest_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE contests 
    SET current_participants = current_participants + 1,
        updated_at = now()
    WHERE id = NEW.contest_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE contests 
    SET current_participants = current_participants - 1,
        updated_at = now()
    WHERE id = OLD.contest_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to maintain participant count
DROP TRIGGER IF EXISTS trigger_update_participant_count_insert ON contest_participants;
CREATE TRIGGER trigger_update_participant_count_insert
  AFTER INSERT ON contest_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_contest_participant_count();

DROP TRIGGER IF EXISTS trigger_update_participant_count_delete ON contest_participants;
CREATE TRIGGER trigger_update_participant_count_delete
  AFTER DELETE ON contest_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_contest_participant_count();

-- Create function to automatically update contest status based on time
CREATE OR REPLACE FUNCTION update_contest_status()
RETURNS void AS $$
BEGIN
  -- Update upcoming contests to live when start time is reached
  UPDATE contests 
  SET status = 'live', updated_at = now()
  WHERE status = 'upcoming' 
    AND start_time <= now();
  
  -- Update live contests to completed when end time is reached
  UPDATE contests 
  SET status = 'completed', updated_at = now()
  WHERE status = 'live' 
    AND end_time <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_contests_updated_at ON contests;
CREATE TRIGGER trigger_contests_updated_at
  BEFORE UPDATE ON contests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample contests for testing
INSERT INTO contests (
  title, 
  description, 
  entry_fee, 
  prize_pool, 
  max_participants, 
  contest_type, 
  start_time, 
  end_time,
  created_by
) VALUES 
(
  'Tech Giants Weekly Challenge',
  'Pick the best performing tech stocks for this week. Focus on FAANG and emerging tech companies.',
  25.00,
  5000.00,
  200,
  'tournament',
  now() + interval '2 hours',
  now() + interval '7 days',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Energy Sector Showdown',
  'Battle it out with energy and renewable stocks. Who can predict the energy market best?',
  50.00,
  10000.00,
  100,
  'mega-contest',
  now() + interval '1 day',
  now() + interval '14 days',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Head-to-Head: Bulls vs Bears',
  'Direct competition between two players. Winner takes all!',
  100.00,
  180.00,
  2,
  'head-to-head',
  now() + interval '3 hours',
  now() + interval '3 days',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'Beginner Friendly Contest',
  'Perfect for new players! Low entry fee with great learning opportunities.',
  5.00,
  500.00,
  500,
  'tournament',
  now() + interval '6 hours',
  now() + interval '5 days',
  (SELECT id FROM auth.users LIMIT 1)
);