import { getSupabaseClient } from "./supabase-client";
import { createSupabaseAdmin } from "./supabase-auth";
import { auth0IdToUuid } from "./auth0-utils";

// Subject with icon mapping
export interface SubjectWithIcon {
  id: string;
  // Support different column naming conventions
  title?: string;
  name?: string; // Alternative name for title
  description?: string;
  difficulty?: string;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  // UI specific properties
  icon?: any; // For client-side icon component
  color?: string; // For gradient colors
  progress?: number; // User's progress percentage
  currentTopic?: string; // Current topic the user is on
}

// Course with additional info
export interface CourseWithProgress {
  id: string;
  subject_id: string;
  title: string;
  description: string;
  difficulty: string;
  created_at: string;
  updated_at: string;
  progress?: number; // User's progress percentage
  lesson_count?: number; // Total number of lessons
  completed_lessons?: number; // Number of completed lessons
}

// Quiz with additional info
export interface QuizWithInfo {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  question_count: number;
  estimated_time: string;
}

// Client-side data fetching functions
export const clientDataService = {
  // Get all subjects
  async getSubjects(): Promise<SubjectWithIcon[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("title");

    if (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }

    return data || [];
  },

  // Get user's progress for all subjects - simplified version
  async getUserSubjectsProgress(
    auth0UserId: string
  ): Promise<SubjectWithIcon[]> {
    try {
      console.log("Getting subjects for user:", auth0UserId);
      const supabase = getSupabaseClient();

      // Just get all subjects for now without calculating progress
      const { data: subjects, error: subjectsError } = await supabase
        .from("subjects")
        .select("*");

      if (subjectsError) {
        console.error("Error fetching subjects:", subjectsError);
        return [];
      }

      if (!subjects || subjects.length === 0) {
        console.log("No subjects found");
        return [];
      }

      console.log("Found subjects:", subjects.length);
      console.log("First subject sample:", subjects[0]);

      // Add dummy progress data for now
      return subjects.map((subject) => {
        // Determine the display name (title or name)
        const displayName = subject.title || subject.name || "Unnamed Subject";

        // Ensure we have default values for all fields
        return {
          ...subject,
          // Ensure we have a title property for consistency
          title: displayName,
          // Ensure we have a description
          description: subject.description || "No description available",
          // Add dummy progress data
          progress: Math.floor(Math.random() * 100), // Random progress for demo
          currentTopic: "Introduction", // Default topic
          // Add default difficulty if missing
          difficulty: subject.difficulty || "Beginner",
          // Add timestamps if missing
          created_at: subject.created_at || new Date().toISOString(),
          updated_at: subject.updated_at || new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error("Error in getUserSubjectsProgress:", error);
      return [];
    }
  },

  // Get courses for a subject
  async getCoursesBySubject(subjectId: string): Promise<CourseWithProgress[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("subject_id", subjectId)
      .order("title");

    if (error) {
      console.error("Error fetching courses:", error);
      return [];
    }

    return data || [];
  },

  // Get quizzes for a lesson
  async getQuizzesByLesson(lessonId: string): Promise<QuizWithInfo[]> {
    const supabase = getSupabaseClient();

    // Get quizzes
    const { data: quizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("lesson_id", lessonId);

    if (quizzesError) {
      console.error("Error fetching quizzes:", quizzesError);
      return [];
    }

    if (!quizzes || quizzes.length === 0) {
      return [];
    }

    // For each quiz, get the question count
    const quizzesWithInfo: QuizWithInfo[] = [];

    for (const quiz of quizzes) {
      const { data: questions, error: questionsError } = await supabase
        .from("quiz_questions")
        .select("id")
        .eq("quiz_id", quiz.id);

      if (questionsError) {
        console.error("Error fetching quiz questions:", questionsError);
        continue;
      }

      const questionCount = questions?.length || 0;
      // Estimate time based on question count (2 minutes per question)
      const estimatedMinutes = questionCount * 2;

      quizzesWithInfo.push({
        ...quiz,
        question_count: questionCount,
        estimated_time: `${estimatedMinutes} minutes`,
      });
    }

    return quizzesWithInfo;
  },
};

// Server-side data fetching functions
export const serverDataService = {
  // Get all subjects
  async getSubjects() {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("title");

    if (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }

    return data || [];
  },

  // Get user's progress
  async getUserProgress(auth0UserId: string) {
    const supabaseUuid = auth0IdToUuid(auth0UserId);
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", supabaseUuid);

    if (error) {
      console.error("Error fetching user progress:", error);
      return [];
    }

    return data || [];
  },
};
