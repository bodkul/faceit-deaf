import { cn } from "cn";
import Link from "next/link";

import { CountryFlag } from "@/components/country-flag";
import { FaceitLevelIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type RankedPlayer = {
  id: string;
  nickname: string;
  avatar: string | null;
  faceit_elo: number | null;
  country: string | null;
};

// Gold, silver and bronze rank numbers.
const podium: Record<number, string> = {
  1: "text-[oklch(0.85_0.14_85)]",
  2: "text-[oklch(0.84_0.01_250)]",
  3: "text-[oklch(0.72_0.11_55)]",
};

export function PlayerRankRow({
  rank,
  player,
  compact = false,
}: {
  rank: number;
  player: RankedPlayer;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/player/${player.nickname}`}
      className={cn(
        "group flex items-center gap-3 transition-colors hover:bg-foreground/[0.03]",
        compact ? "px-4 py-2.5" : "px-4 py-3",
      )}
    >
      <span
        className={cn(
          "w-6 shrink-0 text-center font-mono font-semibold text-sm tabular-nums",
          podium[rank] ?? "text-faint",
        )}
      >
        {rank}
      </span>

      <Avatar className={cn("shrink-0", compact ? "size-8" : "size-9")}>
        <AvatarImage src={player.avatar ?? undefined} alt="" />
        <AvatarFallback className="font-semibold text-xs">
          {player.nickname.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate font-medium">{player.nickname}</span>
        <CountryFlag code={player.country} />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono font-semibold text-sm tabular-nums">
          {player.faceit_elo ?? "—"}
        </span>
        <FaceitLevelIcon elo={player.faceit_elo} className="size-6" />
      </div>
    </Link>
  );
}
