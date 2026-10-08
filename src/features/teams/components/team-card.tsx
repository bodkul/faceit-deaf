import { IconCalendar, IconTrophy } from "@tabler/icons-react";
import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";

import { TeamAvatar } from "@/components/team-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { teamHref } from "@/features/teams/lib/team-href";
import type { Team } from "@/features/teams/queries";

const ROSTER_PREVIEW = 5;

export function TeamCard({ team }: { team: Team }) {
  const played = team.wins + team.losses;
  const winrate = played ? Math.round((team.wins / played) * 100) : 0;
  const roster = team.roster.slice(0, ROSTER_PREVIEW);
  const extra = team.roster.length - roster.length;

  return (
    <Link
      href={teamHref(team.name)}
      className="group flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-(--highlight) transition-colors hover:border-border-strong hover:bg-foreground/3"
    >
      <div className="flex items-center gap-3">
        <TeamAvatar name={team.name} className="size-11 rounded-xl" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-semibold">{team.name}</span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground text-xs">
            <IconTrophy className="size-3.5 text-faint" />
            {team.events.length} {team.events.length === 1 ? "event" : "events"}
            {team.last_played && (
              <>
                <span className="text-faint">·</span>
                <IconCalendar className="size-3.5 text-faint" />
                {formatDistanceToNowStrict(team.last_played, {
                  addSuffix: true,
                })}
              </>
            )}
          </span>
        </div>
        <div className="flex shrink-0 items-baseline gap-0.5 font-bold font-mono tabular-nums">
          <span className="text-win">{team.wins}</span>
          <span className="text-faint text-sm">–</span>
          <span className="text-loss">{team.losses}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Series win rate</span>
          <span className="font-mono font-semibold tabular-nums">
            {winrate}%
          </span>
        </div>
        <div className="flex h-1.5 overflow-hidden rounded-full bg-loss/25">
          <div className="bg-win" style={{ width: `${winrate}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {roster.map((player) => (
            <Avatar
              key={player.player_id}
              className="size-7 ring-2 ring-card"
              title={player.nickname}
            >
              <AvatarImage src={player.avatar ?? undefined} alt="" />
              <AvatarFallback className="font-semibold text-[10px]">
                {player.nickname.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <span className="min-w-0 truncate text-muted-foreground text-xs">
          {roster.map((p) => p.nickname).join(", ")}
          {extra > 0 && ` +${extra}`}
        </span>
      </div>
    </Link>
  );
}
