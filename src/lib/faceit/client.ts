import { mapAsync } from "es-toolkit";
import { createFaceitSDK, type FaceitSDK, type HttpClient } from "faceit-sdk";
import ky from "ky";
import pThrottle from "p-throttle";

import type { Match, MatchStats, Player } from "./types";

/**
 * faceit-sdk types several fields loosely (`games: {}`, `voting: any`, stats
 * players without `player_stats`), and module augmentation can't narrow
 * existing properties. The methods we use are re-typed with ./types instead,
 * and batch variants are added next to them.
 */
type TypedFaceitSDK = Omit<FaceitSDK, "players" | "matches"> & {
  players: Omit<FaceitSDK["players"], "getPlayerDetails"> & {
    getPlayerDetails(playerId: string): Promise<Player>;
    getPlayersDetails(playerIds: string[]): Promise<Player[]>;
  };
  matches: {
    getMatchDetails(matchId: string): Promise<Match>;
    getMatchesDetails(matchIds: string[]): Promise<Match[]>;
    getMatchStats(matchId: string): Promise<MatchStats>;
  };
};

const BATCH_CONCURRENCY = 10;

const throttle = pThrottle({ limit: 10, interval: 1000 });

const http = ky.create({
  prefix: "https://open.faceit.com/data/v4",
  headers: {
    Authorization: `Bearer ${process.env.FACEIT_API_TOKEN}`,
  },
  hooks: {
    beforeRetry: [
      ({ request, error, retryCount }) => {
        console.warn(
          `Retrying request to ${request.url}. Attempt #${retryCount}. Error: ${error.message}`,
        );
      },
    ],
  },
  fetch: (...args) => throttle(() => fetch(...args))(),
});

/** Adapts the throttled ky instance to the transport faceit-sdk expects. */
const httpClient: HttpClient = {
  async get(url, config) {
    const response = await http.get(url.replace(/^\//, ""), {
      // `headers: undefined` would drop the Authorization header set above.
      headers: { ...config?.headers },
      searchParams: config?.params,
    });

    return {
      data: await response.json(),
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    };
  },
  async post(url, data, config) {
    const response = await http.post(url.replace(/^\//, ""), {
      // `headers: undefined` would drop the Authorization header set above.
      headers: { ...config?.headers },
      searchParams: config?.params,
      json: data,
    });

    return {
      data: await response.json(),
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    };
  },
};

const sdk = createFaceitSDK(httpClient) as unknown as TypedFaceitSDK;

// Modules are class instances, so the batch methods are assigned onto them
// (spreading would drop the prototype methods).
Object.assign(sdk.players, {
  getPlayersDetails: (playerIds: string[]) =>
    mapAsync(playerIds, (id) => sdk.players.getPlayerDetails(id), {
      concurrency: BATCH_CONCURRENCY,
    }),
});

Object.assign(sdk.matches, {
  getMatchesDetails: (matchIds: string[]) =>
    mapAsync(matchIds, (id) => sdk.matches.getMatchDetails(id), {
      concurrency: BATCH_CONCURRENCY,
    }),
});

export const faceit = sdk;
