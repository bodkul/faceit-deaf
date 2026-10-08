import { TZDate } from "@date-fns/tz";
import { format, getYear } from "date-fns";
import { enUS } from "date-fns/locale";

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

/** "12 Sep — 13 Sep", with the year only when it isn't the current one. */
export function formatEventDates(startDate: string, endDate: string | null) {
  const fmt = (date: string) =>
    format(
      new TZDate(date, EVENT_TZ),
      getYear(date) === getYear(new Date()) ? "d MMM" : "d MMM yyyy",
      { locale: enUS },
    );

  return endDate ? `${fmt(startDate)} — ${fmt(endDate)}` : fmt(startDate);
}
