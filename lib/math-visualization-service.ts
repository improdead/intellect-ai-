import { getSupabaseClient } from "./supabase-client";
import { createSupabaseAdmin } from "./supabase-auth";
import { auth0IdToUuid } from "./auth0-utils";

// Visualization status types
export type VisualizationStatus = 
  | 'pending'
  | 'generating_script'
  | 'generating_audio'
  | 'generating_manim'
  | 'rendering_video'
  | 'combining_media'
  | 'completed'
  | 'failed';

// Math visualization data interface
export interface MathVisualization {
  id: string;
  user_id: string;
  conversation_id: string;
  message_id: string;
  prompt: string;
  script?: string;
  audio_url?: string;
  manim_code?: string;
  video_url?: string;
  combined_video_url?: string;
  status: VisualizationStatus;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// Create visualization request data
export interface CreateVisualizationData {
  user_id: string;
  conversation_id: string;
  message_id: string;
  prompt: string;
}

// Update visualization data
export interface UpdateVisualizationData {
  script?: string;
  audio_url?: string;
  manim_code?: string;
  video_url?: string;
  combined_video_url?: string;
  status?: VisualizationStatus;
  error_message?: string;
}

// Math visualization service
export const mathVisualizationService = {
  // Create a new math visualization
  async createVisualization(data: CreateVisualizationData): Promise<MathVisualization | null> {
    try {
      const supabase = createSupabaseAdmin();
      
      if (!supabase) {
        console.error("Supabase admin client is not initialized");
        return null;
      }
      
      // Convert Auth0 ID to UUID if needed
      const supabaseUserId = data.user_id.includes('auth0|') 
        ? auth0IdToUuid(data.user_id) 
        : data.user_id;
      
      // Insert the visualization record
      const { data: visualization, error } = await supabase
        .from('math_visualizations')
        .insert({
          user_id: supabaseUserId,
          conversation_id: data.conversation_id,
          message_id: data.message_id,
          prompt: data.prompt,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating math visualization:", error);
        return null;
      }
      
      return visualization as MathVisualization;
    } catch (error) {
      console.error("Exception in createVisualization:", error);
      return null;
    }
  },
  
  // Update a math visualization
  async updateVisualization(id: string, data: UpdateVisualizationData): Promise<boolean> {
    try {
      const supabase = createSupabaseAdmin();
      
      if (!supabase) {
        console.error("Supabase admin client is not initialized");
        return false;
      }
      
      // Update the visualization record
      const { error } = await supabase
        .from('math_visualizations')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        console.error("Error updating math visualization:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Exception in updateVisualization:", error);
      return false;
    }
  },
  
  // Get a math visualization by ID
  async getVisualization(id: string): Promise<MathVisualization | null> {
    try {
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        console.error("Supabase client is not initialized");
        return null;
      }
      
      // Get the visualization record
      const { data, error } = await supabase
        .from('math_visualizations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error getting math visualization:", error);
        return null;
      }
      
      return data as MathVisualization;
    } catch (error) {
      console.error("Exception in getVisualization:", error);
      return null;
    }
  },
  
  // Get all math visualizations for a user
  async getUserVisualizations(userId: string): Promise<MathVisualization[]> {
    try {
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        console.error("Supabase client is not initialized");
        return [];
      }
      
      // Convert Auth0 ID to UUID if needed
      const supabaseUserId = userId.includes('auth0|') 
        ? auth0IdToUuid(userId) 
        : userId;
      
      // Get the visualization records
      const { data, error } = await supabase
        .from('math_visualizations')
        .select('*')
        .eq('user_id', supabaseUserId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error getting user math visualizations:", error);
        return [];
      }
      
      return data as MathVisualization[];
    } catch (error) {
      console.error("Exception in getUserVisualizations:", error);
      return [];
    }
  },
  
  // Get all math visualizations for a conversation
  async getConversationVisualizations(conversationId: string): Promise<MathVisualization[]> {
    try {
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        console.error("Supabase client is not initialized");
        return [];
      }
      
      // Get the visualization records
      const { data, error } = await supabase
        .from('math_visualizations')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error getting conversation math visualizations:", error);
        return [];
      }
      
      return data as MathVisualization[];
    } catch (error) {
      console.error("Exception in getConversationVisualizations:", error);
      return [];
    }
  }
};
