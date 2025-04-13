"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { clientDataService, SubjectWithIcon } from "@/lib/data-service";
import { researchService } from "@/lib/research-service";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Research title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  subject_id: z.string().optional(),
  // These will be handled separately, not through the form validation
  preferredSources: z.array(z.string()).optional(),
  excludedSources: z.array(z.string()).optional(),
});

interface ResearchFormProps {
  userId: string;
  subjects: SubjectWithIcon[];
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export function ResearchForm({
  userId,
  subjects,
  onSuccess,
  onCancel,
}: ResearchFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferredSources, setPreferredSources] = useState<string[]>([]);
  const [excludedSources, setExcludedSources] = useState<string[]>([]);
  const [newSource, setNewSource] = useState("");

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
      const payload = {
        title: values.title,
        description: values.description,
        subject_id: values.subject_id,
        preferredSources: preferredSources,
        excludedSources: excludedSources,
      };

      console.log("Submitting research topic:", payload);

      // Call the new API route
      const response = await fetch("/api/research/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Parse response
      const result = await response.json();
      console.log("API response:", result);

      if (response.ok && result) {
        toast.success("Research topic created successfully!");

        // Verify chat_id is present
        if (result.chat_id) {
          console.log("Research topic created with chat_id:", result.chat_id);

          // Begin multi-stage loading process with feedback
          const loadingToast = toast.loading(
            "Setting up your research experience..."
          );

          // Give the database a moment to finalize all connections
          setTimeout(() => {
            toast.dismiss(loadingToast);
            const redirectToast = toast.loading(
              "Redirecting to research chat..."
            );

            // Final redirection after short delay to show feedback
            setTimeout(() => {
              toast.dismiss(redirectToast);
              // Make sure we pass the chat_id for proper redirection
              if (onSuccess) onSuccess({ id: result.chat_id || result.id });
              form.reset();
              setPreferredSources([]);
              setExcludedSources([]);
              setNewSource("");
            }, 1000);
          }, 1500);
        } else {
          console.error("No chat_id returned from API:", result);
          toast.error(
            "Research topic created but chat setup failed. Please try again."
          );
          if (onSuccess) onSuccess(result); // Still call success to refresh list
        }
      } else {
        console.error("API Error:", result);
        toast.error(
          result.error || "Failed to create research topic. Please try again."
        );
      }
    } catch (error) {
      console.error("Error submitting research topic form:", error);
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
                  <Input
                    placeholder="e.g., Quantum Physics Fundamentals"
                    {...field}
                  />
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
                    className="min-h-[80px] max-h-[150px]"
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

          {/* Source Preferences */}
          <div className="space-y-4 border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">
                Source Preferences (Optional)
              </h4>
              <p className="text-xs text-muted-foreground">
                Help refine your research results
              </p>
            </div>

            {/* Add Source Input */}
            <div className="relative">
              <Input
                placeholder="Add source (e.g., wikipedia.org)"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                className="pr-[180px] h-10"
              />
              <div className="absolute right-1 top-1 flex space-x-1">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-8 px-3 rounded-md"
                  onClick={() => {
                    if (newSource.trim()) {
                      setPreferredSources([
                        ...preferredSources,
                        newSource.trim(),
                      ]);
                      setNewSource("");
                    }
                  }}
                  disabled={!newSource.trim()}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Prefer
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 rounded-md"
                  onClick={() => {
                    if (newSource.trim()) {
                      setExcludedSources([
                        ...excludedSources,
                        newSource.trim(),
                      ]);
                      setNewSource("");
                    }
                  }}
                  disabled={!newSource.trim()}
                >
                  <X className="h-3.5 w-3.5 mr-1" /> Exclude
                </Button>
              </div>
            </div>

            {/* Sources Lists */}
            <div className="grid grid-cols-2 gap-4">
              {/* Preferred Sources */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-xs font-medium text-foreground">
                    Preferred Sources
                  </FormLabel>
                  {preferredSources.length > 0 && (
                    <Badge variant="secondary" className="text-xs font-normal">
                      {preferredSources.length}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[60px] max-h-[80px] overflow-y-auto p-2 bg-muted/30 border rounded-md">
                  {preferredSources.map((source) => (
                    <Badge
                      key={source}
                      variant="secondary"
                      className="flex items-center gap-1 py-1 px-2 bg-secondary/80"
                    >
                      {source}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() =>
                          setPreferredSources(
                            preferredSources.filter((s) => s !== source)
                          )
                        }
                      />
                    </Badge>
                  ))}
                  {preferredSources.length === 0 && (
                    <div className="flex items-center justify-center h-full w-full">
                      <span className="text-xs text-muted-foreground">
                        No preferred sources added
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Excluded Sources */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-xs font-medium text-foreground">
                    Excluded Sources
                  </FormLabel>
                  {excludedSources.length > 0 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {excludedSources.length}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[60px] max-h-[80px] overflow-y-auto p-2 bg-muted/30 border rounded-md">
                  {excludedSources.map((source) => (
                    <Badge
                      key={source}
                      variant="outline"
                      className="flex items-center gap-1 py-1 px-2 border-destructive/30 bg-destructive/10 text-destructive-foreground"
                    >
                      {source}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() =>
                          setExcludedSources(
                            excludedSources.filter((s) => s !== source)
                          )
                        }
                      />
                    </Badge>
                  ))}
                  {excludedSources.length === 0 && (
                    <div className="flex items-center justify-center h-full w-full">
                      <span className="text-xs text-muted-foreground">
                        No excluded sources added
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

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
