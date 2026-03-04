"use client";

import { IconClock, IconExternalLink, IconMapPin } from "@tabler/icons-react";
import { format, intervalToDuration } from "date-fns";
import { isNumber } from "es-toolkit";
import { orderBy } from "es-toolkit/array";
import { gt, lt, subtract, sumBy } from "es-toolkit/compat";
import { isNil } from "es-toolkit/predicate";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useMemo } from "react";

import { SkillLevelIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useMatch } from "@/hooks/useMatch";
import { calculateAverageStats } from "@/lib/calculateAverageStats";
import { getCountryCode, getFlagUrl } from "@/lib/country";
import { formatNumberWithSign } from "@/lib/faceit/utils";
import { cn } from "@/lib/utils";

type MatchType = NonNullable<ReturnType<typeof useMatch>["data"]>;

type TeamType = MatchType["teams"][number];

type PlayerType = TeamType["team_players"][number];

import Loading from "./loading";

const formatDuration = (start: string, end: string): string => {
  const { hours = 0, minutes = 0 } = intervalToDuration({ start, end });
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

function MatchHeader({ match }: { match: MatchType }) {
  const team1 = match.teams[0];
  const team2 = match.teams[1];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
      {/* map background */}
      {match.map_pick && (
        <div className="absolute inset-0">
          <Image
            src={`/img/maps/${match.map_pick}.webp`}
            alt="Map"
            fill
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-linear-to-b from-neutral-950/60 via-neutral-950/80 to-neutral-950" />
        </div>
      )}

      {/* glow top line */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-neutral-600/50 to-transparent" />

      <div className="relative px-6 pt-5 pb-6">
        {/* top bar: map + faceit link */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
            <IconMapPin size={13} className="text-neutral-500" />
            <span className="font-medium font-mono text-neutral-300 text-xs capitalize">
              {match.map_pick?.replace("de_", "") ?? "—"}
            </span>
          </div>

          {/* spacer for PC so the right side stays on the right */}
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
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="border border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
            >
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

        {/* teams + score */}
        <div className="grid grid-cols-3 items-center gap-4">
          {/* team 1 */}
          <div className="flex items-center gap-4">
            <Avatar className="size-14 rounded-xl border border-neutral-800">
              <AvatarImage src={team1.avatar ?? undefined} />
              <AvatarFallback className="rounded-xl bg-neutral-800 text-neutral-400">
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
                {team1.final_score ?? "—"}
              </span>
            </div>
          </div>

          {/* center */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-bold font-mono text-2xl text-neutral-700">
              VS
            </span>

            {/* half scores */}
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

          {/* team 2 */}
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
                {team2.final_score ?? "—"}
              </span>
            </div>
            <Avatar className="size-14 rounded-xl border border-neutral-800">
              <AvatarImage src={team2.avatar ?? undefined} />
              <AvatarFallback className="rounded-xl bg-neutral-800 text-neutral-400">
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

  return (
    <tr className="group border-neutral-800/50 border-b transition-colors last:border-0 hover:bg-neutral-800/20">
      {/* player */}
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

      {/* K - D */}
      <StatCell
        value={
          !isNil(player.kills) && !isNil(player.deaths)
            ? `${player.kills} - ${player.deaths}`
            : null
        }
      />

      {/* +/- */}
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

      {/* ADR */}
      <StatCell value={player.adr?.toFixed(1)} />

      {/* Rating */}
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
  const totalKills = sumBy(players, (p) => p.kills ?? 0);
  const totalDeaths = sumBy(players, (p) => p.deaths ?? 0);
  const kdDiff = totalKills - totalDeaths;
  const avgAdr =
    players.length > 0 ? sumBy(players, (p) => p.adr ?? 0) / players.length : 0;

  const validStats = players.filter(
    (
      p,
    ): p is PlayerType & {
      assists: number;
      deaths: number;
      adr: number;
      kr_ratio: number;
    } =>
      isNumber(p.assists) &&
      isNumber(p.deaths) &&
      isNumber(p.adr) &&
      isNumber(p.kr_ratio),
  );

  const avgRating =
    validStats.length > 0
      ? sumBy(
          validStats,
          (p) =>
            calculateAverageStats({
              rounds: totalScore,
              assists: p.assists,
              deaths: p.deaths,
              adr: p.adr,
              kpr: p.kr_ratio,
            }).rating,
        ) / validStats.length
      : null;

  return (
    <tr className="border-neutral-800/50 border-t bg-neutral-900/40">
      <td className="px-4 py-2 text-left font-mono text-neutral-600 text-sm uppercase tracking-widest">
        Total
      </td>
      <td className="px-4 py-2 text-right font-mono text-neutral-400 text-sm tabular-nums">
        {totalKills} - {totalDeaths}
      </td>
      <td
        className={cn(
          "px-4 py-2 text-right font-mono text-sm tabular-nums",
          kdDiff > 0
            ? "text-emerald-400"
            : kdDiff < 0
              ? "text-red-400"
              : "text-neutral-400",
        )}
      >
        {formatNumberWithSign(kdDiff)}
      </td>
      <td className="px-4 py-2 text-right font-mono text-neutral-400 text-sm tabular-nums">
        {avgAdr.toFixed(1)}
      </td>
      <td className="px-4 py-2 text-right font-mono text-neutral-400 text-sm tabular-nums">
        {avgRating?.toFixed(2) ?? "—"}
      </td>
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
      {/* team header */}
      <div className="flex items-center gap-3 border-neutral-800 border-b px-4 py-3">
        <Avatar className="size-7 rounded-lg border border-neutral-800">
          <AvatarImage src={team.avatar ?? undefined} />
          <AvatarFallback className="rounded-lg bg-neutral-800 text-neutral-500 text-xs">
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
              : "—"}
        </span>
      </div>

      {/* stats table */}
      <div className="w-full overflow-x-auto">
        <table className="w-max min-w-full">
          <thead>
            <tr className="border-neutral-800/50 border-b">
              <th className="px-4 py-2 text-left font-mono text-neutral-600 text-xs uppercase tracking-widest">
                Player
              </th>
              <th className="px-4 py-2 text-right font-mono text-neutral-600 text-xs uppercase tracking-widest">
                K - D
              </th>
              <th className="px-4 py-2 text-right font-mono text-neutral-600 text-xs uppercase tracking-widest">
                +/-
              </th>
              <th className="px-4 py-2 text-right font-mono text-neutral-600 text-xs uppercase tracking-widest">
                ADR
              </th>
              <th className="px-4 py-2 text-right font-mono text-neutral-600 text-xs uppercase tracking-widest">
                Rating
              </th>
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

  if (!matchId.startsWith("1-")) return notFound();
  if (isLoading) return <Loading />;
  if (!match) return notFound();

  const totalScore = sumBy(match.teams, (team) => team.final_score ?? 0);

  return (
    <div className="flex flex-col gap-4">
      <MatchHeader match={match} />

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
