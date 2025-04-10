-- Sample data for the Intellect learning platform

-- Insert sample subjects
INSERT INTO public.subjects (id, title, description, difficulty, image_url, created_at, updated_at)
VALUES
  ('1', 'Physics', 'Explore the fundamental laws that govern the universe', 'Intermediate', 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa', NOW(), NOW()),
  ('2', 'Mathematics', 'Develop problem-solving skills through mathematical concepts', 'Intermediate', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb', NOW(), NOW()),
  ('3', 'Chemistry', 'Understand the composition and properties of matter', 'Intermediate', 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6', NOW(), NOW()),
  ('4', 'Biology', 'Study living organisms and their interactions with each other', 'Beginner', 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample courses
INSERT INTO public.courses (id, subject_id, title, description, difficulty, created_at, updated_at)
VALUES
  ('1', '1', 'Classical Mechanics', 'Learn about motion, forces, and energy', 'Intermediate', NOW(), NOW()),
  ('2', '1', 'Electromagnetism', 'Explore electric and magnetic fields', 'Advanced', NOW(), NOW()),
  ('3', '2', 'Calculus', 'Master derivatives, integrals, and their applications', 'Intermediate', NOW(), NOW()),
  ('4', '2', 'Linear Algebra', 'Study vectors, matrices, and linear transformations', 'Intermediate', NOW(), NOW()),
  ('5', '3', 'Organic Chemistry', 'Understand carbon-based compounds', 'Advanced', NOW(), NOW()),
  ('6', '4', 'Cell Biology', 'Explore the fundamental unit of life', 'Beginner', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample lessons
INSERT INTO public.lessons (id, course_id, title, content, order_id, created_at, updated_at)
VALUES
  ('1', '1', 'Newton''s Laws of Motion', 'Introduction to the three fundamental laws that form the foundation of classical mechanics.', 1, NOW(), NOW()),
  ('2', '1', 'Conservation of Energy', 'Understanding how energy is conserved in physical systems.', 2, NOW(), NOW()),
  ('3', '2', 'Electric Fields', 'Introduction to electric fields and Coulomb''s law.', 1, NOW(), NOW()),
  ('4', '3', 'Limits and Continuity', 'Understanding the concept of limits and continuous functions.', 1, NOW(), NOW()),
  ('5', '3', 'Derivatives', 'Learning how to find rates of change using derivatives.', 2, NOW(), NOW()),
  ('6', '5', 'Introduction to Hydrocarbons', 'Understanding the basic structure and properties of hydrocarbons.', 1, NOW(), NOW()),
  ('7', '6', 'Cell Structure', 'Exploring the components and organization of cells.', 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample quizzes
INSERT INTO public.quizzes (id, lesson_id, title, description, created_at, updated_at)
VALUES
  ('1', '1', 'Newton''s Laws Quiz', 'Test your understanding of Newton''s three laws of motion', NOW(), NOW()),
  ('2', '4', 'Limits Quiz', 'Test your knowledge of limits and continuity', NOW(), NOW()),
  ('3', '7', 'Cell Structure Quiz', 'Test your understanding of cell components and functions', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample quiz questions
INSERT INTO public.quiz_questions (id, quiz_id, question, options, correct_answer, created_at, updated_at)
VALUES
  ('1', '1', 'What is Newton''s First Law about?', '["Inertia", "Force equals mass times acceleration", "Equal and opposite reactions", "Conservation of energy"]', 'Inertia', NOW(), NOW()),
  ('2', '1', 'What is the formula for Newton''s Second Law?', '["F = ma", "E = mc²", "F = G(m₁m₂)/r²", "p = mv"]', 'F = ma', NOW(), NOW()),
  ('3', '2', 'What happens to a function at a removable discontinuity?', '["The limit exists but the function is undefined at that point", "The limit does not exist", "The function approaches infinity", "The function oscillates"]', 'The limit exists but the function is undefined at that point', NOW(), NOW()),
  ('4', '3', 'Which organelle is known as the powerhouse of the cell?', '["Mitochondria", "Nucleus", "Endoplasmic Reticulum", "Golgi Apparatus"]', 'Mitochondria', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
