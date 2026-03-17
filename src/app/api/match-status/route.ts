import { type NextRequest, NextResponse } from "next/server";

import { GAME } from "@/lib/faceit/api";
import {
  handleMatchStatusCancelled,
  handleMatchStatusReady,
} from "@/lib/faceit/handlers";
import { syncFinishedMatchTask } from "@/trigger/sync-finished-match";

export async function POST(request: NextRequest) {
  const { payload, event } = await request.json();

  console.log(`Received:`, { event, payload });

  if (payload?.game !== GAME) {
    return NextResponse.json({ message: "Ignored: not a valid match" });
  }

  switch (event) {
    case "match_status_ready":
      await handleMatchStatusReady(payload);
      break;

    case "match_status_cancelled":
      await handleMatchStatusCancelled(payload);
      break;

    case "match_status_finished": {
      const handle = await syncFinishedMatchTask.trigger(payload, {
        tags: [`match_${payload.id}`],
      });
      return NextResponse.json(handle);
    }

    default:
      break;
  }

  return NextResponse.json({ message: "OK" });
}
