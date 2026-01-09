import { fromUnixTime, subHours } from "date-fns";
import { now } from "lodash-es";
import { NextResponse } from "next/server";
import pMap from "p-map";

import { fetchMatch, fetchMatchStats, fetchPlayers } from "@/lib/faceit/api";
import {
  getExistingPlayers,
  supabaseClient,
  updateMatch,
  upsertMatchTeam,
  upsertMatchTeamPlayer,
  upsertPlayerStatsNormalized,
  upsertPlayers,
} from "@/lib/supabase";

export async function GET() {
  const { data } = await supabaseClient
    .from("matches")
    .select("id, match_teams(match_team_players(player_id_mandatory))")
    .neq("status", "FINISHED")
    .lt("started_at", subHours(now(), 1).toISOString());

  const matches = data ?? [];

  for (const [index, row] of Array.from(matches.entries())) {
    console.log(`Processing match ${index + 1}/${matches.length}: ${row.id}`);

    const start = performance.now();

    const [existingPlayers, match, matchStats] = await Promise.all([
      getExistingPlayers(
        row.match_teams.flatMap((team) =>
          team.match_team_players.map((player) => player.player_id_mandatory),
        ),
      ),
      fetchMatch(`1-${row.id}`),
      fetchMatchStats(`1-${row.id}`),
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

    console.log(`Fetched match and stats: ${row.id}.`);

    await updateMatch(row.id, {
      status: match.status,
      location_pick: match.voting.location?.pick[0],
      map_pick: match.voting.map?.pick[0],
      round_score: round.round_stats.Score,
      started_at: fromUnixTime(match.started_at).toISOString(),
      finished_at: fromUnixTime(match.finished_at).toISOString(),
    });

    await pMap(
      [match.teams.faction1, match.teams.faction2],
      async (team) => {
        const roundTeam = round.teams.find(
          (rt) => rt.team_id === team.faction_id,
        );
        const stats = (roundTeam?.team_stats ?? {}) as Record<string, string>;

        const resTeam = await upsertMatchTeam({
          match_id: row.id,
          team_id: team.faction_id,
          name: team.name,
          avatar: team.avatar,
          first_half_score: Number(stats["First Half Score"]),
          second_half_score: Number(stats["Second Half Score"]),
          overtime_score: Number(stats["Overtime score"]),
          final_score: Number(stats["Final Score"]),
          team_win: stats["Team Win"] === "1",
        });

        if (!resTeam) return;

        await pMap(
          team.roster,
          async (player) => {
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
              elo_before: existingPlayers.find((p) => p.id === player.player_id)
                ?.faceit_elo,
              elo_after: players.find((p) => p.player_id === player.player_id)
                ?.games.cs2.faceit_elo,
            });

            if (!resPlayer) return;

            await upsertPlayerStatsNormalized({
              match_team_player_id: resPlayer.id,
              adr: qwe?.player_stats?.ADR,
              mvps: qwe?.player_stats?.MVPs,
              kills: qwe?.player_stats?.Kills,
              damage: qwe?.player_stats?.Damage,
              deaths: qwe?.player_stats?.Deaths,
              "1v1wins": qwe?.player_stats?.["1v1Wins"],
              "1v2wins": qwe?.player_stats?.["1v2Wins"],
              assists: qwe?.player_stats?.Assists,
              "1v1count": qwe?.player_stats?.["1v1Count"],
              "1v2count": qwe?.player_stats?.["1v2Count"],
              headshots: qwe?.player_stats?.Headshots,
              kd_ratio: qwe?.player_stats?.["K/D Ratio"],
              kr_ratio: qwe?.player_stats?.["K/R Ratio"],
              entry_wins: qwe?.player_stats?.["Entry Wins"],
              entry_count: qwe?.player_stats?.["Entry Count"],
              first_kills: qwe?.player_stats?.["First Kills"],
              flash_count: qwe?.player_stats?.["Flash Count"],
              headshots_percent: qwe?.player_stats?.["Headshots %"],
              clutch_kills: qwe?.player_stats?.["Clutch Kills"],
              double_kills: qwe?.player_stats?.["Double Kills"],
              pistol_kills: qwe?.player_stats?.["Pistol Kills"],
              quadro_kills: qwe?.player_stats?.["Quadro Kills"],
              triple_kills: qwe?.player_stats?.["Triple Kills"],
              utility_count: qwe?.player_stats?.["Utility Count"],
              utility_damage: qwe?.player_stats?.["Utility Damage"],
              enemies_flashed: qwe?.player_stats?.["Enemies Flashed"],
              flash_successes: qwe?.player_stats?.["Flash Successes"],
              utility_enemies: qwe?.player_stats?.["Utility Enemies"],
              match_entry_rate: qwe?.player_stats?.["Match Entry Rate"],
              utility_successes: qwe?.player_stats?.["Utility Successes"],
              match_1v1_win_rate: qwe?.player_stats?.["Match 1v1 Win Rate"],
              match_1v2_win_rate: qwe?.player_stats?.["Match 1v2 Win Rate"],
              utility_usage_per_round:
                qwe?.player_stats?.["Utility Usage per Round"],
              match_entry_success_rate:
                qwe?.player_stats?.["Match Entry Success Rate"],
              flash_success_rate_per_match:
                qwe?.player_stats?.["Flash Success Rate per Match"],
              flashes_per_round_in_a_match:
                qwe?.player_stats?.["Flashes per Round in a Match"],
              utility_success_rate_per_match:
                qwe?.player_stats?.["Utility Success Rate per Match"],
              utility_damage_per_round_in_a_match:
                qwe?.player_stats?.["Utility Damage per Round in a Match"],
              enemies_flashed_per_round_in_a_match:
                qwe?.player_stats?.["Enemies Flashed per Round in a Match"],
              utility_damage_success_rate_per_match:
                qwe?.player_stats?.["Utility Damage Success Rate per Match"],
              zeus_kills: qwe?.player_stats?.["Zeus Kills"],
              knife_kills: qwe?.player_stats?.["Knife Kills"],
              penta_kills: qwe?.player_stats?.["Penta Kills"],
              sniper_kills: qwe?.player_stats?.["Sniper Kills"],
              sniper_kill_rate_per_match:
                qwe?.player_stats?.["Sniper Kill Rate per Match"],
              sniper_kill_rate_per_round:
                qwe?.player_stats?.["Sniper Kill Rate per Round"],
            });
          },
          { concurrency: 5 },
        );
      },
      { concurrency: 2 },
    );

    await supabaseClient.channel(`match:${row.id}`).httpSend("*", {});

    const end = performance.now();

    console.log(`Query executed in ${(end - start).toFixed(0)} ms`);
  }

  return NextResponse.json({ message: "OK!" });
}
