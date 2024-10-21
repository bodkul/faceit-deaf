"use client";

import Image from "next/image";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlayerWithEloHistory } from "@/types/database";

const columns = [
  { key: "index", label: "#" },
  { key: "avatar", label: "Avatar" },
  { key: "nickname", label: "Nickname" },
  { key: "level", label: "Level" },
  { key: "elo", label: "Elo" },
];

const EloDelta = ({ player }: { player: PlayerWithEloHistory }) => {
  if (!player.eloHistory.length) {
    return;
  }

  const difference = player.faceit_elo - player.eloHistory[0].player_elo;

  if (difference === 0) {
    return;
  }

  const color = difference > 0 ? "green" : "red";
  const value = difference > 0 ? `+${difference}` : difference;

  return (
    <>
      {" "}
      <sup style={{ color: color }}>{value}</sup>
    </>
  );
};

const Leaderboard = ({ players }: { players: PlayerWithEloHistory[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        {columns.map(({ key, label }) => (
          <TableHead key={key} className="w-[100px]">
            {label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {players?.length ? (
        players.map((player, index) => (
          <TableRow key={player.id} className="h-[49px]">
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={player.avatar}
                  alt={`Avatar of ${player.nickname}`}
                />
                <AvatarFallback></AvatarFallback>
              </Avatar>
            </TableCell>
            <TableCell>
              <a
                className="font-medium"
                href={player.faceit_url.replace("{lang}", "ru")}
                target="_blank"
                rel="noopener noreferrer"
              >
                {player.nickname}
              </a>
            </TableCell>
            <TableCell>
              <Image
                src={`/icons/faceit/levels/${player.skill_level}.svg`}
                className="w-6 h-6"
                width={24}
                height={24}
                alt={`Skill level ${player.skill_level}`}
              />
            </TableCell>
            <TableCell>
              {player.faceit_elo}
              <EloDelta player={player} />
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No players.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);

export default Leaderboard;
