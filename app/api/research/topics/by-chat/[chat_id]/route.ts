import { NextRequest, NextResponse } from "next/server";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0/edge";
import { createSupabaseAdmin } from "@/lib/supabase-auth";
import { auth0IdToUuid } from "@/lib/auth0-utils";

// Get a research topic by chat_id
export const GET = withApiAuthRequired(async function handler(
  req: NextRequest,
  context: { params: { chat_id: string } }
) {
  // Create a response object required by getSession
  const res = new NextResponse();

  // Get session using the edge-compatible getSession
  const session = await getSession(req, res);

  if (!session?.user?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chatId = context.params.chat_id;
  if (!chatId) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
  }

  const auth0UserId = session.user.sub;
  const supabaseUuid = auth0IdToUuid(auth0UserId);

  try {
    const supabase = createSupabaseAdmin();

    // Find the research topic associated with this chat_id
    const { data, error } = await supabase
      .from("research_topics")
      .select("*")
      .eq("chat_id", chatId)
      .eq("user_id", supabaseUuid)
      .single();

    if (error) {
      console.error("Error fetching research topic by chat_id:", error);
      return NextResponse.json(
        { error: "Failed to fetch research topic", details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Research topic not found for this chat" },
        { status: 404 }
      );
    }

    // Return the data with the res object to ensure cookies are handled
    return NextResponse.json(data, res);
  } catch (error: any) {
    console.error(
      "Error in GET /api/research/topics/by-chat/[chat_id]:",
      error
    );
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
});
