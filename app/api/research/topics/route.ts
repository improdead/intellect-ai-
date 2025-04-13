import { NextResponse } from "next/server";
// Use edge-compatible imports for App Router API routes
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0/edge";
import { createSupabaseAdmin } from "@/lib/supabase-auth"; // Use admin client for trusted server operations
import { auth0IdToUuid } from "@/lib/auth0-utils";
import * as z from "zod";

// Define the expected request body schema
const createTopicSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  subject_id: z.string().optional(),
  preferredSources: z.array(z.string()).optional(),
  excludedSources: z.array(z.string()).optional(),
});

// Wrap the handler with withApiAuthRequired for export
export const POST = withApiAuthRequired(async function handler(req) {
  // Create a response object required by getSession in this context
  const res = new NextResponse();

  // Get session using the edge-compatible getSession, passing req and res
  const session = await getSession(req, res);

  if (!session?.user?.sub) {
    // Return standard NextResponse for errors
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth0UserId = session.user.sub;
  const supabaseUuid = auth0IdToUuid(auth0UserId); // Convert Auth0 ID to Supabase UUID

  try {
    const body = await req.json();
    const parseResult = createTopicSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      subject_id,
      preferredSources,
      excludedSources,
    } = parseResult.data;

    const supabase = createSupabaseAdmin(); // Use admin client on the server

    // 1. Create the research topic
    const { data: newTopic, error: topicError } = await supabase
      .from("research_topics")
      .insert({
        user_id: supabaseUuid,
        title: title,
        description: description, // Storing description here might be redundant if it's the first chat message
        subject_id: subject_id,
        progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (topicError) {
      console.error("Supabase error creating research topic:", topicError);
      return NextResponse.json(
        {
          error: "Failed to create research topic",
          details: topicError.message,
        },
        { status: 500 }
      );
    }

    if (!newTopic) {
      console.error("No topic data returned after insert.");
      return NextResponse.json(
        { error: "Failed to create research topic: No data returned" },
        { status: 500 }
      );
    }

    let chatId: string | null = null;

    // 2. Create associated chat history
    // Need to adapt clientDataService or directly use supabase admin client
    // Let's use supabase admin directly for consistency
    const { data: chatHistory, error: chatError } = await supabase
      .from("chat_history")
      .insert({
        user_id: supabaseUuid,
        title: title, // Use topic title for chat title
        subject_id: subject_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (chatError) {
      console.error("Supabase error creating chat history:", chatError);
      // Instead of proceeding without chat history, return error
      return NextResponse.json(
        {
          error: "Failed to create chat history",
          details: chatError.message,
        },
        { status: 500 }
      );
    } else if (chatHistory) {
      chatId = chatHistory.id;

      // 3. Create the initial chat message (using description)
      const { error: messageError } = await supabase
        .from("chat_messages")
        .insert({
          chat_id: chatId,
          role: "user", // Assuming the description is the user's first message
          content: description,
          created_at: new Date().toISOString(),
        });

      if (messageError) {
        console.error(
          "Supabase error creating initial chat message:",
          messageError
        );
        // Log, but continue since we have the chat_id
      }

      // 4. Update the research topic with the chat_id
      const { error: updateError } = await supabase
        .from("research_topics")
        .update({ chat_id: chatId, updated_at: new Date().toISOString() })
        .eq("id", newTopic.id);

      if (updateError) {
        console.error(
          "Supabase error updating topic with chat_id:",
          updateError
        );
        // Return error as this is critical for redirection
        return NextResponse.json(
          {
            error: "Failed to link chat to research topic",
            details: updateError.message,
          },
          { status: 500 }
        );
      }

      // Verify that the chat_id was properly set by re-fetching the topic
      const { data: verifiedTopic, error: verifyError } = await supabase
        .from("research_topics")
        .select("id, chat_id")
        .eq("id", newTopic.id)
        .single();

      if (verifyError || !verifiedTopic?.chat_id) {
        console.error(
          "Failed to verify chat_id was set:",
          verifyError || "No chat_id found"
        );
        return NextResponse.json(
          {
            error: "Failed to verify chat was linked to research topic",
            details: verifyError?.message || "No chat_id found after update",
          },
          { status: 500 }
        );
      }

      // Update the newTopic object with the verified chat_id
      newTopic.chat_id = verifiedTopic.chat_id;
    }

    // 5. Add preferred/excluded sources (Using admin client directly)
    // This logic could be abstracted into researchService if preferred,
    // ensuring researchService functions can accept an admin client instance.
    const addResource = async (
      source: string,
      type: "preferred_source" | "excluded_source"
    ) => {
      const { error } = await supabase.from("research_resources").insert({
        topic_id: newTopic.id,
        title: `${
          type === "preferred_source" ? "Preferred" : "Excluded"
        } Source: ${source}`,
        description: `User ${
          type === "preferred_source" ? "preferred" : "excluded"
        } source for research`,
        type: type,
        source: source,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add other required fields with defaults if necessary
        is_saved: false, // Example default
        rating: 0, // Example default
        url: "", // Example default
        author: "", // Example default
      });
      if (error) {
        console.error(`Supabase error adding ${type} resource:`, error);
      }
    };

    if (preferredSources) {
      for (const source of preferredSources) {
        await addResource(source, "preferred_source");
      }
    }
    if (excludedSources) {
      for (const source of excludedSources) {
        await addResource(source, "excluded_source");
      }
    }

    // Return the newly created topic (potentially updated with chat_id)
    const finalTopic = { ...newTopic, chat_id: chatId }; // Include chatId if created

    // Return the response using the edge-compatible pattern
    // Pass the 'res' object used by getSession as the second argument
    // to NextResponse.json to properly handle cookies.
    return NextResponse.json(finalTopic, res);
  } catch (error: any) {
    console.error("Error in /api/research/topics POST:", error);
    // Return a standard NextResponse for errors
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
});

// --- GET Handler (New Code) ---
export const GET = withApiAuthRequired(async function handler(req) {
  const res = new NextResponse();
  const session = await getSession(req, res);

  if (!session?.user?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const auth0UserId = session.user.sub;
  const supabaseUuid = auth0IdToUuid(auth0UserId);

  try {
    const supabase = createSupabaseAdmin(); // Use admin client

    // Fetch topics for the authenticated user
    // Include resource count similar to the original service function
    const { data, error } = await supabase
      .from("research_topics")
      .select(
        `
        *,
        research_resources(count)
      `
      )
      .eq("user_id", supabaseUuid)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching research topics:", error);
      return NextResponse.json(
        { error: "Failed to fetch research topics", details: error.message },
        { status: 500 }
      );
    }

    // Transform data to include resource count
    // This matches the structure expected by the frontend if it used researchService before
    const topicsWithCount = (data || []).map((topic: any) => ({
      ...topic,
      resourceCount: topic.research_resources?.[0]?.count || 0,
    }));

    return NextResponse.json(topicsWithCount, res); // Return data with session context
  } catch (error: any) {
    console.error("Error in /api/research/topics GET:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
});
