import { getSupabaseClient } from "./supabase-client";
import { auth0IdToUuid } from "./auth0-utils";
import { Database } from "@/types/supabase";

// Research topic with additional UI properties
export interface ResearchTopic {
  id: string;
  user_id: string;
  subject_id?: string;
  title: string;
  description?: string;
  progress: number;
  created_at: string;
  updated_at: string;
  icon?: any; // For client-side icon component
  resourceCount?: number; // Count of resources
}

// Research resource with additional UI properties
export interface ResearchResource {
  id: string;
  topic_id: string;
  title: string;
  description?: string;
  type: string;
  source?: string;
  url?: string;
  author?: string;
  rating?: number;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
  icon?: any; // For client-side icon component
}

// Client-side research data service
export const researchService = {
  // Get all research topics for a user
  async getResearchTopics(userId: string): Promise<ResearchTopic[]> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from("research_topics")
        .select(
          `
          *,
          research_resources(count)
        `
        )
        .eq("user_id", supabaseUuid)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching research topics:", error);
        return [];
      }

      // Transform data to include resource count
      return (data || []).map((topic) => ({
        ...topic,
        resourceCount: topic.research_resources?.[0]?.count || 0,
      }));
    } catch (error) {
      console.error("Error in getResearchTopics:", error);
      return [];
    }
  },

  // Create a new research topic
  async createResearchTopic(
    userId: string,
    data: {
      title: string;
      description?: string;
      subject_id?: string;
    }
  ): Promise<ResearchTopic | null> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      const { data: newTopic, error } = await supabase
        .from("research_topics")
        .insert({
          user_id: supabaseUuid,
          title: data.title,
          description: data.description || "",
          subject_id: data.subject_id,
          progress: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating research topic:", error);
        return null;
      }

      return {
        ...newTopic,
        resourceCount: 0,
      };
    } catch (error) {
      console.error("Error in createResearchTopic:", error);
      return null;
    }
  },

  // Update a research topic
  async updateResearchTopic(
    topicId: string,
    data: {
      title?: string;
      description?: string;
      progress?: number;
      subject_id?: string;
    }
  ): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from("research_topics")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", topicId);

      if (error) {
        console.error("Error updating research topic:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateResearchTopic:", error);
      return false;
    }
  },

  // Delete a research topic
  async deleteResearchTopic(topicId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from("research_topics")
        .delete()
        .eq("id", topicId);

      if (error) {
        console.error("Error deleting research topic:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteResearchTopic:", error);
      return false;
    }
  },

  // Get resources for a research topic
  async getResearchResources(topicId: string): Promise<ResearchResource[]> {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from("research_resources")
        .select("*")
        .eq("topic_id", topicId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching research resources:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in getResearchResources:", error);
      return [];
    }
  },

  // Add a resource to a research topic
  async addResearchResource(
    topicId: string,
    data: {
      title: string;
      description?: string;
      type: string;
      source?: string;
      url?: string;
      author?: string;
      rating?: number;
    }
  ): Promise<ResearchResource | null> {
    try {
      const supabase = getSupabaseClient();

      // First, update the topic's updated_at timestamp
      await supabase
        .from("research_topics")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", topicId);

      // Then add the resource
      const { data: newResource, error } = await supabase
        .from("research_resources")
        .insert({
          topic_id: topicId,
          title: data.title,
          description: data.description || "",
          type: data.type,
          source: data.source || "",
          url: data.url || "",
          author: data.author || "",
          rating: data.rating || 0,
          is_saved: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding research resource:", error);
        return null;
      }

      return newResource;
    } catch (error) {
      console.error("Error in addResearchResource:", error);
      return null;
    }
  },

  // Update a research resource
  async updateResearchResource(
    resourceId: string,
    data: {
      title?: string;
      description?: string;
      type?: string;
      source?: string;
      url?: string;
      author?: string;
      rating?: number;
      is_saved?: boolean;
    }
  ): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from("research_resources")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", resourceId);

      if (error) {
        console.error("Error updating research resource:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateResearchResource:", error);
      return false;
    }
  },

  // Delete a research resource
  async deleteResearchResource(resourceId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from("research_resources")
        .delete()
        .eq("id", resourceId);

      if (error) {
        console.error("Error deleting research resource:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteResearchResource:", error);
      return false;
    }
  },

  // Search for resources across all topics
  async searchResources(
    userId: string,
    query: string
  ): Promise<ResearchResource[]> {
    try {
      const supabaseUuid = auth0IdToUuid(userId);
      const supabase = getSupabaseClient();

      // First get all topics for this user
      const { data: topics, error: topicsError } = await supabase
        .from("research_topics")
        .select("id")
        .eq("user_id", supabaseUuid);

      if (topicsError || !topics || topics.length === 0) {
        return [];
      }

      const topicIds = topics.map((t) => t.id);

      // Then search for resources in those topics
      const { data, error } = await supabase
        .from("research_resources")
        .select("*")
        .in("topic_id", topicIds)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error searching research resources:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error in searchResources:", error);
      return [];
    }
  },
};
