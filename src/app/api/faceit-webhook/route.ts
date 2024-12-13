import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { handleMatchFinished } from "@/services/playerService";
import type { MatchStatusEvent } from "@/types/match-status-event";

export const fetchCache = "force-no-store";

export async function POST(req: NextRequest) {
  const body: MatchStatusEvent = await req.json();

  logger.info("Match status event", body);

  if (body.event === "match_status_finished") {
    await handleMatchFinished(body.payload);
  }

  return NextResponse.json({ message: "OK" });
}
