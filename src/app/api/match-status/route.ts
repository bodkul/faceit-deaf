import { tasks } from "@trigger.dev/sdk";
import { type NextRequest, NextResponse } from "next/server";

import {
  handleMatchStatusCancelled,
  handleMatchStatusReady,
} from "@/lib/faceit/handlers";
import { syncFinishedMatchTask } from "@/trigger/update-match";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (
    body.payload.game !== "cs2" ||
    body.payload.region !== "EU" ||
    body.payload.organizer_id !== "faceit" ||
    body.payload.entity.id !== "f4148ddd-bce8-41b8-9131-ee83afcdd6dd"
  ) {
    return;
  }

  switch (body.event) {
    case "match_status_ready":
      await handleMatchStatusReady(body.payload);
      break;
    case "match_status_cancelled":
      await handleMatchStatusCancelled(body.payload);
      break;
    case "match_status_finished":
      try {
        const handle = await tasks.trigger<typeof syncFinishedMatchTask>(
          "sync-finished-match",
          body.payload,
        );
        console.log("Task triggered successfully");
        return NextResponse.json(handle);
      } catch (err) {
        console.error("Error triggering task", err);
      }
      break;
  }

  return NextResponse.json({ message: "OK" });
}
