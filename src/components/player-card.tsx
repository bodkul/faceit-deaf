"use client";

import { useQuery } from "@supabase-cache-helpers/postgrest-swr";
import Image from "next/image";
import { useMemo } from "react";
import Flag from "react-world-flags";

import { FaceitIcon, SkillLevelIcon, SteamIcon, TwitchIcon } from "@/app/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useCountMatchesByPlayerId from "@/hooks/queries/useCountMatchesByPlayerId";
import usePlayerStats from "@/hooks/queries/usePlayerStats";
import calculateAverageStats from "@/lib/calculateAverageStats";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type PlayerCardProps = {
  player: {
    avatar: string;
    country: string | null;
    cover_image: string | null;
    faceit_elo: number;
    faceit_url: string;
    id: string;
    nickname: string;
    skill_level: number;
    steam_id_64: string;
    twitch_username: string | null;
  };
};

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
    <Skeleton className="relative flex flex-col items-center justify-center size-full mt-3 rounded-[8px] py-3.5 px-1 bg-[rgba(0,0,0,0.48)] text-white mb-0" />
  );
}

function WinrateSkeleton() {
  return <Skeleton className="h-6 w-18" />;
}

export function PlayerCardSceleton() {
  return (
    <section className="flex relative items-stretch justify-between py-6 px-4 gap-2 rounded-3xl">
      <div className="flex flex-col justify-center w-[200px]">
        <div className="relative p-8 outline-0 flex flex-col h-full justify-center items-center mb-2 bg-[#2123298f] rounded-2xl backdrop-blur-[32px]">
          <Skeleton className="size-[118px] rounded-full mb-4" />
          <Skeleton className="h-6 w-20" />
          <div className="w-3.5 h-2.5 mt-2">
            <FlagSkeleton />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center w-[190px]">
        <div className="flex-row flex h-full justify-center items-center mb-2 bg-[#2123298f] rounded-2xl backdrop-blur-[32px]">
          <Skeleton className="block size-10 mr-2 rounded-full" />
          <Skeleton className="h-6 w-20" />
        </div>

        <div className="flex flex-col h-full p-3 justify-center items-center mb-2 bg-[#2123298f] rounded-2xl backdrop-blur-[32px]">
          <span className="text-[#cfcfcf] mb-1 uppercase text-sm">Matches</span>
          <MatchCountSkeleton />
        </div>
        <div className="flex flex-col h-full p-3 justify-center items-center mb-2 bg-[#2123298f] rounded-2xl backdrop-blur-[32px]">
          <span className="text-[#cfcfcf] mb-1 uppercase text-sm">Recent</span>
          <ul className="flex items-center justify-between text-white mb-0">
            <RecentSkeleton />
          </ul>
        </div>
      </div>

      <div className="flex flex-col justify-center w-[160px]">
        <div className="most_played_map flex flex-col h-full p-3 justify-center items-center mb-2 bg-[#2123298f] rounded-2xl backdrop-blur-[32px]">
          <span className="text-[#cfcfcf] mb-1 uppercase text-sm">
            Most Played Map
          </span>
          <MostPlayedMapSkeleton />
        </div>
      </div>

      <div className="flex flex-col justify-center grow">
        <div className="!flex-row justify-between h-auto flex items-center mb-2 bg-[#2123298f] rounded-2xl backdrop-blur-[32px] p-4">
          <span className="text-[#cfcfcf] uppercase text-sm">
            Social Networks
          </span>
          <ul className="flex items-center justify-between text-white mb-0">
            {[1, 2].flatMap((social) => (
              <li
                key={social}
                className="size-8 ml-2 text-center align-top rounded-[8px]"
              >
                <Skeleton className="flex size-8 items-center justify-center border-none rounded" />
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col h-full p-3 justify-center items-center mb-2 bg-[#2123298f] rounded-2xl backdrop-blur-[32px]">
          <span className="text-[#cfcfcf] mb-2 uppercase text-sm">
            Average stats (overall)
          </span>
          <ul className="flex items-center justify-between w-full grow text-white mb-0">
            <li className="w-full mx-1 backdrop-blur-[32px] rounded-2xl mb-2 flex items-center justify-center flex-col p-3 h-full bg-[rgba(33,35,41,0.56)]">
              <span>Winrate</span>
              <WinrateSkeleton />
            </li>
            <li className="w-full mx-1 backdrop-blur-[32px] rounded-2xl mb-2 flex items-center justify-center flex-col p-3 h-full bg-[rgba(33,35,41,0.56)]">
              <span>HS Rate</span>
              <Skeleton className="h-6 w-18" />
            </li>
            <li className="w-full mx-1 backdrop-blur-[32px] rounded-2xl mb-2 flex items-center justify-center flex-col p-3 h-full bg-[rgba(33,35,41,0.56)]">
              <span>K/D</span>
              <Skeleton className="h-6 w-14" />
            </li>
            <li className="w-full mx-1 backdrop-blur-[32px] rounded-2xl mb-2 flex items-center justify-center flex-col p-3 h-full bg-[rgba(33,35,41,0.56)]">
              <span>ADR</span>
              <Skeleton className="h-6 w-14" />
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function PlayerCard({ player }: PlayerCardProps) {
  const { data: statsData } = usePlayerStats(player.id);
  const { count: matchCount } = useCountMatchesByPlayerId(player.id);

  const { data: rawMatchData } = useQuery(
    supabase
      .from("match_team_players")
      .select("match_teams(team_win, matches(id, map_pick, started_at))")
      .eq("player_id_mandatory", player.id),
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
      statsData?.map((item) => ({
        Rounds: String(item.rounds),
        Assists: item.assists,
        Deaths: item.deaths,
        Kills: item.kills,
        Headshots: item.headshots,
        ADR: item.adr,
        "K/R Ratio": item.kpr,
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
        href: player.faceit_url.replace("{lang}", "en"),
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
    <section className="flex relative items-stretch justify-between py-6 px-4 gap-2 rounded-3xl">
      {player.cover_image && (
        <Image
          src={player.cover_image}
          className="top-0 rounded-3xl absolute -z-[1] size-full left-0"
          width={2560}
          height={640}
          alt="cover image"
        />
      )}

      <div className="flex flex-col justify-center w-[200px]">
        <div className="relative p-8 flex flex-col h-full items-center mb-2 bg-[#2123298f] rounded-2xl backdrop-blur-[32px]">
          <Avatar className="size-[118px] mb-4">
            <AvatarImage src={player.avatar} alt="Avatar" />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <strong>{player.nickname}</strong>
          <div className="w-3.5 h-2.5 mt-2 text-white">
            {player.country ? (
              <Flag code={player.country} width={14} height={9} />
            ) : (
              <FlagSkeleton />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center w-[190px]">
        <div className="flex-row flex h-full justify-center items-center mb-2 bg-[#2123298f] rounded-2xl backdrop-blur-[32px]">
          <SkillLevelIcon
            level={player.skill_level}
            className="block size-10 mr-2"
          />
          <strong className="elo-number text-white">
            {player.faceit_elo} ELO
          </strong>
        </div>

        <div className={cardBaseClass}>
          <span className="text-[#cfcfcf] mb-1 uppercase text-sm">Matches</span>
          {matchCount ? (
            <strong className="text-white">{matchCount}</strong>
          ) : (
            <MatchCountSkeleton />
          )}
        </div>

        <div className={cardBaseClass}>
          <span className="text-[#cfcfcf] mb-1 uppercase text-sm">Recent</span>
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

      <div className="flex flex-col justify-center w-[160px]">
        <div className={cardBaseClass}>
          <span className="text-[#cfcfcf] mb-1 uppercase text-sm">
            Most Played Map
          </span>
          {mostPlayedMap.length > 0 ? (
            <div className="relative flex flex-col items-center justify-center size-full mt-3 rounded-[8px] py-3.5 px-1 bg-[rgba(0,0,0,0.48)] text-white">
              <Image
                src={`/img/maps/${mostPlayedMap[0].slice(3).toLowerCase()}.webp`}
                className="absolute -z-[1] size-full left-0 bottom-0 rounded-[8px] object-cover"
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

      <div className="flex flex-col justify-center grow">
        <div className="flex-row justify-between h-auto flex items-center mb-2 bg-[#2123298f] rounded-2xl backdrop-blur-[32px] p-4">
          <span className="text-[#cfcfcf] uppercase text-sm">
            Social Networks
          </span>
          <ul className="flex items-center text-white">
            {socials.map((s) => (
              <li key={s.key} className="size-8 ml-2 text-center rounded-[8px]">
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  <Card className="flex size-8 items-center justify-center border-none rounded">
                    {s.icon}
                  </Card>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={cardBaseClass}>
          <span className="text-[#cfcfcf] mb-2 uppercase text-sm">
            Average stats (overall)
          </span>
          <ul className="flex items-center justify-between w-full grow text-white">
            {avgStats.map((s) => (
              <li
                key={s.name}
                className="w-full mx-1 backdrop-blur-[32px] rounded-2xl flex items-center justify-center flex-col p-3 h-full bg-[rgba(33,35,41,0.56)]"
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
