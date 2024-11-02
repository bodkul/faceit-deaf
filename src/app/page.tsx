"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaceitIcon, SteamIcon } from "@/app/icons/platform-icons";
import SkillLevelIcon from "@/app/icons/skill-level-icon";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import usePlayers from "@/hooks/usePlayers";
import { PlayerWithEloHistory } from "@/types/database";

const columns = [
  { key: "index", label: "#" },
  { key: "avatar", label: "Avatar" },
  { key: "nickname", label: "Nickname" },
  { key: "level", label: "Level" },
  { key: "elo", label: "Elo" },
];

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

export default function Home() {
  const [players, loading] = usePlayers();

  return (
    <main className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 cursor-default">
      <div className="flex flex-col space-y-20 items-center">
        <div className="flex flex-col text-center items-center">
          <Link href="/" className="font-black text-6xl">
            FACEIT DEAF
          </Link>
          <span className="text-2xl">
            View your FACEIT CS2 performance for deaf Ukrainians.
          </span>
        </div>
        <div className="flex rounded-md border">
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
              {loading
                ? Array.from({ length: 20 }).map((_, index) => (
                    <TableRow key={index} className="h-[49px]">
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                    </TableRow>
                  ))
                : players.map((player, index) => (
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
                        <HoverCard>
                          <HoverCardTrigger tabIndex={0} asChild>
                            <div className="font-medium cursor-pointer">
                              {player.nickname}
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-96">
                            <div className="flex space-x-4">
                              <div className="flex flex-col items-center space-y-2">
                                <Avatar>
                                  <AvatarImage
                                    src={player.avatar}
                                    alt={`Avatar of ${player.nickname}`}
                                  />
                                  <AvatarFallback></AvatarFallback>
                                </Avatar>
                                <div className="flex flex-row space-x-1">
                                  <div className="flex rounded-md border h-6 w-6">
                                    <Link
                                      className="m-auto"
                                      href={player.faceit_url.replace(
                                        "{lang}",
                                        "ru"
                                      )}
                                      target="_blank"
                                    >
                                      <FaceitIcon className="h-4 w-4" />
                                    </Link>
                                  </div>
                                  <div className="flex rounded-md border h-6 w-6">
                                    <Link
                                      className="m-auto"
                                      href={`https://steamcommunity.com/profiles/${player.steam_id_64}`}
                                      target="_blank"
                                    >
                                      <SteamIcon className="h-4 w-4" />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                              <div className="grid justify-items-start space-y-1">
                                <h4 className="text-sm font-semibold">
                                  {player.nickname}
                                </h4>
                                {player.nickname === "bodkul" && (
                                  <p className="text-sm">
                                    The Faceit Deaf – created and maintained by
                                    bodkul.
                                  </p>
                                )}
                                <div className="rounded-md border">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Matches</TableHead>
                                        <TableHead>Avg Headshots</TableHead>
                                        <TableHead>Avg K/D Ratio</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell>{player.matches}</TableCell>
                                        <TableCell>
                                          {player.average_headshots_percent}%
                                        </TableCell>
                                        <TableCell>
                                          {player.average_kd_ratio}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                      <TableCell>
                        <SkillLevelIcon
                          level={player.skill_level}
                          className="h-6 w-6"
                        />
                      </TableCell>
                      <TableCell>
                        {player.faceit_elo}
                        <EloDelta player={player} />
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
