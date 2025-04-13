import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { sessionService } from "@/lib/session-service";
import { achievementService } from "@/lib/achievement-service";

export async function POST(req: Request) {
  try {
    console.log("[track-session] API called");

    // Verify the user is authenticated
    const session = await getSession();

    if (!session?.user) {
      console.log("[track-session] No authenticated user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
