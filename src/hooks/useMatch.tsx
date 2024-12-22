"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchMatch,
  fetchMatchStats,
  fetchPlayer,
  type PlayerStats,
} from "@/lib/faceit/api";

type Match = {
  best_of: number;
  broadcast_start_time: number;
  broadcast_start_time_label: boolean;
  calculate_elo: boolean;
  chat_room_id: string;
  competition_id: string;
  competition_name: string;
  competition_type: string;
  configured_at: number;
  demo_url: string[];
  detailed_results: [
    {
      asc_score: boolean;
      factions: {
        property1: {
          score: number;
        };
        property2: {
          score: number;
        };
      };
      winner: string;
    },
  ];
  faceit_url: string;
  finished_at: number;
  game: string;
  group: number;
  match_id: string;
  organizer_id: string;
  region: string;
  results: {
    score: {
      faction1: number;
      faction2: number;
    };
    winner: string;
  };
  round: number;
  scheduled_at: number;
  started_at: number;
  status: "FINISHED" | "ONGOING";
  teams: {
    faction1: {
      avatar: string;
      faction_id: string;
      leader: string;
      name: string;
      roster: [
        {
          anticheat_required: boolean;
          avatar: string;
          game_player_id: string;
          game_player_name: string;
          game_skill_level: number;
          membership: string;
          nickname: string;
          player_id: string;
        },
      ];
      roster_v1: null;
      stats: {
        rating: number;
        skillLevel: {
          average: number;
          range: {
            max: number;
            min: number;
          };
        };
        winProbability: number;
      };
      substituted: boolean;
      type: string;
    };
    faction2: {
      avatar: string;
      faction_id: string;
      leader: string;
      name: string;
      roster: [
        {
          anticheat_required: boolean;
          avatar: string;
          game_player_id: string;
          game_player_name: string;
          game_skill_level: number;
          membership: string;
          nickname: string;
          player_id: string;
        },
      ];
      roster_v1: null;
      stats: {
        rating: number;
        skillLevel: {
          average: number;
          range: {
            max: number;
            min: number;
          };
        };
        winProbability: number;
      };
      substituted: boolean;
      type: string;
    };
  };
  version: number;
  voting: {
    location?: {
      entities: {
        class_name: string;
        game_location_id: string;
        guid: string;
        image_lg: string;
        image_sm: string;
        name: string;
      }[];
      pick: string[];
    };
    map?: {
      entities: {
        class_name: string;
        game_location_id: string;
        guid: string;
        image_lg: string;
        image_sm: string;
        name: string;
      }[];
      pick: string[];
    };
  };
};

type MatchResult = {
  id: Match["match_id"];
  startedAt: Date;
  finishedAt: Date;
  bo: Match["best_of"];
  team1: Match["teams"]["faction1"];
  team2: Match["teams"]["faction2"];
  status: Match["status"];
  winner: {
    team1: boolean;
    team2: boolean;
  };
  demo: string;
  server: {
    name: string | undefined;
    image: {
      sm: string | undefined;
      lg: string | undefined;
    };
  };
  map: {
    name: string | undefined;
    image: {
      sm: string | undefined;
      lg: string | undefined;
    };
  };
  stats: {
    score: {
      teamId: string;
      firstHalfScore: string;
      secondHalfScore: string;
      score: string;
      overtimeScore: string;
    }[];
    isOvertime: number;
    team1: {
      player_id: string;
      nickname: string;
      player_stats: PlayerStats;
    }[];
    team2: {
      player_id: string;
      nickname: string;
      player_stats: PlayerStats;
    }[];
    rounds: number;
  };
  countries: {
    team1: { id: string; country: string }[];
    team2: { id: string; country: string }[];
  };
};

export default function useMatch(matchId?: string) {
  const [match, setMatch] = useState<MatchResult>();

  const getMatch = useCallback(async () => {
    if (!matchId) return;

    const match = await fetchMatch(matchId);

    const server = match.voting.location?.pick[0];
    const map = match.voting.map?.pick[0];

    return {
      id: match.match_id,
      startedAt: new Date(match.started_at * 1000),
      finishedAt: new Date(match.finished_at * 1000),
      bo: match.best_of,
      team1: match.teams.faction1,
      team2: match.teams.faction2,
      status: match.status,
      winner: {
        team1: match.results.winner === "faction1",
        team2: match.results.winner === "faction2",
      },
      demo: match.demo_url[0],
      server: {
        name: server,
        image: {
          sm: match.voting.location?.entities.find(
            (entity) => entity.guid === server,
          )?.image_sm,
          lg: match.voting.location?.entities.find(
            (entity) => entity.guid === server,
          )?.image_lg,
        },
      },
      map: {
        name: map,
        image: {
          sm: match.voting.map?.entities.find((entity) => entity.guid === map)
            ?.image_sm,
          lg: match.voting.map?.entities.find((entity) => entity.guid === map)
            ?.image_lg,
        },
      },
    };
  }, [matchId]);

  const getMatchStats = useCallback(async () => {
    if (!matchId) return;

    const { rounds } = await fetchMatchStats(matchId);

    const team1 = rounds[0].teams[0];
    const team2 = rounds[0].teams[1];

    return {
      score: [
        {
          teamId: team1.team_id,
          firstHalfScore: team1.team_stats["First Half Score"],
          secondHalfScore: team1.team_stats["Second Half Score"],
          score: team1.team_stats["Final Score"],
          overtimeScore: team1.team_stats["Overtime score"],
        },
        {
          teamId: team2.team_id,
          firstHalfScore: team2.team_stats["First Half Score"],
          secondHalfScore: team2.team_stats["Second Half Score"],
          score: team2.team_stats["Final Score"],
          overtimeScore: team2.team_stats["Overtime score"],
        },
      ],
      isOvertime:
        +team1.team_stats["Overtime score"] ||
        +team2.team_stats["Overtime score"],
      team1: team1.players,
      team2: team2.players,
      rounds: +rounds[0].round_stats.Rounds,
    };
  }, [matchId]);

  const getPlayerDetails = useCallback(fetchPlayer, []);

  const loadMatch = useCallback(async () => {
    if (!matchId) {
      return;
    }

    const [match, stats] = await Promise.all([getMatch(), getMatchStats()]);

    if (!match || !stats) throw new Error("No match found");

    const countries = {
      team1: await Promise.all(
        match.team1.roster.map((player) =>
          getPlayerDetails(player.player_id).then((details) => ({
            id: player.player_id,
            country: details.country,
          })),
        ),
      ),
      team2: await Promise.all(
        match.team2.roster.map((player) =>
          getPlayerDetails(player.player_id).then((details) => ({
            id: player.player_id,
            country: details.country,
          })),
        ),
      ),
    };

    setMatch({
      ...match,
      stats,
      countries,
    });
  }, [matchId, getMatch, getMatchStats, getPlayerDetails]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  return match;
}
