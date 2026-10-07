import { TZDate } from "@date-fns/tz";

export const EVENT_TZ = "Europe/Berlin";

export type EventStatus = "upcoming" | "ongoing" | "finished";

export function getEventStatus(
  startDate: string,
  endDate: string | null,
): EventStatus {
  const now = TZDate.tz(EVENT_TZ);
  const start = new TZDate(startDate, EVENT_TZ);
  const end = endDate ? new TZDate(endDate, EVENT_TZ) : null;

  if (now < start) return "upcoming";
  if (end && now > end) return "finished";
  return "ongoing";
}
