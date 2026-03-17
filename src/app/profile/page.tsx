"use client";

import { IconBrandTwitch, IconCheck } from "@tabler/icons-react";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { FaceitIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function useTwitchLinked() {
  const [linked, setLinked] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/profile/accounts")
      .then((r) => r.json())
      .then((data) => setLinked(data.twitch ?? false))
      .catch(() => setLinked(false));
  }, []);

  return linked;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const twitchLinked = useTwitchLinked();

  if (status === "loading") {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
        <Skeleton className="h-8 w-40 bg-neutral-900" />
        <Skeleton className="h-24 w-full rounded-2xl bg-neutral-900" />
        <Skeleton className="h-16 w-full rounded-2xl bg-neutral-900" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-center text-neutral-500 text-sm">
        Not logged in.
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10">
      <h1 className="font-black text-2xl text-white">Profile</h1>

      {/* user card */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-neutral-700/50 to-transparent" />
        <div className="flex items-center gap-4 px-6 py-5">
          <Avatar className="size-16 rounded-xl">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
            <AvatarFallback className="rounded-xl text-xl">
              {user.name?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-black text-white text-xl">{user.name}</h2>
            <p className="text-neutral-500 text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      {/* connected accounts */}
      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        <div className="border-neutral-800 border-b px-5 py-4">
          <h3 className="font-bold text-white">Connected accounts</h3>
        </div>

        {/* FACEIT — always connected */}
        <div className="flex items-center justify-between border-neutral-800/50 border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg border border-[#ff5500]/20 bg-[#ff5500]/10">
              <FaceitIcon className="size-4 text-[#ff5500]" />
            </div>
            <div>
              <p className="font-medium text-neutral-200 text-sm">FACEIT</p>
              <p className="text-neutral-600 text-xs">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1">
            <IconCheck size={11} className="text-emerald-400" />
            <span className="font-mono text-emerald-400 text-xs">
              Connected
            </span>
          </div>
        </div>

        {/* Twitch */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg border border-[#9146ff]/20 bg-[#9146ff]/10">
              <IconBrandTwitch className="size-4 text-[#9146ff]" />
            </div>
            <div>
              <p className="font-medium text-neutral-200 text-sm">Twitch</p>
              <p className="text-neutral-600 text-xs">
                {twitchLinked === null
                  ? "Checking..."
                  : twitchLinked
                    ? "Connected"
                    : "Not connected"}
              </p>
            </div>
          </div>
          {twitchLinked === null ? (
            <Skeleton className="h-7 w-20 rounded-lg bg-neutral-800" />
          ) : twitchLinked ? (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1">
              <IconCheck size={11} className="text-emerald-400" />
              <span className="font-mono text-emerald-400 text-xs">
                Connected
              </span>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => signIn("twitch", { callbackUrl: "/profile" })}
              className="border border-[#9146ff]/30 bg-[#9146ff]/10 text-[#9146ff] text-xs hover:bg-[#9146ff]/20"
            >
              <IconBrandTwitch size={13} className="mr-1.5" />
              Connect
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
