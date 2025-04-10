-- Sample data for the Intellect learning platform

-- Seed script specifically tailored for your database schema

-- Insert sample subjects
INSERT INTO public.subjects (id, name, description, icon, color, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Physics', 'Explore the fundamental laws that govern the universe', 'Zap', 'from-blue-400 to-cyan-300', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Mathematics', 'Develop problem-solving skills through mathematical concepts', 'Calculator', 'from-emerald-400 to-teal-300', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'Chemistry', 'Understand the composition and properties of matter', 'Atom', 'from-amber-400 to-yellow-300', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'Biology', 'Study living organisms and their interactions with each other', 'Dna', 'from-rose-400 to-pink-300', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample courses
INSERT INTO public.courses (id, subject_id, title, description, difficulty, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Classical Mechanics', 'Learn about motion, forces, and energy', 'Intermediate', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Electromagnetism', 'Explore electric and magnetic fields', 'Advanced', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222222', 'Calculus', 'Master derivatives, integrals, and their applications', 'Intermediate', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444445', '22222222-2222-2222-2222-222222222222', 'Linear Algebra', 'Study vectors, matrices, and linear transformations', 'Intermediate', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555556', '33333333-3333-3333-3333-333333333333', 'Organic Chemistry', 'Understand carbon-based compounds', 'Advanced', NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666667', '44444444-4444-4444-4444-444444444444', 'Cell Biology', 'Explore the fundamental unit of life', 'Beginner', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample lessons
INSERT INTO public.lessons (id, course_id, title, content, order_index, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111112', 'Newton''s Laws of Motion', 'Introduction to the three fundamental laws that form the foundation of classical mechanics.', 1, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111112', 'Conservation of Energy', 'Understanding how energy is conserved in physical systems.', 2, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333335', '22222222-2222-2222-2222-222222222223', 'Electric Fields', 'Introduction to electric fields and Coulomb''s law.', 1, NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444446', '33333333-3333-3333-3333-333333333334', 'Limits and Continuity', 'Understanding the concept of limits and continuous functions.', 1, NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555557', '33333333-3333-3333-3333-333333333334', 'Derivatives', 'Learning how to find rates of change using derivatives.', 2, NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666668', '55555555-5555-5555-5555-555555555556', 'Introduction to Hydrocarbons', 'Understanding the basic structure and properties of hydrocarbons.', 1, NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777779', '66666666-6666-6666-6666-666666666667', 'Cell Structure', 'Exploring the components and organization of cells.', 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample quizzes
INSERT INTO public.quizzes (id, subject_id, title, description, difficulty, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'Newton''s Laws Quiz', 'Test your understanding of Newton''s three laws of motion', 'Intermediate', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222225', '22222222-2222-2222-2222-222222222222', 'Limits Quiz', 'Test your knowledge of limits and continuity', 'Intermediate', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333336', '44444444-4444-4444-4444-444444444444', 'Cell Structure Quiz', 'Test your understanding of cell components and functions', 'Beginner', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample quiz questions
INSERT INTO public.quiz_questions (id, quiz_id, question, explanation, order_index, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111114', 'What is Newton''s First Law about?', 'Newton''s First Law states that an object at rest stays at rest, and an object in motion stays in motion with the same speed and direction, unless acted upon by an external force.', 1, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222226', '11111111-1111-1111-1111-111111111114', 'What is the formula for Newton''s Second Law?', 'Newton''s Second Law states that the force acting on an object is equal to the mass of the object times its acceleration (F = ma).', 2, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333337', '22222222-2222-2222-2222-222222222225', 'What happens to a function at a removable discontinuity?', 'At a removable discontinuity, the limit of the function exists but the function is undefined at that point.', 1, NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444447', '33333333-3333-3333-3333-333333333336', 'Which organelle is known as the powerhouse of the cell?', 'The mitochondria are known as the powerhouse of the cell because they generate most of the cell''s supply of ATP, which is used as a source of chemical energy.', 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample quiz answers
INSERT INTO public.quiz_answers (id, question_id, answer, is_correct, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111116', '11111111-1111-1111-1111-111111111115', 'Inertia', TRUE, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222227', '11111111-1111-1111-1111-111111111115', 'Force equals mass times acceleration', FALSE, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333338', '11111111-1111-1111-1111-111111111115', 'Equal and opposite reactions', FALSE, NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444448', '11111111-1111-1111-1111-111111111115', 'Conservation of energy', FALSE, NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555558', '22222222-2222-2222-2222-222222222226', 'F = ma', TRUE, NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666669', '22222222-2222-2222-2222-222222222226', 'E = mc²', FALSE, NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777780', '22222222-2222-2222-2222-222222222226', 'F = G(m₁m₂)/r²', FALSE, NOW(), NOW()),
  ('88888888-8888-8888-8888-888888888881', '22222222-2222-2222-2222-222222222226', 'p = mv', FALSE, NOW(), NOW()),
  ('99999999-9999-9999-9999-999999999982', '33333333-3333-3333-3333-333333333337', 'The limit exists but the function is undefined at that point', TRUE, NOW(), NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333337', 'The limit does not exist', FALSE, NOW(), NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333337', 'The function approaches infinity', FALSE, NOW(), NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333337', 'The function oscillates', FALSE, NOW(), NOW()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444447', 'Mitochondria', TRUE, NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444447', 'Nucleus', FALSE, NOW(), NOW()),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '44444444-4444-4444-4444-444444444447', 'Endoplasmic Reticulum', FALSE, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444447', 'Golgi Apparatus', FALSE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
