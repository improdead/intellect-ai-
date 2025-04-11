"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import {
  MessageSquare,
  BookOpen,
  BarChart,
  Brain,
  Clock,
  Sparkles,
  Plus,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { toast } from "sonner";
import UserSync from "./user-sync";
import { clientDataService, SubjectWithIcon } from "@/lib/data-service";
import { getSubjectIcon, getSubjectColor } from "@/components/subject-icon";
import { SubjectForm } from "@/components/forms/subject-form";
import { CreateModal } from "@/components/ui/create-modal";
import { SubjectSkeleton } from "@/components/ui/skeleton-loader";

export default function DashboardPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("");
  // Removed unused state: const [suggestionIndex, setSuggestionIndex] = useState(0);
  // We don't need tabPressed state anymore as it's handled in EnhancedInput
  const suggestions = [
    "What is photosynthesis?",
    "Explain the theory of relativity.",
    "How does a computer work?",
    "Tell me about black holes.",
    "What are the main causes of climate change?",
  ];

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!isInputFocused && !searchQuery) {
        setPlaceholderText(
          suggestions[Math.floor(Math.random() * suggestions.length)]
        );
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isInputFocused, searchQuery, suggestions]);

  // Tab key handling is now managed by the EnhancedInput component

  const handleLearnClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Refs for scroll animations
  const heroRef = useRef(null);
  const progressRef = useRef(null);
  const tabsRef = useRef(null);
  const footerRef = useRef(null);

  // Check if elements are in view
  const heroInView = useInView(heroRef, { once: false, amount: 0.3 });
  const progressInView = useInView(progressRef, { once: false, amount: 0.3 });
  const tabsInView = useInView(tabsRef, { once: false, amount: 0.3 });
  const footerInView = useInView(footerRef, { once: false, amount: 0.3 });

  // State for subjects
  const [subjects, setSubjects] = useState<SubjectWithIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch subjects from the database
  const fetchSubjects = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Fetch subjects with user progress
      const subjectsData = await clientDataService.getUserSubjectsProgress(
        user.sub as string
      );

      // Add icon and color to each subject
      const subjectsWithIcons = subjectsData.map((subject) => ({
        ...subject,
        // Use title or name, whichever is available
        icon: getSubjectIcon(subject.title || subject.name || "Default"),
        color: getSubjectColor(subject.title || subject.name || "Default"),
        // If no progress data, default to 0
        progress: subject.progress || 0,
        // If no current topic, default to 'Not started'
        currentTopic: subject.currentTopic || "Not started",
      }));

      setSubjects(subjectsWithIcons);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to load subjects. Please try again.");
      // If there's an error, use empty array
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [user]);

  const handleCreateSubjectSuccess = (newSubject: SubjectWithIcon) => {
    toast.success(`Subject "${newSubject.name}" created successfully!`);
    setIsCreateModalOpen(false);
    fetchSubjects(); // Refresh the subjects list
  };

  return (
    <>
      {/* Client component to sync Auth0 user with the database */}
      <UserSync />

      <div className="space-y-16 max-w-4xl mx-auto pb-8">
        {/* Background elements */}
        <div className="fixed inset-0 -z-10 bg-background/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute w-full h-full bg-grid-pattern opacity-30"></div>
        </div>
        {/* Hero section with centered search */}
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0 }}
          animate={heroInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center justify-center py-16 md:py-20 text-center px-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 animated-gradient opacity-30 -z-10 rounded-3xl"></div>
          <motion.div
            className="absolute -z-5 w-64 h-64 rounded-full bg-primary/10 blur-3xl"
            animate={{
              x: [50, -50, 50],
              y: [-20, 20, -20],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ top: "10%", right: "15%" }}
          />
          <motion.div
            className="absolute -z-5 w-72 h-72 rounded-full bg-accent/10 blur-3xl"
            animate={{
              x: [-30, 30, -30],
              y: [30, -30, 30],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ bottom: "5%", left: "10%" }}
          />

          <motion.h1
            className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
            initial={{ y: 20, opacity: 0 }}
            animate={heroInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            What do you want to learn today,{" "}
            <span className="text-primary">{user?.name || "Learner"}</span>?
          </motion.h1>

          <motion.p
            className="text-muted-foreground max-w-2xl mb-10 text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={heroInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Ask any question or explore subjects to enhance your knowledge
          </motion.p>

          <motion.div
            className="w-full max-w-2xl relative"
            initial={{ y: 20, opacity: 0 }}
            animate={heroInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative">
              <EnhancedInput
                ref={inputRef}
                type="text"
                placeholder={placeholderText}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                className="w-full py-6 px-6 text-lg rounded-xl transition-all duration-300 pr-32"
                showSearchIcon={true}
                suggestions={suggestions}
                onSuggestionSelect={(suggestion) => setSearchQuery(suggestion)}
                iconRight={
                  <Button
                    className="px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
                    onClick={handleLearnClick}
                  >
                    <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                    Learn
                  </Button>
                }
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Quick actions */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-6 mb-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold tracking-tight">
              Continue Learning
            </h2>
            <p className="text-muted-foreground">Pick up where you left off</p>
          </motion.div>
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              asChild
              className="rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              <Link href="/dashboard/chat">
                <MessageSquare className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                Chat with AI Tutor
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Progress Card */}
        <motion.div
          ref={progressRef}
          initial={{ opacity: 0 }}
          animate={progressInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-5 px-6 max-w-3xl mx-auto"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Your Subjects</h2>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span>New Subject</span>
            </Button>
          </div>
          {isLoading && (
            // Loading skeleton
            <>
              {Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="w-full"
                >
                  <Card className="overflow-hidden border-0 shadow-lg bg-card/50 rounded-2xl">
                    <CardContent className="p-5 relative flex flex-col">
                      <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-xl bg-muted animate-pulse flex-shrink-0 ml-1"></div>
                        <div className="flex-1 flex flex-col justify-center space-y-3">
                          <div className="h-5 bg-muted rounded animate-pulse w-1/3"></div>
                          <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
                        </div>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-muted mt-3 animate-pulse"></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </>
          )}

          {!isLoading && subjects.length > 0 && (
            // Render actual subjects
            <>
              {subjects.map((subject, index) => {
                const Icon = subject.icon;
                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={
                      progressInView
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 20 }
                    }
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                    className="w-full"
                  >
                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card rounded-2xl">
                      <CardContent className="p-5 relative flex flex-col">
                        <div
                          className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br opacity-10 -z-10 rounded-2xl ${subject.color}`}
                        ></div>
                        <div className="flex items-center gap-5">
                          <div
                            className={`h-16 w-16 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-md ring-2 ring-white/20 flex-shrink-0 ml-1`}
                          >
                            <Icon className="h-8 w-8 text-white drop-shadow-sm" />
                          </div>
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-lg tracking-tight">
                                {subject.title ||
                                  subject.name ||
                                  "Unnamed Subject"}
                              </h3>
                              <span className="text-sm font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary shadow-sm whitespace-nowrap">
                                {subject.progress}%
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 flex-shrink-0 text-primary/60" />
                              <span className="truncate">
                                Current:{" "}
                                <span className="text-foreground/80">
                                  {subject.currentTopic}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-secondary/50 mt-3">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${subject.progress}%` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${subject.progress}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          ></motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </>
          )}

          {!isLoading && subjects.length === 0 && (
            // No subjects found
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full text-center py-8"
            >
              <p className="text-muted-foreground">
                No subjects found in the database. Create your first subject to
                get started.
              </p>
              <div className="mt-4">
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create First Subject</span>
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Features Tabs */}
        <motion.div
          ref={tabsRef}
          initial={{ opacity: 0 }}
          animate={tabsInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="px-6"
        >
          <Tabs
            defaultValue="chat"
            className="rounded-xl overflow-hidden shadow-lg bg-card/50 backdrop-blur-sm border border-border/10"
          >
            <TabsList className="grid w-full grid-cols-4 p-1.5 bg-muted/50 gap-1">
              <TabsTrigger
                value="chat"
                className="rounded-lg data-[state=active]:shadow-md py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">AI Chat</span>
              </TabsTrigger>
              <TabsTrigger
                value="quiz"
                className="rounded-lg data-[state=active]:shadow-md py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <Brain className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Quiz</span>
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="rounded-lg data-[state=active]:shadow-md py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Resources</span>
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="rounded-lg data-[state=active]:shadow-md py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <BarChart className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="space-y-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">AI Tutor Chat</CardTitle>
                  <CardDescription>
                    Ask questions and get personalized explanations from your AI
                    tutor
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">AI Tutor</p>
                        <p className="text-sm text-muted-foreground">
                          Hi there! I'm your AI tutor. What would you like to
                          learn about today?
                        </p>
                      </div>
                    </div>
                    <Button asChild className="w-full">
                      <Link href="/dashboard/chat">Start Chatting</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="quiz" className="space-y-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">Available Quizzes</CardTitle>
                  <CardDescription>
                    Test your knowledge with interactive quizzes
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Quizzes will be loaded from your database when available.
                    </p>
                    <div className="flex justify-center">
                      <Button asChild>
                        <Link href="/dashboard/quiz">Browse Quizzes</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="resources" className="space-y-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">Learning Resources</CardTitle>
                  <CardDescription>
                    Access study materials and educational content
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Resources will be loaded from your database when
                      available.
                    </p>
                    <div className="flex justify-center">
                      <Button asChild>
                        <Link href="/dashboard/resources">
                          Browse Resources
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="progress" className="space-y-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">Learning Analytics</CardTitle>
                  <CardDescription>
                    Track your progress and identify areas for improvement
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Analytics will be generated based on your learning
                      activity.
                    </p>
                    <div className="flex justify-center">
                      <Button asChild>
                        <Link href="/dashboard/analytics">View Analytics</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Footer */}
        <motion.div
          ref={footerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={footerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm text-muted-foreground py-8"
        >
          <p>© 2023 Intellect Learning Platform. All rights reserved.</p>
        </motion.div>
      </div>

      {/* Create Subject Modal */}
      <CreateModal
        title="Create New Subject"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <SubjectForm
          onSuccess={handleCreateSubjectSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </CreateModal>
    </>
  );
}
