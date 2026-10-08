import { StatusPill } from "@/components/status-pill";
import type { EventStatus } from "@/features/events/lib/event-status";

const config = {
  ongoing: { tone: "live", label: "Live", pulse: true },
  upcoming: { tone: "warning", label: "Upcoming", pulse: false },
  finished: { tone: "muted", label: "Finished", pulse: false },
} as const;

export function EventStatusPill({ status }: { status: EventStatus }) {
  const { tone, label, pulse } = config[status];
  return (
    <StatusPill tone={tone} pulse={pulse}>
      {label}
    </StatusPill>
  );
}
