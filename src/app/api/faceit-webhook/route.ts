import { NextRequest, NextResponse } from "next/server";
import { handleMatchFinished } from "@/services/playerService";
import { UUID } from "crypto";

interface RequestBody {
  event: string;
  payload: {
    teams: {
      roster: {
        id: UUID;
      }[];
    }[];
  };
}

export const fetchCache = "force-no-store";

export async function POST(req: NextRequest) {
  const { event, payload }: RequestBody = await req.json();

  console.log(payload);

  if (event === "match_status_finished") {
    await handleMatchFinished(payload);
  }

  return NextResponse.json({ message: "OK" });
}
