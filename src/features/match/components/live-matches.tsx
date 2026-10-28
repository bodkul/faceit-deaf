"use client";

import NumberFlow from "@number-flow/react";
import {
  IconBrandTwitch,
  IconDeviceGamepad2,
  IconFlag,
} from "@tabler/icons-react";
import { cn } from "cn";
import { differenceInMinutes, formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";

import { MapBackground } from "@/components/map-background";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinishedMatches } from "@/features/match/hooks/use-finished-matches";
import { useLiveMatches } from "@/features/match/hooks/use-live-matches";
import { useLiveStreams } from "@/features/match/hooks/use-live-streams";

type LiveMatch = NonNullable<ReturnType<typeof useLiveMatches>["data"]>[number];
type FinishedMatch = NonNullable<
  ReturnType<typeof useFinishedMatches>["data"]
>[number];
type Match = LiveMatch | FinishedMatch;
type MatchStatus = "live" | "soon" | "finished";

function getMatchStatus(match: Match): MatchStatus {
  if (match.finished_at) return "finished";
  if (match.started_at) return "live";
  return "soon";
}

function formatMap(map: string | null) {
  return map?.replace("de_", "") ?? "Map vote";
}

function MatchStatusPill({ match }: { match: Match }) {
  const status = getMatchStatus(match);

  if (status === "live") {
    const minutes = match.started_at
      ? differenceInMinutes(new Date(), match.started_at)
      : null;
    return (
      <StatusPill tone="live" pulse>
        Live{minutes !== null && ` · ${minutes}m`}
      </StatusPill>
    );
  }
  if (status === "soon") {
    return <StatusPill tone="warning">Starting</StatusPill>;
  }
  return (
    <StatusPill tone="muted">
      Finished
      {match.finished_at &&
        ` · ${formatDistanceToNowStrict(match.finished_at, { addSuffix: true })}`}
    </StatusPill>
  );
}

const NO_STREAMS = new Set<string>();

function MatchCard({
  match,
  streamingNicknames = NO_STREAMS,
}: {
  match: Match;
  streamingNicknames?: Set<string>;
}) {
  const status = getMatchStatus(match);
  const [scoreA, scoreB] = (match.round_score ?? "0 / 0")
    .split("/")
    .map((s) => Number(s.trim()) || 0);
  const hasStream = !!match.players?.some((nickname) =>
    streamingNicknames.has(nickname),
  );

  return (
    <Link
      href={`/match/1-${match.id}`}
      className={cn(
        "group relative isolate flex flex-col gap-4 overflow-hidden rounded-xl border bg-card p-4 transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lg hover:shadow-black/40",
        status === "live" ? "border-live/30" : "border-border",
      )}
    >
      <MapBackground map={match.map_pick} />
      {status === "live" && (
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-live/70 to-transparent" />
      )}

      <div className="flex items-center justify-between gap-2">
        <MatchStatusPill match={match} />
        <div className="flex items-center gap-2">
          {hasStream && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#9146ff]/15 px-2 py-0.5 text-[11px] font-medium text-[#b58cff]">
              <IconBrandTwitch className="size-3" />
              Stream
            </span>
          )}
          <span className="text-sm font-medium text-muted-foreground capitalize">
            {formatMap(match.map_pick)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 font-mono text-4xl font-black tabular-nums">
        <NumberFlow
          value={scoreA}
          className={cn(scoreA > scoreB && status === "finished" && "text-win")}
        />
        <span className="text-xl text-faint">:</span>
        <NumberFlow
          value={scoreB}
          className={cn(scoreB > scoreA && status === "finished" && "text-win")}
        />
      </div>

      {match.players && match.players.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {match.players.map((nickname) => {
            const isStreaming = streamingNicknames.has(nickname);

            return (
              <span
                key={nickname}
                title={isStreaming ? `${nickname} is streaming` : nickname}
                className={cn(
                  "inline-flex h-6 max-w-full min-w-0 items-center gap-1 rounded-md px-2 text-xs font-medium ring-1 ring-inset",
                  isStreaming
                    ? "text-[#b58cff] ring-[#9146ff]/40"
                    : "text-foreground/80 ring-foreground/15",
                )}
              >
                {isStreaming && <IconBrandTwitch className="size-3 shrink-0" />}
                <span className="truncate">{nickname}</span>
              </span>
            );
          })}
        </div>
      )}
    </Link>
  );
}

function MatchGrid({
  matches,
  streamingNicknames,
}: {
  matches: Match[];
  streamingNicknames?: Set<string>;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          streamingNicknames={streamingNicknames}
        />
      ))}
    </div>
  );
}

function MatchGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="hidden h-40 rounded-xl sm:block" />
      <Skeleton className="hidden h-40 rounded-xl lg:block" />
    </div>
  );
}

export function LiveMatches() {
  const { data: active = [], isLoading } = useLiveMatches();
  const { data: finished = [], isLoading: isFinishedLoading } =
    useFinishedMatches();
  // One request for every live player rather than one per card. Finished
  // matches are skipped: whatever their players stream now isn't that match.
  const { data: streamingPlayers = [] } = useLiveStreams(
    active.flatMap((match) => match.players ?? []),
  );
  const streamingNicknames = new Set(streamingPlayers.map((p) => p.nickname));

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <SectionHeader
          title="Live now"
          description="Matches deaf players are playing on FACEIT right now"
        >
          {active.length > 0 && (
            <span className="rounded-full bg-live/15 px-2 py-0.5 font-mono text-xs font-semibold text-live tabular-nums">
              {active.length}
            </span>
          )}
        </SectionHeader>

        {isLoading ? (
          <MatchGridSkeleton />
        ) : active.length > 0 ? (
          <MatchGrid matches={active} streamingNicknames={streamingNicknames} />
        ) : (
          <Empty className="rounded-xl border border-dashed border-border p-6 md:p-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconDeviceGamepad2 />
              </EmptyMedia>
              <EmptyTitle>Nobody is playing right now</EmptyTitle>
              <EmptyDescription>
                Matches appear here the moment they start — no refresh needed.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <SectionHeader title="Just finished" />
        {isFinishedLoading ? (
          <MatchGridSkeleton />
        ) : finished.length > 0 ? (
          <MatchGrid matches={finished} />
        ) : (
          <Empty className="rounded-xl border border-dashed border-border p-6 md:p-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconFlag />
              </EmptyMedia>
              <EmptyTitle>No finished matches yet</EmptyTitle>
              <EmptyDescription>
                Matches show up here as soon as they end.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </section>
  );
}
