"use client";

import React, { useState, useRef, useEffect } from "react";
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
import { Send, Brain, User, Phone, Video, Info, Zap } from "lucide-react";

// Sample chat messages for demonstration
const defaultMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hi there! I'm your AI assistant. How can I help you today?",
    timestamp: "18:49",
    isNewGroup: true,
    dateMarker: "Today"
  },
];

interface ChatInterfaceProps {
  initialMessage?: string | null;
  useThinkingModel?: boolean;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isNewGroup?: boolean;
  dateMarker?: string;
}

export default function ChatInterface({ initialMessage, useThinkingModel = false }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to call the Gemini API
  const callGeminiAPI = async (message: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          history: chatHistory,
          useThinkingModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();

      // Update chat history for future API calls
      setChatHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: message }] },
        { role: 'model', parts: [{ text: data.responseText }] }
      ]);

      return data.responseText;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return 'Sorry, I encountered an error while processing your request. Please try again.';
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to format AI response as a single message
  const splitIntoMultipleMessages = (content: string): string[] => {
    // Clean up any excessive formatting like **** or multiple asterisks
    let cleanedContent = content
      .replace(/\*{2,}/g, '') // Remove multiple asterisks
      .replace(/\*\s*\*\s*\*/g, '') // Remove patterns like * * *
      .trim();

    // Return as a single message instead of splitting by paragraphs
    return [cleanedContent];
  };

  // Process initial message if provided
  useEffect(() => {
    if (initialMessage) {
      // Simulate user sending the initial message
      const userMessage: ChatMessage = {
        id: messages.length + 1,
        role: "user",
        content: initialMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isNewGroup: true,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Call the Gemini API with a slight delay to show typing indicator
      setTimeout(async () => {
        try {
          // Get response from Gemini API
          const response = await callGeminiAPI(initialMessage);

          // Split the response into multiple messages
          const responseMessages = splitIntoMultipleMessages(response);

          // Send messages one by one with typing indicator between each
          const sendMessages = async () => {
            for (let i = 0; i < responseMessages.length; i++) {
              const aiMessage: ChatMessage = {
                id: messages.length + 2 + i,
                role: "assistant",
                content: responseMessages[i],
                timestamp: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };

              setMessages((prev) => [...prev, aiMessage]);

              // If not the last message, show typing indicator before next message
              if (i < responseMessages.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
              }
            }
            setIsTyping(false);
          };

          sendMessages();
        } catch (error) {
          console.error("Error processing AI response:", error);
          // Add error message to chat
          const errorMessage: ChatMessage = {
            id: messages.length + 2,
            role: "assistant",
            content: "Sorry, I encountered an error while processing your request. Please try again.",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsTyping(false);
        }
      }, 1000);
    }
  }, [initialMessage, callGeminiAPI, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isNewGroup: messages.length > 0 &&
        messages[messages.length - 1].role !== "user" &&
        new Date().getTime() - new Date().setHours(
          parseInt(messages[messages.length - 1].timestamp.split(":")[0]),
          parseInt(messages[messages.length - 1].timestamp.split(":")[1])
        ) > 5 * 60 * 1000, // 5 minutes difference
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Call the Gemini API with a slight delay to show typing indicator
    setTimeout(async () => {
      try {
        // Get response from Gemini API
        const response = await callGeminiAPI(input);

        // Split the response into multiple messages
        const responseMessages = splitIntoMultipleMessages(response);

        // Send messages one by one with typing indicator between each
        const sendMessages = async () => {
          for (let i = 0; i < responseMessages.length; i++) {
            const aiMessage: ChatMessage = {
              id: messages.length + 2 + i,
              role: "assistant",
              content: responseMessages[i],
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };

            setMessages((prev) => [...prev, aiMessage]);

            // If not the last message, show typing indicator before next message
            if (i < responseMessages.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
            }
          }
          setIsTyping(false);
        };

        sendMessages();
      } catch (error) {
        console.error("Error processing AI response:", error);
        // Add error message to chat
        const errorMessage: ChatMessage = {
          id: messages.length + 2,
          role: "assistant",
          content: "Sorry, I encountered an error while processing your request. Please try again.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
      }
    }, 1000);
  };

  return (
    <Card className="flex flex-col h-full border-0 rounded-none shadow-none bg-black text-white">
      <CardHeader className="border-b border-gray-800 px-6 py-3 bg-black shadow-sm">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src="/metallic-gaze.png" />
                <AvatarFallback className="bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>
              <motion.div
                className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <CardTitle className="text-base font-medium">intelect AI</CardTitle>
              <p className="text-xs text-muted-foreground">Active now</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-6 bg-black">
        <div className="space-y-4 max-w-3xl mx-auto">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <React.Fragment key={message.id}>
                {/* Date marker */}
                {message.dateMarker && (
                  <div className="flex justify-center my-4">
                    <div className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">
                      {message.dateMarker}
                    </div>
                  </div>
                )}

                {/* Time marker for new message groups */}
                {message.isNewGroup && !message.dateMarker && (
                  <div className="flex justify-center my-3">
                    <div className="text-gray-500 text-xs">
                      {new Date().toLocaleString('en-US', { weekday: 'short' })} {message.timestamp}
                    </div>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } ${index > 0 && messages[index-1].role === message.role && !message.isNewGroup ? "mt-1" : "mt-3"}`}
                >
                  <div className={`flex items-start gap-2 ${message.role === "assistant" ? "max-w-[90%]" : "max-w-[80%]"}`}>
                    {/* AI Avatar - only show for first message in a group */}
                    {message.role === "assistant" && (index === 0 || messages[index-1].role !== "assistant" || message.isNewGroup) && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src="/metallic-gaze.png" />
                        <AvatarFallback className="bg-primary/10">
                          <Brain className="h-4 w-4 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Spacer for consecutive AI messages */}
                    {message.role === "assistant" && index > 0 && messages[index-1].role === "assistant" && !message.isNewGroup && (
                      <div className="w-8"></div>
                    )}

                    <div
                      className={`${message.role === "user"
                        ? "bg-blue-500 text-white rounded-2xl rounded-tr-sm p-3"
                        : "bg-gray-700 text-white rounded-2xl rounded-tl-sm p-4"
                      } ${index > 0 && messages[index-1].role === message.role && !message.isNewGroup
                        ? (message.role === "user" ? "rounded-tr-2xl" : "rounded-tl-2xl")
                        : ""}`}
                    >
                      <p className={`${message.role === "assistant" ? "text-sm leading-relaxed whitespace-pre-line" : "text-sm"}`}>{message.content}</p>
                    </div>

                    {/* User Avatar - only show for first message in a group */}
                    {message.role === "user" && (index === 0 || messages[index-1].role !== "user" || message.isNewGroup) && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src="/abstract-user-icon.png" />
                        <AvatarFallback className="bg-primary">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Spacer for consecutive user messages */}
                    {message.role === "user" && index > 0 && messages[index-1].role === "user" && !message.isNewGroup && (
                      <div className="w-8"></div>
                    )}
                  </div>
                </motion.div>
              </React.Fragment>
            ))}
          </AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mt-1"
            >
              <div className="flex items-start gap-2 max-w-[90%]">
                {messages.length > 0 && messages[messages.length-1].role === "assistant" ? (
                  <div className="w-8"></div>
                ) : (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src="/metallic-gaze.png" />
                    <AvatarFallback className="bg-primary/10">
                      <Brain className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="p-4 bg-gray-700 text-white rounded-2xl rounded-tl-sm">
                  <div className="flex gap-2 items-center h-5">
                    <div className="h-2 w-2 rounded-full bg-gray-300 animate-pulse"></div>
                    <div className="h-2 w-2 rounded-full bg-gray-300 animate-pulse [animation-delay:0.3s]"></div>
                    <div className="h-2 w-2 rounded-full bg-gray-300 animate-pulse [animation-delay:0.6s]"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-800 p-4 bg-black shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-3xl mx-auto gap-2"
        >
          <div className="relative flex-1">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              className="pl-4 pr-10 py-3 rounded-full border-gray-700 bg-gray-800 text-white shadow-sm focus:shadow-md transition-all duration-200 placeholder:text-gray-400"
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
            className="h-12 w-12 rounded-full shadow-sm bg-blue-500 hover:bg-blue-600"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
