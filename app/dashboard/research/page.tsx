"use client";

import type React from "react";
import { isValidElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Trash2,
  Search,
  BookOpen,
  FileText,
  Video,
  ImageIcon,
  Star,
  Bookmark,
  Share2,
  Download,
  Plus,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  Atom,
  Calculator,
  FlaskRoundIcon as Flask,
  Leaf,
  Lightbulb,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { toast } from "sonner";
import { clientDataService, SubjectWithIcon } from "@/lib/data-service";
import {
  researchService,
  ResearchTopic as ServiceResearchTopic,
} from "@/lib/research-service";
import { getSubjectIcon } from "@/components/subject-icon";
import { CreateModal } from "@/components/ui/create-modal";
import { ResearchForm } from "@/components/forms/research-form";
import { LucideIcon } from "lucide-react";
import { auth0IdToUuid } from "@/lib/auth0-utils";

// Define a type for the topics displayed in the UI
interface DisplayResearchTopic extends ServiceResearchTopic {
  subjectName?: string;
  icon?: LucideIcon;
}

// Sample search results for the search tab
const searchResults = [
  {
    id: 101,
    title: "Introduction to Quantum Physics",
    type: "article",
    source: "Science Journal",
    date: "2023-06-15",
    description:
      "A comprehensive introduction to the principles of quantum physics and its applications.",
    icon: <FileText className="h-5 w-5" />,
    rating: 4.8,
    subject: "Physics",
  },
  {
    id: 102,
    title: "Quantum Mechanics Explained",
    type: "video",
    source: "Science Academy",
    date: "2023-04-20",
    description:
      "Visual explanation of quantum mechanics concepts with practical examples.",
    icon: <Video className="h-5 w-5" />,
    rating: 4.5,
    subject: "Physics",
    duration: "32 min",
  },
];

// Sample recommended resources for the recommended tab
const recommendedResources = [
  {
    id: 201,
    title: "The Quantum World: Particle Physics for Everyone",
    type: "book",
    author: "Dr. Richard Maxwell",
    description:
      "An accessible introduction to quantum physics for non-specialists.",
    icon: <BookOpen className="h-5 w-5" />,
    subject: "Physics",
  },
  {
    id: 202,
    title: "Quantum Computing: The Next Frontier",
    type: "article",
    author: "Quantum Research Institute",
    description:
      "Exploring the potential of quantum computing to revolutionize technology.",
    icon: <FileText className="h-5 w-5" />,
    subject: "Physics",
  },
];

export default function ResearchPage() {
  const { user } = useUser();
  const router = useRouter();
  const [researchTopics, setResearchTopics] = useState<DisplayResearchTopic[]>(
    []
  );
  const [subjects, setSubjects] = useState<SubjectWithIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch research topics and subjects
  useEffect(() => {
    async function fetchData() {
      if (!user?.sub) return; // Guard against undefined user
      console.log(
        `[Research Page Effect] Running fetchData. User sub: ${user.sub}`
      ); // Log effect trigger

      try {
        setIsLoading(true);

        console.log("Fetching research topics for user via API");
        // Fetch data from the new API route
        const response = await fetch("/api/research/topics");
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Attempt to parse error
          throw new Error(
            `API Error: ${response.status} ${JSON.stringify(errorData)}`
          );
        }
        const topicsData = await response.json();
        console.log("Raw topics data from API:", topicsData); // <-- Log raw data from API

        // Fetch subjects (remains the same)
        const subjectsData = await clientDataService.getSubjects();
        console.log("Fetched subjects data:", subjectsData);
        setSubjects(subjectsData);

        // Subject map creation (remains the same)
        const subjectMap = new Map<string, string>();
        subjectsData.forEach((subject) => {
          subjectMap.set(
            subject.id,
            subject.name || subject.title || "General"
          );
        });
        console.log("Created subject map:", subjectMap);

        // Map to DisplayResearchTopic type (remains the same logic)
        const topicsWithDisplayData: DisplayResearchTopic[] = topicsData.map(
          (topic: ServiceResearchTopic) => {
            // Ensure type safety for mapping input
            const subjectName = topic.subject_id
              ? subjectMap.get(topic.subject_id) || "General"
              : "General";
            return {
              ...topic,
              icon: getSubjectIcon(subjectName),
              subjectName: subjectName,
            };
          }
        );
        console.log(
          "Processed topics with display data:",
          topicsWithDisplayData
        );

        setResearchTopics(topicsWithDisplayData);
      } catch (error) {
        console.error("Error fetching research page data:", error);
        toast.error("Failed to load research topics. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
    // Log the user object itself to see if its reference changes
    console.log("[Research Page Effect] Dependency check. User object:", user);
  }, [user]);

  const handleCreateResearchSuccess = (newTopic: ServiceResearchTopic) => {
    toast.success(`Research topic "${newTopic.title}" created successfully!`);
    setIsCreateModalOpen(false);

    // Refetch topics list after successful creation
    if (user?.sub) {
      async function refetchTopics() {
        try {
          console.log("Refetching topics via API after creation...");
          const response = await fetch("/api/research/topics");
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              `API Error on refetch: ${response.status} ${JSON.stringify(
                errorData
              )}`
            );
          }
          const topicsData = await response.json();

          const subjectMap = new Map<string, string>();
          subjects.forEach((subject) => {
            subjectMap.set(
              subject.id,
              subject.name || subject.title || "General"
            );
          });
          const topicsWithDisplayData: DisplayResearchTopic[] = topicsData.map(
            (topic: ServiceResearchTopic) => {
              const subjectName = topic.subject_id
                ? subjectMap.get(topic.subject_id) || "General"
                : "General";
              return {
                ...topic,
                icon: getSubjectIcon(subjectName),
                subjectName: subjectName,
              };
            }
          );
          setResearchTopics(topicsWithDisplayData);
          console.log("Refetched and processed topics:", topicsWithDisplayData);
        } catch (error) {
          console.error("Error refetching topics after creation:", error);
          toast.error("Failed to update topics list.");
        }
      }
      refetchTopics();
    }

    // Improved redirection logic with better error handling and loading state
    if (newTopic.chat_id) {
      const loadingToast = toast.loading(
        "Preparing your research experience..."
      );
      setTimeout(() => {
        toast.dismiss(loadingToast);
        console.log(
          `[Create Success] Navigating to new chat: /dashboard/research/${newTopic.chat_id}`
        );
        router.push(`/dashboard/research/${newTopic.chat_id}`);
      }, 1500);
    } else {
      console.error(
        "New topic created without a chat_id, redirecting to specific topic page instead",
        newTopic
      );
      // If no chat_id, redirect to the topic-specific page using the topic's own ID
      if (newTopic.id) {
        const errorToast = toast.error(
          "Setting up research chat failed. Redirecting to topics page.",
          {
            duration: 3000,
          }
        );
        // Still redirect to the research page to avoid getting stuck
        setTimeout(() => {
          toast.dismiss(errorToast);
          // Keep the user on the research page where they can try again
          window.location.reload();
        }, 2000);
      } else {
        toast.error("Failed to create research properly. Please try again.");
      }
    }
  };

  const handleDelete = async (topicId: string) => {
    if (!topicId) return;
    setIsDeleting(topicId);
    try {
      const response = await fetch(`/api/research/topics/${topicId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Research topic deleted successfully!");
        setResearchTopics((prevTopics) =>
          prevTopics.filter((topic) => topic.id !== topicId)
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error deleting topic:", errorData);
        toast.error(
          errorData.error ||
            "Failed to delete research topic. Please try again."
        );
      }
    } catch (error) {
      console.error("Error deleting research topic:", error);
      toast.error("An error occurred while deleting the topic.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Research</h1>
          <p className="text-muted-foreground">Organize your learning topics</p>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard/research/new">
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span>New Topic</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                        <div className="h-3 w-20 bg-muted animate-pulse rounded"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 w-full bg-muted animate-pulse rounded mb-2"></div>
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : researchTopics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {researchTopics.map((topic) => {
              console.log(
                `[Render Topic Card] ID: ${topic.id}, Chat ID: ${topic.chat_id}`
              );
              return (
                <motion.div
                  key={topic.id}
                  onClick={() =>
                    console.log(
                      `[Card Area Click] Clicked on card for topic ${topic.id}`
                    )
                  }
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                >
                  <Card className="border-primary/10 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            {topic.icon && isValidElement(topic.icon) ? (
                              topic.icon
                            ) : (
                              <MessageSquare className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <CardTitle>{topic.title}</CardTitle>
                            <CardDescription>
                              {topic.subjectName}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-primary/5 hover:bg-primary/10"
                        >
                          {new Date(topic.created_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Created</span>
                        <span>
                          {new Date(topic.created_at).toLocaleString()}
                        </span>
                      </div>
                      {topic.updated_at !== topic.created_at && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Last updated</span>
                          <span>
                            {new Date(topic.updated_at).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        className="flex-1 bg-primary/10 text-primary hover:bg-primary/20"
                        onClick={async () => {
                          console.log(
                            `[Continue Click] Topic ID: ${topic.id}, Chat ID: ${topic.chat_id}`
                          );
                          if (!user?.sub) {
                            toast.error(
                              "You must be logged in to continue research"
                            );
                            return;
                          }

                          if (!topic.chat_id) {
                            toast.error(
                              "No chat session available for this topic"
                            );
                            console.log(
                              `[Continue Click] Aborted: No chat_id for topic ${topic.id}`
                            );
                            return;
                          }

                          const targetUrl = `/dashboard/research/${topic.chat_id}`;
                          console.log(
                            `[Continue Click] Target URL: ${targetUrl}`
                          );

                          try {
                            toast.loading("Checking chat availability...", {
                              duration: 1500,
                            });
                            console.log(
                              `[Continue Click] Validating chat ${topic.chat_id} exists...`
                            );
                            try {
                              await clientDataService.getChatMessages(
                                topic.chat_id
                              );
                              console.log(
                                `[Continue Click] Chat ${topic.chat_id} validation success. Navigating...`
                              );
                              toast.success("Opening research chat", {
                                duration: 1000,
                              });
                              router.push(targetUrl);
                            } catch (chatError) {
                              console.warn(
                                `[Continue Click] Chat ${topic.chat_id} validation failed:`,
                                chatError
                              );
                              throw new Error("Chat not found or inaccessible");
                            }
                          } catch (error) {
                            console.error(
                              "[Continue Click] Chat validation/navigation error, attempting restore:",
                              error
                            );
                            try {
                              toast.error(
                                "Chat not found. Attempting to restore...",
                                { duration: 2000 }
                              );
                              const loadingToast = toast.loading(
                                "Creating new chat session..."
                              );
                              console.log(
                                `[Chat Restore] Creating new chat history for topic ${topic.id}`
                              );

                              const chatHistory =
                                await clientDataService.createChatHistory({
                                  user_id: auth0IdToUuid(user.sub),
                                  title: topic.title,
                                  subject_id: topic.subject_id,
                                });

                              if (chatHistory && chatHistory.id) {
                                console.log(
                                  `[Chat Restore] New chat history created: ${chatHistory.id}. Updating topic ${topic.id}.`
                                );
                                const success =
                                  await researchService.updateResearchTopic(
                                    topic.id,
                                    { chat_id: chatHistory.id }
                                  );

                                if (success) {
                                  toast.dismiss(loadingToast);
                                  toast.success(
                                    "Chat restored! Redirecting..."
                                  );
                                  console.log(
                                    `[Chat Restore] Topic updated. Navigating to new chat: /dashboard/research/${chatHistory.id}`
                                  );
                                  router.push(
                                    `/dashboard/research/${chatHistory.id}`
                                  );
                                } else {
                                  toast.dismiss(loadingToast);
                                  toast.error(
                                    "Failed to update topic with new chat"
                                  );
                                  console.error(
                                    `[Chat Restore] Failed to update topic ${topic.id} with new chat_id ${chatHistory.id}`
                                  );
                                }
                              } else {
                                toast.dismiss(loadingToast);
                                toast.error("Failed to create new chat");
                                console.error(
                                  `[Chat Restore] Failed to create chat history for topic ${topic.id}`
                                );
                              }
                            } catch (restoreError) {
                              console.error(
                                "[Chat Restore] Fatal error during restoration:",
                                restoreError
                              );
                              toast.error(
                                "Failed to restore chat. Please create a new research topic."
                              );
                            }
                          }
                        }}
                        disabled={!topic.chat_id || isDeleting === topic.id}
                      >
                        {isDeleting === topic.id ? (
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        ) : (
                          <ArrowRight className="mr-2 h-4 w-4" />
                        )}
                        Continue Research
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4 bg-destructive/80 hover:bg-destructive"
                            disabled={isDeleting === topic.id}
                            title="Delete Topic"
                          >
                            {isDeleting === topic.id ? (
                              <Loader2 className="animate-spin h-4 w-4" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the research topic "
                              {topic.title}" and all associated data (chat
                              history, resources, steps).
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(topic.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Yes, Delete Topic
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full text-center py-8"
          >
            <p className="text-muted-foreground">
              No research topics found. Create your first topic to get started.
            </p>
            <div className="mt-4">
              <Link href="/dashboard/research/new">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Create First Topic</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      <CreateModal
        title="Create New Research Topic"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        {user?.sub && (
          <ResearchForm
            userId={user.sub}
            subjects={subjects}
            onSuccess={handleCreateResearchSuccess}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        )}
      </CreateModal>
    </div>
  );
}
