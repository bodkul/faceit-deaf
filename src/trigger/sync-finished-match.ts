import { logger, task } from "@trigger.dev/sdk/v3";
import { fromUnixTime } from "date-fns";

import { fetchMatch, fetchMatchStats, fetchPlayers } from "@/lib/faceit/api";
import type { MatchPayload } from "@/lib/faceit/match-events";
import {
  getExistingPlayers,
  supabaseClient,
  upsertMatch,
  upsertMatchTeam,
  upsertMatchTeamPlayer,
  upsertPlayerStatsNormalized,
  upsertPlayers,
} from "@/lib/supabase";

export const syncFinishedMatchTask = task({
  id: "sync-finished-match",
  maxDuration: 300,
  run: async (payload: MatchPayload) => {
    logger.log("Starting sync of finished match", { matchId: payload.id });

    const matchId = payload.id.replace(/^1-/, "");
    const playerIds = payload.teams.flatMap((team) =>
      team.roster.map((p) => p.id),
    );

    const [existingPlayers, match, matchStats] = await Promise.all([
      getExistingPlayers(playerIds),
      fetchMatch(payload.id),
      fetchMatchStats(payload.id),
    ]);

    const existingPlayerIds = existingPlayers.map((p) => p.id);
    const players = await fetchPlayers(existingPlayerIds);

    await upsertPlayers(
      players.map((player) => ({
        id: player.player_id,
        avatar: player.avatar,
        nickname: player.nickname,
        skill_level: player.games.cs2.skill_level,
        faceit_elo: player.games.cs2.faceit_elo,
        steam_id_64: player.steam_id_64,
        cover_image: player.cover_image,
      })),
    );

    const round = matchStats.rounds[0];

    await upsertMatch({
      id: matchId,
      competition_id: match.competition_id,
      organizer_id: match.organizer_id,
      location_pick: match.voting.location?.pick[0],
      map_pick: match.voting.map?.pick[0],
      started_at: fromUnixTime(match.started_at).toISOString(),
      finished_at: fromUnixTime(match.finished_at).toISOString(),
      status: match.status,
      round_score: round.round_stats.Score,
    });

    for (const team of payload.teams) {
      const roundTeam = round.teams.find((rt) => rt.team_id === team.id);
      const stats = (roundTeam?.team_stats ?? {}) as Record<string, string>;

      const resTeam = await upsertMatchTeam({
        match_id: matchId,
        team_id: team.id,
        name: team.name,
        avatar: team.avatar,
        first_half_score: Number(stats["First Half Score"]),
        second_half_score: Number(stats["Second Half Score"]),
        overtime_score: Number(stats["Overtime score"]),
        final_score: Number(stats["Final Score"]),
        team_win: stats["Team Win"] === "1",
      });

      if (!resTeam) return;

      for (const player of team.roster) {
        const qwe = roundTeam?.players.find((p) => p.player_id === player.id);

        logger.log("Player stats from API", {
          playerId: player.id,
          hasStats: !!qwe?.player_stats,
          sampleStats: qwe?.player_stats
            ? {
                kills: qwe.player_stats.Kills,
                deaths: qwe.player_stats.Deaths,
                adr: qwe.player_stats.ADR,
              }
            : null,
        });

        const stats = qwe?.player_stats;
        const num = (val: unknown) => Number(val) || 0;

        const resPlayer = await upsertMatchTeamPlayer({
          match_team_id: resTeam.id,
          player_id_nullable: existingPlayerIds.includes(player.id)
            ? player.id
            : null,
          player_id_mandatory: player.id,
          nickname: player.nickname,
          game_skill_level: player.game_skill_level,
          elo_before: existingPlayers.find((p) => p.id === player.id)
            ?.faceit_elo,
          elo_after: players.find((p) => p.player_id === player.id)?.games.cs2
            .faceit_elo,
          adr: num(stats?.ADR),
          mvps: num(stats?.MVPs),
          kills: num(stats?.Kills),
          damage: num(stats?.Damage),
          deaths: num(stats?.Deaths),
          "1v1wins": num(stats?.["1v1Wins"]),
          "1v2wins": num(stats?.["1v2Wins"]),
          assists: num(stats?.Assists),
          "1v1count": num(stats?.["1v1Count"]),
          "1v2count": num(stats?.["1v2Count"]),
          headshots: num(stats?.Headshots),
          kd_ratio: num(stats?.["K/D Ratio"]),
          kr_ratio: num(stats?.["K/R Ratio"]),
          entry_wins: num(stats?.["Entry Wins"]),
          entry_count: num(stats?.["Entry Count"]),
          first_kills: num(stats?.["First Kills"]),
          flash_count: num(stats?.["Flash Count"]),
          headshots_percent: num(stats?.["Headshots %"]),
          clutch_kills: num(stats?.["Clutch Kills"]),
          double_kills: num(stats?.["Double Kills"]),
          pistol_kills: num(stats?.["Pistol Kills"]),
          quadro_kills: num(stats?.["Quadro Kills"]),
          triple_kills: num(stats?.["Triple Kills"]),
          utility_count: num(stats?.["Utility Count"]),
          utility_damage: num(stats?.["Utility Damage"]),
          enemies_flashed: num(stats?.["Enemies Flashed"]),
          flash_successes: num(stats?.["Flash Successes"]),
          utility_enemies: num(stats?.["Utility Enemies"]),
          match_entry_rate: num(stats?.["Match Entry Rate"]),
          utility_successes: num(stats?.["Utility Successes"]),
          match_1v1_win_rate: num(stats?.["Match 1v1 Win Rate"]),
          match_1v2_win_rate: num(stats?.["Match 1v2 Win Rate"]),
          utility_usage_per_round: num(stats?.["Utility Usage per Round"]),
          match_entry_success_rate: num(stats?.["Match Entry Success Rate"]),
          flash_success_rate_per_match: num(
            stats?.["Flash Success Rate per Match"],
          ),
          flashes_per_round_in_a_match: num(
            stats?.["Flashes per Round in a Match"],
          ),
          utility_success_rate_per_match: num(
            stats?.["Utility Success Rate per Match"],
          ),
          utility_damage_per_round_in_a_match: num(
            stats?.["Utility Damage per Round in a Match"],
          ),
          enemies_flashed_per_round_in_a_match: num(
            stats?.["Enemies Flashed per Round in a Match"],
          ),
          utility_damage_success_rate_per_match: num(
            stats?.["Utility Damage Success Rate per Match"],
          ),
          zeus_kills: num(stats?.["Zeus Kills"]),
          knife_kills: num(stats?.["Knife Kills"]),
          penta_kills: num(stats?.["Penta Kills"]),
          sniper_kills: num(stats?.["Sniper Kills"]),
          sniper_kill_rate_per_match: num(
            stats?.["Sniper Kill Rate per Match"],
          ),
          sniper_kill_rate_per_round: num(
            stats?.["Sniper Kill Rate per Round"],
          ),
        });

        if (!resPlayer) return;

        await upsertPlayerStatsNormalized({
          match_team_player_id: resPlayer.id,
          adr: num(stats?.ADR),
          mvps: num(stats?.MVPs),
          kills: num(stats?.Kills),
          damage: num(stats?.Damage),
          deaths: num(stats?.Deaths),
          "1v1wins": num(stats?.["1v1Wins"]),
          "1v2wins": num(stats?.["1v2Wins"]),
          assists: num(stats?.Assists),
          "1v1count": num(stats?.["1v1Count"]),
          "1v2count": num(stats?.["1v2Count"]),
          headshots: num(stats?.Headshots),
          kd_ratio: num(stats?.["K/D Ratio"]),
          kr_ratio: num(stats?.["K/R Ratio"]),
          entry_wins: num(stats?.["Entry Wins"]),
          entry_count: num(stats?.["Entry Count"]),
          first_kills: num(stats?.["First Kills"]),
          flash_count: num(stats?.["Flash Count"]),
          headshots_percent: num(stats?.["Headshots %"]),
          clutch_kills: num(stats?.["Clutch Kills"]),
          double_kills: num(stats?.["Double Kills"]),
          pistol_kills: num(stats?.["Pistol Kills"]),
          quadro_kills: num(stats?.["Quadro Kills"]),
          triple_kills: num(stats?.["Triple Kills"]),
          utility_count: num(stats?.["Utility Count"]),
          utility_damage: num(stats?.["Utility Damage"]),
          enemies_flashed: num(stats?.["Enemies Flashed"]),
          flash_successes: num(stats?.["Flash Successes"]),
          utility_enemies: num(stats?.["Utility Enemies"]),
          match_entry_rate: num(stats?.["Match Entry Rate"]),
          utility_successes: num(stats?.["Utility Successes"]),
          match_1v1_win_rate: num(stats?.["Match 1v1 Win Rate"]),
          match_1v2_win_rate: num(stats?.["Match 1v2 Win Rate"]),
          utility_usage_per_round: num(stats?.["Utility Usage per Round"]),
          match_entry_success_rate: num(stats?.["Match Entry Success Rate"]),
          flash_success_rate_per_match: num(
            stats?.["Flash Success Rate per Match"],
          ),
          flashes_per_round_in_a_match: num(
            stats?.["Flashes per Round in a Match"],
          ),
          utility_success_rate_per_match: num(
            stats?.["Utility Success Rate per Match"],
          ),
          utility_damage_per_round_in_a_match: num(
            stats?.["Utility Damage per Round in a Match"],
          ),
          enemies_flashed_per_round_in_a_match: num(
            stats?.["Enemies Flashed per Round in a Match"],
          ),
          utility_damage_success_rate_per_match: num(
            stats?.["Utility Damage Success Rate per Match"],
          ),
          zeus_kills: num(stats?.["Zeus Kills"]),
          knife_kills: num(stats?.["Knife Kills"]),
          penta_kills: num(stats?.["Penta Kills"]),
          sniper_kills: num(stats?.["Sniper Kills"]),
          sniper_kill_rate_per_match: num(
            stats?.["Sniper Kill Rate per Match"],
          ),
          sniper_kill_rate_per_round: num(
            stats?.["Sniper Kill Rate per Round"],
          ),
        });
      }
    }

    await supabaseClient.channel(`match:${matchId}`).httpSend("*", {});

    logger.log("Finished syncing match", { matchId });

    return { message: `Match ${matchId} synced successfully` };
  },
});
