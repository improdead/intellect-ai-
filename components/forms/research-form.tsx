"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clientDataService, SubjectWithIcon } from "@/lib/data-service";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Research title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  subject_id: z.string().optional(),
});

interface ResearchFormProps {
  userId: string;
  subjects: SubjectWithIcon[];
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export function ResearchForm({ userId, subjects, onSuccess, onCancel }: ResearchFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      subject_id: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const chatData = {
        user_id: userId,
        title: values.title,
        subject_id: values.subject_id,
      };

      const result = await clientDataService.createChatHistory(chatData);
      
      if (result) {
        // Create initial message with the description
        const messageData = {
          chat_id: result.id,
          role: "user",
          content: values.description,
        };
        
        await clientDataService.createChatMessage(messageData);
        
        toast.success("Research topic created successfully!");
        if (onSuccess) onSuccess(result);
        form.reset();
      } else {
        toast.error("Failed to create research topic. Please try again.");
      }
    } catch (error) {
      console.error("Error creating research topic:", error);
      toast.error("An error occurred while creating the research topic.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-medium">Create New Research Topic</h3>
        <p className="text-sm text-muted-foreground">
          Start a new research conversation with the AI tutor.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Research Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Quantum Physics Fundamentals" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial Question or Topic</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What would you like to learn about this topic? Ask a specific question to start the research..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name || subject.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Start Research"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
