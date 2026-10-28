import { IconArrowLeft, IconChevronRight } from "@tabler/icons-react";
import { cn } from "cn";
import { format } from "date-fns";
import Link from "next/link";

import { SectionHeader } from "@/components/section-header";
import {
  ratioTone,
  StatsTable,
  StatsTd,
  StatsTh,
} from "@/components/stats-table";
import { TeamAvatar } from "@/components/team-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatEventDates } from "@/features/events/lib/event-status";
import type { Team } from "@/features/teams/queries";

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 bg-card px-4 py-3 sm:px-6">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xl font-bold tabular-nums">
        {children}
      </span>
    </div>
  );
}

function ResultBadge({ win }: { win: boolean | null }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold",
        win === true && "bg-win/15 text-win",
        win === false && "bg-loss/15 text-loss",
        win == null && "bg-muted text-faint",
      )}
    >
      {win === true ? "W" : win === false ? "L" : "–"}
    </span>
  );
}

export function TeamView({ team }: { team: Team }) {
  const played = team.wins + team.losses;
  const winrate = played ? Math.round((team.wins / played) * 100) : 0;
  const mapsPlayed = team.maps_won + team.maps_lost;
  const mapWinrate = mapsPlayed
    ? Math.round((team.maps_won / mapsPlayed) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-(--highlight)">
        <div className="border-b border-border px-4 py-3 sm:px-6">
          <Link
            href="/teams"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <IconArrowLeft className="size-4" />
            All teams
          </Link>
        </div>
        <div className="flex items-center gap-4 px-4 py-5 sm:px-6">
          <TeamAvatar name={team.name} className="size-16 rounded-2xl" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="truncate text-2xl font-black tracking-tight sm:text-3xl">
              {team.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {team.roster.length} players
              {team.last_played &&
                ` · last played ${format(team.last_played, "d MMM yyyy")}`}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4">
          <Stat label="Series">
            <span className="text-win">{team.wins}</span>
            <span className="text-faint">–</span>
            <span className="text-loss">{team.losses}</span>
          </Stat>
          <Stat label="Series win rate">{winrate}%</Stat>
          <Stat label="Maps">
            <span className="text-win">{team.maps_won}</span>
            <span className="text-faint">–</span>
            <span className="text-loss">{team.maps_lost}</span>
          </Stat>
          <Stat label="Map win rate">{mapWinrate}%</Stat>
        </div>
      </section>

      {team.roster.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeader
            title="Roster"
            description="Everyone who has played for the team, by maps played"
          />
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
            <StatsTable minWidth={600}>
              <thead className="border-b border-border">
                <tr>
                  <StatsTh sticky align="left">
                    Player
                  </StatsTh>
                  <StatsTh>Events</StatsTh>
                  <StatsTh>Maps</StatsTh>
                  <StatsTh>K/D</StatsTh>
                  <StatsTh>Avg K</StatsTh>
                  <StatsTh>ADR</StatsTh>
                  <StatsTh>MVP</StatsTh>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {team.roster.map((p) => {
                  const kd = p.kills / Math.max(p.deaths, 1);
                  const name = (
                    <span className="flex min-w-0 items-center gap-2.5">
                      <Avatar className="size-7">
                        <AvatarImage src={p.avatar ?? undefined} alt="" />
                        <AvatarFallback className="text-[10px] font-semibold">
                          {p.nickname.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-36 truncate font-medium">
                        {p.nickname}
                      </span>
                    </span>
                  );
                  return (
                    <tr
                      key={p.player_id}
                      className="transition-colors hover:bg-foreground/3"
                    >
                      <StatsTd sticky align="left" numeric={false}>
                        {p.profile ? (
                          <Link
                            href={`/player/${p.profile}`}
                            className="transition-colors hover:text-primary"
                          >
                            {name}
                          </Link>
                        ) : (
                          name
                        )}
                      </StatsTd>
                      <StatsTd tone="muted">{p.events}</StatsTd>
                      <StatsTd tone="muted">{p.maps}</StatsTd>
                      <StatsTd tone={ratioTone(kd)} className="font-semibold">
                        {kd.toFixed(2)}
                      </StatsTd>
                      <StatsTd tone="strong">
                        {(p.kills / p.maps).toFixed(1)}
                      </StatsTd>
                      <StatsTd>{(p.adr_total / p.maps).toFixed(1)}</StatsTd>
                      <StatsTd tone={p.mvps > 0 ? "warning" : "muted"}>
                        {p.mvps}
                      </StatsTd>
                    </tr>
                  );
                })}
              </tbody>
            </StatsTable>
          </div>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:gap-6">
        <section className="flex min-w-0 flex-col gap-4">
          <SectionHeader title="Events" />
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
            {team.events.map((event) => (
              <Link
                key={event.slug}
                href={`/events/${event.slug}/teams/${encodeURIComponent(team.name)}`}
                className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-foreground/3"
              >
                <Avatar className="size-9 shrink-0 rounded-lg after:rounded-lg after:border-border">
                  <AvatarImage
                    className="rounded-lg bg-black object-contain"
                    src={event.logo_url}
                    alt=""
                  />
                  <AvatarFallback className="rounded-lg font-bold">
                    {event.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {event.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatEventDates(event.start_date, event.end_date)}
                  </span>
                </div>
                <span className="font-mono text-sm font-bold tabular-nums">
                  <span className="text-win">{event.wins}</span>
                  <span className="text-faint">–</span>
                  <span className="text-loss">{event.losses}</span>
                </span>
                <IconChevronRight className="size-4 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        </section>

        <section className="flex min-w-0 flex-col gap-4">
          <SectionHeader title="Results" />
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
            {team.results.map((row) => (
              <Link
                key={`${row.event_slug}-${row.match_id}`}
                href={`/events/${row.event_slug}/matches/${row.match_id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-foreground/3"
              >
                <ResultBadge win={row.win} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    <span className="text-muted-foreground">vs </span>
                    {row.opponent}
                  </span>
                  <span className="truncate text-xs text-faint">
                    {row.event_name}
                    {row.started_at &&
                      ` · ${format(row.started_at, "d MMM, HH:mm")}`}
                  </span>
                </div>
                <span className="font-mono font-bold tabular-nums">
                  {row.maps_won}:{row.maps_lost}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
