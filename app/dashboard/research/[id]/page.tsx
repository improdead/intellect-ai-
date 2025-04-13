"use client";

import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useParams, useRouter } from "next/navigation";
import { Message } from "ai";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import ResearchChatInterface from "@/components/research-chat-interface";
import { clientDataService } from "@/lib/data-service";
import { auth0IdToUuid } from "@/lib/auth0-utils";
import { researchService } from "@/lib/research-service";

export default function ResearchChatPage() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [topicTitle, setTopicTitle] = useState("");

  // Get the topic ID from the URL
  const topicId = params.id as string;

  // Fetch initial messages for this research topic
  useEffect(() => {
    async function fetchMessages() {
      if (!user || !topicId) return;

      try {
        setIsLoading(true);
        console.log("Fetching research chat with ID:", topicId);

        // First try to get the research topic directly by ID
        // This is the most reliable approach
        let topic = await researchService.getResearchTopic(topicId);
        let chatId = topicId; // Default to using the topic ID as chat ID
        let title = "Research Topic";
        let messages = [];

        if (topic) {
          console.log("Found research topic directly:", topic.title);
          title = topic.title;

          // Check if this topic has an associated chat_id
          if (topic.chat_id) {
            console.log("Topic has associated chat_id:", topic.chat_id);
            chatId = topic.chat_id;
          } else {
            // If no chat_id, we need to create one
            console.log("Topic has no chat_id, creating one...");
            try {
              const chatHistory = await clientDataService.createChatHistory({
                user_id: auth0IdToUuid(user.sub as string),
                title: topic.title,
                subject_id: topic.subject_id,
              });

              if (chatHistory) {
                console.log("Created new chat history:", chatHistory.id);
                chatId = chatHistory.id;

                // Update the research topic with the new chat_id
                await researchService.updateResearchTopic(topic.id, {
                  chat_id: chatId,
                });
                console.log("Updated research topic with chat_id");

                // Create initial message if topic has a description
                if (topic.description) {
                  await clientDataService.createChatMessage({
                    chat_id: chatId,
                    role: "user",
                    content: topic.description,
                  });
                  console.log("Created initial message from topic description");
                }
              }
            } catch (chatCreationError) {
              console.error("Error creating chat history:", chatCreationError);
            }
          }

          // Try to get messages for this chat
          try {
            console.log("Fetching messages for chat ID:", chatId);
            messages = await clientDataService.getChatMessages(chatId);
            console.log(
              `Found ${messages.length} messages for chat ID:`,
              chatId
            );
          } catch (messagesError) {
            console.error("Error fetching messages:", messagesError);
          }

          // If we have messages, set up the chat interface
          if (messages.length > 0) {
            console.log("Messages exist, setting up chat interface");
            setTopicTitle(title);

            // Convert messages to the format expected by the AI SDK
            const formattedMessages: Message[] = messages.map((msg) => ({
              id: msg.id,
              role: msg.role === "user" ? "user" : "assistant",
              content: msg.content,
            }));

            setInitialMessages(formattedMessages);
          } else {
            // No messages but we have a topic, so we can still show the interface
            console.log(
              "No messages found, but topic exists. Showing empty chat."
            );
            setTopicTitle(title);
            setInitialMessages([]);
          }
        } else {
          // If we couldn't find the topic by ID, try to find it by chat_id
          console.log("Topic not found by ID, trying to find by chat_id...");

          // Try to find the topic by chat_id
          topic = await researchService.getResearchTopicByChatId(topicId);

          if (topic) {
            console.log("Found research topic by chat_id:", topic.title);
            title = topic.title;
            chatId = topicId;

            // Try to get messages
            try {
              messages = await clientDataService.getChatMessages(chatId);
              console.log(
                `Found ${messages.length} messages for chat ID:`,
                chatId
              );

              if (messages.length > 0) {
                setTopicTitle(title);
                const formattedMessages: Message[] = messages.map((msg) => ({
                  id: msg.id,
                  role: msg.role === "user" ? "user" : "assistant",
                  content: msg.content,
                }));
                setInitialMessages(formattedMessages);
              } else {
                console.error("No messages found for chat");
                toast.error("Research chat is empty");
                router.push("/dashboard/research");
              }
            } catch (messagesError) {
              console.error("Error fetching messages:", messagesError);
              toast.error("Failed to load chat messages");
              router.push("/dashboard/research");
            }
          } else {
            // Last resort: check if it's a chat in chat history
            try {
              console.log("Trying to find chat in user's chat history");
              const chatHistory = await clientDataService.getChatHistory(
                auth0IdToUuid(user.sub as string)
              );

              const chat = chatHistory.find((chat) => chat.id === topicId);

              if (chat) {
                console.log("Found chat in history:", chat.title);
                title = chat.title;
                chatId = topicId;

                // Try to get messages
                messages = await clientDataService.getChatMessages(chatId);

                if (messages.length > 0) {
                  setTopicTitle(title);
                  const formattedMessages: Message[] = messages.map((msg) => ({
                    id: msg.id,
                    role: msg.role === "user" ? "user" : "assistant",
                    content: msg.content,
                  }));
                  setInitialMessages(formattedMessages);
                } else {
                  console.error("No messages found for chat");
                  toast.error("Research chat is empty");
                  router.push("/dashboard/research");
                }
              } else {
                console.log("No research topic or chat found");
                toast.error("Research topic not found");
                router.push("/dashboard/research");
              }
            } catch (chatError) {
              console.error("Error fetching chat history:", chatError);
              toast.error("Failed to load research data");
              router.push("/dashboard/research");
            }
          }
        }
      } catch (error) {
        console.error("Error in fetching research data:", error);
        toast.error("Failed to load research data");
        router.push("/dashboard/research");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMessages();
  }, [user, topicId, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-theme(space.16))]">
        <p>Please log in to access research</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-theme(space.16))]">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading research data...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-theme(space.16))]">
      <ResearchChatInterface
        chatIdFromUrl={topicId}
        initialMessages={initialMessages}
        initialTitle={topicTitle}
        userId={auth0IdToUuid(user.sub as string)}
      />
    </div>
  );
}
