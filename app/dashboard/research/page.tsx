"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"

// Sample research data
const researchTopics = [
  {
    id: 1,
    title: "Quantum Mechanics",
    subject: "Physics",
    icon: <Atom className="h-5 w-5" />,
    resources: 24,
    lastUpdated: "2 days ago",
    progress: 65,
  },
  {
    id: 2,
    title: "Advanced Calculus",
    subject: "Math",
    icon: <Calculator className="h-5 w-5" />,
    resources: 18,
    lastUpdated: "1 week ago",
    progress: 42,
  },
  {
    id: 3,
    title: "Organic Chemistry",
    subject: "Chemistry",
    icon: <Flask className="h-5 w-5" />,
    resources: 31,
    lastUpdated: "3 days ago",
    progress: 78,
  },
  {
    id: 4,
    title: "Genetics and Evolution",
    subject: "Biology",
    icon: <Leaf className="h-5 w-5" />,
    resources: 15,
    lastUpdated: "5 days ago",
    progress: 23,
  },
]

const searchResults = [
  {
    id: 101,
    title: "Introduction to Quantum Physics",
    type: "article",
    source: "Science Journal",
    date: "2023-04-15",
    description:
      "A comprehensive introduction to the principles of quantum mechanics and its applications in modern physics.",
    icon: <FileText className="h-5 w-5" />,
    rating: 4.8,
    subject: "Physics",
  },
  {
    id: 102,
    title: "Quantum Mechanics Explained",
    type: "video",
    source: "Educational Videos",
    date: "2023-03-22",
    description: "Visual explanation of quantum mechanics concepts with interactive simulations and examples.",
    icon: <Video className="h-5 w-5" />,
    rating: 4.5,
    subject: "Physics",
    duration: "32 min",
  },
  {
    id: 103,
    title: "Quantum Entanglement and Superposition",
    type: "research",
    source: "Physics Research Institute",
    date: "2023-05-01",
    description:
      "Detailed research paper on quantum entanglement, superposition, and their implications for quantum computing.",
    icon: <BookOpen className="h-5 w-5" />,
    rating: 4.9,
    subject: "Physics",
  },
  {
    id: 104,
    title: "Visualizing Quantum Wave Functions",
    type: "interactive",
    source: "Interactive Science",
    date: "2023-02-10",
    description: "Interactive tool for visualizing quantum wave functions and understanding probability distributions.",
    icon: <ImageIcon className="h-5 w-5" />,
    rating: 4.7,
    subject: "Physics",
  },
]

const recommendedResources = [
  {
    id: 201,
    title: "The Quantum World: Particle Physics for Everyone",
    type: "book",
    author: "Dr. Richard Maxwell",
    description: "An accessible introduction to quantum physics for non-specialists.",
    icon: <BookOpen className="h-5 w-5" />,
    subject: "Physics",
  },
  {
    id: 202,
    title: "Quantum Computing: The Next Frontier",
    type: "article",
    author: "Quantum Research Institute",
    description: "Exploring the potential of quantum computing to revolutionize technology.",
    icon: <FileText className="h-5 w-5" />,
    subject: "Physics",
  },
  {
    id: 203,
    title: "Understanding Wave-Particle Duality",
    type: "video",
    author: "Science Explained",
    description: "Visual explanation of the wave-particle duality concept in quantum mechanics.",
    icon: <Video className="h-5 w-5" />,
    subject: "Physics",
    duration: "18 min",
  },
]

export default function ResearchPage() {
  const [activeTab, setActiveTab] = useState("topics")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearching(true)
      setActiveTab("results")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Deep Research</h1>
          <p className="text-foreground/70">Explore topics in depth and save resources for later</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
            <Input
              placeholder="Search for topics, concepts, or resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-primary/20 focus-visible:ring-primary/30"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <Tabs defaultValue="topics" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="topics">My Topics</TabsTrigger>
          <TabsTrigger value="results">Search Results</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Research Topics</h2>
            <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
              <Plus className="h-4 w-4 mr-2" />
              New Topic
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {researchTopics.map((topic) => (
              <Card key={topic.id} className="border-primary/10 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">{topic.icon}</div>
                      <div>
                        <CardTitle>{topic.title}</CardTitle>
                        <CardDescription>{topic.subject}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{topic.resources} Resources</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm text-foreground/70 mb-2">
                    <span>Progress</span>
                    <span>{topic.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${topic.progress}%` }}></div>
                  </div>
                  <p className="text-xs text-foreground/60 mt-2">Last updated: {topic.lastUpdated}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20">
                    Continue Research
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Card className="border-primary/10 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 rounded-full bg-primary/10">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-semibold mb-2">Need research assistance?</h3>
                  <p className="text-foreground/70 mb-4">
                    Our AI can help you find resources, summarize content, and create study materials for any topic.
                  </p>
                  <Button>Get AI Assistance</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {isSearching && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Search Results for "{searchQuery}"</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/5">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/5">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Sort
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {searchResults.map((result) => (
                  <Card key={result.id} className="border-primary/10">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 h-fit">{result.icon}</div>
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                            <h3 className="font-semibold">{result.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {result.type}
                              </Badge>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                <span className="text-xs ml-1">{result.rating}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-foreground/70 mb-3">{result.description}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground/60">
                            <span>Source: {result.source}</span>
                            <span>Date: {result.date}</span>
                            <span>Subject: {result.subject}</span>
                            {result.duration && <span>Duration: {result.duration}</span>}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <Button size="sm" variant="outline" className="h-8 border-primary/20 hover:bg-primary/5">
                              <Bookmark className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 border-primary/20 hover:bg-primary/5">
                              <Share2 className="h-3 w-3 mr-1" />
                              Share
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 border-primary/20 hover:bg-primary/5">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="space-y-6">
          <h2 className="text-xl font-semibold">Recommended for You</h2>
          <p className="text-foreground/70">Based on your research topics and learning patterns</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedResources.map((resource) => (
              <Card key={resource.id} className="border-primary/10">
                <CardContent className="p-6">
                  <div className="flex flex-col h-full">
                    <div className="p-2 w-fit rounded-full bg-primary/10 mb-4">{resource.icon}</div>
                    <h3 className="font-medium mb-2">{resource.title}</h3>
                    <p className="text-sm text-foreground/70 mb-2">{resource.description}</p>
                    <div className="text-xs text-foreground/60 mb-4">
                      <div>Type: {resource.type}</div>
                      <div>By: {resource.author}</div>
                      <div>Subject: {resource.subject}</div>
                      {resource.duration && <div>Duration: {resource.duration}</div>}
                    </div>
                    <div className="mt-auto">
                      <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20">View Resource</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Research Topics You Might Like</CardTitle>
              <CardDescription>Expand your knowledge with these related topics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Quantum Computing",
                    description: "Explore the intersection of quantum mechanics and computer science",
                    icon: <Atom className="h-5 w-5 text-blue-500" />,
                    resources: 42,
                  },
                  {
                    title: "String Theory",
                    description:
                      "Theoretical framework in physics that attempts to reconcile quantum mechanics and general relativity",
                    icon: <Atom className="h-5 w-5 text-purple-500" />,
                    resources: 28,
                  },
                ].map((topic, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-lg border border-primary/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <div className="p-2 rounded-full bg-primary/10 h-fit">{topic.icon}</div>
                    <div>
                      <h4 className="font-medium">{topic.title}</h4>
                      <p className="text-sm text-foreground/70 mb-2">{topic.description}</p>
                      <Badge variant="outline" className="text-xs">
                        {topic.resources} Resources
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
