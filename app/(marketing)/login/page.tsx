"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (user && !isLoading) {
      router.push("/dashboard");
      return;
    }

    // Redirect to Auth0 login with Google if not logged in and not loading
    if (!user && !isLoading) {
      window.location.href =
        "/api/auth/login?connection=google-oauth2&returnTo=/dashboard";
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication or redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          Redirecting to login...
        </p>
      </div>
    </div>
  );
}
