import Leaderboard from "./components/leaderboard";

export default function Home() {
  return (
    <main className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
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
          <Leaderboard />
        </div>
      </div>
    </main>
  );
}
