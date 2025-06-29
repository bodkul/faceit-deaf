import { fromUnixTime } from "date-fns";
import { NextResponse } from "next/server";

import {
  fetchFullPlayerHistory,
  fetchMatch,
  fetchMatchStats,
} from "@/lib/faceit/api";
import {
  getExistingPlayers,
  upsertMatch,
  upsertMatchTeam,
  upsertMatchTeamPlayer,
  upsertPlayerStatsNormalized,
} from "@/lib/supabase/mutations";

const PLAYER_IDS = [
  "73554889-e13a-457c-bdfc-55487d246f62",
  "c07027c3-0b31-4aef-9251-e7030855cb58",
  "14c679f1-7ddc-4cac-9f81-ab9802b6555b",
  "ee2d195c-6f06-48ed-b88a-7bd503b4c78a",
  "633c6776-5229-43c4-a31a-fb2dfafeeb49",
  "bf3930e6-4a63-4cd0-a63a-c2ceb50925b0",
  "2a1e2772-d16d-4b62-84d6-89817dc1a8dd",
  "6581ccbc-0bad-46c2-a44b-85d9266e67d6",
  "a9aeb812-2ea6-48eb-a2ff-aeb964c427ab",
  "8fb3b38a-5876-46e5-b349-5723a6aacc05",
  "20e71879-0e40-4a62-89e0-c2226e5a8716",
  "fc69b176-a328-44ee-99b3-fa7d686ac65b",
  "8bff016a-55ea-4fec-a349-78fc3a3d8c27",
];

export async function GET() {
  for (const playerId of PLAYER_IDS) {
    console.log(`Starting to load matches for player: ${playerId}`);

    const matches = await fetchFullPlayerHistory(playerId);

    console.log(`Fetched ${matches.length} matches for player: ${playerId}.`);

    for (const [index, { match_id, playing_players }] of matches.entries()) {
      console.log(
        `Processing match ${index + 1}/${matches.length}: ${match_id}`,
      );

      const [existingPlayers, match, matchStats] = await Promise.all([
        getExistingPlayers(playing_players),
        fetchMatch(match_id),
        fetchMatchStats(match_id),
      ]);

      const existingPlayerIds = existingPlayers.map((player) => player.id);

      const round = matchStats.rounds[0];

      await upsertMatch({
        id: match_id.replace(/^1-/, ""),
        competition_id: match.competition_id,
        organizer_id: match.organizer_id,
        location_pick: match.voting.location?.pick[0],
        map_pick: match.voting.map?.pick[0],
        started_at: fromUnixTime(match.started_at).toISOString(),
        finished_at: fromUnixTime(match.finished_at).toISOString(),
        status: match.status.toUpperCase(),
        round_score: round.round_stats.Score,
      });

      for (const team of [match.teams.faction1, match.teams.faction2]) {
        const roundTeam = round.teams.find(
          (rt) => rt.team_id === team.faction_id,
        );
        const stats = (roundTeam?.team_stats as Record<string, string>) ?? {};

        const resTeam = await upsertMatchTeam({
          match_id: match_id.replace(/^1-/, ""),
          team_id: team.faction_id,
          name: team.name,
          avatar: team.avatar,
          first_half_score: Number(stats["First Half Score"]),
          second_half_score: Number(stats["Second Half Score"]),
          overtime_score: Number(stats["Overtime score"]),
          final_score: Number(stats["Final Score"]),
          team_win: stats["Team Win"] === "1",
        });

        await Promise.all(
          team.roster.map(async (player) => {
            const qwe = roundTeam?.players.find(
              (p) => p.player_id === player.player_id,
            );

            const resPlayer = await upsertMatchTeamPlayer({
              match_team_id: resTeam.id,
              player_id_nullable: existingPlayerIds.includes(player.player_id)
                ? player.player_id
                : null,
              player_id_mandatory: player.player_id,
              nickname: player.nickname,
              game_skill_level: player.game_skill_level,
            });

            await upsertPlayerStatsNormalized({
              match_team_player_id: resPlayer.id,
              adr: qwe?.player_stats?.ADR ?? null,
              mvps: qwe?.player_stats?.MVPs ?? null,
              kills: qwe?.player_stats?.Kills ?? null,
              damage: qwe?.player_stats?.Damage ?? null,
              deaths: qwe?.player_stats?.Deaths ?? null,
              "1v1wins": qwe?.player_stats?.["1v1Wins"] ?? null,
              "1v2wins": qwe?.player_stats?.["1v2Wins"] ?? null,
              assists: qwe?.player_stats?.Assists ?? null,
              "1v1count": qwe?.player_stats?.["1v1Count"] ?? null,
              "1v2count": qwe?.player_stats?.["1v2Count"] ?? null,
              headshots: qwe?.player_stats?.Headshots ?? null,
              kd_ratio: qwe?.player_stats?.["K/D Ratio"] ?? null,
              kr_ratio: qwe?.player_stats?.["K/R Ratio"] ?? null,
              entry_wins: qwe?.player_stats?.["Entry Wins"] ?? null,
              entry_count: qwe?.player_stats?.["Entry Count"] ?? null,
              first_kills: qwe?.player_stats?.["First Kills"] ?? null,
              flash_count: qwe?.player_stats?.["Flash Count"] ?? null,
              headshots_percent: qwe?.player_stats?.["Headshots %"] ?? null,
              clutch_kills: qwe?.player_stats?.["Clutch Kills"] ?? null,
              double_kills: qwe?.player_stats?.["Double Kills"] ?? null,
              pistol_kills: qwe?.player_stats?.["Pistol Kills"] ?? null,
              quadro_kills: qwe?.player_stats?.["Quadro Kills"] ?? null,
              triple_kills: qwe?.player_stats?.["Triple Kills"] ?? null,
              utility_count: qwe?.player_stats?.["Utility Count"] ?? null,
              utility_damage: qwe?.player_stats?.["Utility Damage"] ?? null,
              enemies_flashed: qwe?.player_stats?.["Enemies Flashed"] ?? null,
              flash_successes: qwe?.player_stats?.["Flash Successes"] ?? null,
              utility_enemies: qwe?.player_stats?.["Utility Enemies"] ?? null,
              match_entry_rate: qwe?.player_stats?.["Match Entry Rate"] ?? null,
              utility_successes:
                qwe?.player_stats?.["Utility Successes"] ?? null,
              match_1v1_win_rate:
                qwe?.player_stats?.["Match 1v1 Win Rate"] ?? null,
              match_1v2_win_rate:
                qwe?.player_stats?.["Match 1v2 Win Rate"] ?? null,
              utility_usage_per_round:
                qwe?.player_stats?.["Utility Usage per Round"] ?? null,
              match_entry_success_rate:
                qwe?.player_stats?.["Match Entry Success Rate"] ?? null,
              flash_success_rate_per_match:
                qwe?.player_stats?.["Flash Success Rate per Match"] ?? null,
              flashes_per_round_in_a_match:
                qwe?.player_stats?.["Flashes per Round in a Match"] ?? null,
              utility_success_rate_per_match:
                qwe?.player_stats?.["Utility Success Rate per Match"] ?? null,
              utility_damage_per_round_in_a_match:
                qwe?.player_stats?.["Utility Damage per Round in a Match"] ??
                null,
              enemies_flashed_per_round_in_a_match:
                qwe?.player_stats?.["Enemies Flashed per Round in a Match"] ??
                null,
              utility_damage_success_rate_per_match:
                qwe?.player_stats?.["Utility Damage Success Rate per Match"] ??
                null,
              zeus_kills: qwe?.player_stats?.["Zeus Kills"] ?? null,
              knife_kills: qwe?.player_stats?.["Knife Kills"] ?? null,
              penta_kills: qwe?.player_stats?.["Penta Kills"] ?? null,
              sniper_kills: qwe?.player_stats?.["Sniper Kills"] ?? null,
              sniper_kill_rate_per_match:
                qwe?.player_stats?.["Sniper Kill Rate per Match"] ?? null,
              sniper_kill_rate_per_round:
                qwe?.player_stats?.["Sniper Kill Rate per Round"] ?? null,
            });
          }),
        );
      }
    }
  }

  return NextResponse.json({ message: "OK!" });
}
