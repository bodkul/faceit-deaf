/**
 * Notifies subscribers that data behind `topics` changed. Uses the REST
 * broadcast endpoint so all topics go out in one request without creating
 * channels on the server. Best effort: a failure is logged, not thrown, so it
 * never fails the write that preceded it.
 */
export async function broadcast(topics: string[]) {
  const messages = [...new Set(topics)].map((topic) => ({
    topic,
    event: "changed",
    payload: {},
  }));
  if (!messages.length) return;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/realtime/v1/api/broadcast`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ messages }),
      },
    );
    if (!response.ok) {
      throw new Error(`${response.status} ${await response.text()}`);
    }
  } catch (error) {
    console.error("Realtime broadcast failed:", topics, error);
  }
}
