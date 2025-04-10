"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Atom,
  Calculator,
  FlaskRoundIcon as Flask,
  Leaf,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Star,
  BarChart2,
  ArrowRight,
  Filter,
} from "lucide-react"

// Sample quiz data
const availableQuizzes = [
  {
    id: 1,
    title: "Newton's Laws of Motion",
    subject: "Physics",
    icon: <Atom className="h-5 w-5" />,
    questions: 10,
    timeEstimate: "15 min",
    difficulty: "Intermediate",
    description: "Test your understanding of Newton's three laws of motion and their applications.",
  },
  {
    id: 2,
    title: "Calculus Fundamentals",
    subject: "Math",
    icon: <Calculator className="h-5 w-5" />,
    questions: 12,
    timeEstimate: "20 min",
    difficulty: "Advanced",
    description: "Challenge yourself with derivatives, integrals, and applications of calculus.",
  },
  {
    id: 3,
    title: "Periodic Table Elements",
    subject: "Chemistry",
    icon: <Flask className="h-5 w-5" />,
    questions: 15,
    timeEstimate: "25 min",
    difficulty: "Intermediate",
    description: "Identify elements, their properties, and their positions in the periodic table.",
  },
  {
    id: 4,
    title: "Cell Structure and Function",
    subject: "Biology",
    icon: <Leaf className="h-5 w-5" />,
    questions: 8,
    timeEstimate: "12 min",
    difficulty: "Beginner",
    description: "Explore the basic components of cells and their functions in living organisms.",
  },
]

const completedQuizzes = [
  {
    id: 101,
    title: "Quantum Mechanics Basics",
    subject: "Physics",
    icon: <Atom className="h-5 w-5" />,
    score: 85,
    date: "May 15, 2023",
    questions: 10,
  },
  {
    id: 102,
    title: "Algebra Fundamentals",
    subject: "Math",
    icon: <Calculator className="h-5 w-5" />,
    score: 92,
    date: "May 10, 2023",
    questions: 12,
  },
  {
    id: 103,
    title: "Chemical Reactions",
    subject: "Chemistry",
    icon: <Flask className="h-5 w-5" />,
    score: 78,
    date: "May 5, 2023",
    questions: 15,
  },
]

// Sample quiz questions
const sampleQuizQuestions = [
  {
    id: 1,
    question: "What is Newton's First Law of Motion?",
    options: [
      "An object in motion stays in motion unless acted upon by an external force.",
      "Force equals mass times acceleration.",
      "For every action, there is an equal and opposite reaction.",
      "Objects attract each other with a force proportional to their masses.",
    ],
    correctAnswer: 0,
  },
  {
    id: 2,
    question: "What is Newton's Second Law of Motion?",
    options: [
      "An object in motion stays in motion unless acted upon by an external force.",
      "Force equals mass times acceleration.",
      "For every action, there is an equal and opposite reaction.",
      "Objects attract each other with a force proportional to their masses.",
    ],
    correctAnswer: 1,
  },
  {
    id: 3,
    question: "What is Newton's Third Law of Motion?",
    options: [
      "An object in motion stays in motion unless acted upon by an external force.",
      "Force equals mass times acceleration.",
      "For every action, there is an equal and opposite reaction.",
      "Objects attract each other with a force proportional to their masses.",
    ],
    correctAnswer: 2,
  },
]

export default function QuizPage() {
  const [activeTab, setActiveTab] = useState("available")
  const [activeQuiz, setActiveQuiz] = useState<number | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [quizResults, setQuizResults] = useState<{
    correct: number
    total: number
    answers: { questionId: number; isCorrect: boolean }[]
  } | null>(null)

  const startQuiz = (quizId: number) => {
    setActiveQuiz(quizId)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setIsAnswerSubmitted(false)
    setQuizResults(null)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answerIndex)
    }
  }

  const submitAnswer = () => {
    if (selectedAnswer !== null) {
      setIsAnswerSubmitted(true)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < sampleQuizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setIsAnswerSubmitted(false)
    } else {
      // End of quiz
      setQuizResults({
        correct: 2, // Simulated result
        total: sampleQuizQuestions.length,
        answers: sampleQuizQuestions.map((q, i) => ({
          questionId: q.id,
          isCorrect: i % 2 === 0, // Simulated correct/incorrect pattern
        })),
      })
    }
  }

  const exitQuiz = () => {
    setActiveQuiz(null)
    setQuizResults(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <AnimatePresence mode="wait">
        {activeQuiz === null ? (
          <motion.div
            key="quiz-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold">Quizzes</h1>
                <p className="text-foreground/70">Test your knowledge and track your progress</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  View Stats
                </Button>
              </div>
            </div>

            <Tabs defaultValue="available" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="available">Available Quizzes</TabsTrigger>
                <TabsTrigger value="completed">Completed Quizzes</TabsTrigger>
              </TabsList>

              <TabsContent value="available" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {availableQuizzes.map((quiz) => (
                    <Card key={quiz.id} className="border-primary/10 hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">{quiz.icon}</div>
                            <div>
                              <CardTitle>{quiz.title}</CardTitle>
                              <CardDescription>{quiz.subject}</CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              quiz.difficulty === "Beginner"
                                ? "bg-green-500/10 text-green-500"
                                : quiz.difficulty === "Intermediate"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : "bg-purple-500/10 text-purple-500"
                            }
                          >
                            {quiz.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-foreground/70 mb-4">{quiz.description}</p>
                        <div className="flex justify-between text-sm text-foreground/70">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            <span>{quiz.questions} questions</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{quiz.timeEstimate}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          className="w-full bg-primary/10 text-primary hover:bg-primary/20"
                          onClick={() => startQuiz(quiz.id)}
                        >
                          Start Quiz
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {completedQuizzes.map((quiz) => (
                    <Card key={quiz.id} className="border-primary/10">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">{quiz.icon}</div>
                            <div>
                              <h3 className="font-medium">{quiz.title}</h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{quiz.subject}</Badge>
                                <span className="text-xs text-foreground/60">Completed: {quiz.date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <div className="flex">
                                {[...Array(Math.floor(quiz.score / 20))].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                                ))}
                                {[...Array(5 - Math.floor(quiz.score / 20))].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 text-foreground/20" />
                                ))}
                              </div>
                              <span className="font-medium ml-2">{quiz.score}%</span>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 border-primary/20 hover:bg-primary/5">
                              Review
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : (
          <motion.div
            key="active-quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {quizResults === null ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold">{availableQuizzes.find((q) => q.id === activeQuiz)?.title}</h1>
                    <p className="text-foreground/70">
                      Question {currentQuestion + 1} of {sampleQuizQuestions.length}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exitQuiz}
                    className="border-primary/20 hover:bg-primary/5"
                  >
                    Exit Quiz
                  </Button>
                </div>

                <Progress value={((currentQuestion + 1) / sampleQuizQuestions.length) * 100} className="h-2" />

                <Card className="border-primary/10">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-medium mb-6">{sampleQuizQuestions[currentQuestion].question}</h2>
                    <div className="space-y-3">
                      {sampleQuizQuestions[currentQuestion].options.map((option, index) => {
                        const isCorrect = index === sampleQuizQuestions[currentQuestion].correctAnswer
                        const isSelected = selectedAnswer === index

                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? isAnswerSubmitted
                                  ? isCorrect
                                    ? "border-green-500 bg-green-500/10"
                                    : "border-red-500 bg-red-500/10"
                                  : "border-primary bg-primary/10"
                                : "border-primary/10 hover:border-primary/30 hover:bg-primary/5"
                            }`}
                            onClick={() => handleAnswerSelect(index)}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option}</span>
                              {isAnswerSubmitted &&
                                (isCorrect ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  isSelected && <XCircle className="h-5 w-5 text-red-500" />
                                ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center gap-1 text-foreground/60">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Time remaining: 2:45</span>
                    </div>
                    {isAnswerSubmitted ? (
                      <Button onClick={nextQuestion}>
                        {currentQuestion < sampleQuizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={submitAnswer} disabled={selectedAnswer === null}>
                        Submit Answer
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                <Card className="border-primary/10">
                  <CardHeader>
                    <CardTitle className="text-center">Quiz Results</CardTitle>
                    <CardDescription className="text-center">
                      {availableQuizzes.find((q) => q.id === activeQuiz)?.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center mb-8">
                      <div className="relative w-32 h-32 mb-4">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="hsl(var(--primary) / 0.2)"
                              strokeWidth="10"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="hsl(var(--primary))"
                              strokeWidth="10"
                              strokeDasharray={`${2 * Math.PI * 45}`}
                              strokeDashoffset={`${2 * Math.PI * 45 * (1 - quizResults.correct / quizResults.total)}`}
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-3xl font-bold">
                                {Math.round((quizResults.correct / quizResults.total) * 100)}%
                              </div>
                              <div className="text-sm text-foreground/70">Score</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-center mb-2">
                        <h3 className="text-xl font-medium">
                          {quizResults.correct} out of {quizResults.total} correct
                        </h3>
                        <p className="text-foreground/70">
                          {quizResults.correct >= quizResults.total / 2 ? "Great job!" : "Keep practicing!"}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {quizResults.correct === quizResults.total ? (
                          <Badge className="bg-green-500">Perfect Score</Badge>
                        ) : quizResults.correct >= quizResults.total * 0.8 ? (
                          <Badge className="bg-blue-500">Excellent</Badge>
                        ) : quizResults.correct >= quizResults.total * 0.6 ? (
                          <Badge className="bg-amber-500">Good</Badge>
                        ) : (
                          <Badge className="bg-red-500">Needs Improvement</Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <h3 className="font-medium">Question Summary</h3>
                      {quizResults.answers.map((answer, index) => (
                        <div key={index} className="flex items-center gap-3">
                          {answer.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                          )}
                          <div className="text-sm">
                            Question {index + 1}: {sampleQuizQuestions[index].question}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={exitQuiz} className="border-primary/20 hover:bg-primary/5">
                      Back to Quizzes
                    </Button>
                    <Button>Review Answers</Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
