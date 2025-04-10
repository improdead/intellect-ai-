-- First, save any existing user data if there is any
CREATE TABLE IF NOT EXISTS public.users_backup AS
SELECT * FROM public.users;

-- Drop the existing users table with the problematic foreign key constraint
DROP TABLE IF EXISTS public.users CASCADE;

-- Recreate the users table without the foreign key constraint to auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,  -- No longer references auth.users
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Restore any backed up data if it exists
INSERT INTO public.users
SELECT * FROM public.users_backup
ON CONFLICT (id) DO NOTHING;

-- Re-create the Row Level Security policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id::text OR auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id::text OR auth.uid() = id);

-- Clean up the backup table
DROP TABLE IF EXISTS public.users_backup;
