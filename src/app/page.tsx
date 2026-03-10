"use client";

import { LiveMatches } from "@/components/live-matches";
import { siteConfig } from "@/config/site";

export default function Page() {
  return (
    <>
      <div className="container flex flex-col items-center gap-4 py-8 text-center md:py-16 lg:py-20">
        <div className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 font-bold font-mono text-red-400 text-xs uppercase tracking-widest">
          CS2 · Deaf Community
        </div>

        <h1 className="max-w-2xl text-balance font-black text-4xl leading-tight tracking-tight xl:text-5xl">
          Welcome to{" "}
          <span className="bg-linear-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            {siteConfig.name}
          </span>
          <span className="text-neutral-600">.pro</span>
        </h1>

        <p className="max-w-2xl text-balance text-neutral-500 text-sm sm:text-base">
          Track, analyze, and watch FACEIT matches for deaf and hard-of-hearing
          players. Live updates, detailed stats, friendly environment.
        </p>
      </div>

      <LiveMatches />
    </>
  );
}
