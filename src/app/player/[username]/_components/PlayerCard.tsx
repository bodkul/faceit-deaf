"use client";

import { useQuery } from "@supabase-cache-helpers/postgrest-swr";
import Image from "next/image";
import { useMemo } from "react";
import Flag from "react-world-flags";

import {
  FaceitIcon,
  SkillLevelIcon,
  SteamIcon,
  TwitchIcon,
} from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayerStats } from "@/hooks/usePlayerStats";
import { calculateAverageStats } from "@/lib/calculateAverageStats";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { PlayerByUsername } from "@/types/player";

const cardBaseClass =
  "flex flex-col h-full p-3 justify-center items-center mb-2 bg-[#2123298f] rounded-2xl backdrop-blur-[32px]";

function FlagSkeleton() {
  return <Skeleton className="h-[9px] w-[14px] rounded-none" />;
}

function MatchCountSkeleton() {
  return <Skeleton className="h-6 w-20" />;
}

function RecentSkeleton() {
  return <Skeleton className="h-6 w-22" />;
}

function MostPlayedMapSkeleton() {
  return (
    <Skeleton className="relative mt-3 mb-0 flex size-full flex-col items-center justify-center rounded-[8px] bg-[rgba(0,0,0,0.48)] px-1 py-3.5 text-white" />
  );
}

function WinrateSkeleton() {
  return <Skeleton className="h-6 w-18" />;
}

export function PlayerCardSceleton() {
  return (
    <section className="relative flex items-stretch justify-between gap-2 rounded-3xl px-4 py-6">
      <div className="flex w-[200px] flex-col justify-center">
        <div className="relative mb-2 flex h-full flex-col items-center justify-center rounded-2xl bg-[#2123298f] p-8 outline-0 backdrop-blur-[32px]">
          <Skeleton className="mb-4 size-[118px] rounded-full" />
          <Skeleton className="h-6 w-20" />
          <div className="mt-2 h-2.5 w-3.5">
            <FlagSkeleton />
          </div>
        </div>
      </div>

      <div className="flex w-[190px] flex-col justify-center">
        <div className="mb-2 flex h-full flex-row items-center justify-center rounded-2xl bg-[#2123298f] backdrop-blur-[32px]">
          <Skeleton className="mr-2 block size-10 rounded-full" />
          <Skeleton className="h-6 w-20" />
        </div>

        <div className="mb-2 flex h-full flex-col items-center justify-center rounded-2xl bg-[#2123298f] p-3 backdrop-blur-[32px]">
          <span className="mb-1 text-sm text-[#cfcfcf] uppercase">Matches</span>
          <MatchCountSkeleton />
        </div>
        <div className="mb-2 flex h-full flex-col items-center justify-center rounded-2xl bg-[#2123298f] p-3 backdrop-blur-[32px]">
          <span className="mb-1 text-sm text-[#cfcfcf] uppercase">Recent</span>
          <ul className="mb-0 flex items-center justify-between text-white">
            <RecentSkeleton />
          </ul>
        </div>
      </div>

      <div className="flex w-[160px] flex-col justify-center">
        <div className="most_played_map mb-2 flex h-full flex-col items-center justify-center rounded-2xl bg-[#2123298f] p-3 backdrop-blur-[32px]">
          <span className="mb-1 text-sm text-[#cfcfcf] uppercase">
            Most Played Map
          </span>
          <MostPlayedMapSkeleton />
        </div>
      </div>

      <div className="flex grow flex-col justify-center">
        <div className="mb-2 flex h-auto flex-row! items-center justify-between rounded-2xl bg-[#2123298f] p-4 backdrop-blur-[32px]">
          <span className="text-sm text-[#cfcfcf] uppercase">
            Social Networks
          </span>
          <ul className="mb-0 flex items-center justify-between text-white">
            {[1, 2].flatMap((social) => (
              <li
                key={social}
                className="ml-2 size-8 rounded-[8px] text-center align-top"
              >
                <Skeleton className="flex size-8 items-center justify-center rounded border-none" />
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-2 flex h-full flex-col items-center justify-center rounded-2xl bg-[#2123298f] p-3 backdrop-blur-[32px]">
          <span className="mb-2 text-sm text-[#cfcfcf] uppercase">
            Average stats (overall)
          </span>
          <ul className="mb-0 flex w-full grow items-center justify-between text-white">
            <li className="mx-1 mb-2 flex h-full w-full flex-col items-center justify-center rounded-2xl bg-[rgba(33,35,41,0.56)] p-3 backdrop-blur-[32px]">
              <span>Winrate</span>
              <WinrateSkeleton />
            </li>
            <li className="mx-1 mb-2 flex h-full w-full flex-col items-center justify-center rounded-2xl bg-[rgba(33,35,41,0.56)] p-3 backdrop-blur-[32px]">
              <span>HS Rate</span>
              <Skeleton className="h-6 w-18" />
            </li>
            <li className="mx-1 mb-2 flex h-full w-full flex-col items-center justify-center rounded-2xl bg-[rgba(33,35,41,0.56)] p-3 backdrop-blur-[32px]">
              <span>K/D</span>
              <Skeleton className="h-6 w-14" />
            </li>
            <li className="mx-1 mb-2 flex h-full w-full flex-col items-center justify-center rounded-2xl bg-[rgba(33,35,41,0.56)] p-3 backdrop-blur-[32px]">
              <span>ADR</span>
              <Skeleton className="h-6 w-14" />
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function PlayerCard({ player }: { player: PlayerByUsername }) {
  const { data: statsData } = usePlayerStats(player.id);

  const { data: rawMatchData, count: matchCount } = useQuery(
    supabase
      .from("match_team_players")
      .select("match_teams(team_win, matches(id, map_pick, started_at))", {
        count: "exact",
      })
      .eq("match_teams.matches.status", "FINISHED")
      .match({ player_id_mandatory: player.id }),
  );

  const matchTeamPlayers = useMemo(() => {
    return rawMatchData
      ?.filter((p) => p.match_teams?.matches?.started_at)
      .sort(
        (a, b) =>
          new Date(b.match_teams.matches.started_at!).getTime() -
          new Date(a.match_teams.matches.started_at!).getTime(),
      );
  }, [rawMatchData]);

  const mostPlayedMap = useMemo(() => {
    const mapPicks = matchTeamPlayers
      ?.map((p) => p.match_teams?.matches?.map_pick)
      .filter((map) => map != null);

    if (!mapPicks || mapPicks.length === 0) return [];

    const mapCounts = mapPicks.reduce<Record<string, number>>((acc, map) => {
      acc[map] = (acc[map] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(mapCounts).sort((a, b) => b[1] - a[1])[0] ?? [];
  }, [matchTeamPlayers]);

  const winrate = useMemo(() => {
    const total = matchTeamPlayers?.length ?? 0;
    const wins =
      matchTeamPlayers?.filter((p) => p.match_teams?.team_win)?.length ?? 0;
    return total > 0 ? (wins / total) * 100 : null;
  }, [matchTeamPlayers]);

  const avgStats = useMemo(() => {
    const stats = calculateAverageStats(
      statsData?.map(({ player_stats_normalized }) => ({
        Rounds: String("0"),
        Assists: player_stats_normalized?.assists ?? "0",
        Deaths: player_stats_normalized?.deaths ?? "0",
        Kills: player_stats_normalized?.kills ?? "0",
        Headshots: player_stats_normalized?.headshots ?? "0",
        ADR: player_stats_normalized?.adr ?? "0",
        "K/R Ratio": player_stats_normalized?.kr_ratio ?? 0,
      })) ?? [],
    );

    return [
      {
        name: "Winrate",
        value: winrate != null ? `${winrate.toFixed(2)}%` : <WinrateSkeleton />,
      },
      { name: "HS Rate", value: `${stats.hsp.toFixed(2)}%` },
      { name: "K/D", value: stats.kd.toFixed(2) },
      { name: "ADR", value: stats.adr.toFixed(2) },
    ];
  }, [statsData, winrate]);

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
        icon: <SteamIcon className="size-6" />,
      },
    ];

    if (player.twitch_username) {
      list.push({
        key: "twitch",
        href: `https://www.twitch.tv/${player.twitch_username}`,
        icon: <TwitchIcon className="size-6" />,
      });
    }

    return list;
  }, [player]);

  return (
    <section className="relative flex items-stretch justify-between gap-2 rounded-3xl px-4 py-6">
      {player.cover_image && (
        <Image
          src={player.cover_image}
          className="absolute top-0 left-0 -z-1 size-full rounded-3xl"
          width={2560}
          height={640}
          alt="cover image"
        />
      )}

      <div className="flex w-[200px] flex-col justify-center">
        <div className="relative mb-2 flex h-full flex-col items-center rounded-2xl bg-[#2123298f] p-8 backdrop-blur-[32px]">
          <Avatar className="mb-4 size-[118px]">
            <AvatarImage src={player.avatar} alt="Avatar" />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <strong>{player.nickname}</strong>
          <div className="mt-2 h-2.5 w-3.5 text-white">
            {player.country ? (
              <Flag code={player.country} width={14} height={9} />
            ) : (
              <FlagSkeleton />
            )}
          </div>
        </div>
      </div>

      <div className="flex w-[190px] flex-col justify-center">
        <div className="mb-2 flex h-full flex-row items-center justify-center rounded-2xl bg-[#2123298f] backdrop-blur-[32px]">
          <SkillLevelIcon
            level={player.skill_level}
            className="mr-2 block size-10"
          />
          <strong className="elo-number text-white">
            {player.faceit_elo} ELO
          </strong>
        </div>

        <div className={cardBaseClass}>
          <span className="mb-1 text-sm text-[#cfcfcf] uppercase">Matches</span>
          {matchCount ? (
            <strong className="text-white">{matchCount}</strong>
          ) : (
            <MatchCountSkeleton />
          )}
        </div>

        <div className={cardBaseClass}>
          <span className="mb-1 text-sm text-[#cfcfcf] uppercase">Recent</span>
          <ul className="flex items-center justify-between text-white">
            {matchTeamPlayers
              ?.slice(0, 5)
              .toReversed()
              .map((p, i) => (
                <li
                  key={i}
                  className={cn("mx-0.5", {
                    "text-[#32d35a]": p.match_teams.team_win === true,
                    "text-[#f2002a]": p.match_teams.team_win === false,
                  })}
                >
                  {p.match_teams.team_win ? "W" : "L"}
                </li>
              )) ?? <RecentSkeleton />}
          </ul>
        </div>
      </div>

      <div className="flex w-[160px] flex-col justify-center">
        <div className={cardBaseClass}>
          <span className="mb-1 text-sm text-[#cfcfcf] uppercase">
            Most Played Map
          </span>
          {mostPlayedMap.length > 0 ? (
            <div className="relative mt-3 flex size-full flex-col items-center justify-center rounded-[8px] bg-[rgba(0,0,0,0.48)] px-1 py-3.5 text-white">
              <Image
                src={`/img/maps/${mostPlayedMap[0].slice(3).toLowerCase()}.webp`}
                className="absolute bottom-0 left-0 -z-1 size-full rounded-[8px] object-cover"
                width={400}
                height={250}
                alt={mostPlayedMap[0]}
              />
              <span className="capitalize">{mostPlayedMap[0].slice(3)}</span>
              <strong>{mostPlayedMap[1]} Games</strong>
            </div>
          ) : (
            <MostPlayedMapSkeleton />
          )}
        </div>
      </div>

      <div className="flex grow flex-col justify-center">
        <div className="mb-2 flex h-auto flex-row items-center justify-between rounded-2xl bg-[#2123298f] p-4 backdrop-blur-[32px]">
          <span className="text-sm text-[#cfcfcf] uppercase">
            Social Networks
          </span>
          <ul className="flex items-center text-white">
            {socials.map((s) => (
              <li key={s.key} className="ml-2 size-8 rounded-[8px] text-center">
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  <Card className="flex size-8 items-center justify-center rounded border-none">
                    {s.icon}
                  </Card>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={cardBaseClass}>
          <span className="mb-2 text-sm text-[#cfcfcf] uppercase">
            Average stats (overall)
          </span>
          <ul className="flex w-full grow items-center justify-between text-white">
            {avgStats.map((s) => (
              <li
                key={s.name}
                className="mx-1 flex h-full w-full flex-col items-center justify-center rounded-2xl bg-[rgba(33,35,41,0.56)] p-3 backdrop-blur-[32px]"
              >
                <span>{s.name}</span>
                <strong>{s.value}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
