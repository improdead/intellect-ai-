-- Create math_visualizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.math_visualizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    conversation_id UUID NOT NULL,
    message_id UUID NOT NULL,
    prompt TEXT NOT NULL,
    script TEXT,
    audio_url TEXT,
    manim_code TEXT,
    video_url TEXT,
    combined_video_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_math_visualizations_user_id ON public.math_visualizations(user_id);
CREATE INDEX IF NOT EXISTS idx_math_visualizations_conversation_id ON public.math_visualizations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_math_visualizations_message_id ON public.math_visualizations(message_id);
CREATE INDEX IF NOT EXISTS idx_math_visualizations_status ON public.math_visualizations(status);

-- Add RLS policies
ALTER TABLE public.math_visualizations ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own visualizations
DROP POLICY IF EXISTS math_visualizations_select_policy ON public.math_visualizations;
CREATE POLICY math_visualizations_select_policy ON public.math_visualizations
    FOR SELECT
    USING (auth.uid() = user_id::text);

-- Policy for service role to manage all visualizations
DROP POLICY IF EXISTS math_visualizations_service_policy ON public.math_visualizations;
CREATE POLICY math_visualizations_service_policy ON public.math_visualizations
    USING (auth.role() = 'service_role');
