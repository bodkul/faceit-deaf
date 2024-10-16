import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Database } from "@/types/database";
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

export default async function Home() {
  const { data: players } = await supabase
    .from<"players", Database["Tables"]["players"]>("players")
    .select()
    .order("faceit_elo", { ascending: false });

  return (
    <main className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="rounded-md border">
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
                  <TableCell>{player.faceit_elo}</TableCell>
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
    </main>
  );
}
