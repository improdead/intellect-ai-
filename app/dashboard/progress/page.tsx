"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Atom,
  Calculator,
  FlaskRoundIcon as Flask,
  Leaf,
  Trophy,
  Clock,
  Calendar,
  BarChart2,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Clock3,
} from "lucide-react";

// Sample data for charts
const weeklyProgressData = [
  { day: "Mon", minutes: 45, topics: 3 },
  { day: "Tue", minutes: 60, topics: 4 },
  { day: "Wed", minutes: 30, topics: 2 },
  { day: "Thu", minutes: 75, topics: 5 },
  { day: "Fri", minutes: 90, topics: 6 },
  { day: "Sat", minutes: 120, topics: 8 },
  { day: "Sun", minutes: 60, topics: 4 },
];

const subjectProgressData = [
  { subject: "Physics", progress: 68, color: "#7c3aed" },
  { subject: "Math", progress: 82, color: "#3b82f6" },
  { subject: "Chemistry", progress: 45, color: "#10b981" },
  { subject: "Biology", progress: 59, color: "#f59e0b" },
];

const recentTopics = [
  {
    id: 1,
    name: "Newton's Laws of Motion",
    subject: "Physics",
    progress: 85,
    icon: <Atom className="h-5 w-5" />,
    lastStudied: "2 hours ago",
  },
  {
    id: 2,
    name: "Calculus Fundamentals",
    subject: "Math",
    progress: 72,
    icon: <Calculator className="h-5 w-5" />,
    lastStudied: "Yesterday",
  },
  {
    id: 3,
    name: "Periodic Table",
    subject: "Chemistry",
    progress: 45,
    icon: <Flask className="h-5 w-5" />,
    lastStudied: "3 days ago",
  },
  {
    id: 4,
    name: "Cell Biology",
    subject: "Biology",
    progress: 60,
    icon: <Leaf className="h-5 w-5" />,
    lastStudied: "1 week ago",
  },
];

const achievements = [
  {
    id: 1,
    name: "Physics Master",
    description: "Complete all physics modules",
    progress: 85,
    icon: <Trophy className="h-10 w-10 text-amber-500" />,
    date: "In progress",
  },
  {
    id: 2,
    name: "Consistent Learner",
    description: "Study for 7 days in a row",
    progress: 100,
    icon: <Calendar className="h-10 w-10 text-emerald-500" />,
    date: "Achieved on May 15",
  },
  {
    id: 3,
    name: "Quiz Champion",
    description: "Score 100% on 5 quizzes",
    progress: 60,
    icon: <CheckCircle2 className="h-10 w-10 text-blue-500" />,
    date: "In progress (3/5)",
  },
  {
    id: 4,
    name: "Study Enthusiast",
    description: "Spend 10+ hours studying",
    progress: 70,
    icon: <Clock3 className="h-10 w-10 text-purple-500" />,
    date: "In progress (7/10 hours)",
  },
];

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Learning Progress</h1>
          <p className="text-foreground/70">
            Track your achievements and study patterns
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-primary/20 hover:bg-primary/5"
          >
            <Calendar className="h-4 w-4 mr-2" />
            This Week
          </Button>
          <Button
            variant="outline"
            className="border-primary/20 hover:bg-primary/5"
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                title: "Study Time",
                value: "14.5 hours",
                change: "+2.5 hours",
                description: "vs. last week",
                icon: <Clock className="h-5 w-5 text-blue-500" />,
              },
              {
                title: "Topics Covered",
                value: "32",
                change: "+8",
                description: "vs. last week",
                icon: <BarChart2 className="h-5 w-5 text-purple-500" />,
              },
              {
                title: "Quiz Score",
                value: "85%",
                change: "+5%",
                description: "vs. last week",
                icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
              },
              {
                title: "Streak",
                value: "7 days",
                change: "",
                description: "Current streak",
                icon: <Trophy className="h-5 w-5 text-amber-500" />,
              },
            ].map((stat, i) => (
              <Card key={i} className="border-primary/10">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-foreground/70">{stat.title}</p>
                      <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                      {stat.change && (
                        <div className="flex items-center mt-1 text-xs text-emerald-500">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          {stat.change}
                          <span className="text-foreground/60 ml-1">
                            {stat.description}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-2 rounded-full bg-primary/10">
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Weekly Progress Chart */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Weekly Study Progress</CardTitle>
              <CardDescription>
                Your study time and topics covered this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  minutes: {
                    label: "Minutes Studied",
                    color: "hsl(var(--chart-1))",
                  },
                  topics: {
                    label: "Topics Covered",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={weeklyProgressData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="minutes"
                      stroke="var(--color-minutes)"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="topics"
                      stroke="var(--color-topics)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Recent Topics */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Recently Studied Topics</CardTitle>
              <CardDescription>
                Your progress on recently studied topics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        {topic.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{topic.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {topic.subject}
                          </Badge>
                          <span className="text-xs text-foreground/60">
                            Last studied: {topic.lastStudied}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <Progress value={topic.progress} className="h-2" />
                      </div>
                      <span className="text-sm font-medium">
                        {topic.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          {/* Subject Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Subject Progress</CardTitle>
                <CardDescription>
                  Your progress across different subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={subjectProgressData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={true}
                        vertical={false}
                        opacity={0.2}
                      />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="subject" type="category" width={80} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Progress"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Bar
                        dataKey="progress"
                        radius={[0, 4, 4, 0]}
                        barSize={20}
                      >
                        {subjectProgressData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle>Subject Details</CardTitle>
                <CardDescription>
                  Detailed breakdown of your subject progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {subjectProgressData.map((subject, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          {i === 0 && <Atom className="h-5 w-5" />}
                          {i === 1 && <Calculator className="h-5 w-5" />}
                          {i === 2 && <Flask className="h-5 w-5" />}
                          {i === 3 && <Leaf className="h-5 w-5" />}
                          <h4 className="font-medium">{subject.subject}</h4>
                        </div>
                        <span className="text-sm font-medium">
                          {subject.progress}%
                        </span>
                      </div>
                      <Progress
                        value={subject.progress}
                        className="h-2"
                        indicatorColor={subject.color}
                      />
                      <div className="flex justify-between text-xs text-foreground/60 mt-1">
                        <span>
                          Topics:{" "}
                          {i === 0
                            ? "8/12"
                            : i === 1
                            ? "10/12"
                            : i === 2
                            ? "5/11"
                            : "7/12"}
                        </span>
                        <span>
                          Quizzes:{" "}
                          {i === 0
                            ? "4/6"
                            : i === 1
                            ? "5/6"
                            : i === 2
                            ? "3/6"
                            : "4/6"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Next Steps */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Recommended Next Steps</CardTitle>
              <CardDescription>
                Based on your progress and learning patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Complete Chemistry Module",
                    description:
                      "You're 45% through - finish the Periodic Table section",
                    icon: <Flask className="h-5 w-5 text-emerald-500" />,
                    time: "Est. 2 hours",
                  },
                  {
                    title: "Take Physics Quiz",
                    description:
                      "Test your knowledge on Newton's Laws of Motion",
                    icon: <Atom className="h-5 w-5 text-blue-500" />,
                    time: "Est. 30 minutes",
                  },
                  {
                    title: "Review Math Concepts",
                    description:
                      "Strengthen your understanding of calculus fundamentals",
                    icon: <Calculator className="h-5 w-5 text-purple-500" />,
                    time: "Est. 1 hour",
                  },
                ].map((item, i) => (
                  <Card key={i} className="border-primary/10 bg-primary/5">
                    <CardContent className="p-6">
                      <div className="flex flex-col h-full">
                        <div className="p-2 w-fit rounded-full bg-background mb-4">
                          {item.icon}
                        </div>
                        <h4 className="font-medium mb-2">{item.title}</h4>
                        <p className="text-sm text-foreground/70 mb-4">
                          {item.description}
                        </p>
                        <div className="mt-auto flex justify-between items-center">
                          <span className="text-xs text-foreground/60">
                            {item.time}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                          >
                            Start <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {/* Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="border-primary/10">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="p-4 rounded-full bg-primary/10 h-fit">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">
                          {achievement.name}
                        </h3>
                        <Badge
                          variant={
                            achievement.progress === 100 ? "default" : "outline"
                          }
                        >
                          {achievement.progress === 100
                            ? "Completed"
                            : "In Progress"}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground/70 mb-4">
                        {achievement.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <Progress
                          value={achievement.progress}
                          className="h-2"
                        />
                        <div className="text-xs text-foreground/60">
                          {achievement.date}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upcoming Achievements */}
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Upcoming Achievements</CardTitle>
              <CardDescription>
                Achievements you're close to unlocking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Biology Expert",
                    description: "Complete all biology modules",
                    progress: 59,
                    icon: <Leaf className="h-5 w-5 text-emerald-500" />,
                  },
                  {
                    name: "Study Marathon",
                    description: "Study for 5 hours in a single day",
                    progress: 80,
                    icon: <Clock className="h-5 w-5 text-blue-500" />,
                  },
                ].map((achievement, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-medium">{achievement.name}</h4>
                        <span className="text-sm">{achievement.progress}%</span>
                      </div>
                      <p className="text-xs text-foreground/70 mb-2">
                        {achievement.description}
                      </p>
                      <Progress
                        value={achievement.progress}
                        className="h-1.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
