"use client";

import NumberFlow from "@number-flow/react";
import { IconClock, IconExternalLink, IconMapPin } from "@tabler/icons-react";
import { format, intervalToDuration } from "date-fns";
import { isNumber, meanBy } from "es-toolkit";
import { orderBy } from "es-toolkit/array";
import { divide, gt, lt, multiply, subtract, sumBy } from "es-toolkit/compat";
import { isNil } from "es-toolkit/predicate";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useMemo } from "react";

import { SkillLevelIcon } from "@/components/icons";
import { MapBackground } from "@/components/map-background";
import { TwitchPlayer } from "@/components/twitch-player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLiveStreams } from "@/hooks/useLiveStreams";
import { useMatch } from "@/hooks/useMatch";
import { calculateAverageStats } from "@/lib/calculateAverageStats";
import { getCountryCode, getFlagUrl } from "@/lib/country";
import { formatNumberWithSign } from "@/lib/faceit/utils";
import { cn } from "@/lib/utils";

type MatchType = NonNullable<ReturnType<typeof useMatch>["data"]>;
type TeamType = MatchType["teams"][number];
type PlayerType = TeamType["team_players"][number];

const formatDuration = (start: string, end: string): string => {
  const { hours = 0, minutes = 0 } = intervalToDuration({ start, end });
  if (hours > 0 && minutes === 0) return `${hours}h`;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        <Skeleton className="h-40 w-full rounded-none" />
        <div className="grid grid-cols-3 items-center gap-4 px-6 py-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-xl" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center justify-end gap-4">
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-12" />
            </div>
            <Skeleton className="size-14 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-32" />
        {[0, 1].map((t) => (
          <div
            key={t}
            className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950"
          >
            <div className="flex items-center gap-3 border-neutral-800 border-b px-4 py-3">
              <Skeleton className="size-7 rounded-lg" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="ml-auto h-4 w-10" />
            </div>
            <div className="px-4">
              {[0, 1, 2, 3, 4].map((r) => (
                <div
                  key={r}
                  className="flex items-center justify-between border-neutral-800/50 border-b py-3 last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-6 rounded" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex gap-6">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((c) => (
                      <Skeleton key={c} className="h-4 w-8" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchHeader({ match }: { match: MatchType }) {
  const [team1, team2] = match.teams;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
      {match.map_pick && <MapBackground map={match.map_pick} />}

      <div className="relative px-6 pt-5 pb-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
            <IconMapPin size={13} className="text-neutral-500" />
            <span className="font-medium font-mono text-neutral-300 text-xs capitalize">
              {match.map_pick?.replace("de_", "") ?? "—"}
            </span>
          </div>
          <div className="hidden sm:block" />
          <div className="flex items-center gap-3">
            {match.started_at && (
              <span className="font-mono text-neutral-600 text-xs">
                {format(match.started_at, "HH:mm · dd/MM/yyyy")}
              </span>
            )}
            {match.finished_at && match.started_at && (
              <span className="rounded border border-neutral-800 bg-neutral-900/60 px-2 py-1 font-mono text-neutral-500 text-xs">
                <IconClock size={11} className="mr-1 inline" />
                {formatDuration(match.started_at, match.finished_at)}
              </span>
            )}
            <Button variant="dark" size="sm" asChild>
              <Link
                href={`https://www.faceit.com/en/cs2/room/1-${match.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                FACEIT
                <IconExternalLink size={12} className="ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 items-center gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 rounded-xl">
              <AvatarImage src={team1.avatar ?? undefined} />
              <AvatarFallback className="rounded-xl text-neutral-400">
                {team1.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-white">{team1.name}</p>
              <span
                className={cn("font-black font-mono text-4xl tabular-nums", {
                  "text-emerald-400": team1.team_win === true,
                  "text-red-400": team1.team_win === false,
                  "text-white": team1.team_win === null,
                })}
              >
                <NumberFlow value={Number(team1.final_score)} />
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="font-bold font-mono text-2xl text-neutral-700">
              VS
            </span>
            {(team1.first_half_score != null ||
              team1.second_half_score != null) && (
              <div className="flex items-center gap-1 text-center">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
                    1H
                  </span>
                  <span className="font-mono text-neutral-400 text-xs">
                    {team1.first_half_score ?? "—"} :{" "}
                    {team2.first_half_score ?? "—"}
                  </span>
                </div>
                <span className="mx-1 text-neutral-800">·</span>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
                    2H
                  </span>
                  <span className="font-mono text-neutral-400 text-xs">
                    {team1.second_half_score ?? "—"} :{" "}
                    {team2.second_half_score ?? "—"}
                  </span>
                </div>
                {team1.overtime_score != null && team1.overtime_score > 0 && (
                  <>
                    <span className="mx-1 text-neutral-800">·</span>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
                        OT
                      </span>
                      <span className="font-mono text-xs text-yellow-500/80">
                        {team1.overtime_score} : {team2.overtime_score}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
            {match.location_pick && (
              <div className="flex items-center gap-1.5">
                <Image
                  src={getFlagUrl(getCountryCode(match.location_pick), "sm")}
                  alt="Server location"
                  width={16}
                  height={11}
                  className="rounded-xs"
                />
                <span className="font-mono text-neutral-600 text-xs">
                  {match.location_pick}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-4 text-right">
            <div>
              <p className="font-bold text-white">{team2.name}</p>
              <span
                className={cn("font-black font-mono text-4xl tabular-nums", {
                  "text-emerald-400": team2.team_win === true,
                  "text-red-400": team2.team_win === false,
                  "text-white": team2.team_win === null,
                })}
              >
                <NumberFlow value={Number(team2.final_score)} />
              </span>
            </div>
            <Avatar className="size-14 rounded-xl">
              <AvatarImage src={team2.avatar ?? undefined} />
              <AvatarFallback className="rounded-xl text-neutral-400">
                {team2.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCell({
  value,
  highlight,
}: {
  value: React.ReactNode;
  highlight?: "green" | "red" | null;
}) {
  return (
    <td
      className={cn(
        "px-4 py-2.5 text-right font-mono text-sm tabular-nums",
        highlight === "green"
          ? "text-emerald-400"
          : highlight === "red"
            ? "text-red-400"
            : "text-neutral-400",
      )}
    >
      {value ?? "—"}
    </td>
  );
}

function PlayerStatsRow({
  player,
  totalScore,
}: {
  player: PlayerType;
  totalScore: number;
}) {
  const stats =
    isNumber(player.assists) &&
    isNumber(player.deaths) &&
    isNumber(player.adr) &&
    isNumber(player.kr_ratio)
      ? calculateAverageStats({
          rounds: totalScore,
          assists: player.assists,
          deaths: player.deaths,
          adr: player.adr,
          kpr: player.kr_ratio,
        })
      : undefined;

  const kdDiff =
    !isNil(player.kills) && !isNil(player.deaths)
      ? subtract(player.kills, player.deaths)
      : null;
  const kd =
    !isNil(player.kills) && !isNil(player.deaths)
      ? divide(player.kills, player.deaths)
      : null;
  const hpr =
    isNumber(player.headshots) && isNumber(player.kills)
      ? multiply(divide(player.headshots, player.kills), 100)
      : null;

  return (
    <tr className="group border-neutral-800/50 border-b transition-colors last:border-0 hover:bg-neutral-800/20">
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <SkillLevelIcon
            level={player.game_skill_level ?? 0}
            className="size-6 shrink-0"
          />
          <Link
            href={
              player.player_id_nullable
                ? `/player/${player.nickname}`
                : `/player/${player.player_id_mandatory}`
            }
            className="font-medium text-neutral-200 text-sm transition-colors hover:text-white"
          >
            {player.nickname}
          </Link>
        </div>
      </td>
      <StatCell value={player.kills} />
      <StatCell value={player.deaths} />
      <StatCell value={player.assists} />
      <StatCell
        value={isNumber(kdDiff) ? formatNumberWithSign(kdDiff) : null}
        highlight={
          isNumber(kdDiff)
            ? gt(kdDiff, 0)
              ? "green"
              : lt(kdDiff, 0)
                ? "red"
                : null
            : null
        }
      />
      <StatCell value={kd?.toFixed(2)} />
      <StatCell value={player.adr?.toFixed(1)} />
      <StatCell value={hpr != null ? `${hpr.toFixed(1)}%` : null} />
      <StatCell value={stats?.rating.toFixed(2)} />
    </tr>
  );
}

function TeamTotalsRow({
  players,
  totalScore,
}: {
  players: PlayerType[];
  totalScore: number;
}) {
  const hasKills = players.some((p) => p.kills != null);
  const hasDeaths = players.some((p) => p.deaths != null);
  const hasAssists = players.some((p) => p.assists != null);
  const hasHeadshots = players.some((p) => p.headshots != null);
  const hasAdr = players.some((p) => p.adr != null);
  const hasKrRatio = players.some((p) => p.kr_ratio != null);

  const totalKills = hasKills ? sumBy(players, (p) => p.kills ?? 0) : undefined;
  const totalDeaths = hasDeaths
    ? sumBy(players, (p) => p.deaths ?? 0)
    : undefined;
  const totalAssists = hasAssists
    ? sumBy(players, (p) => p.assists ?? 0)
    : undefined;
  const totalHeadshots = hasHeadshots
    ? sumBy(players, (p) => p.headshots ?? 0)
    : undefined;

  const kdDiff =
    isNumber(totalKills) && isNumber(totalDeaths)
      ? subtract(totalKills, totalDeaths)
      : undefined;

  const avgKD =
    isNumber(totalKills) && isNumber(totalDeaths) && totalDeaths > 0
      ? divide(totalKills, totalDeaths)
      : undefined;

  const avgADR = hasAdr
    ? meanBy(
        players.filter((p) => p.adr != null),
        (p) => p.adr ?? 0,
      )
    : undefined;

  const avgHPR =
    isNumber(totalHeadshots) && isNumber(totalKills) && totalKills > 0
      ? multiply(divide(totalHeadshots, totalKills), 100)
      : undefined;

  const avgRating =
    hasKrRatio && hasAdr
      ? meanBy(
          players,
          (p) =>
            calculateAverageStats({
              rounds: totalScore,
              assists: p.assists ?? 0,
              deaths: p.deaths ?? 0,
              adr: p.adr ?? 0,
              kpr: p.kr_ratio ?? 0,
            }).rating,
        )
      : undefined;

  return (
    <tr className="border-neutral-800/50 border-t bg-neutral-900/40">
      <td className="px-4 py-2 text-left font-mono text-neutral-600 text-sm uppercase tracking-widest">
        Total
      </td>
      <StatCell value={totalKills} />
      <StatCell value={totalDeaths} />
      <StatCell value={totalAssists} />
      <StatCell
        value={isNumber(kdDiff) ? formatNumberWithSign(kdDiff) : null}
        highlight={
          isNumber(kdDiff)
            ? gt(kdDiff, 0)
              ? "green"
              : lt(kdDiff, 0)
                ? "red"
                : null
            : null
        }
      />
      <StatCell value={avgKD?.toFixed(2)} />
      <StatCell value={avgADR?.toFixed(1)} />
      <StatCell value={avgHPR != null ? `${avgHPR.toFixed(1)}%` : null} />
      <StatCell value={avgRating?.toFixed(2)} />
    </tr>
  );
}

function TeamStatsTable({
  team,
  totalScore,
  isMatchFinished,
}: {
  team: TeamType;
  totalScore: number;
  isMatchFinished: boolean;
}) {
  const sortedPlayers = useMemo(() => {
    return isMatchFinished
      ? orderBy(team.team_players, ["kills"], ["desc"])
      : orderBy(team.team_players, ["game_skill_level"], ["desc"]);
  }, [isMatchFinished, team.team_players]);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
      <div className="flex items-center gap-3 border-neutral-800 border-b px-4 py-3">
        <Avatar className="size-7 rounded-lg">
          <AvatarImage src={team.avatar ?? undefined} />
          <AvatarFallback className="rounded-lg text-neutral-500 text-xs">
            {team.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold text-sm text-white">{team.name}</span>
        <span
          className={cn("ml-auto font-bold font-mono text-sm", {
            "text-emerald-400": team.team_win === true,
            "text-red-400": team.team_win === false,
            "text-neutral-400": team.team_win === null,
          })}
        >
          {team.team_win === true
            ? "WIN"
            : team.team_win === false
              ? "LOSS"
              : null}
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-max min-w-full">
          <colgroup>
            <col className="w-48" />
            <col className="w-16" />
            <col className="w-16" />
            <col className="w-16" />
            <col className="w-16" />
            <col className="w-20" />
            <col className="w-20" />
            <col className="w-20" />
            <col className="w-20" />
          </colgroup>
          <thead>
            <tr className="border-neutral-800/50 border-b">
              {[
                "Player",
                "K",
                "D",
                "A",
                "+/-",
                "KD",
                "ADR",
                "HS%",
                "Rating",
              ].map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    "px-4 py-2 font-mono text-neutral-600 text-xs uppercase tracking-widest",
                    i === 0 ? "text-left" : "text-right",
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => (
              <PlayerStatsRow
                key={player.id}
                player={player}
                totalScore={totalScore}
              />
            ))}
          </tbody>
          <tfoot>
            <TeamTotalsRow
              players={team.team_players}
              totalScore={totalScore}
            />
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default function MatchPage(props: PageProps<"/match/[matchId]">) {
  const { matchId } = use(props.params);
  const { data: match, isLoading } = useMatch(matchId.replace(/^1-/, ""));
  const { data: streamingPlayers = [] } = useLiveStreams();

  if (!matchId.startsWith("1-")) return notFound();
  if (isLoading) return <Loading />;
  if (!match) return notFound();

  const totalScore = sumBy(match.teams, (team) => team.final_score ?? 0);

  const matchPlayerIds = match.teams
    .flatMap((t) => t.team_players)
    .map((p) => p.player_id_nullable)
    .filter(Boolean);

  const activeStreams = streamingPlayers
    .filter((s) => s.twitch_login)
    .filter((s) => matchPlayerIds.includes(s.id));

  return (
    <div className="flex flex-col gap-4">
      <MatchHeader match={match} />

      {activeStreams.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-bold text-neutral-600 text-sm uppercase tracking-widest">
            Live Streams
          </h2>
          <div
            className={cn(
              "grid gap-4",
              activeStreams.length === 1
                ? "grid-cols-1"
                : "grid-cols-1 lg:grid-cols-2",
            )}
          >
            {activeStreams.map((s) => (
              <TwitchPlayer key={s.id} login={s.twitch_login as string} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-neutral-600 text-sm uppercase tracking-widest">
          Match Statistics
        </h2>
        {match.teams.map((team) => (
          <TeamStatsTable
            key={team.id}
            team={team}
            totalScore={totalScore}
            isMatchFinished={Boolean(match.finished_at)}
          />
        ))}
      </div>
    </div>
  );
}
