"use client";

import { IconBrandSteam, IconBrandTwitch } from "@tabler/icons-react";
import { useMemo } from "react";

import { FaceitIcon, SkillLevelIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SecondaryFlowButton } from "@/components/ui/flow-button";
import { Separator } from "@/components/ui/separator";
import type { PlayerByUsername } from "@/types/player";

export function PlayerCard({ player }: { player: PlayerByUsername }) {
  const socials = useMemo(() => {
    const list = [
      {
        key: "faceit",
        href: `https://www.faceit.com/en/players/${player.nickname}`,
        icon: <FaceitIcon className="size-6" />,
      },
    ];

    // Only add Steam link if steam_id_64 is available
    if (player.steam_id_64) {
      list.push({
        key: "steam",
        href: `https://steamcommunity.com/profiles/${player.steam_id_64}`,
        icon: <IconBrandSteam className="size-6" />,
      });
    }

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
    <Card className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 backdrop-blur-sm">
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-red-500/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-red-500/3 blur-3xl" />
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
        {player.faceit_elo > 0 && (
          <div className="items-center rounded-lg border bg-muted/30 p-4 py-2 font-semibold text-lg transition-colors">
            {player.faceit_elo} ELO
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        <div className="flex justify-center gap-4">
          {socials.map((s) => (
            <SecondaryFlowButton key={s.key} size="icon-lg" asChild>
              <a href={s.href} target="_blank">
                {s.icon}
              </a>
            </SecondaryFlowButton>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
