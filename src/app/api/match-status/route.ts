import { tasks } from "@trigger.dev/sdk";
import { type NextRequest, NextResponse } from "next/server";

import {
  handleMatchStatusCancelled,
  handleMatchStatusReady,
} from "@/lib/faceit/handlers";
import { syncFinishedMatchTask } from "@/trigger/sync-finished-match";

const VALID_MATCH = {
  game: "cs2",
  region: "EU",
  organizer_id: "faceit",
  entity_id: "f4148ddd-bce8-41b8-9131-ee83afcdd6dd",
};

export async function POST(request: NextRequest) {
  const { payload, event } = await request.json();

  if (
    payload?.game !== VALID_MATCH.game ||
    payload?.region !== VALID_MATCH.region ||
    payload?.organizer_id !== VALID_MATCH.organizer_id ||
    payload?.entity?.id !== VALID_MATCH.entity_id
  ) {
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
      const handle = await tasks.trigger<typeof syncFinishedMatchTask>(
        "sync-finished-match",
        payload,
      );
      console.log("✅ Task triggered successfully:", handle.id);
      return NextResponse.json(handle);
    }

    default:
      console.log("⚠️ Unhandled event type:", event);
      break;
  }

  return NextResponse.json({ message: "OK" });
}
