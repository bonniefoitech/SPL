/*
  # Contest Details Features

  1. New Tables
    - `contest_rules` - Stores rules for each contest
    - `prize_distributions` - Stores prize distribution details for each contest
    - `contest_leaderboard` - Stores real-time leaderboard data

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Contest Rules Table
CREATE TABLE IF NOT EXISTS contest_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  rule_text text NOT NULL,
  rule_order integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contest_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contest rules"
  ON contest_rules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Contest creators can manage rules"
  ON contest_rules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contests
      WHERE contests.id = contest_rules.contest_id
      AND contests.created_by = auth.uid()
    )
  );

-- Prize Distribution Table
CREATE TABLE IF NOT EXISTS prize_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  rank integer NOT NULL,
  prize_amount numeric(12,2) NOT NULL,
  prize_percentage numeric(5,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prize_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prize distributions"
  ON prize_distributions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Contest creators can manage prize distributions"
  ON prize_distributions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contests
      WHERE contests.id = prize_distributions.contest_id
      AND contests.created_by = auth.uid()
    )
  );

-- Contest Leaderboard Table
CREATE TABLE IF NOT EXISTS contest_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid NOT NULL,
  current_rank integer NOT NULL,
  previous_rank integer,
  points numeric(10,2) NOT NULL DEFAULT 0,
  points_change numeric(10,2),
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE contest_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contest leaderboard"
  ON contest_leaderboard
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can update leaderboard"
  ON contest_leaderboard
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contests
      WHERE contests.id = contest_leaderboard.contest_id
      AND contests.created_by = auth.uid()
    )
  );

-- Add entry fee breakdown column to contests table
ALTER TABLE contests ADD COLUMN IF NOT EXISTS entry_fee_breakdown jsonb;

-- Add function to get user teams for a contest
CREATE OR REPLACE FUNCTION get_user_teams_for_contest(contest_id uuid, user_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  stocks_count integer,
  total_value numeric,
  is_selected boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    COALESCE(jsonb_array_length(t.stocks), 0) as stocks_count,
    COALESCE(t.total_value, 0) as total_value,
    EXISTS (
      SELECT 1 FROM contest_participants cp
      WHERE cp.contest_id = contest_id
      AND cp.user_id = user_id
      AND cp.team_id = t.id
    ) as is_selected
  FROM teams t
  WHERE t.user_id = user_id
  ORDER BY is_selected DESC, created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get contest details with rules and prize distribution
CREATE OR REPLACE FUNCTION get_contest_details(p_contest_id uuid, p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
  contest_data jsonb;
  rules_data jsonb;
  prize_data jsonb;
  user_teams_data jsonb;
  is_joined boolean;
BEGIN
  -- Get contest data
  SELECT jsonb_build_object(
    'id', c.id,
    'title', c.title,
    'description', c.description,
    'entry_fee', c.entry_fee,
    'prize_pool', c.prize_pool,
    'max_participants', c.max_participants,
    'current_participants', c.current_participants,
    'contest_type', c.contest_type,
    'start_time', c.start_time,
    'end_time', c.end_time,
    'status', c.status,
    'created_by', c.created_by,
    'created_at', c.created_at,
    'updated_at', c.updated_at,
    'difficulty', c.difficulty,
    'featured', c.featured,
    'entry_fee_breakdown', c.entry_fee_breakdown,
    'is_favorited', EXISTS (
      SELECT 1 FROM user_contest_favorites
      WHERE contest_id = c.id AND user_id = p_user_id
    )
  )
  INTO contest_data
  FROM contests c
  WHERE c.id = p_contest_id;

  -- Get rules
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', r.id,
      'rule_text', r.rule_text,
      'rule_order', r.rule_order
    )
    ORDER BY r.rule_order
  )
  INTO rules_data
  FROM contest_rules r
  WHERE r.contest_id = p_contest_id;

  -- Get prize distribution
  SELECT jsonb_agg(
    jsonb_build_object(
      'rank', pd.rank,
      'prize_amount', pd.prize_amount,
      'prize_percentage', pd.prize_percentage
    )
    ORDER BY pd.rank
  )
  INTO prize_data
  FROM prize_distributions pd
  WHERE pd.contest_id = p_contest_id;

  -- Check if user has joined
  SELECT EXISTS (
    SELECT 1 FROM contest_participants
    WHERE contest_id = p_contest_id AND user_id = p_user_id
  ) INTO is_joined;

  -- Get user teams if authenticated
  IF p_user_id IS NOT NULL THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'stocks_count', t.stocks_count,
        'total_value', t.total_value,
        'is_selected', t.is_selected
      )
    )
    INTO user_teams_data
    FROM get_user_teams_for_contest(p_contest_id, p_user_id) t;
  ELSE
    user_teams_data := '[]'::jsonb;
  END IF;

  -- Combine all data
  RETURN jsonb_build_object(
    'contest', contest_data,
    'rules', COALESCE(rules_data, '[]'::jsonb),
    'prize_distribution', COALESCE(prize_data, '[]'::jsonb),
    'user_teams', COALESCE(user_teams_data, '[]'::jsonb),
    'is_joined', is_joined
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;