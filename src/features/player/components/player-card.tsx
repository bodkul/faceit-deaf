"use client";

import {
  IconBrandSteam,
  IconBrandTelegram,
  IconBrandTwitch,
  IconUser,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import { CountryFlag } from "@/components/country-flag";
import { FaceitIcon, FaceitLevelIcon } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import type { getPlayerByUsername } from "@/features/player/queries";
import { getEloToNextLevel, getSkillLevel } from "@/lib/faceit/levels";

type Player = Awaited<ReturnType<typeof getPlayerByUsername>>;

// Only this profile links a Telegram account.
const TELEGRAM_BY_PLAYER_ID: Record<string, string> = {
  "ce7684cf-e582-4ebd-9293-608fcd5696ee": "bodkul",
};

function getSocials(player: Player) {
  const telegram = TELEGRAM_BY_PLAYER_ID[player.id];
  return [
    {
      label: "FACEIT profile",
      href: `https://www.faceit.com/en/players/${player.nickname}`,
      icon: FaceitIcon,
    },
    player.steam_id_64 && {
      label: "Steam profile",
      href: `https://steamcommunity.com/profiles/${player.steam_id_64}`,
      icon: IconBrandSteam,
    },
    player.twitch_username && {
      label: "Twitch channel",
      href: `https://www.twitch.tv/${player.twitch_username}`,
      icon: IconBrandTwitch,
    },
    telegram && {
      label: "Telegram",
      href: `https://t.me/${telegram}`,
      icon: IconBrandTelegram,
    },
  ].filter((item) => !!item);
}

export function PlayerCard({ player }: { player: Player }) {
  const level = getSkillLevel(player.faceit_elo);
  const toNext = getEloToNextLevel(player.faceit_elo);

  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-border bg-card">
      {player.cover_image && (
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image
            src={player.cover_image}
            alt=""
            fill
            unoptimized
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-r from-card via-card/85 to-card/40" />
        </div>
      )}

      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          <Avatar className="size-16 shrink-0 rounded-xl ring-2 ring-border-strong after:rounded-xl sm:size-20">
            <AvatarImage className="rounded-xl" src={player.avatar} alt="" />
            <AvatarFallback className="rounded-xl">
              <IconUser className="size-8" />
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-col gap-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <h1 className="truncate font-black text-2xl tracking-tight sm:text-3xl">
                {player.nickname}
              </h1>
              <CountryFlag code={player.country} className="h-3.5 w-5" />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {getSocials(player).map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className={buttonVariants({
                    size: "icon-sm",
                    variant: "outline",
                  })}
                >
                  <Icon />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-background/60 px-4 py-3 backdrop-blur-sm sm:min-w-56">
          <FaceitLevelIcon elo={player.faceit_elo} className="size-10" />
          <div className="flex flex-col">
            <span className="font-mono text-[11px] text-faint uppercase tracking-wider">
              {level > 0 ? `Level ${level}` : "Unranked"}
            </span>
            <span className="font-black font-mono text-2xl tabular-nums leading-tight">
              {player.faceit_elo ?? "—"}
              <span className="ml-1 font-medium text-muted-foreground text-xs">
                ELO
              </span>
            </span>
            {toNext !== null && (
              <span className="text-muted-foreground text-xs">
                {toNext} to level {level + 1}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
