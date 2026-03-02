"use client";

import { IconDeviceGamepad2 } from "@tabler/icons-react";
import { differenceInMinutes } from "date-fns";
import { now } from "es-toolkit/compat";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useLiveMatches } from "@/hooks/useLiveMatches";

type MatchStatus = "live" | "soon" | "finished";

function getMatchStatus(match: {
  started_at: string | null;
  finished_at: string | null;
}): MatchStatus {
  if (match.finished_at) return "finished";
  if (match.started_at) return "live";
  return "soon";
}

function MatchCard({
  match,
}: {
  match: {
    id: string | null;
    map_pick: string | null;
    round_score: string | null;
    started_at: string | null;
    finished_at: string | null;
    players: string[] | null;
  };
}) {
  const status = getMatchStatus(match);
  const isLive = status === "live";
  const isSoon = status === "soon";
  const mapName = match.map_pick?.replace("de_", "") ?? "unknown";
  const [scoreA, scoreB] = (match.round_score ?? "0 / 0")
    .split("/")
    .map((s) => s.trim());
  const minutes = isLive ? differenceInMinutes(now(), match.started_at!) : null;

  return (
    <Link
      href={`/match/1-${match.id}`}
      className={[
        "group relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-xl",
        isLive
          ? "border-red-500/30 bg-linear-to-b from-red-950/30 to-neutral-900 shadow-red-950/20"
          : isSoon
            ? "border-yellow-500/20 bg-linear-to-b from-yellow-950/20 to-neutral-900"
            : "border-neutral-800 bg-neutral-900",
      ].join(" ")}
    >
      {/* glow top line */}
      <div
        className={[
          "absolute inset-x-0 top-0 h-px",
          isLive
            ? "bg-linear-to-r from-transparent via-red-500/60 to-transparent"
            : isSoon
              ? "bg-linear-to-r from-transparent via-yellow-500/40 to-transparent"
              : "bg-linear-to-r from-transparent via-neutral-700/40 to-transparent",
        ].join(" ")}
      />

      <div className="p-4">
        {/* header: status + map */}
        <div className="mb-3 flex items-center justify-between">
          {/* status */}
          {isLive ? (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="font-bold font-mono text-red-400 text-xs uppercase tracking-widest">
                {minutes}m
              </span>
            </div>
          ) : isSoon ? (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-400/80" />
              <span className="font-bold font-mono text-xs text-yellow-400/80 uppercase tracking-widest">
                Soon
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-neutral-600" />
              <span className="font-bold font-mono text-neutral-500 text-xs uppercase tracking-widest">
                Finished
              </span>
            </div>
          )}

          {/* map name */}
          <span className="rounded-md border border-neutral-700/50 bg-neutral-800/60 px-2 py-0.5 font-mono text-neutral-400 text-xs capitalize">
            {mapName}
          </span>
        </div>

        {/* score */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="font-black font-mono text-3xl text-white tabular-nums">
            {scoreA}
          </span>
          <span className="font-mono text-lg text-neutral-600">:</span>
          <span className="font-black font-mono text-3xl text-white tabular-nums">
            {scoreB}
          </span>
        </div>

        {/* players */}
        {match.players && match.players.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {match.players.map((nickname) => (
              <span
                key={`${match.id}_${nickname}`}
                className="rounded border border-neutral-700/50 bg-neutral-800/50 px-1.5 py-0.5 font-mono text-neutral-400 text-xs transition-colors group-hover:border-neutral-600 group-hover:text-neutral-300"
              >
                {nickname}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export function LiveMatches() {
  const { data: matches, isLoading } = useLiveMatches();

  const liveCount =
    matches?.filter((m) => !m.finished_at && m.started_at).length ?? 0;

  return (
    <Card className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm">
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-red-500/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-red-500/3 blur-3xl" />
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-white">Live Matches</CardTitle>
          {liveCount > 0 && (
            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 font-bold font-mono text-red-400 text-xs">
              {liveCount} live
            </span>
          )}
        </div>
        <CardDescription>
          Active FACEIT matches in the deaf community
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner />
          </div>
        ) : matches?.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconDeviceGamepad2 />
              </EmptyMedia>
              <EmptyTitle>No live matches</EmptyTitle>
              <EmptyDescription>
                There are no active matches right now. Check back later!
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
