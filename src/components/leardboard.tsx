"use client";

import Link from "next/link";

import { SkillLevelIcon } from "@/app/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import usePlayers from "@/hooks/queries/usePlayers";
import useEloHistorySubscription from "@/hooks/subscriptions/useEloHistorySubscription";
import usePlayersSubscription from "@/hooks/subscriptions/usePlayersSubscription";
import { type Tables } from "@/lib/supabase";

type PlayerWithEloHistory = Tables<"players"> & {
  eloHistory: Tables<"eloHistory">[];
};

const EloDelta = ({ player }: { player: PlayerWithEloHistory }) => {
  if (!player.eloHistory.length) return;

  const difference = player.faceit_elo - player.eloHistory[0].player_elo;
  if (difference === 0) return;

  const color = difference > 0 ? "text-green-500" : "text-red-500";
  const value = difference > 0 ? `+${difference}` : difference;

  return (
    <>
      {" "}
      <sup className={color}>{value}</sup>
    </>
  );
};

const PlayerRow = ({
  player,
  index,
}: {
  player: PlayerWithEloHistory;
  index: number;
}) => {
  return (
    <Link
      key={player.id}
      href={`/player/${player.nickname}`}
      prefetch={false}
      legacyBehavior
    >
      <TableRow className="h-[49px] cursor-pointer">
        <TableCell>{index + 1}</TableCell>
        <TableCell className="flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={player.avatar}
              alt={`Avatar of ${player.nickname}`}
            />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <div className="font-medium">{player.nickname}</div>
        </TableCell>
        <TableCell>
          <SkillLevelIcon level={player.skill_level} className="h-6 w-6" />
        </TableCell>
        <TableCell>
          {player.faceit_elo}
          <EloDelta player={player} />
        </TableCell>
      </TableRow>
    </Link>
  );
};

const renderLoadingRows = (count: number) => {
  return Array.from({ length: count }).map((_, index) => (
    <TableRow key={index} className="h-[49px]">
      <TableCell>{index + 1}</TableCell>
      <TableCell className="flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-6 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
    </TableRow>
  ));
};

export default function Leardboard() {
  const { data, mutate, isLoading } = usePlayers();

  usePlayersSubscription(async () => {
    await mutate();
  });

  useEloHistorySubscription(async () => {
    await mutate();
  });

  return (
    <div className="flex rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rating</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Elo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading || data == null
            ? renderLoadingRows(25)
            : data.map((player, index) => (
                <PlayerRow key={player.id} player={player} index={index} />
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
