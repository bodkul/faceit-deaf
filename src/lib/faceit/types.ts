import type {
  FaceitSDK as BaseFaceitSDK,
  PlayerDetails as BasePlayerDetails,
  PlayerMatchDTO as BasePlayerMatchDTO,
} from "faceit-sdk";
import type { MatchDetails } from "faceit-sdk/matches";

export interface PlayerDetails extends BasePlayerDetails {
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
}

export interface PlayerMatchDTO extends BasePlayerMatchDTO {
  playing_players: string[];
}

export interface PlayerStatsData {
  ADR: number;
  Assists: number;
  Deaths: number;
  Damage: number;
  Kills: number;
  MVPs: number;
  Headshots: number;
  "Headshots %": number;
  "K/D Ratio": number;
  "K/R Ratio": number;
  "1v1Wins": number;
  "1v2Wins": number;
  "1v1Count": number;
  "1v2Count": number;
  "Entry Wins": number;
  "Entry Count": number;
  "First Kills": number;
  "Flash Count": number;
  "Clutch Kills": number;
  "Double Kills": number;
  "Pistol Kills": number;
  "Quadro Kills": number;
  "Triple Kills": number;
  "Utility Count": number;
  "Utility Damage": number;
  "Enemies Flashed": number;
  "Flash Successes": number;
  "Utility Enemies": number;
  "Match Entry Rate": number;
  "Utility Successes": number;
  "Match 1v1 Win Rate": number;
  "Match 1v2 Win Rate": number;
  "Utility Usage per Round": number;
  "Match Entry Success Rate": number;
  "Flash Success Rate per Match": number;
  "Flashes per Round in a Match": number;
  "Utility Success Rate per Match": number;
  "Utility Damage per Round in a Match": number;
  "Enemies Flashed per Round in a Match": number;
  "Utility Damage Success Rate per Match": number;
  "Zeus Kills": number;
  "Knife Kills": number;
  "Sniper Kills": number;
  "Sniper Kill Rate per Match": number;
  "Sniper Kill Rate per Round": number;
  "Penta Kills": number;
}

export interface FaceitSDK extends BaseFaceitSDK {
  players: BaseFaceitSDK["players"] & {
    getPlayerDetails(playerId: string): Promise<PlayerDetails>;
    getPlayersDetails(playerIds: string[]): Promise<PlayerDetails[]>;
    getCompletePlayerHistory(playerId: string): Promise<PlayerMatchDTO[]>;
  };
  matches: BaseFaceitSDK["matches"] & {
    getMatchesDetails(matchIds: string[]): Promise<MatchDetails[]>;
  };
}
