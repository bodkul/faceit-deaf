import { fromUnixTime } from "date-fns";
import { NextResponse } from "next/server";
import pMap from "p-map";

import {
  fetchFullPlayerHistory,
  fetchMatch,
  fetchMatchStats,
  fetchPlayers,
} from "@/lib/faceit/api";
import {
  getExistingPlayers,
  getMatchesCount,
  getMatchesIds,
  getPlayers,
  upsertMatch,
  upsertMatchTeam,
  upsertMatchTeamPlayer,
  upsertPlayerStatsNormalized,
  upsertPlayers,
} from "@/lib/supabase";

export async function GET() {
  console.log("🚀 Начало загрузки матчей для всех игроков");

  const players = await getPlayers();
  console.log(`📊 Получено игроков для обработки: ${players.length}`);

  for (const [playerIndex, player] of players.entries()) {
    console.log(
      `\n👤 [${playerIndex + 1}/${players.length}] Обработка игрока: ${player.nickname}`,
    );

    const matches = await fetchFullPlayerHistory(player.id);
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
          fetchMatch(match_id),
          fetchMatchStats(match_id),
        ]);
        console.log(`      ✅ Данные матча загружены успешно`);

        console.log(
          `      👥 Обновление информации об игроках (${existingPlayers.length} игроков)...`,
        );
        const existingPlayerIds = existingPlayers.map((p) => p.id);

        if (existingPlayerIds.length > 0) {
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
          round_score: round.round_stats.Score,
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
                );

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
                  adr: playerStats?.player_stats?.ADR,
                  mvps: playerStats?.player_stats?.MVPs,
                  kills: playerStats?.player_stats?.Kills,
                  damage: playerStats?.player_stats?.Damage,
                  deaths: playerStats?.player_stats?.Deaths,
                  "1v1wins": playerStats?.player_stats?.["1v1Wins"],
                  "1v2wins": playerStats?.player_stats?.["1v2Wins"],
                  assists: playerStats?.player_stats?.Assists,
                  "1v1count": playerStats?.player_stats?.["1v1Count"],
                  "1v2count": playerStats?.player_stats?.["1v2Count"],
                  headshots: playerStats?.player_stats?.Headshots,
                  kd_ratio: playerStats?.player_stats?.["K/D Ratio"],
                  kr_ratio: playerStats?.player_stats?.["K/R Ratio"],
                  entry_wins: playerStats?.player_stats?.["Entry Wins"],
                  entry_count: playerStats?.player_stats?.["Entry Count"],
                  first_kills: playerStats?.player_stats?.["First Kills"],
                  flash_count: playerStats?.player_stats?.["Flash Count"],
                  headshots_percent: playerStats?.player_stats?.["Headshots %"],
                  clutch_kills: playerStats?.player_stats?.["Clutch Kills"],
                  double_kills: playerStats?.player_stats?.["Double Kills"],
                  pistol_kills: playerStats?.player_stats?.["Pistol Kills"],
                  quadro_kills: playerStats?.player_stats?.["Quadro Kills"],
                  triple_kills: playerStats?.player_stats?.["Triple Kills"],
                  utility_count: playerStats?.player_stats?.["Utility Count"],
                  utility_damage: playerStats?.player_stats?.["Utility Damage"],
                  enemies_flashed:
                    playerStats?.player_stats?.["Enemies Flashed"],
                  flash_successes:
                    playerStats?.player_stats?.["Flash Successes"],
                  utility_enemies:
                    playerStats?.player_stats?.["Utility Enemies"],
                  match_entry_rate:
                    playerStats?.player_stats?.["Match Entry Rate"],
                  utility_successes:
                    playerStats?.player_stats?.["Utility Successes"],
                  match_1v1_win_rate:
                    playerStats?.player_stats?.["Match 1v1 Win Rate"],
                  match_1v2_win_rate:
                    playerStats?.player_stats?.["Match 1v2 Win Rate"],
                  utility_usage_per_round:
                    playerStats?.player_stats?.["Utility Usage per Round"],
                  match_entry_success_rate:
                    playerStats?.player_stats?.["Match Entry Success Rate"],
                  flash_success_rate_per_match:
                    playerStats?.player_stats?.["Flash Success Rate per Match"],
                  flashes_per_round_in_a_match:
                    playerStats?.player_stats?.["Flashes per Round in a Match"],
                  utility_success_rate_per_match:
                    playerStats?.player_stats?.[
                      "Utility Success Rate per Match"
                    ],
                  utility_damage_per_round_in_a_match:
                    playerStats?.player_stats?.[
                      "Utility Damage per Round in a Match"
                    ],
                  enemies_flashed_per_round_in_a_match:
                    playerStats?.player_stats?.[
                      "Enemies Flashed per Round in a Match"
                    ],
                  utility_damage_success_rate_per_match:
                    playerStats?.player_stats?.[
                      "Utility Damage Success Rate per Match"
                    ],
                  zeus_kills: playerStats?.player_stats?.["Zeus Kills"],
                  knife_kills: playerStats?.player_stats?.["Knife Kills"],
                  penta_kills: playerStats?.player_stats?.["Penta Kills"],
                  sniper_kills: playerStats?.player_stats?.["Sniper Kills"],
                  sniper_kill_rate_per_match:
                    playerStats?.player_stats?.["Sniper Kill Rate per Match"],
                  sniper_kill_rate_per_round:
                    playerStats?.player_stats?.["Sniper Kill Rate per Round"],
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
      }
    }

    console.log(
      `  ✅ Игрок ${player.nickname} обработан полностью (${newMatches.length} матчей)`,
    );
  }

  console.log("\n🎉 Загрузка матчей завершена успешно!");
  return NextResponse.json({ message: "OK!" });
}
