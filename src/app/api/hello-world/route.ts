import { tasks } from "@trigger.dev/sdk";
import { NextResponse } from "next/server";

import type { helloWorldTask } from "@/trigger/example";

export async function GET() {
  const handle = await tasks.trigger<typeof helloWorldTask>(
    "hello-world",
    "James",
  );

  return NextResponse.json(handle);
}
