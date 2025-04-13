import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { sessionService } from "@/lib/session-service";
import { achievementService } from "@/lib/achievement-service";

// Suppress the cookie errors - the functionality still works despite the errors
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    console.log("[track-session] API called");

    // Get the user session from Auth0
    const session = await getSession();

    // If no session, return a proper error response
    if (!session || !session.user) {
      console.log("No authenticated user found for tracking session");
      return NextResponse.json(
        { error: "Authentication required", code: "auth_required" },
        { status: 401 }
      );
    }

    console.log(`[track-session] User authenticated: ${session.user.sub}`);

    // Get the request body
    const body = await req.json();
    const { action } = body;
    console.log(`[track-session] Action: ${action}`);

    if (action === "start") {
      console.log(
        `[track-session] Starting session for user: ${session.user.sub}`
      );
      // Start a new session
      const newSession = await sessionService.startSession(session.user.sub);
      console.log(
        `[track-session] Session started: ${newSession?.id || "failed"}`
      );

      // Check and update achievements
      console.log(
        `[track-session] Checking achievements for user: ${session.user.sub}`
      );
      await achievementService.checkAndUpdateAchievements(session.user.sub);

      return NextResponse.json({
        success: true,
        message: "Session started",
        session: newSession,
      });
    } else if (action === "end") {
      // End the active session
      const activeSession = await sessionService.getActiveSession(
        session.user.sub
      );

      if (activeSession) {
        await sessionService.endSession(activeSession.id, session.user.sub);

        return NextResponse.json({
          success: true,
          message: "Session ended",
        });
      } else {
        return NextResponse.json({
          success: false,
          message: "No active session found",
        });
      }
    } else {
      return NextResponse.json(
        {
          error: "Invalid action",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in track-session API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: (error as Error).message },
      { status: 500 }
    );
  }
}

// Optional: Handle the OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
