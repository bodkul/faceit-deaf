import { fromUnixTime } from "date-fns";
import { NextResponse } from "next/server";
import pMap from "p-map";

import faceitSdk from "@/lib/faceit/sdk";
import type { PlayerStatsData } from "@/lib/faceit/types";
import {
  getExistingPlayers,
  getMatchesCount,
  getMatchesIds,
  getPlayers,
  upsertMatch,
  upsertMatchTeam,
  upsertMatchTeamPlayer,
  upsertPlayers,
  upsertPlayerStatsNormalized,
} from "@/lib/supabase/mutations";

export async function GET() {
  console.log("🚀 Начало загрузки матчей для всех игроков");

  const players = await getPlayers();
  console.log(`📊 Получено игроков для обработки: ${players.length}`);

  for (const [playerIndex, player] of players.entries()) {
    console.log(
      `\n👤 [${playerIndex + 1}/${players.length}] Обработка игрока: ${player.nickname}`,
    );

    const matches = await faceitSdk.players.getCompletePlayerHistory(player.id);
    console.log(`  ✅ Получено матчей из Faceit API: ${matches.length}`);

    const existingMatchCount = await getMatchesCount(player.id);
    console.log(`  📝 Матчей уже в БД: ${existingMatchCount}`);

    console.log(
      `  🔍 Проверка существующих матчей в БД (${matches.length} матчей)...`,
    );
    const existingMatches = await getMatchesIds(
      matches.map((m) => m.match_id.replace(/^1-/, "")),
    );

    const newMatches = matches.filter(
      (m) =>
        !existingMatches.some((em) => em.id === m.match_id.replace(/^1-/, "")),
    );
    console.log(`  🆕 Новых матчей для обработки: ${newMatches.length}`);

    if (newMatches.length === 0) {
      console.log(`  ✅ Все матчи игрока ${player.nickname} уже в базе данных`);
      continue;
    }

    console.log(`  🔄 Начало обработки ${newMatches.length} новых матчей...`);

    for (const [index, { match_id, playing_players }] of newMatches.entries()) {
      console.log(
        `\n    🎮 [${index + 1}/${newMatches.length}] Обработка матча: ${match_id}`,
      );

      try {
        console.log(`      📥 Загрузка данных матча и статистики...`);
        const [existingPlayers, match, matchStats] = await Promise.all([
          getExistingPlayers(playing_players),
          faceitSdk.matches.getMatchDetails(match_id),
          faceitSdk.matches.getMatchStats(match_id),
        ]);
        console.log(`      ✅ Данные матча загружены успешно`);

        console.log(
          `      👥 Обновление информации об игроках (${existingPlayers.length} игроков)...`,
        );
        const existingPlayerIds = existingPlayers.map((p) => p.id);

        if (existingPlayerIds.length > 0) {
          const players =
            await faceitSdk.players.getPlayersDetails(existingPlayerIds);

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
          console.log(`      ✅ Обновлено ${players.length} игроков в БД`);
        }

        const round = matchStats.rounds[0];
        if (!round) {
          console.log(
            `      ⚠️  Нет данных раундов для матча ${match_id}, пропускаем`,
          );
          continue;
        }

        console.log(`      💾 Сохранение данных матча в БД...`);

        await upsertMatch({
          id: match_id.replace(/^1-/, ""),
          competition_id: match.competition_id,
          organizer_id: match.organizer_id,
          status: match.status,
          location_pick: match.voting.location?.pick[0],
          map_pick: match.voting.map?.pick[0],
          round_score: round.round_stats.Score.toString(),
          started_at: fromUnixTime(match.started_at).toISOString(),
          finished_at: fromUnixTime(match.finished_at).toISOString(),
        });
        console.log(`      ✅ Матч сохранен в БД`);

        console.log(`      🏆 Обработка команд и игроков (2 команды)...`);
        await pMap(
          [match.teams.faction1, match.teams.faction2],
          async (team, teamIndex) => {
            console.log(
              `        👥 Обработка команды ${teamIndex + 1}/2: ${team.name}`,
            );

            const roundTeam = round.teams.find(
              (rt) => rt.team_id === team.faction_id,
            );
            const stats = (roundTeam?.team_stats ?? {}) as Record<
              string,
              string
            >;

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

            if (!resTeam) {
              console.log(
                `        ❌ Не удалось сохранить команду ${team.name}`,
              );
              return;
            }

            console.log(
              `        📊 Обработка игроков команды (${team.roster.length} игроков)...`,
            );
            await pMap(
              team.roster,
              async (player) => {
                const playerStats = roundTeam?.players.find(
                  (p) => p.player_id === player.player_id,
                )?.player_stats as unknown as PlayerStatsData | null;

                const resPlayer = await upsertMatchTeamPlayer({
                  match_team_id: resTeam.id,
                  player_id_nullable: existingPlayerIds.includes(
                    player.player_id,
                  )
                    ? player.player_id
                    : null,
                  player_id_mandatory: player.player_id,
                  nickname: player.nickname,
                  game_skill_level: player.game_skill_level,
                  elo_before: existingPlayers.find(
                    (p) => p.id === player.player_id,
                  )?.faceit_elo,
                  elo_after:
                    existingPlayerIds.length > 0
                      ? existingPlayers.find((p) => p.id === player.player_id)
                          ?.faceit_elo
                      : undefined,
                });

                if (!resPlayer) {
                  console.log(
                    `          ❌ Не удалось сохранить игрока ${player.nickname}`,
                  );
                  return;
                }

                await upsertPlayerStatsNormalized({
                  match_team_player_id: resPlayer.id,
                  adr: playerStats?.ADR,
                  mvps: playerStats?.MVPs,
                  kills: playerStats?.Kills,
                  damage: playerStats?.Damage,
                  deaths: playerStats?.Deaths,
                  "1v1wins": playerStats?.["1v1Wins"],
                  "1v2wins": playerStats?.["1v2Wins"],
                  assists: playerStats?.Assists,
                  "1v1count": playerStats?.["1v1Count"],
                  "1v2count": playerStats?.["1v2Count"],
                  headshots: playerStats?.Headshots,
                  kd_ratio: playerStats?.["K/D Ratio"],
                  kr_ratio: playerStats?.["K/R Ratio"],
                  entry_wins: playerStats?.["Entry Wins"],
                  entry_count: playerStats?.["Entry Count"],
                  first_kills: playerStats?.["First Kills"],
                  flash_count: playerStats?.["Flash Count"],
                  headshots_percent: playerStats?.["Headshots %"],
                  clutch_kills: playerStats?.["Clutch Kills"],
                  double_kills: playerStats?.["Double Kills"],
                  pistol_kills: playerStats?.["Pistol Kills"],
                  quadro_kills: playerStats?.["Quadro Kills"],
                  triple_kills: playerStats?.["Triple Kills"],
                  utility_count: playerStats?.["Utility Count"],
                  utility_damage: playerStats?.["Utility Damage"],
                  enemies_flashed: playerStats?.["Enemies Flashed"],
                  flash_successes: playerStats?.["Flash Successes"],
                  utility_enemies: playerStats?.["Utility Enemies"],
                  match_entry_rate: playerStats?.["Match Entry Rate"],
                  utility_successes: playerStats?.["Utility Successes"],
                  match_1v1_win_rate: playerStats?.["Match 1v1 Win Rate"],
                  match_1v2_win_rate: playerStats?.["Match 1v2 Win Rate"],
                  utility_usage_per_round:
                    playerStats?.["Utility Usage per Round"],
                  match_entry_success_rate:
                    playerStats?.["Match Entry Success Rate"],
                  flash_success_rate_per_match:
                    playerStats?.["Flash Success Rate per Match"],
                  flashes_per_round_in_a_match:
                    playerStats?.["Flashes per Round in a Match"],
                  utility_success_rate_per_match:
                    playerStats?.["Utility Success Rate per Match"],
                  utility_damage_per_round_in_a_match:
                    playerStats?.["Utility Damage per Round in a Match"],
                  enemies_flashed_per_round_in_a_match:
                    playerStats?.["Enemies Flashed per Round in a Match"],
                  utility_damage_success_rate_per_match:
                    playerStats?.["Utility Damage Success Rate per Match"],
                  zeus_kills: playerStats?.["Zeus Kills"],
                  knife_kills: playerStats?.["Knife Kills"],
                  penta_kills: playerStats?.["Penta Kills"],
                  sniper_kills: playerStats?.["Sniper Kills"],
                  sniper_kill_rate_per_match:
                    playerStats?.["Sniper Kill Rate per Match"],
                  sniper_kill_rate_per_round:
                    playerStats?.["Sniper Kill Rate per Round"],
                });
              },
              { concurrency: 5 },
            );
            console.log(`        ✅ Команда ${team.name} обработана успешно`);
          },
          { concurrency: 2 },
        );

        console.log(`      🎉 Матч ${match_id} обработан успешно`);
      } catch (error) {
        console.error(
          `      ❌ Ошибка при обработке матча ${match_id}:`,
          error,
        );
        continue;
      }
    }

    console.log(
      `  ✅ Игрок ${player.nickname} обработан полностью (${newMatches.length} матчей)`,
    );
  }

  console.log("\n🎉 Загрузка матчей завершена успешно!");
  return NextResponse.json({ message: "OK!" });
}
