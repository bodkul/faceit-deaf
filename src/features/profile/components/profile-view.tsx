"use client";

import { IconBrandTwitch, IconCheck } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import { signIn, useSession } from "next-auth/react";

import { FaceitIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function useTwitchLinked() {
  const { data } = useQuery({
    queryKey: ["profile", "accounts"],
    queryFn: () => ky("/api/profile/accounts").json<{ twitch: boolean }>(),
    select: (data) => data.twitch ?? false,
  });

  return data ?? null;
}

function ConnectedBadge() {
  return (
    <Badge className="border-none bg-win/10 text-win focus-visible:ring-win/20 focus-visible:outline-none dark:bg-win/10 dark:text-win dark:focus-visible:ring-win/40 [a]:hover:bg-win/5 dark:[a]:hover:bg-win/5">
      <IconCheck size={12} />
      Connected
    </Badge>
  );
}

export function ProfileView() {
  const { data: session, status } = useSession();
  const twitchLinked = useTwitchLinked();

  if (status === "loading") {
    return (
      <>
        <Skeleton className="h-26 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </>
    );
  }

  if (!session?.user) {
    return (
      <Empty className="rounded-xl border border-dashed border-border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FaceitIcon />
          </EmptyMedia>
          <EmptyTitle>Log in to manage your account</EmptyTitle>
          <EmptyDescription>
            Sign in with FACEIT to link Twitch and show your stream on match
            pages.
          </EmptyDescription>
        </EmptyHeader>
        <Button variant="faceit" onClick={() => signIn("faceit")}>
          <FaceitIcon />
          Log in with FACEIT
        </Button>
      </Empty>
    );
  }

  const { user } = session;

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
        <div className="flex items-center gap-4 px-6 py-5">
          <Avatar className="size-16 rounded-xl">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
            <AvatarFallback className="rounded-xl text-xl">
              {user.name?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-black text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-(--highlight)">
        <div className="border-b border-border px-5 py-4">
          <h3 className="font-bold text-foreground">Connected accounts</h3>
        </div>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between px-6">
            <div className="flex gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg border border-[#ff5500]/20 bg-[#ff5500]/10">
                <FaceitIcon className="size-4 text-[#ff5500]" />
              </div>
              <div>
                <h4 className="text-sm font-medium">FACEIT</h4>
                <p className="text-xs text-muted-foreground">{user.name}</p>
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
                <h4 className="text-sm font-medium">Twitch</h4>
                <p className="text-xs text-muted-foreground">
                  {twitchLinked === null
                    ? "Checking..."
                    : twitchLinked
                      ? "Connected"
                      : "Not connected"}
                </p>
              </div>
            </div>
            {twitchLinked === null ? (
              <Skeleton className="h-7 w-20 rounded-lg bg-muted" />
            ) : twitchLinked ? (
              <ConnectedBadge />
            ) : (
              <Button
                size="sm"
                onClick={() => signIn("twitch", { callbackUrl: "/profile" })}
                className="border border-[#9146ff]/30 bg-[#9146ff]/10 text-xs text-[#9146ff] hover:bg-[#9146ff]/20"
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
