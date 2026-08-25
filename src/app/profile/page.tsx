"use client";

import { IconBrandTwitch, IconCheck } from "@tabler/icons-react";
import ky from "ky";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { FaceitIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function useTwitchLinked() {
  const [linked, setLinked] = useState<boolean | null>(null);

  useEffect(() => {
    ky("/api/profile/accounts")
      .json<{ twitch: boolean }>()
      .then((data) => setLinked(data.twitch ?? false))
      .catch(() => setLinked(false));
  }, []);

  return linked;
}

function ConnectedBadge() {
  return (
    <Badge className="border-none bg-green-600/10 text-green-600 focus-visible:outline-none focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a]:hover:bg-green-600/5 dark:[a]:hover:bg-green-400/5">
      <IconCheck size={12} />
      Connected
    </Badge>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const twitchLinked = useTwitchLinked();

  if (status === "loading") {
    return (
      <>
        <Skeleton className="h-26 w-full rounded-2xl bg-neutral-900" />
        <Skeleton className="h-48 w-full rounded-2xl bg-neutral-900" />
      </>
    );
  }

  if (!session?.user) {
    return (
      <div className="mx-auto px-4 py-10 text-center text-neutral-500 text-sm">
        Not logged in.
      </div>
    );
  }

  const { user } = session;

  return (
    <>
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

      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
        <div className="border-neutral-800 border-b px-5 py-4">
          <h3 className="font-bold text-white">Connected accounts</h3>
        </div>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between px-6">
            <div className="flex gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg border border-[#ff5500]/20 bg-[#ff5500]/10">
                <FaceitIcon className="size-4 text-[#ff5500]" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Faceit</h4>
                <p className="text-muted-foreground text-xs">{user.name}</p>
              </div>
            </div>
            <ConnectedBadge />
          </div>
          <Separator />
          <div className="flex items-center justify-between px-6">
            <div className="flex gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg border border-[#9146ff]/20 bg-[#9146ff]/10">
                <IconBrandTwitch className="size-4 text-[#9146ff]" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Twitch</h4>
                <p className="text-muted-foreground text-xs">
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
              <ConnectedBadge />
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
    </>
  );
}
