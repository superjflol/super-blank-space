
-- Update the retrieval order of best_games to show newest first
CREATE OR REPLACE FUNCTION get_best_games()
RETURNS TABLE (
  id uuid,
  format text,
  phase text,
  tournament text,
  image_url text,
  replay_url text,
  players text,
  description_en text,
  description_it text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bg.id,
    bg.format,
    bg.phase,
    bg.tournament,
    bg.image_url,
    bg.replay_url,
    bg.players,
    bg.description_en,
    bg.description_it,
    bg.created_at
  FROM 
    public.best_games bg
  ORDER BY 
    bg.created_at DESC;
END;
$$ LANGUAGE plpgsql;
