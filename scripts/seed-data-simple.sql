-- Simple seed script with minimal fields

-- First, check the schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'subjects';

-- Try inserting with just id and name
INSERT INTO public.subjects (id, name) VALUES
  ('1', 'Physics'),
  ('2', 'Mathematics'),
  ('3', 'Chemistry'),
  ('4', 'Biology')
ON CONFLICT (id) DO NOTHING;
