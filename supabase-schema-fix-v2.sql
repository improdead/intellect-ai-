-- First, save any existing user data if there is any
CREATE TABLE IF NOT EXISTS public.users_backup AS
SELECT * FROM public.users;

-- Drop the existing users table with the problematic foreign key constraint
DROP TABLE IF EXISTS public.users CASCADE;

-- Recreate the users table with a TEXT id field instead of UUID
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,  -- Changed from UUID to TEXT to accommodate Auth0 IDs
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Re-create the Row Level Security policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = id);

-- Clean up the backup table
DROP TABLE IF EXISTS public.users_backup;
