"use client";

import type React from "react";

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
import { getSubjectIcon } from "@/components/subject-icon";
import { CreateModal } from "@/components/ui/create-modal";
import { ResearchForm } from "@/components/forms/research-form";
import { auth0IdToUuid } from "@/lib/auth0-utils";

// Interface for research data with icon
interface ResearchTopic {
  id: string;
  title: string;
  subject?: string;
  subject_id?: string;
  icon?: React.ReactNode;
  created_at: string;
  updated_at: string;
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
  const [activeTab, setActiveTab] = useState("topics");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [researchTopics, setResearchTopics] = useState<ResearchTopic[]>([]);
  const [subjects, setSubjects] = useState<SubjectWithIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch research topics (chat history) and subjects
  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        setIsLoading(true);

        // Convert Auth0 ID to UUID for Supabase
        const userId = auth0IdToUuid(user.sub as string);

        // Fetch chat history (research topics)
        const chatHistoryData = await clientDataService.getChatHistory(userId);

        // Fetch all subjects to get subject names
        const subjectsData = await clientDataService.getSubjects();
        setSubjects(subjectsData);

        // Create a map of subject IDs to names
        const subjectMap = new Map();
        subjectsData.forEach((subject) => {
          subjectMap.set(
            subject.id,
            subject.name || subject.title || "General"
          );
        });

        // Add icon and subject name to each research topic
        const topicsWithIcons = chatHistoryData.map((topic) => {
          const subjectName = topic.subject_id
            ? subjectMap.get(topic.subject_id) || "General"
            : "General";
          return {
            ...topic,
            icon: getSubjectIcon(subjectName),
            subject: subjectName,
          };
        });

        setResearchTopics(topicsWithIcons);
      } catch (error) {
        console.error("Error fetching research topics:", error);
        toast.error("Failed to load research topics. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleCreateResearchSuccess = (newTopic: any) => {
    toast.success(`Research topic "${newTopic.title}" created successfully!`);
    setIsCreateModalOpen(false);
    // Redirect to the chat page with the new topic
    window.location.href = `/dashboard/chat?id=${newTopic.id}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setActiveTab("results");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Research</h1>
          <p className="text-muted-foreground">
            Explore and organize your learning materials
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>New Topic</span>
          </Button>
          <Button
            variant="outline"
            className="border-primary/20 hover:bg-primary/5"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="relative">
        <form onSubmit={handleSearch} className="flex gap-2 w-full mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for topics, concepts, or resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 rounded-xl"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <Tabs
        defaultValue="topics"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="topics">My Topics</TabsTrigger>
          <TabsTrigger value="results">Search Results</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-6">
          {isLoading ? (
            // Loading skeleton
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
              {researchTopics.map((topic) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-primary/10 hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            {topic.icon && React.isValidElement(topic.icon) ? (
                              topic.icon
                            ) : (
                              <MessageSquare className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <CardTitle>{topic.title}</CardTitle>
                            <CardDescription>{topic.subject}</CardDescription>
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
                    <CardFooter>
                      <Button
                        className="w-full bg-primary/10 text-primary hover:bg-primary/20"
                        asChild
                      >
                        <a href={`/dashboard/chat?id=${topic.id}`}>
                          Continue Research
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            // No research topics found
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full text-center py-8"
            >
              <p className="text-muted-foreground">
                No research topics found. Create your first topic to get
                started.
              </p>
              <div className="mt-4">
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create First Topic</span>
                </Button>
              </div>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {isSearching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResults.map((result) => (
                <Card
                  key={result.id}
                  className="border-primary/10 hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          {result.icon}
                        </div>
                        <div>
                          <CardTitle>{result.title}</CardTitle>
                          <CardDescription>
                            {result.type} • {result.source}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-primary/5 hover:bg-primary/10"
                      >
                        {result.subject}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {result.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(Math.floor(result.rating))].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 text-amber-500 fill-amber-500"
                            />
                          ))}
                          {result.rating % 1 > 0 && (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          )}
                          {[...Array(5 - Math.ceil(result.rating))].map(
                            (_, i) => (
                              <Star
                                key={i}
                                className="h-4 w-4 text-muted-foreground/20"
                              />
                            )
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground ml-1">
                          {result.rating}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {result.date}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-primary/20 hover:bg-primary/5"
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-primary/20 hover:bg-primary/5"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-primary/20 hover:bg-primary/5"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">
                Search for Research Topics
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter keywords in the search bar above to find relevant research
                materials, articles, and resources.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedResources.map((resource) => (
              <Card
                key={resource.id}
                className="border-primary/10 hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        {resource.icon}
                      </div>
                      <div>
                        <CardTitle>{resource.title}</CardTitle>
                        <CardDescription>
                          {resource.type} • {resource.author}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-primary/5 hover:bg-primary/10"
                    >
                      {resource.subject}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {resource.description}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20">
                    Explore Resource
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Research Modal */}
      <CreateModal
        title="Create New Research Topic"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        {user && (
          <ResearchForm
            userId={auth0IdToUuid(user.sub as string)}
            subjects={subjects}
            onSuccess={handleCreateResearchSuccess}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        )}
      </CreateModal>
    </div>
  );
}
