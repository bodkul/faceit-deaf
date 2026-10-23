import { logger, task } from "@trigger.dev/sdk";
import { keyBy, mapAsync } from "es-toolkit";
import { HTTPError } from "ky";

import { getMatch, getMatchStats, getPlayers } from "@/lib/faceit/api";
import type { PlayerStats } from "@/lib/faceit/types";
import { getMatchId, unixToISO } from "@/lib/faceit/utils";
import { broadcast } from "@/lib/realtime/broadcast";
import { topics } from "@/lib/realtime/topics";
import {
  getExistingPlayers,
  upsertMatch,
  upsertMatchTeam,
  upsertMatchTeamPlayers,
  upsertPlayers,
} from "@/lib/supabase/mutations";
import type { TablesInsert } from "@/types/database";

const num = (val: unknown) => Number(val) || 0;

function mapPlayerStats(
  stats: PlayerStats | undefined,
): Partial<TablesInsert<"match_team_players">> {
  return {
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
    flash_success_rate_per_match: num(stats?.["Flash Success Rate per Match"]),
    flashes_per_round_in_a_match: num(stats?.["Flashes per Round in a Match"]),
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
    sniper_kill_rate_per_match: num(stats?.["Sniper Kill Rate per Match"]),
    sniper_kill_rate_per_round: num(stats?.["Sniper Kill Rate per Round"]),
  };
}

/**
 * A refreshed FACEIT ELO only reflects this match while the players haven't
 * played another one, so matches synced late (missed webhooks, backfills)
 * leave ELO alone.
 */
const ELO_FRESHNESS_SECONDS = 15 * 60;

/**
 * FACEIT occasionally never publishes stats for a finished match. Past this
 * age the match is closed from its result alone instead of retrying forever.
 */
const STATS_GIVE_UP_SECONDS = 24 * 60 * 60;

const secondsSince = (timestamp: number | undefined) =>
  timestamp ? Date.now() / 1000 - timestamp : 0;

/** Sync a finished match by its FACEIT id ("1-<uuid>"). */
export async function syncFinishedMatch(faceitMatchId: string) {
  const match = await getMatch(faceitMatchId);
  const matchId = getMatchId({ id: match.match_id });

  if (match.calculate_elo !== true) {
    return { message: "Ignored: not a valid match" };
  }

  if (match.status !== "FINISHED") {
    throw new Error(`Match ${matchId} is ${match.status}, not FINISHED yet`);
  }

  const teams = [match.teams.faction1, match.teams.faction2];
  const playerIds = teams.flatMap((team) =>
    (team.roster ?? []).map((p) => p.player_id as string),
  );
  const finishedAgo = secondsSince(match.finished_at);
  const trackElo = !!match.finished_at && finishedAgo < ELO_FRESHNESS_SECONDS;

  logger.info("Starting sync of finished match", {
    matchId,
    totalPlayers: playerIds.length,
    trackElo,
  });

  const [existingPlayers, matchStats] = await Promise.all([
    getExistingPlayers(playerIds),
    getMatchStats(faceitMatchId).catch((error) => {
      if (error instanceof HTTPError && error.response.status === 404) return;
      throw error;
    }),
  ]);

  const round = matchStats?.rounds?.[0];
  if (!round) {
    if (finishedAgo < STATS_GIVE_UP_SECONDS) {
      throw new Error(`Match ${matchId} has no round stats yet`);
    }
    logger.warn("No stats from FACEIT, closing match from its result", {
      matchId,
    });
  }

  const score = match.results?.score;
  const roundScore =
    (round?.round_stats?.Score as string | undefined) ??
    (score ? `${score.faction1} / ${score.faction2}` : undefined);

  logger.info("Fetched initial data", {
    matchId,
    existingPlayersCount: existingPlayers.length,
    roundScore,
  });

  // Refresh profiles of tracked players to capture their post-match ELO.
  const players = trackElo
    ? await getPlayers(existingPlayers.map((p) => p.id))
    : [];

  // Independent writes; team players below reference both.
  await Promise.all([
    players.length &&
      upsertPlayers(
        players.map((player) => ({
          id: player.player_id,
          avatar: player.avatar,
          nickname: player.nickname,
          faceit_elo: player.games.cs2.faceit_elo,
          skill_level: player.games.cs2.skill_level,
          steam_id_64: player.steam_id_64,
          cover_image: player.cover_image,
        })),
      ),
    upsertMatch({
      id: matchId,
      competition_id: match.competition_id,
      organizer_id: match.organizer_id,
      location_pick: match.voting?.location?.pick[0],
      map_pick: match.voting?.map?.pick[0],
      started_at: unixToISO(match.started_at),
      finished_at: unixToISO(match.finished_at),
      status: match.status,
      round_score: roundScore,
    }),
  ]);

  logger.info("Upserted players and match", {
    matchId,
    playersCount: players.length,
  });

  const existingPlayerById = keyBy(existingPlayers, (p) => p.id);
  const refreshedPlayerById = keyBy(players, (p) => p.player_id);

  await mapAsync(
    teams,
    async (team, index) => {
      const teamId = team.faction_id;
      const faction = index === 0 ? "faction1" : "faction2";
      const roundTeam = round?.teams?.find((rt) => rt.team_id === teamId);
      const teamStats = roundTeam?.team_stats ?? {};
      const statsByPlayerId = keyBy(roundTeam?.players ?? [], (p) =>
        String(p.player_id),
      );

      if (!roundTeam) {
        logger.warn("No round stats for team", { matchId, teamId });
      }

      const resTeam = await upsertMatchTeam({
        match_id: matchId,
        team_id: teamId,
        name: team.name ?? "",
        avatar: team.avatar ?? "",
        faction: index + 1,
        first_half_score: Number(teamStats["First Half Score"]),
        second_half_score: Number(teamStats["Second Half Score"]),
        overtime_score: Number(teamStats["Overtime score"]),
        final_score: roundTeam
          ? Number(teamStats["Final Score"])
          : score?.[faction],
        team_win: roundTeam
          ? teamStats["Team Win"] === "1"
          : match.results?.winner === faction,
      });

      await upsertMatchTeamPlayers(
        (team.roster ?? []).map((player) => {
          const id = player.player_id as string;
          return {
            match_team_id: resTeam.id,
            player_id_nullable: existingPlayerById[id] ? id : null,
            player_id_mandatory: id,
            nickname: player.nickname ?? "",
            game_skill_level: player.game_skill_level,
            // Left out entirely (not null) when stale, so the upsert keeps
            // the elo_before recorded when the match went READY.
            ...(trackElo && {
              elo_before: existingPlayerById[id]?.faceit_elo,
              elo_after: refreshedPlayerById[id]?.games.cs2.faceit_elo,
            }),
            ...mapPlayerStats(statsByPlayerId[id]?.player_stats),
          };
        }),
      );
    },
    { concurrency: 2 },
  );

  await broadcast([
    topics.match(matchId),
    topics.liveMatches,
    topics.players,
    ...playerIds.map(topics.player),
  ]);

  logger.info("Finished syncing match successfully", {
    matchId,
    totalPlayersProcessed: playerIds.length,
  });

  return { message: `Match ${matchId} synced successfully` };
}

/** Same key from the webhook and the cron, so a match is synced once. */
export function syncFinishedMatchOptions(faceitMatchId: string) {
  return {
    tags: [`match_${getMatchId({ id: faceitMatchId })}`],
    idempotencyKey: `sync-finished-match-${faceitMatchId}`,
    idempotencyKeyTTL: "10m",
  };
}

export const syncFinishedMatchTask = task({
  id: "sync-finished-match",
  maxDuration: 300,
  // The webhook sends the whole match payload; only the id is used.
  run: async (payload: { id: string }) => syncFinishedMatch(payload.id),
});
