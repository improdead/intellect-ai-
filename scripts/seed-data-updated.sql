-- Sample data for the Intellect learning platform

-- First, let's check the schema of the subjects table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'subjects';

-- Insert sample subjects (adjust column names based on your actual schema)
INSERT INTO public.subjects (id, title, description, difficulty, image_url, created_at, updated_at)
VALUES
  ('1', 'Physics', 'Explore the fundamental laws that govern the universe', 'Intermediate', 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa', NOW(), NOW()),
  ('2', 'Mathematics', 'Develop problem-solving skills through mathematical concepts', 'Intermediate', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb', NOW(), NOW()),
  ('3', 'Chemistry', 'Understand the composition and properties of matter', 'Intermediate', 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6', NOW(), NOW()),
  ('4', 'Biology', 'Study living organisms and their interactions with each other', 'Beginner', 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
