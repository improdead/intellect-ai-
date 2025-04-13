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
  chat_id?: string; // Associated chat history ID
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
      chat_id?: string;
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
          chat_id: data.chat_id,
          progress: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error(
          "Error creating research topic:",
          JSON.stringify(error, null, 2)
        );
        return null;
      }

      return {
        ...newTopic,
        resourceCount: 0,
      };
    } catch (error) {
      console.error(
        "Error in createResearchTopic:",
        JSON.stringify(error, null, 2)
      );
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
      chat_id?: string;
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

  // Get a research topic by ID
  async getResearchTopic(topicId: string): Promise<ResearchTopic | null> {
    try {
      console.log(`\n=== getResearchTopic Debug ===`);
      console.log(`Attempting to get research topic with ID: ${topicId}`);

      const supabase = getSupabaseClient();

      if (!supabase) {
        console.error(
          "Supabase client initialization failed in getResearchTopic"
        );
        return null;
      }

      // First try to get the topic directly by ID
      console.log(`Fetching research topic with ID: ${topicId}`);
      let { data, error } = await supabase
        .from("research_topics")
        .select("*")
        .eq("id", topicId)
        .maybeSingle();

      if (error) {
        console.error(`Error fetching research topic by ID:`, error);
        return null;
      }

      // If not found by ID, try to find by chat_id
      if (!data) {
        console.log(`No topic found with ID ${topicId}, trying as chat_id...`);
        const { data: topicByChat, error: chatError } = await supabase
          .from("research_topics")
          .select("*")
          .eq("chat_id", topicId)
          .maybeSingle();

        if (chatError) {
          console.error(`Error fetching research topic by chat_id:`, chatError);
          return null;
        }

        data = topicByChat;
      }

      if (!data) {
        console.warn(`No research topic found with ID or chat_id: ${topicId}`);
        return null;
      }

      console.log(`✅ Found research topic:`, {
        id: data.id,
        title: data.title,
      });

      // Get resource count
      const { data: resourceData, error: resourceError } = await supabase
        .from("research_resources")
        .select("id")
        .eq("topic_id", data.id);

      const resourceCount = resourceError ? 0 : resourceData?.length || 0;

      return {
        ...data,
        resourceCount,
      };
    } catch (error) {
      console.error(`Exception in getResearchTopic for ${topicId}:`, error);
      if (error instanceof Error) {
        console.error(
          `Error name: ${error.name}, message: ${error.message}, stack: ${error.stack}`
        );
      } else {
        console.error(`Non-Error exception: ${JSON.stringify(error)}`);
      }
      return null;
    }
  },

  // Get a research topic by chat ID
  async getResearchTopicByChatId(
    chatId: string
  ): Promise<ResearchTopic | null> {
    try {
      console.log(`\n=== getResearchTopicByChatId Debug ===`);
      console.log(`Attempting to get research topic with chat_id: ${chatId}`);
      console.log(`chatId type:`, typeof chatId); // Log the type to ensure it's a string

      const supabase = getSupabaseClient();

      if (!supabase) {
        console.error(
          "Supabase client initialization failed in getResearchTopicByChatId"
        );
        return null;
      }

      // First, check if the chat exists
      try {
        console.log(`Checking if chat with ID ${chatId} exists...`);
        const { data: chatData, error: chatError } = await supabase
          .from("chat_history")
          .select("id")
          .eq("id", chatId)
          .maybeSingle();

        if (chatError) {
          console.error(`Error verifying chat existence:`, chatError);
        } else if (!chatData) {
          console.warn(`No chat found with ID ${chatId}`);
        } else {
          console.log(`Chat with ID ${chatId} exists.`);
        }
      } catch (chatCheckError) {
        console.error("Error checking chat existence:", chatCheckError);
      }

      // Now attempt to fetch the research topic (exact match)
      console.log(`Fetching research topic using chat_id: ${chatId}`);
      const { data, error } = await supabase
        .from("research_topics")
        .select("*")
        .eq("chat_id", chatId)
        .limit(1);

      console.log("Supabase query result:", data, error); // Log the data and error from the query

      if (error) {
        console.error(`Error fetching research topic by chat_id:`, error);
        return null;
      }

      if (!data || data.length === 0) {
        console.warn(`No research topic found with chat_id: ${chatId}`);
        return null;
      }

      console.log(`✅ Found research topic for chat_id ${chatId}:`, {
        id: data[0].id,
        title: data[0].title,
      });

      return {
        ...data[0],
        resourceCount: 0,
      };
    } catch (error) {
      console.error(
        `Exception in getResearchTopicByChatId for ${chatId}:`,
        error
      );
      if (error instanceof Error) {
        console.error(
          `Error name: ${error.name}, message: ${error.message}, stack: ${error.stack}`
        );
      } else {
        console.error(`Non-Error exception: ${JSON.stringify(error)}`);
      }
      return null;
    }
  },
};
