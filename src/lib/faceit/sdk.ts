import type {
  HttpClient,
  PaginatedResponse,
  PaginationParams,
} from "faceit-sdk";
import { createFaceitSDK as baseCreateFaceitSDK } from "faceit-sdk";
import { uniqBy } from "lodash";
import pMap from "p-map";

import { httpClient } from "./httpClient";
import type { FaceitSDK, PlayerDetails, PlayerMatchDTO } from "./types";

export function createFaceitSDK(httpClient: HttpClient): FaceitSDK {
  const sdk = baseCreateFaceitSDK(httpClient);

  (sdk.players as FaceitSDK["players"]).getPlayersDetails = (
    playerIds: string[],
  ) =>
    pMap(
      playerIds,
      (id) => sdk.players.getPlayerDetails(id) as Promise<PlayerDetails>,
      { concurrency: 10 },
    );

  (sdk.players as FaceitSDK["players"]).getCompletePlayerHistory = async (
    playerId: string,
  ) => {
    const GAME = "cs2";
    const REGION = "EU";
    const allMatches: PlayerMatchDTO[] = [];
    let to = 0;

    while (true) {
      const pagination: PaginationParams = {
        limit: 100,
        offset: allMatches.length < 1000 ? allMatches.length : undefined,
        to: allMatches.length >= 1000 ? to : undefined,
      };

      const { items } = (await sdk.players.getPlayerMatches(
        playerId,
        GAME,
        pagination,
      )) as PaginatedResponse<PlayerMatchDTO>;
      allMatches.push(...items);

      if (items.length !== 100) break;
      to = items[items.length - 1].finished_at;
    }

    return uniqBy(allMatches, "match_id").filter((m) => m.region === REGION);
  };

  (sdk.matches as FaceitSDK["matches"]).getMatchesDetails = (
    matchIds: string[],
  ) =>
    pMap(matchIds, (id) => sdk.matches.getMatchDetails(id), {
      concurrency: 10,
    });

  return sdk as FaceitSDK;
}

export const faceitSdk = createFaceitSDK(httpClient);

export default faceitSdk;
