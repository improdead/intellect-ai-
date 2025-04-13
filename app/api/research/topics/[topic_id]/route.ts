import { NextRequest, NextResponse } from "next/server";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0/edge";
import { createSupabaseAdmin } from "@/lib/supabase-auth";
import { auth0IdToUuid } from "@/lib/auth0-utils";

// GET handler for retrieving a specific research topic by ID
export const GET = withApiAuthRequired(async function handler(
  req: NextRequest,
  context: { params: { topic_id: string } }
) {
  // Create a response object required by getSession
  const res = new NextResponse();

  // Get session using the edge-compatible getSession
  const session = await getSession(req, res);

  if (!session?.user?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topicId = context.params.topic_id;
  if (!topicId) {
    return NextResponse.json(
      { error: "Topic ID is required" },
      { status: 400 }
    );
  }

  const auth0UserId = session.user.sub;
  const supabaseUuid = auth0IdToUuid(auth0UserId);

  try {
    const supabase = createSupabaseAdmin();

    // Find the research topic by ID
    const { data, error } = await supabase
      .from("research_topics")
      .select("*")
      .eq("id", topicId)
      .eq("user_id", supabaseUuid)
      .single();

    if (error) {
      console.error("Error fetching research topic by ID:", error);
      return NextResponse.json(
        { error: "Failed to fetch research topic", details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Research topic not found" },
        { status: 404 }
      );
    }

    // Return the data with the res object to ensure cookies are handled
    return NextResponse.json(data, res);
  } catch (error: any) {
    console.error(`Error in GET /api/research/topics/${topicId}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
});

// DELETE handler for deleting a specific research topic
export const DELETE = withApiAuthRequired(async function handler(
  req,
  { params }
) {
  const res = new NextResponse();
  const session = await getSession(req, res);

  if (!session?.user?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topicId = params?.topic_id as string; // Get topic ID from route parameters
  if (!topicId) {
    return NextResponse.json(
      { error: "Topic ID is required" },
      { status: 400 }
    );
  }

  const auth0UserId = session.user.sub;
  const supabaseUuid = auth0IdToUuid(auth0UserId);
  const supabase = createSupabaseAdmin();

  try {
    // 1. Verify the user owns the topic before deleting
    const { data: topicData, error: fetchError } = await supabase
      .from("research_topics")
      .select("id, user_id") // Select only necessary columns
      .eq("id", topicId)
      .eq("user_id", supabaseUuid) // Ensure the topic belongs to the user
      .single();

    if (fetchError || !topicData) {
      console.error(
        "Error fetching topic or user does not own topic:",
        fetchError
      );
      // If the topic doesn't exist or doesn't belong to the user, return 404
      return NextResponse.json(
        { error: "Topic not found or access denied" },
        { status: 404 }
      );
    }

    // 2. Delete the topic (RLS policies on related tables like research_steps should handle cascades if set up)
    const { error: deleteError } = await supabase
      .from("research_topics")
      .delete()
      .eq("id", topicId);

    if (deleteError) {
      console.error("Supabase error deleting research topic:", deleteError);
      return NextResponse.json(
        {
          error: "Failed to delete research topic",
          details: deleteError.message,
        },
        { status: 500 }
      );
    }

    // Return success with no content
    // Auth0 cookies are handled by passing res
    return new NextResponse(null, res); // 204 No Content is implicit
  } catch (error: any) {
    console.error(`Error in DELETE /api/research/topics/${topicId}:`, error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
});
