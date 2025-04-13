"use client";

import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ResearchForm } from "@/components/forms/research-form";
import { clientDataService } from "@/lib/data-service";
import { auth0IdToUuid } from "@/lib/auth0-utils";

export default function NewResearchPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch subjects when the component mounts
  useEffect(() => {
    async function fetchSubjects() {
      if (!user) return;

      try {
        const fetchedSubjects = await clientDataService.getSubjects();
        setSubjects(fetchedSubjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast.error("Failed to load subjects");
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchSubjects();
    } else if (!isUserLoading) {
      setIsLoading(false);
    }
  }, [user, isUserLoading]);

  // Handle successful creation of a research topic
  const handleSuccess = (data: { id: string }) => {
    toast.success("Research topic created successfully!");
    router.push(`/dashboard/research/${data.id}`);
  };

  // Handle cancellation
  const handleCancel = () => {
    router.push("/dashboard/research");
  };

  if (!user && !isUserLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-theme(space.16))]">
        <p>Please log in to create research topics</p>
      </div>
    );
  }

  if (isLoading || isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-theme(space.16))]">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <ResearchForm
        userId={user.sub}
        subjects={subjects}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
