"use client";

import { siteConfig } from "@/config/site";

import { LiveMatches } from "./_components/LiveMatches";

export default function Page() {
  return (
    <>
      <div className="container flex flex-col items-center gap-2 py-8 text-center md:py-16 lg:py-20 xl:gap-4">
        <h1 className="leading-tighter max-w-2xl text-4xl font-semibold tracking-tight text-balance text-primary lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter">
          Welcome to <span className="text-orange-500">{siteConfig.name}</span>
          .pro
        </h1>
        <p className="max-w-3xl text-base text-balance text-foreground sm:text-lg">
          FaceitDeaf is a platform for tracking, analyzing, and watching FACEIT
          matches for deaf and hard-of-hearing players. Enjoy a modern
          interface, live match updates, detailed statistics, and a friendly
          environment for everyone who loves CS2.
        </p>
      </div>
      <LiveMatches />
    </>
  );
}
