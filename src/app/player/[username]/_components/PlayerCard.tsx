"use client";

import { IconBrandSteam, IconBrandTwitch } from "@tabler/icons-react";
import { useMemo } from "react";

import { FaceitIcon, SkillLevelIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlayerByUsername } from "@/types/player";

export function PlayerCardSceleton() {
  return (
    <Card>
      <CardHeader className="flex flex-col items-center space-y-2 text-center">
        <div className="relative w-fit">
          <Skeleton className="size-28 rounded-full" />
          <Skeleton className="absolute -right-1 -bottom-1 size-10 rounded-full" />
        </div>
        <CardTitle className="text-2xl">
          <Skeleton className="h-6 w-32 rounded" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4">
        <Separator />
        <div className="flex justify-center gap-4">
          {["faceit", "steam", "twitch"].map((key) => (
            <Skeleton
              key={`skeleton-${key}`}
              className="size-10 rounded-md border"
            />
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
        <div className="relative w-fit">
          <Avatar className="size-28">
            <AvatarImage
              className="object-cover"
              src={player.avatar}
              alt="Player avatar"
            />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <SkillLevelIcon
            level={player.skill_level}
            className="absolute -right-1 -bottom-1 size-10"
          />
        </div>
        <CardTitle className="text-2xl">{player.nickname}</CardTitle>
        <div className="items-center rounded-lg border bg-muted/30 p-4 py-2 font-semibold text-lg transition-colors">
          {player.faceit_elo} ELO
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        <div className="flex justify-center gap-4">
          {socials.map((s) => (
            <Button
              key={s.key}
              className="duration-200 hover:scale-110"
              variant="outline"
              size="icon-lg"
              asChild
            >
              <a href={s.href} target="_blank">
                {s.icon}
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
