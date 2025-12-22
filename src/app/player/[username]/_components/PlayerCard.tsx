"use client";

import { IconBrandSteam, IconBrandTwitch } from "@tabler/icons-react";
import { range } from "lodash";
import { useMemo } from "react";

import { FaceitIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlayerByUsername } from "@/types/player";

export function PlayerCardSceleton() {
  return (
    <Card>
      <CardHeader className="flex flex-col items-center space-y-2 text-center">
        <Avatar className="size-28">
          <AvatarFallback>
            <Skeleton className="size-28 rounded-full" />
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-2xl">
          <Skeleton className="h-6 w-32 rounded" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4">
        <Separator />
        <div className="flex justify-center gap-4">
          {range(3).map((_, i) => (
            <Skeleton key={i} className="size-12 rounded-2xl border" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PlayerCard({ player }: { player: PlayerByUsername }) {
  const socials = useMemo(() => {
    const list = [
      {
        key: "faceit",
        href: `https://www.faceit.com/en/players/${player.nickname}`,
        icon: <FaceitIcon className="size-6" />,
      },
      {
        key: "steam",
        href: `https://steamcommunity.com/profiles/${player.steam_id_64}`,
        icon: <IconBrandSteam className="size-6" />,
      },
    ];

    if (player.twitch_username) {
      list.push({
        key: "twitch",
        href: `https://www.twitch.tv/${player.twitch_username}`,
        icon: <IconBrandTwitch className="size-6" />,
      });
    }

    return list;
  }, [player]);

  return (
    <Card>
      <CardHeader className="flex flex-col items-center">
        <Avatar className="size-28">
          <AvatarImage
            className="object-cover"
            src={player.avatar}
            alt="Player avatar"
          />
          <AvatarFallback></AvatarFallback>
        </Avatar>
        <CardTitle className="text-2xl">{player.nickname}</CardTitle>
        {/* <div className="text-sm text-muted-foreground">Team HARD</div> */}
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        <div className="flex justify-center gap-4">
          {socials.map((s) => (
            <a
              key={s.key}
              className="flex size-12 items-center justify-center rounded-2xl border bg-muted text-card-foreground shadow transition-all duration-200 hover:scale-110"
              href={s.href}
              target="_blank"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
