-- Create research_topics table
CREATE TABLE IF NOT EXISTS public.research_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  subject_id UUID REFERENCES public.subjects(id),
  title TEXT NOT NULL,
  description TEXT,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create research_resources table
CREATE TABLE IF NOT EXISTS public.research_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES public.research_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'article', 'video', 'book', 'interactive', etc.
  source TEXT,
  url TEXT,
  author TEXT,
  rating DECIMAL(3,1),
  is_saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  icon TEXT, -- Store icon name as string
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_history table
CREATE TABLE IF NOT EXISTS public.user_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  activity_type TEXT NOT NULL, -- 'lesson', 'quiz', 'research', 'course', etc.
  activity_id UUID, -- ID of the related activity (lesson_id, quiz_id, etc.)
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- Subject or category
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER, -- For quizzes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for these tables
ALTER TABLE public.research_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

-- Create policies for research_topics
CREATE POLICY "Users can view their own research topics" 
  ON public.research_topics FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own research topics" 
  ON public.research_topics FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research topics" 
  ON public.research_topics FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research topics" 
  ON public.research_topics FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for research_resources
CREATE POLICY "Users can view resources for their topics" 
  ON public.research_resources FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.research_topics 
    WHERE research_topics.id = research_resources.topic_id 
    AND research_topics.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert resources for their topics" 
  ON public.research_resources FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.research_topics 
    WHERE research_topics.id = research_resources.topic_id 
    AND research_topics.user_id = auth.uid()
  ));

CREATE POLICY "Users can update resources for their topics" 
  ON public.research_resources FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.research_topics 
    WHERE research_topics.id = research_resources.topic_id 
    AND research_topics.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete resources for their topics" 
  ON public.research_resources FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.research_topics 
    WHERE research_topics.id = research_resources.topic_id 
    AND research_topics.user_id = auth.uid()
  ));

-- Create policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
  ON public.user_achievements FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" 
  ON public.user_achievements FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for user_history
CREATE POLICY "Users can view their own history" 
  ON public.user_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history" 
  ON public.user_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
