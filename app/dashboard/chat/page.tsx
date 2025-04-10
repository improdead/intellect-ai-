"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ChatInterface from "@/components/chat-interface";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery) {
      setInitialMessage(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-border shadow-sm">
      <ChatInterface initialMessage={initialMessage} />
    </div>
  );
}
