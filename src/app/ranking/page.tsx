"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconTrophy,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import { SkillLevelIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayersWithPagination } from "@/hooks/usePlayers";
import { getCountryFlagUrl } from "@/lib/country";
import { formatNumberWithSign } from "@/lib/faceit/utils";

type PlayerWithPagination = NonNullable<
  ReturnType<typeof usePlayersWithPagination>["data"]
>[number];

const PAGE_SIZE = 20;

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

function getRankColor(index: number) {
  if (index === 0) return "text-yellow-400";
  if (index === 1) return "text-neutral-300";
  if (index === 2) return "text-orange-500";
  return "text-neutral-600";
}

function PlayerRow({
  player,
  index,
}: {
  player: PlayerWithPagination;
  index: number;
}) {
  const isTop3 = index < 3;

  return (
    <Link href={`/player/${player.nickname}`}>
      <div
        className={[
          "group grid grid-cols-[2rem_1fr_auto] items-center gap-4 px-4 py-2.5 transition-colors",
          "border-neutral-800/50 border-b last:border-0",
          "hover:bg-neutral-800/30",
        ].join(" ")}
      >
        {/* rank */}
        <span
          className={`text-right font-bold font-mono text-sm tabular-nums ${getRankColor(index)}`}
        >
          {index + 1}
        </span>

        {/* avatar + info */}
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="size-8 shrink-0 rounded-lg border border-neutral-800">
            <AvatarImage
              src={player.avatar ?? undefined}
              alt={player.nickname ?? ""}
            />
            <AvatarFallback className="rounded-lg bg-neutral-800 text-neutral-500 text-xs">
              {player.nickname?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              {player.country ? (
                <Image
                  className="h-2.5 w-3.75 shrink-0 rounded-xs"
                  src={getCountryFlagUrl(player.country.toLowerCase(), 20)}
                  width={15}
                  height={10}
                  alt={player.country}
                />
              ) : (
                <div className="h-2.5 w-3.75 shrink-0 rounded-xs bg-neutral-800" />
              )}
              <span
                className={[
                  "truncate font-medium text-sm transition-colors group-hover:text-white",
                  isTop3 ? "text-white" : "text-neutral-300",
                ].join(" ")}
              >
                {player.nickname}
              </span>
            </div>
          </div>
        </div>

        {/* elo + skill */}
        <div className="flex items-center gap-3">
          <SkillLevelIcon
            level={player.skill_level}
            className="size-5 shrink-0"
          />
          <div className="flex w-20 items-center justify-end gap-1.5">
            <EloDelta player={player} />
            <span
              className={[
                "font-bold font-mono text-sm tabular-nums",
                isTop3 ? "text-white" : "text-neutral-300",
              ].join(" ")}
            >
              {player.faceit_elo}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }, (_, i) => `skeleton-row-${i}`).map(
        (key) => (
          <div
            key={key}
            className="grid grid-cols-[2rem_1fr_auto] items-center gap-4 border-neutral-800/50 border-b px-4 py-2.5 last:border-0"
          >
            <Skeleton className="ml-auto h-4 w-6 rounded bg-neutral-800/80" />
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 shrink-0 rounded-lg bg-neutral-800/80" />
              <Skeleton className="h-4 w-28 rounded bg-neutral-800/80" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="size-5 rounded bg-neutral-800/80" />
              <Skeleton className="h-4 w-12 rounded bg-neutral-800/80" />
            </div>
          </div>
        ),
      )}
    </>
  );
}

export default function RankingPage() {
  const {
    data,
    totalPages,
    canPreviousPage,
    canNextPage,
    pageIndex,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    isLoading,
  } = usePlayersWithPagination();

  const offset = (pageIndex - 1) * PAGE_SIZE;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
      {/* header */}
      <div className="flex items-center justify-between border-neutral-800 border-b px-4 py-4">
        <div>
          <h2 className="font-bold text-white">Ranking</h2>
          <p className="text-neutral-500 text-sm">
            Player rankings by FACEIT ELO
          </p>
        </div>
        {/* column labels */}
        <div className="flex items-center gap-3 pr-1">
          <span className="font-mono text-neutral-600 text-xs uppercase tracking-widest">
            Lvl
          </span>
          <span className="w-20 text-right font-mono text-neutral-600 text-xs uppercase tracking-widest">
            ELO
          </span>
        </div>
      </div>

      {/* rows */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : !data || data.length === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconTrophy />
            </EmptyMedia>
            <EmptyTitle>No players found</EmptyTitle>
            <EmptyDescription>
              There are no players in the ranking yet
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        data.map((player, index) => (
          <PlayerRow key={player.id} player={player} index={offset + index} />
        ))
      )}

      {/* footer pagination */}
      <div className="flex items-center justify-between border-neutral-800 border-t px-4 py-3">
        <span className="font-mono text-neutral-600 text-xs">
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
                variant="ghost"
                size="icon-sm"
                onClick={() => action?.()}
                disabled={disabled}
                className="border border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white disabled:opacity-30"
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
