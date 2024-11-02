import Link from "next/link";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const columns = [
  { key: "index", label: "Rating" },
  { key: "avatar", label: "Avatar" },
  { key: "nickname", label: "Nickname" },
  { key: "level", label: "Level" },
  { key: "elo", label: "Elo" },
];

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 cursor-default">
      <div className="flex flex-col space-y-20 items-center">
        <div className="flex flex-col text-center items-center">
          <Link href="/" className="font-black text-6xl uppercase">
            Faceit Deaf
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
            <TableBody>{children}</TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
