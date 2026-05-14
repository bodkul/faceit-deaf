import { IconCalendar } from "@tabler/icons-react";
import { format, isAfter, isBefore } from "date-fns";
import { enGB } from "date-fns/locale";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import type { EventById } from "@/lib/db/events";

function getEventStatus(event: EventById): "upcoming" | "live" | "finished" {
  const now = new Date();

  if (isBefore(now, event.start_date)) return "upcoming";
  if (isAfter(now, event.end_date)) return "finished";
  return "live";
}

function formatDate(dateStr: string) {
  return format(dateStr, "d MMM yyyy", { locale: enGB });
}

export function EventHeader({ event }: { event: EventById }) {
  const status = getEventStatus(event);

  const statusConfig = {
    upcoming: {
      label: "Upcoming",
      className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    live: {
      label: "Live",
      className:
        "bg-green-500/15 text-green-400 border-green-500/30 animate-pulse",
    },
    finished: {
      label: "Finished",
      className: "bg-muted text-muted-foreground",
    },
  } as const;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
      <div className="flex flex-col items-start gap-6 px-6 py-6 sm:flex-row sm:items-center">
        {event.logo_url ? (
          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
            <Image
              src={event.logo_url}
              alt={event.name}
              fill
              className="object-contain"
              sizes="80px"
            />
          </div>
        ) : (
          <div className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 font-bold text-2xl text-neutral-500">
            {event.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="truncate font-black text-2xl text-white tracking-tight">
              {event.name}
            </h1>
            <Badge variant="outline" className={statusConfig[status].className}>
              {status === "live" && (
                <span className="mr-1.5 inline-block size-1.5 rounded-full bg-green-400" />
              )}
              {statusConfig[status].label}
            </Badge>
          </div>

          <span className="flex items-center gap-1.5 text-neutral-500 text-sm">
            <IconCalendar className="size-3.5" />
            {formatDate(event.start_date)}
            {" — "}
            {formatDate(event.end_date)}
          </span>
        </div>
      </div>
    </div>
  );
}
