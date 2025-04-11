"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useAnimation, LayoutGroup } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Sparkles,
  Brain,
  Zap,
  Lightbulb,
  BarChart,
  MessageSquare,
  Users,
  ChevronLeft,
  ChevronRight,
  Rocket,
  Atom,
  Dna,
  Globe,
  BookOpen,
  Code,
  Palette,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectShowcase from "@/components/subject-showcase";
import { useRouter } from "next/navigation";
import StackedCards from "@/components/stacked-cards";
import VideoPreview from "@/components/video-preview";
import TextRotate from "@/components/text/text-rotate";
import { BentoGrid } from "@/components/bento-grid";

// Dynamically import the background component with no SSR to avoid hydration issues
const WavyParticlesBackground = dynamic(
  () => import("@/components/wavy-particles-background"),
  { ssr: false }
);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const router = useRouter();
  const controls = useAnimation();
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);

    // Animate sections on load
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    });

    // Add scroll animation
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (backgroundRef.current) {
        backgroundRef.current.style.transform = `translateY(${
          scrollY * 0.1
        }px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [controls]);

  const handleGetStarted = () => {
    setIsButtonClicked(true);
    setTimeout(() => {
      router.push("/login?returnTo=/dashboard");
    }, 600);
  };

  const nextCard = () => {
    setActiveCardIndex((prev) => (prev + 1) % featureCards.length);
  };

  const prevCard = () => {
    setActiveCardIndex(
      (prev) => (prev - 1 + featureCards.length) % featureCards.length
    );
  };

  if (!mounted) return null;

  const featureCards = [
    {
      bgColor: "bg-gradient-to-br from-purple-600 to-indigo-700",
      title: "AI-Powered Learning",
      description:
        "Our advanced AI understands your questions and creates personalized explanations tailored to your learning style and pace.",
      image: "/digital-brain-learning.png",
    },
    {
      bgColor: "bg-gradient-to-br from-blue-600 to-cyan-700",
      title: "Interactive Visualizations",
      description:
        "Complex concepts come to life through dynamic, interactive visualizations generated in real-time during your conversations.",
      image: "/dna-helix-interactive.png",
    },
    {
      bgColor: "bg-gradient-to-br from-indigo-600 to-purple-700",
      title: "Personalized Learning Path",
      description:
        "Our AI adapts to your progress, creating a customized learning journey that evolves as your understanding deepens.",
      image: "/personalized-learning-journey.png",
    },
    {
      bgColor: "bg-gradient-to-br from-violet-600 to-purple-700",
      title: "Natural Conversations",
      description:
        "Chat naturally as if you're talking to a human tutor, with the ability to ask follow-up questions and explore topics deeply.",
      image: "/ai-tutor-session.png",
    },
    {
      bgColor: "bg-gradient-to-br from-cyan-600 to-blue-700",
      title: "Progress Tracking",
      description:
        "Monitor your learning journey with detailed analytics and insights that help you identify strengths and areas for improvement.",
      image: "/learning-analytics-overview.png",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Wavy particles background */}
      <WavyParticlesBackground />

      <main className="relative pt-16 pb-20">
        <section className="container flex flex-col items-center justify-center text-center space-y-8 py-12 min-h-[90vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto space-y-4"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4 backdrop-blur-sm">
              Your ultimate learning companion
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Learn anything with
              <br />
              <LayoutGroup>
                <motion.div
                  className="flex whitespace-pre justify-center mt-2 mb-0"
                  layout
                >
                  <TextRotate
                    texts={[
                      "AI-powered",
                      "interactive",
                      "personalized",
                      "immersive",
                      "adaptive",
                      "engaging",
                    ]}
                    mainClassName="text-primary px-2 sm:px-2 md:px-3 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                    staggerFrom="last"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                  />
                </motion.div>
              </LayoutGroup>
              conversations
            </h1>

            <p className="text-xl text-foreground/80 mt-6 max-w-2xl mx-auto">
              Chat with an AI tutor that creates interactive visualizations and
              explanations in real-time to help you understand complex concepts
              instantly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg group transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                Start Chatting
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-primary/20 hover:bg-primary/5 transition-all duration-300"
              asChild
            >
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </motion.div>

          <div className="relative mt-16 w-full max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl -z-10"></div>
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <VideoPreview
                src=""
                title="AI-Powered Learning Experience"
                description="See how our chatbot transforms education with interactive visualizations"
              />
            </motion.div>
          </div>
        </section>

        <section id="bento" className="py-20 container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold">
              Explore our learning ecosystem
            </h2>
            <p className="text-foreground/70 mt-4 max-w-2xl mx-auto">
              Discover all the ways Intellect can transform your learning
              experience
            </p>
          </motion.div>

          <BentoGrid
            items={[
              {
                title: "AI-Powered Tutoring",
                description:
                  "Get personalized explanations and answers to your questions with our advanced AI tutor.",
                icon: <Brain className="h-8 w-8 text-purple-500" />,
                color: "from-purple-500/20 to-indigo-500/20",
                width: "large",
                height: "medium",
                link: "/features/ai-tutor",
              },
              {
                title: "Interactive Visualizations",
                description:
                  "See complex concepts come to life with dynamic, interactive visualizations.",
                icon: <Sparkles className="h-8 w-8 text-blue-500" />,
                color: "from-blue-500/20 to-cyan-500/20",
                width: "medium",
                height: "medium",
                link: "/features/visualizations",
              },
              {
                title: "Physics Simulations",
                description:
                  "Explore the laws of physics through interactive simulations and experiments.",
                icon: <Atom className="h-8 w-8 text-cyan-500" />,
                color: "from-cyan-500/20 to-blue-500/20",
                width: "medium",
                height: "small",
                link: "/subjects/physics",
              },
              {
                title: "Biology Explorer",
                description:
                  "Dive into the world of living organisms with detailed models and explanations.",
                icon: <Dna className="h-8 w-8 text-green-500" />,
                color: "from-green-500/20 to-emerald-500/20",
                width: "medium",
                height: "small",
                link: "/subjects/biology",
              },
              {
                title: "Progress Tracking",
                description:
                  "Monitor your learning journey with detailed analytics and insights.",
                icon: <BarChart className="h-8 w-8 text-amber-500" />,
                color: "from-amber-500/20 to-yellow-500/20",
                width: "medium",
                height: "medium",
                link: "/features/progress",
              },
              {
                title: "Coding Playground",
                description:
                  "Learn programming concepts with an interactive coding environment.",
                icon: <Code className="h-8 w-8 text-indigo-500" />,
                color: "from-indigo-500/20 to-violet-500/20",
                width: "medium",
                height: "medium",
                link: "/features/coding",
              },
              {
                title: "Global Learning Community",
                description:
                  "Connect with learners from around the world to collaborate and share knowledge.",
                icon: <Globe className="h-8 w-8 text-blue-500" />,
                color: "from-blue-500/20 to-indigo-500/20",
                width: "large",
                height: "small",
                link: "/features/community",
              },
              {
                title: "Creative Arts",
                description:
                  "Explore music, visual arts, and creative expression with AI-guided tutorials.",
                icon: <Palette className="h-8 w-8 text-pink-500" />,
                color: "from-pink-500/20 to-rose-500/20",
                width: "medium",
                height: "small",
                link: "/subjects/arts",
              },
              {
                title: "Space Exploration",
                description:
                  "Journey through the cosmos with interactive astronomy lessons and simulations.",
                icon: <Rocket className="h-8 w-8 text-violet-500" />,
                color: "from-violet-500/20 to-purple-500/20",
                width: "medium",
                height: "small",
                link: "/subjects/astronomy",
              },
            ]}
          />
        </section>

        <section id="features" className="pt-20 pb-10 container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold">
              Why choose Intellect?
            </h2>
            <p className="text-foreground/70 mt-4 max-w-2xl mx-auto">
              Our AI chatbot combines cutting-edge AI with interactive
              visualizations to help you master any subject through
              conversation.
            </p>
          </motion.div>

          <StackedCards
            cards={[
              {
                id: 1,
                title: "AI-Powered Conversations",
                description:
                  "Our advanced AI understands your questions and creates personalized explanations tailored to your needs.",
                icon: <Brain className="h-6 w-6 text-white" />,
                color: "from-purple-600 to-indigo-700",
              },
              {
                id: 2,
                title: "Interactive Visualizations",
                description:
                  "Visualize complex concepts through dynamic, interactive visualizations generated in real-time during your chat.",
                icon: <Lightbulb className="h-6 w-6 text-white" />,
                color: "from-blue-600 to-cyan-700",
              },
              {
                id: 3,
                title: "Instant Answers",
                description:
                  "Get immediate, accurate responses to your questions with detailed explanations that adapt to your understanding.",
                icon: <Zap className="h-6 w-6 text-white" />,
                color: "from-indigo-600 to-purple-700",
              },
              {
                id: 4,
                title: "Track Learning Progress",
                description:
                  "Our AI remembers your conversations and builds on previous discussions to create a personalized learning journey.",
                icon: <BarChart className="h-6 w-6 text-white" />,
                color: "from-cyan-600 to-blue-700",
              },
              {
                id: 5,
                title: "Natural Conversations",
                description:
                  "Chat naturally as if you're talking to a human tutor, with the ability to ask follow-up questions and explore topics deeply.",
                icon: <MessageSquare className="h-6 w-6 text-white" />,
                color: "from-violet-600 to-purple-700",
              },
              {
                id: 6,
                title: "Multi-Subject Expertise",
                description:
                  "From physics to philosophy, our AI chatbot has deep knowledge across a wide range of academic and practical subjects.",
                icon: <Users className="h-6 w-6 text-white" />,
                color: "from-purple-600 to-pink-700",
              },
            ]}
          />
        </section>

        <section
          id="subjects"
          className="pt-10 pb-20 bg-gradient-to-b from-background to-primary/5"
        >
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold">Explore Topics</h2>
              <p className="text-foreground/70 mt-4 max-w-2xl mx-auto">
                Chat about any subject with our interactive AI learning
                companion
              </p>
            </motion.div>

            <Tabs defaultValue="physics" className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-12">
                <TabsTrigger value="physics">Physics</TabsTrigger>
                <TabsTrigger value="math">Mathematics</TabsTrigger>
                <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
                <TabsTrigger value="biology">Biology</TabsTrigger>
              </TabsList>

              <TabsContent value="physics">
                <SubjectShowcase
                  title="Physics"
                  description="Chat about the fundamental laws that govern the universe"
                  topics={[
                    "Newton's Laws of Motion",
                    "Thermodynamics",
                    "Electromagnetism",
                    "Quantum Mechanics",
                    "Relativity",
                    "Fluid Dynamics",
                  ]}
                />
              </TabsContent>

              <TabsContent value="math">
                <SubjectShowcase
                  title="Mathematics"
                  description="Discuss patterns, structures, and mathematical relationships"
                  topics={[
                    "Calculus",
                    "Linear Algebra",
                    "Statistics & Probability",
                    "Number Theory",
                    "Geometry",
                    "Differential Equations",
                  ]}
                />
              </TabsContent>

              <TabsContent value="chemistry">
                <SubjectShowcase
                  title="Chemistry"
                  description="Explore the composition, structure, and properties of matter"
                  topics={[
                    "Atomic Structure",
                    "Chemical Bonding",
                    "Thermochemistry",
                    "Organic Chemistry",
                    "Biochemistry",
                    "Analytical Chemistry",
                  ]}
                />
              </TabsContent>

              <TabsContent value="biology">
                <SubjectShowcase
                  title="Biology"
                  description="Learn about the living world and the processes that sustain life"
                  topics={[
                    "Cell Biology",
                    "Genetics",
                    "Evolution",
                    "Ecology",
                    "Physiology",
                    "Molecular Biology",
                  ]}
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section id="how-it-works" className="py-20 container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold">How it works</h2>
            <p className="text-foreground/70 mt-4 max-w-2xl mx-auto">
              Our AI-powered chatbot makes learning intuitive and engaging
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                icon: <MessageSquare className="h-12 w-12 text-purple-500" />,
                title: "Ask Anything",
                description:
                  "Type your question in natural language and get instant, personalized explanations from our AI tutor.",
              },
              {
                icon: <Sparkles className="h-12 w-12 text-blue-500" />,
                title: "See It Visualized",
                description:
                  "The AI generates custom interactive visualizations to help you understand complex concepts as you chat.",
              },
              {
                icon: <Zap className="h-12 w-12 text-indigo-500" />,
                title: "Deepen Understanding",
                description:
                  "Ask follow-up questions, request simpler explanations, or dive deeper into any topic in a natural conversation.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full border-primary/10 bg-background/50 backdrop-blur-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                  <div className="mb-6 flex justify-center">{item.icon}</div>
                  <h3 className="text-2xl font-semibold mb-4 text-center">
                    {item.title}
                  </h3>
                  <p className="text-foreground/70 text-center">
                    {item.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section
          id="benefits"
          className="py-20 bg-gradient-to-b from-primary/5 to-background"
        >
          <div
            className="relative h-[620px] w-full overflow-visible"
            ref={(node) => setContainer(node)}
          >
            <div className="absolute inset-0 w-full h-full">
              {featureCards.map(
                ({ bgColor, description, image, title }, index) => (
                  <motion.div
                    key={index}
                    className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
                    initial={{
                      scale: 0.9,
                      y: 0,
                      opacity: 0.5,
                      zIndex: featureCards.length - index,
                    }}
                    animate={{
                      scale:
                        index === activeCardIndex
                          ? 1
                          : 0.9 - Math.abs(index - activeCardIndex) * 0.05,
                      y:
                        index === activeCardIndex
                          ? 0
                          : 20 + Math.abs(index - activeCardIndex) * 10,
                      opacity:
                        index === activeCardIndex
                          ? 1
                          : 0.7 - Math.abs(index - activeCardIndex) * 0.15,
                      zIndex:
                        index === activeCardIndex
                          ? 10
                          : featureCards.length -
                            Math.abs(index - activeCardIndex),
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <div
                      className={`${bgColor} flex-col sm:flex-row px-8 py-10 flex w-11/12 max-w-5xl rounded-3xl mx-auto relative cursor-pointer`}
                      style={{
                        height: "auto",
                        minHeight: "300px",
                        transform: `perspective(1000px) rotateX(${
                          index === activeCardIndex
                            ? 0
                            : Math.abs(index - activeCardIndex) * 1
                        }deg)`,
                        boxShadow:
                          index === activeCardIndex
                            ? "0 10px 30px rgba(0,0,0,0.2)"
                            : "0 5px 15px rgba(0,0,0,0.1)",
                      }}
                      onClick={() => setActiveCardIndex(index)}
                    >
                      <div className="flex-1 flex flex-col justify-center text-white">
                        <h3 className="font-bold text-2xl mb-5">{title}</h3>
                        <p>{description}</p>
                      </div>

                      <div className="w-full sm:w-1/2 rounded-xl aspect-video relative overflow-hidden mt-6 sm:mt-0">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={title}
                          className="object-cover"
                          fill
                        />
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </div>

            {/* Navigation controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4 z-20">
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevCard}
                  className="h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous card</span>
                </Button>

                <div className="flex gap-1">
                  {featureCards.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveCardIndex(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === activeCardIndex
                          ? "w-6 bg-primary"
                          : "w-2 bg-primary/30"
                      }`}
                      aria-label={`Go to card ${index + 1}`}
                    />
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextCard}
                  className="h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20"
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next card</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 container">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl p-12 border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -z-10 transform -translate-x-1/2 translate-y-1/2"></div>

            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to transform your learning experience?
              </h2>
              <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
                Join thousands of students who are already learning faster and
                more effectively with our AI-powered chatbot.
              </p>

              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg group transition-all duration-300 text-lg px-8 py-3 h-auto min-h-[60px]"
                >
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    Start Chatting Today
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
