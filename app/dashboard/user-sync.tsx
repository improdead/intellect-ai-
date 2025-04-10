"use client";

import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function UserSync() {
  const { user, isLoading } = useUser();
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");

  useEffect(() => {
    // Only run when we have a user and they're not loading
    if (user && !isLoading) {
      console.log("Syncing user to Supabase:", user.sub);
      setSyncStatus("syncing");

      // Call the API route to sync the user
      fetch("/api/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.sub }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              `Sync failed: ${response.status} ${JSON.stringify(errorData)}`
            );
          }
          return response.json();
        })
        .then((data) => {
          console.log("User synced successfully:", data);
          setSyncStatus("success");
        })
        .catch((error) => {
          console.error("Error syncing user:", error);
          setSyncStatus("error");
        });
    }
  }, [user, isLoading]);

  // This component doesn't render anything visible
  // But we could add a small indicator for development purposes
  if (process.env.NODE_ENV === "development" && syncStatus !== "idle") {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "10px",
          right: "10px",
          padding: "5px 10px",
          borderRadius: "4px",
          fontSize: "12px",
          zIndex: 9999,
          backgroundColor:
            syncStatus === "syncing"
              ? "#f0f9ff"
              : syncStatus === "success"
              ? "#f0fdf4"
              : "#fef2f2",
          color:
            syncStatus === "syncing"
              ? "#0369a1"
              : syncStatus === "success"
              ? "#166534"
              : "#b91c1c",
          border:
            syncStatus === "syncing"
              ? "1px solid #0ea5e9"
              : syncStatus === "success"
              ? "1px solid #22c55e"
              : "1px solid #ef4444",
        }}
      >
        {syncStatus === "syncing" && "Syncing user to Supabase..."}
        {syncStatus === "success" && "User synced to Supabase!"}
        {syncStatus === "error" && "Error syncing user to Supabase"}
      </div>
    );
  }

  return null;
}
