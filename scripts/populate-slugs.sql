-- Generate slugs for courses that don't have them
-- This will create slugs from course titles

UPDATE courses 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- Handle duplicate slugs by appending ID
-- This will make slugs unique
DO $$
DECLARE
  duplicate_record RECORD;
  counter INTEGER := 1;
BEGIN
  FOR duplicate_record IN 
    SELECT slug, id, title FROM (
      SELECT slug, id, title, COUNT(*) OVER (PARTITION BY slug) as cnt
      FROM courses
      WHERE slug IS NOT NULL AND slug != ''
    ) t
    WHERE cnt > 1
    ORDER BY slug, id
  LOOP
    UPDATE courses 
    SET slug = duplicate_record.slug || '-' || counter
    WHERE id = duplicate_record.id;
    counter := counter + 1;
  END LOOP;
END $$;
