"use client";

import "@/config/dateConfig";

import Link from "next/link";
import { notFound } from "next/navigation";
import { type JSX, use } from "react";

import { FaceitIcon, SkillLevelIcon, SteamIcon, TwitchIcon } from "@/app/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import usePlayer from "@/hooks/queries/usePlayer";
import usePlayersSubscription from "@/hooks/subscriptions/usePlayersSubscription";

import MatchHistories from "./components/matchHistories";
import PlayerStats from "./components/playerStats";
import Stat from "./components/stat";
import Loading from "./loading";

export default function Page(props: { params: Promise<{ username: string }> }) {
  const { username } = use(props.params);

  const { data: player, mutate, isLoading } = usePlayer(username);

  usePlayersSubscription(async () => {
    await mutate();
  });

  if (isLoading) {
    return Loading();
  }

  if (!player) {
    return notFound();
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex relative size-20">
              <Avatar className="size-20">
                <AvatarImage src={player.avatar} alt={player.nickname} />
                <AvatarFallback />
              </Avatar>
              <SkillLevelIcon
                level={player.skill_level}
                className="size-8 absolute -right-1 -bottom-1"
              />
            </div>
            <div className="flex flex-col space-y-3">
              <p className="text-2xl font-medium leading-none">
                {player.nickname}
              </p>
              <div className="flex space-x-1">
                {[
                  {
                    href: player.faceit_url.replace("{lang}", "en"),
                    icon: <FaceitIcon className="size-4" />,
                  },
                  {
                    href: `https://steamcommunity.com/profiles/${player.steam_id_64}`,
                    icon: <SteamIcon className="size-4" />,
                  },
                  player.twitch_username
                    ? {
                        href: `https://www.twitch.tv/${player.twitch_username}`,
                        icon: <TwitchIcon className="size-4" />,
                      }
                    : null,
                ]
                  .filter(
                    (item): item is { href: string; icon: JSX.Element } =>
                      !!item,
                  )
                  .map(({ href, icon }, index) => (
                    <div key={index} className="flex rounded-md border size-6">
                      <Link className="m-auto" href={href} target="_blank">
                        {icon}
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Stat name="Elo" value={player?.faceit_elo} isLoading={!player} />
            <PlayerStats playerId={player.id} />
          </div>
        </CardContent>
      </Card>

      <MatchHistories playerId={player.id} />
    </>
  );
}
