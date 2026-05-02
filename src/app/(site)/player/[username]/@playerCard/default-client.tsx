"use client";

import { IconBrandSteam, IconBrandTwitch } from "@tabler/icons-react";
import Image from "next/image";
import { useMemo } from "react";

import { FaceitIcon, SkillLevelIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SecondaryFlowButton } from "@/components/ui/flow-button";
import { getCountryFlagUrl } from "@/lib/country";
import { getSkillLevelFromElo } from "@/lib/faceit/utils";
import type { getPlayerByUsername } from "@/lib/supabase";

export function PlayerCard({
  player,
}: {
  player: NonNullable<Awaited<ReturnType<typeof getPlayerByUsername>>>;
}) {
  const socials = useMemo(() => {
    const list = [
      {
        key: "faceit",
        href: `https://www.faceit.com/en/players/${player.nickname}`,
        icon: <FaceitIcon className="size-5 fill-[#ff5500]" />,
      },
    ];
    if (player.steam_id_64) {
      list.push({
        key: "steam",
        href: `https://steamcommunity.com/profiles/${player.steam_id_64}`,
        icon: <IconBrandSteam className="size-5" />,
      });
    }
    if (player.twitch_username) {
      list.push({
        key: "twitch",
        href: `https://www.twitch.tv/${player.twitch_username}`,
        icon: <IconBrandTwitch className="size-5" />,
      });
    }
    return list;
  }, [player]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-neutral-700/50 to-transparent" />
      <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/4 blur-3xl" />

      <div className="h-16 w-full bg-linear-to-br from-neutral-900 to-neutral-950" />

      <div className="relative -mt-8 flex flex-col items-center px-6 pb-6">
        <div className="relative mb-3">
          <Avatar className="size-20 rounded-2xl border-2 shadow-xl">
            <AvatarImage
              className="object-cover"
              src={player.avatar}
              alt={player.nickname}
            />
            <AvatarFallback className="rounded-2xl text-neutral-400">
              {player.nickname.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {player.faceit_elo && (
            <SkillLevelIcon
              level={getSkillLevelFromElo(player.faceit_elo)}
              className="absolute -right-1 -bottom-1 size-8 drop-shadow-lg"
            />
          )}
        </div>

        <div className="mb-1 flex items-center gap-2">
          {player.country && (
            <Image
              src={getCountryFlagUrl(player.country.toLowerCase(), 20)}
              width={16}
              height={11}
              alt={player.country}
              className="rounded-xs"
            />
          )}
          <h2 className="font-bold text-lg text-white">{player.nickname}</h2>
        </div>

        {player.faceit_elo && player.faceit_elo > 0 && (
          <div className="mb-5 rounded-lg border border-neutral-800 bg-neutral-900/80 px-4 py-1.5">
            <span className="font-bold font-mono text-sm text-white tabular-nums">
              {player.faceit_elo}
            </span>
            <span className="ml-1 font-mono text-neutral-500 text-xs">ELO</span>
          </div>
        )}

        <div className="mb-4 h-px w-full bg-neutral-800" />

        <div className="flex gap-2">
          {socials.map((s) => (
            <SecondaryFlowButton key={s.key} size="icon-lg" asChild>
              <a href={s.href} target="_blank" rel="noopener noreferrer">
                {s.icon}
              </a>
            </SecondaryFlowButton>
          ))}
        </div>
      </div>
    </div>
  );
}
