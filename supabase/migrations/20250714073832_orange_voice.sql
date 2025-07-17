/*
  # Contest Listing Features

  1. New Tables
    - `contest_tags` - Stores tags that can be applied to contests
    - `contest_tag_relations` - Junction table for contest-tag relationships
    - `user_contest_favorites` - Stores user's favorite contests

  2. Changes
    - Add `difficulty` and `featured` columns to `contests` table
    - Add functions and stored procedures for contest filtering and searching

  3. Security
    - Enable RLS on new tables
    - Add appropriate policies for each table
*/

-- Create contest_tags table
CREATE TABLE IF NOT EXISTS contest_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  color text NOT NULL DEFAULT 'blue',
  created_at timestamptz DEFAULT now()
);

-- Create contest_tag_relations junction table
CREATE TABLE IF NOT EXISTS contest_tag_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES contest_tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(contest_id, tag_id)
);

-- Create user_contest_favorites table
CREATE TABLE IF NOT EXISTS user_contest_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contest_id uuid NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, contest_id)
);

-- Add new columns to contests table
ALTER TABLE contests 
ADD COLUMN IF NOT EXISTS difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;

-- Create function for searching and filtering contests
CREATE OR REPLACE FUNCTION search_contests(
  search_term text DEFAULT '',
  contest_types text[] DEFAULT '{}',
  min_entry_fee numeric DEFAULT 0,
  max_entry_fee numeric DEFAULT 10000,
  min_prize_pool numeric DEFAULT 0,
  statuses text[] DEFAULT '{}',
  difficulty_levels text[] DEFAULT '{}',
  is_featured boolean DEFAULT null,
  tag_filter text[] DEFAULT '{}',
  sort_by text DEFAULT 'created_at',
  sort_direction text DEFAULT 'desc',
  page_number int DEFAULT 1,
  page_size int DEFAULT 12
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  entry_fee numeric,
  prize_pool numeric,
  max_participants integer,
  current_participants integer,
  contest_type text,
  start_time timestamptz,
  end_time timestamptz,
  status text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  difficulty text,
  featured boolean,
  tags text[],
  is_favorited boolean,
  total_count bigint
) AS $$
DECLARE
  total_records bigint;
  offset_value int;
BEGIN
  -- Calculate offset
  offset_value := (page_number - 1) * page_size;
  
  -- Get total count for pagination
  SELECT COUNT(*) INTO total_records
  FROM contests c
  WHERE 
    (search_term = '' OR 
     c.title ILIKE '%' || search_term || '%' OR 
     c.description ILIKE '%' || search_term || '%') AND
    (array_length(contest_types, 1) IS NULL OR c.contest_type = ANY(contest_types)) AND
    c.entry_fee >= min_entry_fee AND
    c.entry_fee <= max_entry_fee AND
    c.prize_pool >= min_prize_pool AND
    (array_length(statuses, 1) IS NULL OR c.status = ANY(statuses)) AND
    (array_length(difficulty_levels, 1) IS NULL OR c.difficulty = ANY(difficulty_levels)) AND
    (is_featured IS NULL OR c.featured = is_featured) AND
    (array_length(tag_filter, 1) IS NULL OR EXISTS (
      SELECT 1 FROM contest_tag_relations ctr
      JOIN contest_tags ct ON ctr.tag_id = ct.id
      WHERE ctr.contest_id = c.id AND ct.name = ANY(tag_filter)
    ));
  
  -- Return filtered and sorted results
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.description,
    c.entry_fee,
    c.prize_pool,
    c.max_participants,
    c.current_participants,
    c.contest_type,
    c.start_time,
    c.end_time,
    c.status,
    c.created_by,
    c.created_at,
    c.updated_at,
    c.difficulty,
    c.featured,
    ARRAY(
      SELECT ct.name 
      FROM contest_tag_relations ctr
      JOIN contest_tags ct ON ctr.tag_id = ct.id
      WHERE ctr.contest_id = c.id
    ) as tags,
    EXISTS (
      SELECT 1 FROM user_contest_favorites ucf
      WHERE ucf.contest_id = c.id AND ucf.user_id = auth.uid()
    ) as is_favorited,
    total_records as total_count
  FROM contests c
  WHERE 
    (search_term = '' OR 
     c.title ILIKE '%' || search_term || '%' OR 
     c.description ILIKE '%' || search_term || '%') AND
    (array_length(contest_types, 1) IS NULL OR c.contest_type = ANY(contest_types)) AND
    c.entry_fee >= min_entry_fee AND
    c.entry_fee <= max_entry_fee AND
    c.prize_pool >= min_prize_pool AND
    (array_length(statuses, 1) IS NULL OR c.status = ANY(statuses)) AND
    (array_length(difficulty_levels, 1) IS NULL OR c.difficulty = ANY(difficulty_levels)) AND
    (is_featured IS NULL OR c.featured = is_featured) AND
    (array_length(tag_filter, 1) IS NULL OR EXISTS (
      SELECT 1 FROM contest_tag_relations ctr
      JOIN contest_tags ct ON ctr.tag_id = ct.id
      WHERE ctr.contest_id = c.id AND ct.name = ANY(tag_filter)
    ))
  ORDER BY
    CASE WHEN sort_by = 'prize_pool' AND sort_direction = 'asc' THEN c.prize_pool END ASC,
    CASE WHEN sort_by = 'prize_pool' AND sort_direction = 'desc' THEN c.prize_pool END DESC,
    CASE WHEN sort_by = 'entry_fee' AND sort_direction = 'asc' THEN c.entry_fee END ASC,
    CASE WHEN sort_by = 'entry_fee' AND sort_direction = 'desc' THEN c.entry_fee END DESC,
    CASE WHEN sort_by = 'start_time' AND sort_direction = 'asc' THEN c.start_time END ASC,
    CASE WHEN sort_by = 'start_time' AND sort_direction = 'desc' THEN c.start_time END DESC,
    CASE WHEN sort_by = 'participants' AND sort_direction = 'asc' THEN c.current_participants END ASC,
    CASE WHEN sort_by = 'participants' AND sort_direction = 'desc' THEN c.current_participants END DESC,
    CASE WHEN sort_by = 'created_at' AND sort_direction = 'asc' THEN c.created_at END ASC,
    CASE WHEN sort_by = 'created_at' AND sort_direction = 'desc' THEN c.created_at END DESC
  LIMIT page_size
  OFFSET offset_value;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new tables
ALTER TABLE contest_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contest_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for contest_tags
CREATE POLICY "Anyone can view contest tags" 
  ON contest_tags FOR SELECT 
  USING (true);

CREATE POLICY "Admins can insert contest tags" 
  ON contest_tags FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE auth.email() = 'admin@example.com'));

-- Create policies for contest_tag_relations
CREATE POLICY "Anyone can view contest tag relations" 
  ON contest_tag_relations FOR SELECT 
  USING (true);

CREATE POLICY "Contest creators can manage tags" 
  ON contest_tag_relations FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contests c
      WHERE c.id = contest_id AND c.created_by = auth.uid()
    )
  );

-- Create policies for user_contest_favorites
CREATE POLICY "Users can view their own favorites" 
  ON user_contest_favorites FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites" 
  ON user_contest_favorites FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their favorites" 
  ON user_contest_favorites FOR DELETE 
  TO authenticated
  USING (user_id = auth.uid());

-- Insert some sample tags
INSERT INTO contest_tags (name, description, color) VALUES
('Daily', 'Contests that last for one day', 'blue'),
('Weekly', 'Contests that last for one week', 'purple'),
('Seasonal', 'Contests that last for a season', 'green'),
('Beginner-Friendly', 'Great for new players', 'emerald'),
('High-Stakes', 'Contests with large prize pools', 'red'),
('Tech', 'Technology sector focused', 'indigo'),
('Finance', 'Finance sector focused', 'amber'),
('Healthcare', 'Healthcare sector focused', 'cyan')
ON CONFLICT (name) DO NOTHING;