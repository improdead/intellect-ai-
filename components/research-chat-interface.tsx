"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat, Message } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Send,
  Brain,
  User,
  Search,
  BookOpen,
  Link as LinkIcon,
  Plus,
  X,
  Save,
  ExternalLink,
  Bookmark,
  FileText,
  Settings,
  Trash2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ResearchResource } from "@/lib/research-service";
import { clientDataService } from "@/lib/data-service";
import { researchService } from "@/lib/research-service";
import { perplexityClient } from "@/lib/perplexity-client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ResearchChatInterfaceProps {
  chatIdFromUrl: string;
  initialMessages?: Message[];
  initialTitle?: string;
  userId: string;
}

// Enhanced thinking animation for clearer visual feedback
const ThinkingAnimation = () => (
  <div className="flex flex-col space-y-3 rounded-lg p-4 bg-muted w-full">
    <div className="flex items-center gap-2 mb-2">
      <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-150"></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-300"></div>
      <span className="text-sm text-primary ml-2 font-medium">
        Researching across reliable sources...
      </span>
    </div>

    <div className="space-y-2">
      <div className="h-2 bg-muted-foreground/20 rounded w-3/4 animate-pulse"></div>
      <div className="h-2 bg-muted-foreground/20 rounded w-1/2 animate-pulse delay-100"></div>
      <div className="h-2 bg-muted-foreground/20 rounded w-5/6 animate-pulse delay-200"></div>
      <div className="h-2 bg-muted-foreground/20 rounded w-2/3 animate-pulse delay-300"></div>
    </div>

    <div className="flex flex-wrap gap-2 mt-3">
      <div className="px-2 py-1 bg-primary/10 rounded text-xs text-primary/70 animate-pulse">
        <span className="animate-pulse">Finding sources...</span>
      </div>
      <div className="px-2 py-1 bg-primary/10 rounded text-xs text-primary/70 animate-pulse delay-300">
        <span className="animate-pulse">Evaluating credibility...</span>
      </div>
      <div className="px-2 py-1 bg-primary/10 rounded text-xs text-primary/70 animate-pulse delay-600">
        <span className="animate-pulse">Analyzing content...</span>
      </div>
    </div>

    <div className="mt-2 text-xs text-muted-foreground">
      This may take a moment as I thoroughly research your question...
    </div>
  </div>
);

export default function ResearchChatInterface({
  chatIdFromUrl,
  initialMessages = [],
  initialTitle = "Research Assistant",
  userId,
}: ResearchChatInterfaceProps) {
  console.log(
    `[ResearchChatInterface Mount] Received chatIdFromUrl: ${chatIdFromUrl}`
  );

  // State variables
  const [chatId, setChatId] = useState<string>(chatIdFromUrl);
  const [topic, setTopic] = useState<any>(null);
  const [actualTopicId, setActualTopicId] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [showCitations, setShowCitations] = useState(true);
  const [preferredSources, setPreferredSources] = useState<string[]>([]);
  const [excludedSources, setExcludedSources] = useState<string[]>([]);
  const [newSource, setNewSource] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [resources, setResources] = useState<ResearchResource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ---- MOVED customSubmitHandler DEFINITION HERE ----
  const customSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Don't send empty messages
    if (!input.trim()) return;

    // Show a send animation
    toast.success("Sending your research query...", {
      duration: 1000,
      position: "bottom-right",
    });

    // Save the user message to chat history first, for better UX
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input.trim(),
    };

    // Add to local messages immediately for instant feedback
    // Need to ensure setMessages is defined before this point (comes from useChat)
    // We will define useChat before this handler now.
    // setMessages([...messages, userMessage]);

    // Save to database
    clientDataService
      .createChatMessage({
        chat_id: chatId,
        role: "user",
        content: input.trim(),
      })
      .catch((error) => {
        console.error("Error saving user message:", error);
      });

    // Now actually send to AI API
    // Need to ensure handleSubmit is defined before this (comes from useChat)
    // handleSubmit(e);

    // Help focus for mobile, focus back to input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);

    // The actual submit and message update will happen within the useChat setup below
  };

  // When the component mounts, set up the chat with the chatId from the URL
  useEffect(() => {
    async function setupChat() {
      console.log(
        `🔍 [ResearchChatInterface Effect] useEffect triggered! Setting up chat with ID: ${chatIdFromUrl}`
      );

      try {
        // First, check if this chat exists by trying to get messages
        const messages = await clientDataService.getChatMessages(chatIdFromUrl);
        console.log(
          `📦 Found ${messages.length} messages for chat ${chatIdFromUrl}`
        );

        // Try to find the topic, but don't fail if not found
        try {
          const fetchedTopic = await researchService.getResearchTopicByChatId(
            chatIdFromUrl
          );

          if (fetchedTopic) {
            console.log("✅ Topic FOUND!");
            console.log(
              `🎯 Matched topic ID: ${fetchedTopic.id} for chat_id: ${chatIdFromUrl}`
            );

            setTopic(fetchedTopic);
            setActualTopicId(fetchedTopic.id);
          } else {
            console.log(
              `⚠️ No topic found for chat_id: ${chatIdFromUrl}, using fallback`
            );

            // Create a temporary topic object with the chat ID as the ID
            // This allows the chat to work without a real topic
            const tempTopic = {
              id: chatIdFromUrl, // Use the chat ID as the topic ID
              title: initialTitle || "Research Chat",
              description: "",
              progress: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              chat_id: chatIdFromUrl,
            };

            setTopic(tempTopic);
            setActualTopicId(chatIdFromUrl); // Use chat ID as topic ID for simplicity

            console.log("� Using temporary topic:", tempTopic);
          }
        } catch (topicError) {
          console.log("⚠️ Error fetching topic, using fallback:", topicError);

          // Same fallback as above
          const tempTopic = {
            id: chatIdFromUrl,
            title: initialTitle || "Research Chat",
            description: "",
            progress: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            chat_id: chatIdFromUrl,
          };

          setTopic(tempTopic);
          setActualTopicId(chatIdFromUrl);
        }

        // Always set the chat ID
        setChatId(chatIdFromUrl);
        console.log("🔗 Chat setup complete with ID:", chatIdFromUrl);
      } catch (error) {
        console.error(
          `💥 ERROR during setupChat for chatId: ${chatIdFromUrl}`,
          error
        );
        toast.error("⚠️ Could not load chat history. Starting a new session.");

        // Create a fallback chat ID and topic
        const fallbackChatId = `fallback-${Date.now()}`;
        setChatId(fallbackChatId);

        const fallbackTopic = {
          id: fallbackChatId,
          title: initialTitle || "Research Chat",
          description: "",
          progress: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          chat_id: fallbackChatId,
        };

        setTopic(fallbackTopic);
        setActualTopicId(fallbackChatId);

        console.log("🔄 Using fallback chat and topic:", fallbackTopic);
      }
    }

    setupChat();
  }, [chatIdFromUrl, initialTitle]);

  // ---- SINGLE useChat HOOK ----
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit, // Rename original handleSubmit
    isLoading,
    append,
    setMessages,
    setInput,
  } = useChat({
    api: "/api/research",
    initialMessages,
    id: chatId,
    body: {
      topicId: actualTopicId,
      userId,
      preferredSources,
      excludedSources,
      searchQuery: searchQuery || undefined,
    },
    onResponse: (response) => {
      if (!response.ok) {
        console.error("Error response from research API:", response.status);
      }
    },
    onFinish: async (message) => {
      console.log("Research response completed, processing content");

      // Ensure we have the actual topic ID before proceeding
      if (!actualTopicId) {
        console.error(
          "[onFinish] Cannot save resources or message, actualTopicId is null."
        );
        toast.error("Failed to save research results: Topic context lost.");
        return;
      }

      try {
        const sources = perplexityClient.extractSources(message.content);
        console.log(`Extracted ${sources.length} sources from response`);

        if (sources.length > 0) {
          for (const source of sources) {
            try {
              const url = source.url.startsWith("http")
                ? source.url
                : `https://${source.url}`;
              const hostname = new URL(url).hostname;
              await researchService.addResearchResource(actualTopicId, {
                title: source.title,
                description: source.snippet || "Source from research",
                type: "website",
                source: hostname,
                url: url,
                rating: 0,
              });
            } catch (sourceError) {
              console.error("Error saving source:", sourceError);
            }
          }
          fetchResources();
          toast.success(`Saved ${sources.length} resources from research`);
        }

        console.log("Saving AI response to chat history");
        await clientDataService.createChatMessage({
          chat_id: chatId,
          role: "assistant",
          content: message.content,
        });
        console.log("AI response saved successfully");
      } catch (error) {
        console.error("Error processing research response:", error);
      }
    },
  });

  // ---- Override handleSubmit to include local state update ----
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input.trim(),
    };

    setMessages([...messages, userMessage]); // Update local state immediately

    // Call the original handler from useChat
    originalHandleSubmit(e);

    // Call the rest of the custom logic (DB save, focus)
    customSubmitHandler(e); // Pass the event through
  };

  // Auto-start research if there are no messages
  useEffect(() => {
    if (
      topic &&
      actualTopicId &&
      initialMessages.length === 0 &&
      topic.description &&
      !isLoading &&
      !messages.some(
        (m) => m.role === "user" && m.content === topic.description
      )
    ) {
      console.log(
        `[ResearchChatInterface Effect] Auto-starting research for topic:`,
        topic
      );
      const timer = setTimeout(() => {
        setInput(topic.description);
        setTimeout(() => {
          // Correct type casting for fake event
          const fakeEvent = {
            preventDefault: () => {},
          } as any as React.FormEvent<HTMLFormElement>;
          // Use the overridden handleSubmit for consistency
          handleSubmit(fakeEvent);
        }, 100);
      }, 1000);
      return () => clearTimeout(timer);
    }
    // Dependencies: Ensure customSubmitHandler is stable or memoized if needed, but definition outside should be fine.
  }, [
    topic,
    actualTopicId,
    initialMessages.length,
    isLoading,
    setInput,
    handleSubmit,
    messages,
  ]);

  // Fetch resources for this research topic
  const fetchResources = async () => {
    if (!actualTopicId) {
      console.log(
        "[ResearchChatInterface] Cannot fetch resources, actualTopicId not set yet."
      );
      return;
    }
    console.log(
      `[ResearchChatInterface] Fetching resources for actualTopicId: ${actualTopicId}`
    );
    try {
      setIsLoadingResources(true);
      const fetchedResources = await researchService.getResearchResources(
        actualTopicId
      );
      console.log(
        `[ResearchChatInterface] Fetched ${fetchedResources.length} resources:`,
        fetchedResources
      );
      setResources(fetchedResources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Failed to load research resources");
    } finally {
      setIsLoadingResources(false);
    }
  };

  // Initialize by fetching resources
  useEffect(() => {
    if (actualTopicId) {
      fetchResources();
    }
  }, [actualTopicId]);

  // Log when messages change
  useEffect(() => {
    console.log("Messages updated, count:", messages.length);
  }, [messages]);

  // Scroll to bottom when messages change, respecting user preference
  useEffect(() => {
    if (isAutoScrollEnabled) {
      scrollToBottom();
    }
  }, [messages, isAutoScrollEnabled]);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle adding a preferred source
  const handleAddPreferredSource = () => {
    if (newSource.trim()) {
      setPreferredSources([...preferredSources, newSource.trim()]);
      setNewSource("");
      toast.success(`Added ${newSource.trim()} to preferred sources`);
    }
  };

  // Handle adding an excluded source
  const handleAddExcludedSource = () => {
    if (newSource.trim()) {
      setExcludedSources([...excludedSources, newSource.trim()]);
      setNewSource("");
      toast.success(`Added ${newSource.trim()} to excluded sources`);
    }
  };

  // Handle removing a preferred source
  const handleRemovePreferredSource = (source: string) => {
    setPreferredSources(preferredSources.filter((s) => s !== source));
  };

  // Handle removing an excluded source
  const handleRemoveExcludedSource = (source: string) => {
    setExcludedSources(excludedSources.filter((s) => s !== source));
  };

  // Handle saving a resource
  const handleSaveResource = async (resource: ResearchResource) => {
    try {
      await researchService.updateResearchResource(resource.id, {
        is_saved: !resource.is_saved,
      });
      setResources(
        resources.map((r) =>
          r.id === resource.id ? { ...r, is_saved: !resource.is_saved } : r
        )
      );
      toast.success(
        resource.is_saved
          ? `Removed ${resource.title} from saved resources`
          : `Saved ${resource.title} to your resources`
      );
    } catch (error) {
      console.error("Error saving resource:", error);
      toast.error("Failed to save resource");
    }
  };

  // ---- SINGLE handleDeleteResource Function ----
  const handleDeleteResource = async (resourceId: string) => {
    try {
      const success = await researchService.deleteResearchResource(resourceId);
      if (success) {
        setResources(resources.filter((r) => r.id !== resourceId));
        toast.success("Resource deleted successfully");
      } else {
        toast.error("Failed to delete resource");
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Failed to delete resource");
    }
  };

  // Handle deleting the research topic
  const handleDeleteResearchTopic = async () => {
    if (!actualTopicId) {
      toast.error("Cannot delete topic: Topic ID not loaded.");
      return;
    }
    try {
      setIsDeleting(true);
      const success = await researchService.deleteResearchTopic(actualTopicId);
      if (success) {
        toast.success("Research topic deleted successfully");
        window.location.href = "/dashboard/research";
      } else {
        toast.error("Failed to delete research topic");
        setIsDeleting(false);
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error("Error deleting research topic:", error);
      toast.error("Failed to delete research topic");
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Extract sources from a message
  const extractSourcesFromMessage = (content: string) => {
    if (!content) return { formattedContent: "", sources: [] };

    // Check if there's a sources section at the end
    const sourcesRegex =
      /(?:\n\n|\n)(Sources|References|Citations):\s*\n([\s\S]+)$/i;
    const sourcesMatch = content.match(sourcesRegex);

    let mainContent = content;
    let sourcesSection = "";
    let extractedSources: any[] = [];

    if (sourcesMatch) {
      // Split the content and sources section
      mainContent = content.substring(0, sourcesMatch.index);
      sourcesSection = sourcesMatch[2];

      // Extract numbered sources
      const sourceRegex =
        /(?:^|\n)\s*(\d+)\s*\.\s*([\s\S]+?)(?=(?:\n\s*\d+\s*\.)|$)/g;
      let sourceMatch;

      while ((sourceMatch = sourceRegex.exec(sourcesSection)) !== null) {
        const sourceNumber = sourceMatch[1];
        const sourceText = sourceMatch[2].trim();

        // Extract URL from the source text
        const urlMatch = sourceText.match(/(https?:\/\/[^\s]+)/);
        const url = urlMatch ? urlMatch[1] : "";

        // Extract title - everything before the URL or the whole text if no URL
        let title = url ? sourceText.split(url)[0].trim() : sourceText;
        title = title.replace(/[":,.]+$/, ""); // Clean up trailing punctuation

        if (!title && url) {
          // If no title but we have URL, use domain as title
          try {
            const domain = new URL(url).hostname.replace("www.", "");
            title = domain.charAt(0).toUpperCase() + domain.slice(1);
          } catch (e) {
            title = `Source ${sourceNumber}`;
          }
        }

        extractedSources.push({
          id: sourceNumber,
          title: title || `Source ${sourceNumber}`,
          url: url,
          text: sourceText,
        });
      }

      // Update the sources state
      if (extractedSources.length > 0) {
        setSources(extractedSources);
      }
    }

    return {
      formattedContent: mainContent,
      sources: extractedSources,
    };
  };

  // Format the chat message content with proper styling
  const formatMessageContent = (content: string) => {
    // First extract sources if any
    const { formattedContent, sources } = extractSourcesFromMessage(content);

    // Use the content without the sources section for formatting
    let processedContent = formattedContent || content;

    // Replace citation numbers with superscript links
    if (showCitations && sources.length > 0) {
      // Replace [1], [2], etc. with superscript citation links
      const citationRegex = /\[(\d+)\]/g;
      processedContent = processedContent.replace(
        citationRegex,
        (match, num) => {
          const source = sources.find((s) => s.id === num);
          if (source && source.url) {
            return `<a href="${source.url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 font-medium" title="${source.title}"><sup>[${num}]</sup></a>`;
          }
          return `<sup>[${num}]</sup>`;
        }
      );
    }

    // Replace URLs with clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const withLinks = processedContent.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${url}</a>`;
    });

    // Replace markdown-style links [text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const withMarkdownLinks = withLinks.replace(
      markdownLinkRegex,
      (_, text, url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">${text}</a>`;
      }
    );

    // Replace markdown-style bold **text**
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const withBold = withMarkdownLinks.replace(
      boldRegex,
      "<strong>$1</strong>"
    );

    // Replace markdown-style italic *text*
    const italicRegex = /\*([^*]+)\*/g;
    const withItalic = withBold.replace(italicRegex, "<em>$1</em>");

    // Replace markdown-style headers
    const headerRegex = /^(#{1,6})\s+(.+)$/gm;
    const withHeaders = withItalic.replace(headerRegex, (_, hashes, text) => {
      const level = hashes.length;
      const fontSize = 24 - level * 2;
      return `<h${level} class="text-${fontSize}px font-bold my-2">${text}</h${level}>`;
    });

    // Replace markdown-style lists
    const listItemRegex = /^(\s*)-\s+(.+)$/gm;
    const withListItems = withHeaders.replace(
      listItemRegex,
      '<li class="ml-4">$2</li>'
    );

    // Replace newlines with <br> tags
    let finalContent = withListItems.replace(/\n/g, "<br>");

    // Add sources section at the end if we have sources and showCitations is true
    if (showCitations && sources.length > 0) {
      finalContent += `<div class="mt-4 pt-2 border-t border-border/50">
        <p class="text-sm font-medium text-muted-foreground mb-2">Sources:</p>
        <ol class="text-sm space-y-1 text-muted-foreground">
          ${sources
            .map(
              (source) => `
            <li value="${source.id}" class="flex items-start">
              <span class="mr-1">${source.id}.</span>
              <span>
                ${
                  source.url
                    ? `<a href="${source.url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${source.title}</a>`
                    : source.title
                }
              </span>
            </li>
          `
            )
            .join("")}
        </ol>
      </div>`;
    }

    return finalContent;
  };

  // Keep the handleSearchSubmit for search tab functionality
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is for the search tab functionality
    if (searchQuery.trim()) {
      toast.success(`Searching for "${searchQuery}"...`);
      // The rest of the search logic remains unchanged
    }
  };

  return !topic ? (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2 text-muted-foreground">
        Loading research details...
      </span>
    </div>
  ) : (
    <div className="flex flex-col h-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="h-full flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <TabsList>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Research Chat</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              <span>Resources</span>
              {resources.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {resources.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                {/* <div className="space-y-4"> */}
                <h3 className="font-medium">Research Settings</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Display Options</h4>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Show Citations</span>
                      <Switch
                        checked={showCitations}
                        onCheckedChange={setShowCitations}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-scroll</span>
                      <Switch
                        checked={isAutoScrollEnabled}
                        onCheckedChange={setIsAutoScrollEnabled}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium mb-2">
                      Preferred Sources
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {preferredSources.map((source) => (
                        <Badge
                          key={source}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {source}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleRemovePreferredSource(source)}
                          />
                        </Badge>
                      ))}
                      {preferredSources.length === 0 && (
                        <span className="text-xs text-muted-foreground">
                          No preferred sources
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Excluded Sources</h4>
                    <div className="flex flex-wrap gap-2">
                      {excludedSources.map((source) => (
                        <Badge
                          key={source}
                          variant="destructive"
                          className="flex items-center gap-1"
                        >
                          {source}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveExcludedSource(source)}
                          />
                        </Badge>
                      ))}
                      {excludedSources.length === 0 && (
                        <span className="text-xs text-muted-foreground">
                          No excluded sources
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add source (e.g., wikipedia.org)"
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleAddPreferredSource}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddExcludedSource}
                    >
                      <X className="h-4 w-4 mr-1" /> Exclude
                    </Button>
                  </div>

                  <div className="pt-2 border-t">
                    <Dialog
                      open={isDeleteDialogOpen}
                      onOpenChange={setIsDeleteDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Research
                          Topic
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Research Topic</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this research topic?
                            This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isDeleting}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteResearchTopic}
                            disabled={isDeleting}
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <TabsContent
          value="chat"
          className="flex-1 overflow-hidden flex flex-col"
        >
          <CardContent className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex gap-3 max-w-[80%] ${
                        message.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        {message.role === "user" ? (
                          <>
                            <AvatarImage src="/avatars/user.png" alt="User" />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </>
                        ) : (
                          <>
                            <AvatarImage src="/avatars/ai.png" alt="AI" />
                            <AvatarFallback>
                              <Brain className="h-4 w-4" />
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div
                        className={`rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: formatMessageContent(message.content),
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3 max-w-[90%] w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/ai.png" alt="AI" />
                      <AvatarFallback>
                        <Brain className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-4 bg-muted">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                        <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-150" />
                        <div className="h-2 w-2 bg-primary rounded-full animate-pulse delay-300" />
                        <span className="text-sm text-muted-foreground ml-1">
                          Researching...
                        </span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="h-4 bg-muted-foreground/10 rounded animate-pulse w-[80%]" />
                        <div className="h-4 bg-muted-foreground/10 rounded animate-pulse w-[90%]" />
                        <div className="h-4 bg-muted-foreground/10 rounded animate-pulse w-[60%]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          <CardFooter className="border-t p-4">
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 w-full max-w-3xl mx-auto"
            >
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask a research question..."
                  className="min-h-[60px] py-3 pr-12 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!isLoading && input.trim()) {
                        handleSubmit(e as any);
                      }
                    }
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 bottom-2 p-1 h-8 w-8"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-primary" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </CardFooter>
        </TabsContent>

        <TabsContent
          value="resources"
          className="flex-1 overflow-hidden flex flex-col"
        >
          <CardContent className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Research Resources</h3>
                <Badge variant="outline" className="font-normal">
                  {resources.length}{" "}
                  {resources.length === 1 ? "resource" : "resources"}
                </Badge>
              </div>

              {isLoadingResources ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <Skeleton className="h-6 w-3/4" />
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : resources.length > 0 ? (
                <div className="space-y-4">
                  {resources.map((resource) => (
                    <Card key={resource.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                        <div>
                          <CardTitle className="text-base font-medium">
                            {resource.title}
                          </CardTitle>
                          {resource.source && (
                            <p className="text-xs text-muted-foreground">
                              Source: {resource.source}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleSaveResource(resource)}
                          >
                            <Bookmark
                              className={`h-4 w-4 ${
                                resource.is_saved ? "fill-primary" : ""
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        {resource.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {resource.description}
                          </p>
                        )}
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary flex items-center hover:underline"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {resource.url.length > 50
                              ? resource.url.substring(0, 50) + "..."
                              : resource.url}
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No resources yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start a research conversation to collect resources
                  </p>
                  <Button onClick={() => setActiveTab("chat")}>
                    Start Researching
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </div>
  );
}
