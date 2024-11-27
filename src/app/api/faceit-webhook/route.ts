import { NextRequest, NextResponse } from "next/server";
import { handleMatchFinished } from "@/services/playerService";
import type { MatchStatusEvent } from "@/types/match-status-event";

export const fetchCache = "force-no-store";

export async function POST(req: NextRequest) {
  const body: MatchStatusEvent = await req.json();

  console.log(body);
  console.log(body.payload);
  console.log(body.payload.teams);
  console.log(body.payload.teams[0]);
  console.log(body.payload.teams[1]);
  console.log([
    ...body.payload.teams[0].roster,
    ...body.payload.teams[1].roster,
  ]);

  if (body.event === "match_status_finished") {
    await handleMatchFinished(body.payload);
  }

  return NextResponse.json({ message: "OK" });
}
