import { IconUsers } from "@tabler/icons-react";

import { RealtimeRefresh } from "@/components/realtime-refresh";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PlayerRankRow } from "@/features/player/components/player-rank-row";
import { PlayersPagination } from "@/features/player/components/players-pagination";
import { getPlayerRankings } from "@/features/player/queries";
import { topics } from "@/lib/realtime/topics";

const PAGE_SIZE = 25;

function parsePage(raw: string | undefined): number {
  const parsed = Number(raw ?? "1");
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = parsePage(page);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { players, count } = await getPlayerRankings(PAGE_SIZE, offset);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  if (players.length === 0) {
    return (
      <Empty className="rounded-xl border border-dashed border-border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconUsers />
          </EmptyMedia>
          <EmptyTitle>No players on this page</EmptyTitle>
          <EmptyDescription>
            The rankings have {count} players in total.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <RealtimeRefresh sources={[topics.players]} />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
        <div className="flex items-center gap-3 border-b border-border bg-foreground/2 px-4 py-2.5 font-mono text-[11px] tracking-wider text-faint uppercase">
          <span className="w-7 text-center">#</span>
          <span className="flex-1 pl-12">Player</span>
          <span>FACEIT ELO</span>
        </div>
        <div className="divide-y divide-border">
          {players.map((player, index) => (
            <PlayerRankRow
              key={player.id}
              rank={offset + index + 1}
              player={player}
            />
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-2">
          <PlayersPagination
            currentPage={currentPage}
            totalPages={totalPages}
          />
          <p className="text-xs text-faint">
            {offset + 1}–{offset + players.length} of {count} players
          </p>
        </div>
      )}
    </div>
  );
}
