import { fromUnixTime } from "date-fns";
import { NextResponse } from "next/server";

import { fetchMatch, fetchMatchStats } from "@/lib/faceit/api";
import { supabase } from "@/lib/supabase";
import {
  getExistingPlayers,
  upsertMatch,
  upsertMatchTeam,
  upsertMatchTeamPlayer,
  upsertPlayerStatsNormalized,
} from "@/lib/supabase/mutations";

export async function GET() {
  const { data } = await supabase
    .from("matches")
    .select("id")
    .in("id", ["7407b42d-67dd-4ecf-a81b-80fd68589b68"]);

  const matchIds = data?.flatMap((match) => match.id) ?? [];

  for (const [index, matchId] of Array.from(matchIds.entries())) {
    console.log(`Processing match ${index + 1}/${matchIds.length}: ${matchId}`);

    const start = performance.now();

    const [match, matchStats] = await Promise.all([
      fetchMatch(`1-${matchId}`),
      fetchMatchStats(`1-${matchId}`),
    ]);

    const teams = [match.teams.faction1, match.teams.faction2];

    const playingPlayers = teams.flatMap((team) =>
      team.roster.map((player) => player.player_id),
    );
    const existingPlayers = await getExistingPlayers(playingPlayers);
    const existingPlayerIds = existingPlayers.map((player) => player.id);

    const round = matchStats.rounds[0];

    await upsertMatch({
      id: matchId,
      competition_id: match.competition_id,
      organizer_id: match.organizer_id,
      location_pick: match.voting.location?.pick[0],
      map_pick: match.voting.map?.pick[0],
      started_at: fromUnixTime(match.started_at).toISOString(),
      finished_at: fromUnixTime(match.finished_at).toISOString(),
      status: match.status.toUpperCase(),
      round_score: round.round_stats.Score,
    });

    for (const team of teams) {
      const roundTeam = round.teams.find(
        (rt) => rt.team_id === team.faction_id,
      );
      const stats = (roundTeam?.team_stats as Record<string, string>) ?? {};

      const resTeam = await upsertMatchTeam({
        match_id: matchId,
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
            utility_successes: qwe?.player_stats?.["Utility Successes"] ?? null,
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

    const end = performance.now();

    console.log(`Query executed in ${(end - start).toFixed(0)} ms`);
  }

  return NextResponse.json({ message: "OK!" });
}
