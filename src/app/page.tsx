import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";

import { SectionHeader } from "@/components/section-header";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { EventRow } from "@/features/events/components/event-row";
import { getEvents } from "@/features/events/queries";
import { LiveMatches } from "@/features/match/components/live-matches";
import { PlayerRankRow } from "@/features/player/components/player-rank-row";
import { PlayerSearch } from "@/features/player/components/player-search";
import { getPlayerRankings } from "@/features/player/queries";

// Top players and events are prerendered; live matches update on the client.
export const revalidate = 300;

export default async function HomePage() {
  const [{ players, count }, events] = await Promise.all([
    getPlayerRankings(5, 0),
    getEvents(3),
  ]);

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col items-center gap-5 pt-4 text-center sm:pt-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-foreground/5 px-3 py-1 font-medium text-muted-foreground text-xs ring-1 ring-foreground/10 ring-inset">
          <span className="size-1.5 rounded-full bg-primary" />
          Tracking {count} deaf CS2 players
        </span>
        <h1 className="max-w-3xl text-balance font-black text-4xl tracking-tight sm:text-5xl lg:text-6xl">
          Every deaf CS2 match,{" "}
          <span className="bg-linear-to-r from-primary to-warning bg-clip-text text-transparent">
            live
          </span>
        </h1>
        <p className="max-w-xl text-balance text-muted-foreground sm:text-lg">
          {siteConfig.description}
        </p>
        <div className="flex w-full max-w-md flex-col gap-3 pt-2">
          <PlayerSearch
            className="w-full"
            placeholder="Find a player by nickname…"
          />
          <div className="flex justify-center gap-2">
            <Link
              href="/players"
              className={buttonVariants({ variant: "contrast", size: "lg" })}
            >
              Player rankings
            </Link>
            <Link
              href="/events"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              Events
              <IconArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <LiveMatches />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-6">
        <section className="flex min-w-0 flex-col gap-4">
          <SectionHeader
            title="Top players"
            description={`Highest FACEIT ELO of ${count} tracked players`}
            href="/players"
          />
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
            {players.map((player, index) => (
              <PlayerRankRow
                key={player.id}
                rank={index + 1}
                player={player}
                compact
              />
            ))}
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-4">
          <SectionHeader
            title="Events"
            description="Deaf CS2 tournaments and their results"
            href="/events"
          />
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
