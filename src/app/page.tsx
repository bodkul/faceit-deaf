import Image from "next/image";
import { getPlayers } from "@/lib/database/players";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const columns = [
  { key: "index", label: "#" },
  { key: "avatar", label: "Avatar" },
  { key: "nickname", label: "Nickname" },
  { key: "level", label: "Level" },
  { key: "elo", label: "Elo" },
];

function getEloChangeColor(currentElo: number, historyElo: number) {
  const difference = currentElo - historyElo;
  if (difference > 0) {
    return "green";
  } else if (difference < 0) {
    return "red";
  }
}

function formatEloDifference(currentElo: number, historyElo: number) {
  const difference = currentElo - historyElo;
  if (difference > 0) {
    return `+${difference}`;
  } else {
    return `${difference}`;
  }
}

export default async function Home() {
  const players = await getPlayers();

  return (
    <main className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col space-y-20 items-center">
        <div className="flex flex-col text-center items-center">
          <a href="/">
            <div className="font-black text-6xl">FACEIT DEAF</div>
          </a>
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
              {players?.length ? (
                players.map((player, index) => (
                  <TableRow key={player.id} className="h-[49px]">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {player.avatar && (
                        <Image
                          src={player.avatar}
                          className="w-8 h-8 rounded-full"
                          width={32}
                          height={32}
                          alt={`Avatar of ${player.nickname}`}
                        />
                      )}
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
                      {player.faceit_elo}{" "}
                      {!!player.eloHistory.length && (
                        <sup
                          style={{
                            color: getEloChangeColor(
                              player.faceit_elo,
                              player.eloHistory[0]?.player_elo
                            ),
                          }}
                        >
                          {formatEloDifference(
                            player.faceit_elo,
                            player.eloHistory[0]?.player_elo
                          )}
                        </sup>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No players.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
