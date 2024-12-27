import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
    const body = await req.json();

    logger.info("Hub user added:", body);

    return NextResponse.json({ message: "OK" });
}
