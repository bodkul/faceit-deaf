"use client";

import {
  IconBrandSteam,
  IconBrandTelegram,
  IconBrandTwitch,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { FaceitIcon, SkillLevelIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCountryFlagUrl } from "@/lib/country";
import { getSkillLevelFromElo } from "@/lib/faceit/utils";
import type { getPlayerByUsername } from "@/lib/supabase";
// import { useTwitchLiveStatus } from "@/lib/twitch/use-twitch-live-status";

export function PlayerCard({
  player,
}: {
  player: NonNullable<Awaited<ReturnType<typeof getPlayerByUsername>>>;
}) {
  const socials = useMemo(() => {
    const items = [
      {
        key: "faceit",
        href: `https://www.faceit.com/en/players/${player.nickname}`,
        icon: <FaceitIcon />,
      },
      {
        key: "steam",
        href: `https://steamcommunity.com/profiles/${player.steam_id_64}`,
        icon: <IconBrandSteam />,
      },
    ];

    if (player.twitch_username) {
      items.push({
        key: "twitch",
        href: `https://www.twitch.tv/${player.twitch_username}`,
        icon: <IconBrandTwitch />,
      });
    }

    if (player.id === "ce7684cf-e582-4ebd-9293-608fcd5696ee") {
      items.push({
        key: "telegram",
        href: "https://t.me/bodkul",
        icon: <IconBrandTelegram />,
      });
    }

    return items;
  }, [player]);

  const skillLevel = player.faceit_elo
    ? getSkillLevelFromElo(player.faceit_elo)
    : undefined;

  return (
    <Card className="relative bg-background p-6 md:flex-row md:justify-between md:p-8">
      <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/4 blur-3xl" />

      <div className="flex flex-row gap-4">
        <Avatar className="size-30 rounded-md after:rounded-md">
          <AvatarImage
            className="rounded-md"
            src={player.avatar}
            alt={player.nickname}
          />
          <AvatarFallback className="rounded-md">
            {player.nickname.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {player.country && (
              <Image
                src={getCountryFlagUrl(player.country.toLowerCase(), 40)}
                width={28}
                height={20}
                alt={player.country}
                className="rounded-xs"
              />
            )}
            <h1 className="font-bold text-2xl md:text-3xl">
              {player.nickname}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {socials.map((s) => (
              <Link
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  size: "sm",
                  variant: "outline",
                })}
              >
                {s.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="md:w-48">
        {player.faceit_elo && (
          <div className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-neutral-900/50 px-4 py-3">
            {skillLevel && (
              <SkillLevelIcon level={skillLevel} className="size-8 shrink-0" />
            )}
            <div className="flex flex-col leading-tight">
              <span className="font-mono text-[#888888] text-[10px] uppercase tracking-wide">
                Faceit ELO
              </span>
              <span className="font-mono text-lg">{player.faceit_elo}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
