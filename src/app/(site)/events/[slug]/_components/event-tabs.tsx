"use client";

import { IconTrophy } from "@tabler/icons-react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type EventMatch, useEventData } from "@/hooks/use-event-data";
import { cn } from "@/lib/utils";

type Tab = "matches" | "teams" | "players";

function statusLabel(status: string | null) {
  if (status === "FINISHED")
    return { text: "Finished", cls: "bg-muted text-muted-foreground" };
  if (status === "ONGOING")
    return {
      text: "Live",
      cls: "bg-green-500/15 text-green-400 border-green-500/30",
    };
  return { text: status ?? "—", cls: "bg-muted text-muted-foreground" };
}

function MatchCard({ match, slug }: { match: EventMatch; slug: string }) {
  const t1 = match.teams[0];
  const t2 = match.teams[1];
  const st = statusLabel(match.status);

  const mapCount = match.maps.length;
  const label =
    mapCount > 0
      ? `Bo${match.best_of ?? mapCount} · ${mapCount} map${mapCount !== 1 ? "s" : ""}`
      : `Bo${match.best_of ?? "?"}`;

  return (
    <Link
      href={`/events/${slug}/matches/${match.match_id}`}
      className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-950 px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-900"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar className="size-9 shrink-0 rounded-lg">
          <AvatarFallback className="rounded-lg text-sm">
            {t1?.team_name?.charAt(0) ?? "?"}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn("truncate font-semibold text-sm", {
            "text-emerald-400": t1?.is_winner === true,
            "text-red-400": t1?.is_winner === false,
            "text-neutral-200": t1?.is_winner == null,
          })}
        >
          {t1?.team_name ?? "TBD"}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1">
        <div className="flex items-center gap-2 font-black font-mono text-xl tabular-nums">
          <span
            className={cn({
              "text-emerald-400": t1?.is_winner === true,
              "text-red-400": t1?.is_winner === false,
              "text-neutral-300": t1?.is_winner == null,
            })}
          >
            {match.score_faction1 ?? "—"}
          </span>
          <span className="text-neutral-700">:</span>
          <span
            className={cn({
              "text-emerald-400": t2?.is_winner === true,
              "text-red-400": t2?.is_winner === false,
              "text-neutral-300": t2?.is_winner == null,
            })}
          >
            {match.score_faction2 ?? "—"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", st.cls)}>
            {st.text}
          </Badge>
          <span className="font-mono text-neutral-600 text-xs">{label}</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
        <span
          className={cn("truncate font-semibold text-sm", {
            "text-emerald-400": t2?.is_winner === true,
            "text-red-400": t2?.is_winner === false,
            "text-neutral-200": t2?.is_winner == null,
          })}
        >
          {t2?.team_name ?? "TBD"}
        </span>
        <Avatar className="size-9 shrink-0 rounded-lg">
          <AvatarFallback className="rounded-lg text-sm">
            {t2?.team_name?.charAt(0) ?? "?"}
          </AvatarFallback>
        </Avatar>
      </div>

      {match.started_at && (
        <span className="hidden shrink-0 font-mono text-neutral-600 text-xs sm:block">
          {format(new Date(match.started_at), "dd/MM/yy")}
        </span>
      )}
    </Link>
  );
}

function MatchesTab({
  matches,
  slug,
}: {
  matches: EventMatch[];
  slug: string;
}) {
  if (!matches.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-16 text-center">
        <IconTrophy size={32} className="text-yellow-400/60" />
        <p className="text-neutral-400 text-sm">No matches yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {matches.map((m) => (
        <MatchCard key={m.match_id} match={m} slug={slug} />
      ))}
    </div>
  );
}

type TeamStanding = {
  faction_id: string;
  team_name: string;
  matches: number;
  wins: number;
  losses: number;
  maps_won: number;
  maps_lost: number;
};

function buildStandings(data: EventMatch[]): TeamStanding[] {
  const map: Record<string, TeamStanding> = {};

  for (const match of data) {
    if (match.status !== "FINISHED") continue;

    for (const team of match.teams) {
      const fid = team.faction_id;
      if (!map[fid]) {
        map[fid] = {
          faction_id: fid,
          team_name: team.team_name ?? fid,
          matches: 0,
          wins: 0,
          losses: 0,
          maps_won: 0,
          maps_lost: 0,
        };
      }
      map[fid].matches++;
      if (team.is_winner === true) map[fid].wins++;
      else if (team.is_winner === false) map[fid].losses++;
    }

    for (const mapData of match.maps) {
      if (!mapData.winner_faction_id) continue;
      for (const team of match.teams) {
        if (team.faction_id === mapData.winner_faction_id) {
          if (map[team.faction_id]) map[team.faction_id].maps_won++;
        } else {
          if (map[team.faction_id]) map[team.faction_id].maps_lost++;
        }
      }
    }
  }

  return Object.values(map).sort(
    (a, b) => b.wins - a.wins || b.maps_won - a.maps_won,
  );
}

function TeamsTab({ matches, slug }: { matches: EventMatch[]; slug: string }) {
  const standings = buildStandings(matches);
  if (!standings.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-16 text-center">
        <IconTrophy size={32} className="text-yellow-400/60" />
        <p className="text-neutral-400 text-sm">No teams yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
      <div className="w-full overflow-x-auto">
        <table className="w-max min-w-full">
          <colgroup>
            <col className="w-8" />
            <col className="w-56" />
            <col className="w-20" />
            <col className="w-16" />
            <col className="w-16" />
            <col className="w-24" />
          </colgroup>
          <thead>
            <tr className="border-neutral-800/50 border-b">
              {["#", "Team", "Matches", "W", "L", "Maps"].map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    "px-4 py-3 font-mono text-neutral-600 text-xs uppercase tracking-widest",
                    i <= 1 ? "text-left" : "text-right",
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((team, idx) => (
              <tr
                key={team.faction_id}
                className="border-neutral-800/50 border-b last:border-0 hover:bg-neutral-800/20"
              >
                <td className="px-4 py-3 font-mono text-neutral-600 text-sm">
                  {idx + 1}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/events/${slug}/teams/${encodeURIComponent(team.faction_id)}`}
                    className="flex items-center gap-3 transition-colors hover:text-white"
                  >
                    <Avatar className="size-7 rounded-lg">
                      <AvatarFallback className="rounded-lg text-xs">
                        {team.team_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-neutral-200 text-sm">
                      {team.team_name}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right font-mono text-neutral-400 text-sm">
                  {team.matches}
                </td>
                <td className="px-4 py-3 text-right font-bold font-mono text-emerald-400 text-sm">
                  {team.wins}
                </td>
                <td className="px-4 py-3 text-right font-mono text-red-400 text-sm">
                  {team.losses}
                </td>
                <td className="px-4 py-3 text-right font-mono text-neutral-400 text-sm">
                  {team.maps_won}
                  <span className="text-neutral-700">:</span>
                  {team.maps_lost}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type PlayerLeaderboardRow = {
  player_id: string;
  nickname: string;
  maps: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  adr: number;
  mvps: number;
};

function buildPlayerLeaderboard(data: EventMatch[]): PlayerLeaderboardRow[] {
  const map: Record<string, PlayerLeaderboardRow> = {};

  for (const match of data) {
    if (match.status !== "FINISHED") continue;
    for (const mapData of match.maps) {
      for (const ps of mapData.player_stats) {
        const pid = ps.player_id;
        if (!map[pid]) {
          map[pid] = {
            player_id: pid,
            nickname: ps.nickname,
            maps: 0,
            kills: 0,
            deaths: 0,
            assists: 0,
            headshots: 0,
            adr: 0,
            mvps: 0,
          };
        }
        map[pid].maps++;
        map[pid].kills += ps.kills ?? 0;
        map[pid].deaths += ps.deaths ?? 0;
        map[pid].assists += ps.assists ?? 0;
        map[pid].headshots += ps.headshots ?? 0;
        map[pid].adr += ps.adr ?? 0;
        map[pid].mvps += ps.mvps ?? 0;
      }
    }
  }

  return Object.values(map).sort(
    (a, b) => b.kills / Math.max(b.deaths, 1) - a.kills / Math.max(a.deaths, 1),
  );
}

function PlayersTab({
  matches,
  slug,
}: {
  matches: EventMatch[];
  slug: string;
}) {
  const players = buildPlayerLeaderboard(matches);
  if (!players.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-16 text-center">
        <IconTrophy size={32} className="text-yellow-400/60" />
        <p className="text-neutral-400 text-sm">No player stats yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
      <div className="w-full overflow-x-auto">
        <table className="w-max min-w-full">
          <colgroup>
            <col className="w-8" />
            <col className="w-52" />
            <col className="w-16" />
            <col className="w-16" />
            <col className="w-14" />
            <col className="w-14" />
            <col className="w-16" />
            <col className="w-16" />
            <col className="w-14" />
          </colgroup>
          <thead>
            <tr className="border-neutral-800/50 border-b">
              {["#", "Player", "Maps", "KD", "K", "D", "ADR", "HS%", "MVP"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={cn(
                      "px-4 py-3 font-mono text-neutral-600 text-xs uppercase tracking-widest",
                      i <= 1 ? "text-left" : "text-right",
                    )}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {players.map((p, idx) => {
              const kd = p.kills / Math.max(p.deaths, 1);
              const avgAdr = p.adr / Math.max(p.maps, 1);
              const hsPercent = (p.headshots / Math.max(p.kills, 1)) * 100;
              return (
                <tr
                  key={p.player_id}
                  className="border-neutral-800/50 border-b last:border-0 hover:bg-neutral-800/20"
                >
                  <td className="px-4 py-2.5 font-mono text-neutral-600 text-sm">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/events/${slug}/players/${encodeURIComponent(p.player_id)}`}
                      className="font-medium text-neutral-200 text-sm transition-colors hover:text-white"
                    >
                      {p.nickname}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                    {p.maps}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm">
                    <span
                      className={kd >= 1 ? "text-emerald-400" : "text-red-400"}
                    >
                      {kd.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-300 text-sm">
                    {p.kills}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                    {p.deaths}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                    {avgAdr.toFixed(1)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-neutral-400 text-sm">
                    {hsPercent.toFixed(1)}%
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm text-yellow-400">
                    {p.mvps}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: "matches", label: "Matches" },
  { id: "teams", label: "Teams" },
  { id: "players", label: "Players" },
];

export function EventTabs({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawTab = searchParams.get("tab") as Tab | null;
  const activeTab: Tab =
    rawTab && TABS.some((t) => t.id === rawTab) ? rawTab : "matches";

  const { data: matches = [], isLoading } = useEventData(slug);

  function setTab(tab: Tab) {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-fit gap-1 rounded-xl border border-neutral-800 bg-neutral-900/50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={cn(
              "rounded-lg px-4 py-1.5 font-medium text-sm transition-colors",
              activeTab === tab.id
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-300",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-xl bg-neutral-900" />
          <Skeleton className="h-20 w-full rounded-xl bg-neutral-900" />
          <Skeleton className="h-20 w-full rounded-xl bg-neutral-900" />
        </div>
      ) : activeTab === "matches" ? (
        <MatchesTab matches={matches} slug={slug} />
      ) : activeTab === "teams" ? (
        <TeamsTab matches={matches} slug={slug} />
      ) : (
        <PlayersTab matches={matches} slug={slug} />
      )}
    </div>
  );
}
