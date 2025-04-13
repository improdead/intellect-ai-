"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
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
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { toast } from "sonner";
import UserSync from "./user-sync";
import { clientDataService } from "@/lib/data-service";
import { getSubjectIcon, getSubjectColor } from "@/components/subject-icon";
import { SubjectForm } from "@/components/forms/subject-form";
import { CreateModal } from "@/components/ui/create-modal";
import { SubjectSkeleton } from "@/components/ui/skeleton-loader";
import MagnetButton from "@/components/magnet-button";
import Spotlight from "@/components/spotlight";
import ScrollRevealSection, {
  ParallaxSection,
} from "@/components/scroll-section";
import GlareCardComponent from "@/components/glare-card";
import { FloatingElement } from "@/components/parallax-scroll";
import TypingEffect from "@/components/typing-effect";

// Define types
interface Subject {
  id: string;
  title?: string;
  name?: string;
  progress?: number;
  currentTopic?: string;
  description?: string;
}

interface SubjectWithIcon extends Subject {
  iconComponent: React.ComponentType<any>;
  color: string;
  progress: number;
  currentTopic: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cursorRef = useRef<HTMLDivElement>(null);

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

    // Custom cursor tracking
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = "smooth";

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.style.scrollBehavior = "";
    };
  }, [isInputFocused, searchQuery, suggestions]);

  // Update cursor position with smooth animation
  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${mousePosition.x}px, ${mousePosition.y}px)`;
    }
  }, [mousePosition]);

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
        iconComponent: getSubjectIcon(
          subject.title || subject.name || "Default"
        ),
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

      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className="fixed w-8 h-8 bg-primary/10 rounded-full pointer-events-none z-50 border border-primary/20 mix-blend-difference"
        style={{
          top: -16,
          left: -16,
          transition: "transform 0.2s ease-out",
        }}
      />

      {/* Floating elements */}
      <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden opacity-60 dark:opacity-40">
        <FloatingElement
          xFactor={20}
          yFactor={10}
          duration={8}
          className="absolute top-[15%] right-[10%]"
        >
          <div className="w-32 h-32 rounded-full bg-purple-300/20 dark:bg-purple-500/10 blur-xl" />
        </FloatingElement>
        <FloatingElement
          xFactor={15}
          yFactor={25}
          duration={10}
          delay={1}
          className="absolute top-[65%] left-[15%]"
        >
          <div className="w-40 h-40 rounded-full bg-blue-300/20 dark:bg-blue-500/10 blur-xl" />
        </FloatingElement>
        <FloatingElement
          xFactor={10}
          yFactor={10}
          duration={9}
          delay={2}
          className="absolute bottom-[20%] right-[20%]"
        >
          <div className="w-24 h-24 rounded-full bg-indigo-300/20 dark:bg-indigo-500/10 blur-xl" />
        </FloatingElement>
      </div>

      <div className="space-y-16 max-w-5xl mx-auto pb-8">
        {/* Background elements */}
        <div className="fixed inset-0 -z-10 bg-background/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute w-full h-full bg-grid-pattern opacity-30"></div>
        </div>

        {/* User account menu */}
        <div className="absolute top-4 right-4 z-50">
          <MagnetButton
            variant="outlined"
            size="sm"
            className="rounded-lg shadow-sm border-gray-300 dark:border-gray-700 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
            magneticIntensity={0.1}
            onClick={() => (window.location.href = "/api/auth/logout")}
          >
            <span className="flex items-center gap-1">Logout</span>
          </MagnetButton>
        </div>

        {/* Hero section with centered search */}
        <Spotlight>
          <ScrollRevealSection
            animation="fade"
            className="flex flex-col items-center justify-center py-16 md:py-20 text-center px-6 relative overflow-hidden"
          >
            <div
              ref={heroRef}
              className="absolute inset-0 animated-gradient opacity-30 -z-10 rounded-3xl"
            ></div>

            <motion.h1
              className="text-3xl md:text-6xl font-bold mb-4 tracking-tight text-white"
              initial={{ y: 20, opacity: 0 }}
              animate={
                heroInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }
              }
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              What do you want to learn today,{" "}
              <span className="text-primary font-bold">
                <TypingEffect
                  words={[user?.name?.split(" ")[0] || "Learner"]}
                  className="font-bold"
                  typingSpeed={120}
                  deletingSpeed={0}
                  delayBetweenWords={9999999}
                />
              </span>
              ?
            </motion.h1>

            <ParallaxSection direction="up" speed={1.2} className="mb-10">
              <motion.p
                className="text-muted-foreground max-w-2xl text-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={
                  heroInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }
                }
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Ask any question or explore subjects to enhance your knowledge
              </motion.p>
            </ParallaxSection>

            <motion.div
              className="w-full max-w-2xl relative"
              initial={{ y: 20, opacity: 0 }}
              animate={
                heroInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }
              }
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
                  onSuggestionSelect={(suggestion) =>
                    setSearchQuery(suggestion)
                  }
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
          </ScrollRevealSection>
        </Spotlight>

        {/* Quick actions */}
        <ScrollRevealSection animation="rise" className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <MagnetButton
              variant="filled"
              className="rounded-xl h-auto p-0 bg-gradient-to-r from-indigo-200/30 to-violet-200/30 dark:from-indigo-500/15 dark:to-violet-500/15 border border-gray-200 dark:border-primary/10 shadow-sm hover:shadow-md"
              magneticIntensity={0.1}
            >
              <Link
                href="/dashboard/chat"
                className="flex items-center justify-between w-full p-4"
              >
                <div className="flex items-center">
                  <div className="bg-indigo-100 dark:bg-primary/10 p-3 rounded-lg mr-3">
                    <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">New Chat</h3>
                    <p className="text-sm text-muted-foreground">
                      Start a conversation
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-60 ml-2" />
              </Link>
            </MagnetButton>

            <MagnetButton
              variant="filled"
              className="rounded-xl h-auto p-0 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 dark:from-blue-500/15 dark:to-cyan-500/15 border border-gray-200 dark:border-primary/10 shadow-sm hover:shadow-md"
              magneticIntensity={0.1}
            >
              <Link
                href="/dashboard/courses"
                className="flex items-center justify-between w-full p-4"
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-500/10 p-3 rounded-lg mr-3">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Courses</h3>
                    <p className="text-sm text-muted-foreground">
                      Browse learning paths
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-60 ml-2" />
              </Link>
            </MagnetButton>

            <MagnetButton
              variant="filled"
              className="rounded-xl h-auto p-0 bg-gradient-to-r from-amber-200/30 to-orange-200/30 dark:from-amber-500/15 dark:to-orange-500/15 border border-gray-200 dark:border-primary/10 shadow-sm hover:shadow-md"
              magneticIntensity={0.1}
            >
              <Link
                href="/dashboard/progress"
                className="flex items-center justify-between w-full p-4"
              >
                <div className="flex items-center">
                  <div className="bg-amber-100 dark:bg-amber-500/10 p-3 rounded-lg mr-3">
                    <BarChart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Track your learning
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-60 ml-2" />
              </Link>
            </MagnetButton>

            <MagnetButton
              variant="filled"
              className="rounded-xl h-auto p-0 bg-gradient-to-r from-emerald-200/30 to-green-200/30 dark:from-emerald-500/15 dark:to-green-500/15 border border-gray-200 dark:border-primary/10 shadow-sm hover:shadow-md"
              magneticIntensity={0.1}
            >
              <Link
                href="/dashboard/history"
                className="flex items-center justify-between w-full p-4"
              >
                <div className="flex items-center">
                  <div className="bg-emerald-100 dark:bg-emerald-500/10 p-3 rounded-lg mr-3">
                    <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">History</h3>
                    <p className="text-sm text-muted-foreground">
                      Past conversations
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-60 ml-2" />
              </Link>
            </MagnetButton>
          </div>
        </ScrollRevealSection>

        {/* Subjects section */}
        <div ref={tabsRef} className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <ScrollRevealSection animation="slide" direction="left">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Your Subjects
                </h2>
                <p className="text-muted-foreground">
                  Explore and manage your learning subjects
                </p>
              </div>
            </ScrollRevealSection>

            <ScrollRevealSection animation="slide" direction="right">
              <MagnetButton
                variant="outlined"
                className="rounded-lg shadow-sm border-gray-300 dark:border-gray-700 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
                magneticIntensity={0.1}
                onClick={() => setIsCreateModalOpen(true)}
              >
                <span className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add Subject
                </span>
              </MagnetButton>
            </ScrollRevealSection>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <ScrollRevealSection
              animation="fade"
              className="flex justify-center mb-8"
            >
              <TabsList className="bg-gray-100/70 dark:bg-background/50 border border-gray-200 dark:border-primary/10 p-1 rounded-full">
                <TabsTrigger value="all" className="rounded-full px-6">
                  All
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="rounded-full px-6">
                  In Progress
                </TabsTrigger>
                <TabsTrigger value="completed" className="rounded-full px-6">
                  Completed
                </TabsTrigger>
              </TabsList>
            </ScrollRevealSection>

            <ScrollRevealSection animation="rise">
              <TabsContent value="all" className="space-y-4">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <SubjectSkeleton key={index} />
                    ))}
                  </div>
                ) : subjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {subjects.map((subject) => (
                      <Link
                        key={subject.id}
                        href={`/dashboard/courses/${subject.id}`}
                        className="block h-full"
                      >
                        <GlareCardComponent
                          className="h-full"
                          glareSize={150}
                          glareColor={`${subject.color}30`}
                          borderColor={`${subject.color}30`}
                          animateGlare={false}
                        >
                          <div className="p-5 h-full flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                              <div
                                className="p-3 rounded-lg"
                                style={{
                                  backgroundColor: `${subject.color}10`,
                                }}
                              >
                                {subject.iconComponent && (
                                  <subject.iconComponent />
                                )}
                              </div>
                              <div
                                className="relative h-2 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800"
                                style={{ borderColor: `${subject.color}20` }}
                              >
                                <div
                                  className="absolute top-0 left-0 h-full rounded-full"
                                  style={{
                                    width: `${subject.progress}%`,
                                    backgroundColor: subject.color,
                                  }}
                                />
                              </div>
                            </div>
                            <h3 className="font-medium text-lg mb-1">
                              {subject.title || subject.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3 flex-grow">
                              {subject.description ||
                                "No description available"}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">
                                Current topic:{" "}
                              </span>
                              {subject.currentTopic}
                            </div>
                          </div>
                        </GlareCardComponent>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 rounded-lg border border-dashed border-muted">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 rounded-full bg-gray-100 dark:bg-primary/10">
                        <Brain className="h-6 w-6 text-gray-600 dark:text-primary" />
                      </div>
                    </div>
                    <h3 className="font-medium mb-1">No subjects yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first subject to start learning
                    </p>
                    <MagnetButton
                      variant="outlined"
                      size="sm"
                      className="rounded-lg border-gray-300 dark:border-gray-700 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
                      magneticIntensity={0.1}
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <span className="flex items-center gap-1">
                        <Plus className="h-4 w-4" /> Add Subject
                      </span>
                    </MagnetButton>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="in-progress" className="space-y-4">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <SubjectSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {subjects
                      .filter(
                        (subject) =>
                          subject.progress > 0 && subject.progress < 100
                      )
                      .map((subject) => (
                        <Link
                          key={subject.id}
                          href={`/dashboard/courses/${subject.id}`}
                          className="block h-full"
                        >
                          <GlareCardComponent
                            className="h-full"
                            glareSize={150}
                            glareColor={`${subject.color}30`}
                            borderColor={`${subject.color}30`}
                            animateGlare={false}
                          >
                            <div className="p-5 h-full flex flex-col">
                              <div className="flex justify-between items-start mb-4">
                                <div
                                  className="p-3 rounded-lg"
                                  style={{
                                    backgroundColor: `${subject.color}10`,
                                  }}
                                >
                                  {subject.iconComponent && (
                                    <subject.iconComponent />
                                  )}
                                </div>
                                <div
                                  className="relative h-2 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800"
                                  style={{ borderColor: `${subject.color}20` }}
                                >
                                  <div
                                    className="absolute top-0 left-0 h-full rounded-full"
                                    style={{
                                      width: `${subject.progress}%`,
                                      backgroundColor: subject.color,
                                    }}
                                  />
                                </div>
                              </div>
                              <h3 className="font-medium text-lg mb-1">
                                {subject.title || subject.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3 flex-grow">
                                {subject.description ||
                                  "No description available"}
                              </p>
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">
                                  Current topic:{" "}
                                </span>
                                {subject.currentTopic}
                              </div>
                            </div>
                          </GlareCardComponent>
                        </Link>
                      ))}
                    {subjects.filter(
                      (subject) =>
                        subject.progress > 0 && subject.progress < 100
                    ).length === 0 && (
                      <div className="col-span-full text-center py-12 rounded-lg border border-dashed border-muted">
                        <p className="text-muted-foreground">
                          No subjects in progress.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </ScrollRevealSection>

            {/* Create subject modal */}
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
          </Tabs>
        </div>

        {/* Features Tabs */}
        <motion.div
          ref={tabsRef}
          initial={{ opacity: 0 }}
          animate={tabsInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="px-6"
        >
          <Tabs
            defaultValue="intelect"
            className="rounded-xl overflow-hidden shadow-sm bg-white/50 dark:bg-card/30 backdrop-blur-sm border border-gray-200 dark:border-border/10"
          >
            <TabsList className="grid w-full grid-cols-4 p-1.5 bg-gray-100/70 dark:bg-muted/30 gap-1">
              <TabsTrigger
                value="intelect"
                className="rounded-lg data-[state=active]:shadow-sm py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">intelect</span>
              </TabsTrigger>
              <TabsTrigger
                value="quiz"
                className="rounded-lg data-[state=active]:shadow-sm py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <Brain className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Quiz</span>
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="rounded-lg data-[state=active]:shadow-sm py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Resources</span>
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="rounded-lg data-[state=active]:shadow-sm py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <BarChart className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="intelect" className="space-y-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">intelect AI</CardTitle>
                  <CardDescription>
                    Ask questions and get personalized explanations from your AI
                    tutor
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-primary/10 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-indigo-600 dark:text-primary" />
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
                      <Link href="/dashboard/intelect">Chat with intelect</Link>
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
          <p>© 2025 Intelect Learning Platform. All rights reserved.</p>
        </motion.div>
      </div>
    </>
  );
}
