"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { SkillLevelIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PaginationContent, PaginationItem } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlayersWithPagination } from "@/hooks/usePlayers";
import { getCountryFlagUrl } from "@/lib/country";
import { formatNumberWithSign, getSkillLevelFromElo } from "@/lib/faceit/utils";

type PlayerWithPagination = NonNullable<
  ReturnType<typeof usePlayersWithPagination>["data"]
>[number];

const PAGE_SIZE = 20;

function getSeasonElo(player: PlayerWithPagination, season: string) {
  return season === "season-8" ? player.faceit_elo : player.elo_season_7;
}

function EloDelta({ player }: { player: PlayerWithPagination }) {
  if (player.elo_before == null || player.faceit_elo == null) return null;
  const difference = player.faceit_elo - player.elo_before;
  if (difference === 0) return null;
  return (
    <span
      className={`font-mono text-xs tabular-nums ${difference > 0 ? "text-emerald-400" : "text-red-400"}`}
    >
      {formatNumberWithSign(difference)}
    </span>
  );
}

function CompactPlayerRow({
  player,
  rank,
  season,
}: {
  player: PlayerWithPagination;
  rank: number;
  season: string;
}) {
  const elo = getSeasonElo(player, season);

  return (
    <Link
      href={`/player/${player.nickname}`}
      className="group flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 transition-all hover:-translate-y-0.5 hover:border-red-500/50 hover:bg-neutral-900 md:gap-4"
    >
      <div className="w-8 shrink-0 text-center font-mono text-neutral-500 text-xs tabular-nums md:w-10 md:text-sm">
        #{rank}
      </div>

      <Avatar className="size-9 rounded-lg md:size-10">
        <AvatarImage src={player.avatar} alt={player.nickname} />
        <AvatarFallback className="rounded-lg text-neutral-500 text-xs">
          {player.nickname?.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="line-clamp-1 font-medium text-sm text-white md:text-base">
          {player.nickname}
        </p>
        {player.country ? (
          <Image
            className="shrink-0 rounded-xs"
            src={getCountryFlagUrl(player.country.toLowerCase(), 20)}
            width={15}
            height={10}
            alt={player.country}
          />
        ) : (
          <div className="h-2.5 w-3.75 shrink-0 rounded-xs bg-neutral-800" />
        )}
      </div>

      <div className="grid flex-none grid-cols-[1fr_auto_auto] items-center gap-2">
        <span className="text-right font-bold font-mono text-neutral-200 text-sm tabular-nums md:text-base">
          {elo}
        </span>
        {elo != null ? (
          <SkillLevelIcon
            level={getSkillLevelFromElo(elo)}
            className="size-5 shrink-0"
          />
        ) : null}
        <div className="flex w-6 justify-start">
          {season === "season-8" ? <EloDelta player={player} /> : null}
        </div>
      </div>
    </Link>
  );
}

export default function LeaderboardPage() {
  const [season, setSeason] = useState<string>("season-8");

  const {
    data: players = [],
    totalPages,
    canPreviousPage,
    canNextPage,
    pageIndex,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
  } = usePlayersWithPagination(season);

  const filteredPlayers = players?.filter((player) => {
    if (season === "season-8") {
      return player.faceit_elo != null;
    } else if (season === "season-7") {
      return player.elo_season_7 != null;
    }
    return false;
  });

  const topPlayers = filteredPlayers.slice(0, 3);
  const remainingPlayers = filteredPlayers.slice(3);
  const shouldShowTopCards = pageIndex === 1;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <section className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-[radial-gradient(120%_140%_at_100%_0%,rgba(239,68,68,0.18),rgba(10,10,10,0.92)_45%)] p-4 md:p-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-medium font-mono text-[11px] text-red-400 uppercase tracking-[0.18em]">
              Leaderboard
            </p>
            <h2 className="font-semibold text-2xl text-white tracking-tight md:text-3xl">
              Player Rankings by ELO
            </h2>
            <p className="max-w-prose text-neutral-300/80 text-sm md:text-base">
              All linked players sorted by current rating for the selected
              season.
            </p>
          </div>
          <div className="w-full md:w-52">
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger className="w-full border-neutral-600/70 bg-black/40 backdrop-blur">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="season-8">Season 8</SelectItem>
                  <SelectItem value="season-7">Season 7</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {shouldShowTopCards && topPlayers.length > 0 ? (
        <section className="hidden gap-3 sm:grid-cols-2 lg:grid lg:grid-cols-3">
          {topPlayers.map((player, index) => {
            const rank = (pageIndex - 1) * PAGE_SIZE + index + 1;
            const elo = getSeasonElo(player, season);

            return (
              <Link
                href={`/player/${player.nickname}`}
                key={player.id}
                className="group rounded-2xl border border-neutral-800/90 bg-neutral-900/60 p-4 transition-all hover:-translate-y-0.5 hover:border-red-500/50 hover:bg-neutral-900"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="inline-flex h-7 items-center rounded-full border border-red-500/20 bg-red-500/10 px-2.5 font-mono text-[11px] text-red-400 tabular-nums">
                    TOP {rank}
                  </div>
                  <span className="font-mono text-neutral-500 text-xs">
                    {season === "season-8" ? "S8" : "S7"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Avatar className="size-11 rounded-xl ring-1 ring-neutral-700/70">
                    <AvatarImage src={player.avatar} alt={player.nickname} />
                    <AvatarFallback className="rounded-xl text-neutral-500 text-xs">
                      {player.nickname?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-semibold text-sm text-white md:text-base">
                      {player.nickname}
                    </p>
                    {player.country ? (
                      <Image
                        className="shrink-0 rounded-xs"
                        src={getCountryFlagUrl(
                          player.country.toLowerCase(),
                          20,
                        )}
                        width={15}
                        height={10}
                        alt={player.country}
                      />
                    ) : (
                      <div className="h-2.5 w-3.75 shrink-0 rounded-xs bg-neutral-800" />
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="font-mono text-[11px] text-neutral-500 uppercase tracking-wider">
                      ELO
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="font-bold font-mono text-2xl text-white tabular-nums">
                        {elo}
                      </p>
                      {elo != null ? (
                        <SkillLevelIcon
                          level={getSkillLevelFromElo(elo)}
                          className="size-6 shrink-0"
                        />
                      ) : null}
                    </div>
                  </div>
                  {season === "season-8" ? <EloDelta player={player} /> : null}
                </div>
              </Link>
            );
          })}
        </section>
      ) : null}

      <div className="space-y-2 lg:hidden">
        {filteredPlayers.length ? (
          filteredPlayers.map((player, index) => {
            const rank = (pageIndex - 1) * PAGE_SIZE + index + 1;

            return (
              <CompactPlayerRow
                key={player.id}
                player={player}
                rank={rank}
                season={season}
              />
            );
          })
        ) : (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-6 text-center">
            <p className="font-medium text-white">No data</p>
            <p className="mt-1 text-neutral-500 text-sm">
              No players with ELO were found for this season yet.
            </p>
          </div>
        )}
      </div>

      <div className="hidden space-y-2 lg:block">
        {(shouldShowTopCards ? remainingPlayers : filteredPlayers).length ? (
          (shouldShowTopCards ? remainingPlayers : filteredPlayers).map(
            (player, index) => {
              const rank =
                (pageIndex - 1) * PAGE_SIZE +
                index +
                (shouldShowTopCards ? 4 : 1);

              return (
                <CompactPlayerRow
                  key={player.id}
                  player={player}
                  rank={rank}
                  season={season}
                />
              );
            },
          )
        ) : (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-6 text-center">
            <p className="font-medium text-white">No data</p>
            <p className="mt-1 text-neutral-500 text-sm">
              No players with ELO were found for this season yet.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-3 sm:flex-row sm:items-center">
        <span className="font-mono text-neutral-500 text-xs">
          Page {pageIndex} of {totalPages}
        </span>
        <PaginationContent className="gap-1">
          {[
            {
              icon: <IconChevronsLeft size={14} />,
              action: firstPage,
              disabled: !canPreviousPage,
              label: "First",
            },
            {
              icon: <IconChevronLeft size={14} />,
              action: previousPage,
              disabled: !canPreviousPage,
              label: "Prev",
            },
            {
              icon: <IconChevronRight size={14} />,
              action: nextPage,
              disabled: !canNextPage,
              label: "Next",
            },
            {
              icon: <IconChevronsRight size={14} />,
              action: lastPage,
              disabled: !canNextPage,
              label: "Last",
            },
          ].map(({ icon, action, disabled, label }) => (
            <PaginationItem key={label}>
              <Button
                variant="dark"
                size="icon-sm"
                onClick={() => action?.()}
                disabled={disabled}
                className="border border-neutral-800 disabled:opacity-30"
              >
                <span className="sr-only">{label}</span>
                {icon}
              </Button>
            </PaginationItem>
          ))}
        </PaginationContent>
      </div>
    </div>
  );
}
