"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
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
import { Send, Brain, User, Sparkles, Lightbulb, Zap } from "lucide-react";

// Sample chat messages for demonstration
const defaultMessages = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hi there! I'm your AI tutor for physics. What would you like to learn about today?",
    timestamp: "18:49",
  },
];

interface ChatInterfaceProps {
  initialMessage?: string | null;
}

export default function ChatInterface({ initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Process initial message if provided
  useEffect(() => {
    if (initialMessage) {
      // Simulate user sending the initial message
      const userMessage = {
        id: messages.length + 1,
        role: "user",
        content: initialMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Simulate AI response
      setTimeout(() => {
        let response = "";

        // Simple response logic based on user input
        const lowerInput = initialMessage.toLowerCase();
        if (
          lowerInput.includes("newton") ||
          lowerInput.includes("law") ||
          lowerInput.includes("motion")
        ) {
          response =
            "Newton's Three Laws of Motion are fundamental principles in physics. The first law states that an object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force. The second law states that force equals mass times acceleration (F=ma). The third law states that for every action, there is an equal and opposite reaction.";
        } else if (
          lowerInput.includes("gravity") ||
          lowerInput.includes("fall")
        ) {
          response =
            "Gravity is the force that attracts objects toward each other. On Earth, objects fall due to gravity with an acceleration of approximately 9.8 m/s². The gravitational force between two objects is proportional to the product of their masses and inversely proportional to the square of the distance between them.";
        } else if (
          lowerInput.includes("energy") ||
          lowerInput.includes("conservation")
        ) {
          response =
            "The law of conservation of energy states that energy cannot be created or destroyed, only transformed from one form to another. In a closed system, the total energy remains constant. This is one of the most fundamental principles in physics.";
        } else if (
          lowerInput.includes("quantum") ||
          lowerInput.includes("physics")
        ) {
          response =
            "Quantum physics is a branch of physics that deals with the behavior of matter and energy at the smallest scales. It introduces concepts like wave-particle duality, quantum entanglement, and the uncertainty principle that challenge our classical understanding of physics.";
        } else {
          response = `I'd be happy to help you learn about "${initialMessage}". Would you like me to explain the basic principles, or would you prefer a more detailed explanation with examples?`;
        }

        const aiMessage = {
          id: messages.length + 2,
          role: "assistant",
          content: response,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500);
    }
  }, [initialMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      let response = "";

      // Simple response logic based on user input
      const lowerInput = input.toLowerCase();
      if (
        lowerInput.includes("newton") ||
        lowerInput.includes("law") ||
        lowerInput.includes("motion")
      ) {
        response =
          "Newton's Three Laws of Motion are fundamental principles in physics. The first law states that an object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force. The second law states that force equals mass times acceleration (F=ma). The third law states that for every action, there is an equal and opposite reaction.";
      } else if (
        lowerInput.includes("gravity") ||
        lowerInput.includes("fall")
      ) {
        response =
          "Gravity is the force that attracts objects toward each other. On Earth, objects fall due to gravity with an acceleration of approximately 9.8 m/s². The gravitational force between two objects is proportional to the product of their masses and inversely proportional to the square of the distance between them.";
      } else if (
        lowerInput.includes("energy") ||
        lowerInput.includes("conservation")
      ) {
        response =
          "The law of conservation of energy states that energy cannot be created or destroyed, only transformed from one form to another. In a closed system, the total energy remains constant. This is one of the most fundamental principles in physics.";
      } else {
        response =
          "That's an interesting question about physics! Would you like me to explain the basic principles involved, or would you prefer a more detailed explanation with examples?";
      }

      const aiMessage = {
        id: messages.length + 2,
        role: "assistant",
        content: response,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <Card className="flex flex-col h-full border-0 rounded-none shadow-none bg-card/50">
      <CardHeader className="border-b px-6 py-4 bg-card shadow-sm">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="relative">
            <Brain className="h-5 w-5 text-primary" />
            <motion.div
              className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span>Chat with AI Tutor</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-6 bg-grid-pattern">
        <div className="space-y-6 max-w-3xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex items-start gap-3 max-w-[85%]">
                  {message.role === "assistant" && (
                    <div className="relative">
                      <Avatar className="h-10 w-10 mt-1 border-2 border-primary/20 shadow-sm">
                        <AvatarImage src="/metallic-gaze.png" />
                        <AvatarFallback className="bg-primary/10">
                          <Brain className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      {message.id === 1 && (
                        <motion.div
                          className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>
                  )}
                  <div
                    className={`rounded-xl p-4 shadow-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex gap-2">
                        {message.role === "assistant" && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
                            >
                              <Lightbulb className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
                            >
                              <Sparkles className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs opacity-70">{message.timestamp}</p>
                    </div>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-10 w-10 mt-1 border-2 border-primary/20 shadow-sm">
                      <AvatarImage src="/abstract-user-icon.png" />
                      <AvatarFallback className="bg-primary">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start gap-3 max-w-[85%]">
                <Avatar className="h-10 w-10 mt-1 border-2 border-primary/20 shadow-sm">
                  <AvatarImage src="/metallic-gaze.png" />
                  <AvatarFallback className="bg-primary/10">
                    <Brain className="h-5 w-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-xl bg-card border border-border p-4 shadow-sm">
                  <div className="flex gap-2 items-center">
                    <div className="h-2 w-2 rounded-full bg-primary/60 animate-pulse"></div>
                    <div className="h-2 w-2 rounded-full bg-primary/60 animate-pulse [animation-delay:0.3s]"></div>
                    <div className="h-2 w-2 rounded-full bg-primary/60 animate-pulse [animation-delay:0.6s]"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t p-6 bg-card shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-3xl mx-auto gap-3"
        >
          <div className="relative flex-1">
            <Input
              placeholder="Ask about any physics concept..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              className="pl-4 pr-10 py-6 rounded-xl border-primary/20 bg-card/80 shadow-sm focus:shadow-md transition-all duration-200"
            />
            {!isTyping && input.trim() && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
              >
                <Zap className="h-5 w-5 opacity-70" />
              </motion.div>
            )}
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={isTyping || !input.trim()}
            className="h-12 w-12 rounded-xl shadow-sm"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
