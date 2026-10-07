import { type NextRequest, NextResponse } from "next/server";

import { isAuthorized } from "@/lib/api-auth";
import { GAME } from "@/lib/faceit/utils";
import {
  handleMatchStatusCancelled,
  handleMatchStatusReady,
} from "@/lib/faceit/webhooks/handlers";
import { syncFinishedMatchTask } from "@/trigger/sync-finished-match";

export async function POST(request: NextRequest) {
  if (
    !isAuthorized(
      request,
      "x-webhook-secret",
      process.env.FACEIT_WEBHOOK_SECRET,
    )
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { payload, event } = await request.json();

  console.log(`Received:`, { event, matchId: payload?.id });

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
