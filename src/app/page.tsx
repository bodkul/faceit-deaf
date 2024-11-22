import Link from "next/link";
import Leardboard from "@/components/leardboard";
import TwitchStreams from "@/components/twitch-streams";

export default function Page() {
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
        <TwitchStreams />
        <Leardboard />
      </div>
    </main>
  );
}
