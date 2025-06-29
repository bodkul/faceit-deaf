import { fromUnixTime } from "date-fns";
import { NextResponse } from "next/server";

import {
  fetchFullPlayerHistory,
  fetchMatch,
  fetchMatchStats,
  fetchPlayers,
  getAllHubMembers,
} from "@/lib/faceit/api";
import {
  getExistingPlayers,
  upsertMatch,
  upsertMatchTeam,
  upsertMatchTeamPlayer,
  upsertPlayers,
  upsertPlayerStatsNormalized,
} from "@/lib/supabase/mutations";

const HUB_ID = "c28b4096-66a9-48bb-92e6-ef2808a49c1a";

const BLACKLISTED_USER_IDS = new Set<string>([
  "c303c67d-ff05-4453-b8f6-48f80f4e2063", // ESDUA
  "7d5ca3d8-61da-4b9a-a43f-ad9ab03db2f8", // savko666
  "10b4d90e-8d10-4f78-a48a-64d8ea65439e", // Ya1m
  "c9c3191f-d303-4179-999d-37d4cebf7615", // -Xod_boX-
  "0697ca64-02e0-4bcb-a01b-a1816a71ef5c", // b1w111
]);

const PLAYER_IDS: string[] = [
  "5c8311e5-d56c-47b7-b417-8f32964c06bb", // ta1fu
  "21597e63-a6d7-465d-bc18-f318bf304502", // Vtrez_VR666
  "24aed265-95b7-4cb3-a930-b1ae7a1f57ac", // slnko17 ????????
  "ab762a80-af5d-4195-8ee7-6b394884696b", // ROOFWORKX
  "85e7729b-068b-4f22-9dd2-a595d89381c9", // Cosmjny7
  "dd766455-ce13-40a0-aef7-d968b01469ab", // B1w10
  "ef4cf5f2-0382-434a-9e12-6ec87635af07", // 70_tim_07
];

export async function GET() {
  const players = await fetchPlayers(PLAYER_IDS);

  // const members = await getAllHubMembers(HUB_ID);
  // const filteredMembers = members.filter(
  //   (member) => !BLACKLISTED_USER_IDS.has(member.user_id),
  // );
  // const filteredMemberIds = filteredMembers.map((member) => member.user_id);

  // const existingPlayers = await getExistingPlayers(filteredMemberIds);
  // const existingPlayerIds = new Set(existingPlayers.map((player) => player.id));

  // const newPlayers = filteredMembers.filter(
  //   (member) => !existingPlayerIds.has(member.user_id),
  // );
  // const newPlayerIds = newPlayers.flatMap((player) => player.user_id);

  // const players = await fetchPlayers(newPlayerIds);

  players.sort((a, b) => b.games.cs2.faceit_elo - a.games.cs2.faceit_elo);

  // return NextResponse.json({
  //   count: players.length,
  //   data: players.flatMap((player) => ({
  //     id: player.player_id,
  //     nickname: player.nickname,
  //     skill_level: player.games.cs2.skill_level,
  //     faceit_elo: player.games.cs2.faceit_elo,
  //   })),
  // });

  await upsertPlayers(
    players.map((player) => ({
      id: player.player_id,
      avatar: player.avatar,
      nickname: player.nickname,
      skill_level: player.games.cs2.skill_level,
      faceit_elo: player.games.cs2.faceit_elo,
      steam_id_64: player.steam_id_64,
    })),
  );

  console.log(`Added ${players.length} players.`);

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
