import { type NextRequest, NextResponse } from "next/server";

import { handleMatchStatusEvent } from "@/lib/faceit/handlers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await handleMatchStatusEvent(body);
    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("Error handling match status event", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
