export interface Player {
  activated_at: string;
  avatar: string;
  country: string;
  cover_featured_image: string;
  cover_image: string;
  faceit_url: string;
  friends_ids: string[];
  games: Record<
    string,
    {
      faceit_elo: number;
      game_player_id: string;
      game_player_name: string;
      game_profile_id: string;
      region: string;
      regions: unknown;
      skill_level: number;
      skill_level_label: string;
    }
  >;
  infractions: unknown;
  membership_type: string;
  memberships: string[];
  new_steam_id: string;
  nickname: string;
  platforms: Record<string, string>;
  player_id: string;
  settings: {
    language: string;
  };
  steam_id_64: string;
  steam_nickname: string;
  verified: boolean;
}

export interface PlayerStats {
  Assists: string;
  "Best Of": string;
  "Competition Id": string;
  "Created At": string;
  Deaths: string;
  "Final Score": string;
  "First Half Score": string;
  Game: string;
  "Game Mode": string;
  Headshots: string;
  "Headshots %": string;
  "K/D Ratio": string;
  "K/R Ratio": string;
  Kills: string;
  MVPs: string;
  Map: string;
  "Match Id": string;
  "Match Round": string;
  Nickname: string;
  "Overtime score": string;
  "Penta Kills": string;
  "Player Id": string;
  "Quadro Kills": string;
  Region: string;
  Result: string;
  Rounds: string;
  Score: string;
  "Second Half Score": string;
  Team: string;
  "Triple Kills": string;
  "Updated At": string;
  Winner: string;
  ADR: string;
  "Match Finished At": number;
}

export interface PlayerCS2Stats {
  start: number;
  end: number;
  items: {
    stats: PlayerStats;
  }[];
}

export interface Match {
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
}

export interface MatchStats {
  rounds: {
    best_of: string;
    competition_id: string;
    game_id: string;
    game_mode: string;
    match_id: string;
    match_round: string;
    played: string;
    round_stats: {
      Region: string;
      Score: string;
      Winner: string;
      Map: string;
      Rounds: number;
    };
    teams: {
      team_id: string;
      premade: boolean;
      team_stats: {
        "Second Half Score": string;
        "Team Win": string;
        "Team Headshots": string;
        Team: string;
        "Final Score": string;
        "Overtime score": string;
        "First Half Score": string;
      };
      players: {
        player_id: string;
        nickname: string;
        player_stats: PlayerStats;
      }[];
    }[];
  }[];
}

export interface HubStats {
  players: [];
}
