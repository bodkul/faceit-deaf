import { useCallback, useEffect, useState } from "react";

import {
  fetchPlayerCS2Stats,
  type PlayerCS2Stats,
  type PlayerStats,
} from "@/lib/faceit/api";

const MAX_LIMIT = {
  MATCHES: 100,
};
const COMPETITION_ID = "f4148ddd-bce8-41b8-9131-ee83afcdd6dd";

interface Dto<Req, Res> {
  req: Req;
  res: Res;
}

interface ReqWithPagination {
  limit?: number;
  skip?: number;
}

type GetMatchesDto = Dto<
  ReqWithPagination & {
    playerId: string;
    to?: number;
  },
  PlayerCS2Stats
>;

async function getMatches(req: GetMatchesDto["req"]) {
  const offset = req.skip || 0;
  const params = new URLSearchParams({
    limit: req.limit?.toString() || MAX_LIMIT.MATCHES.toString(),
  });

  if (req.to === undefined) {
    params.append("offset", Math.min(offset, 200).toString());
  } else if (offset > 200) {
    params.append("to", req.to.toString());
  }

  const { items } = await fetchPlayerCS2Stats(req.playerId, params);

  return items.map((match) => match.stats);
}

export const calculateAverageStats = (matches: PlayerStats[]) => {
  const DMG_PER_KILL = 105;
  const TRADE_PERCENT = 0.2;

  const weight = matches.length;

  if (weight === 0)
    return {
      kills: 0,
      deaths: 0,
      kd: 0,
      dpr: 0,
      kpr: 0,
      avgk: 0,
      adr: 0,
      hs: 0,
      hsp: 0,
      apr: 0,
      kast: 0,
      impact: 0,
      rating: 0,
      weight,
    };

  const matchStats = matches.map((match) => {
    return {
      kills: +match["Kills"],
      deaths: +match["Deaths"],
      rounds: +match["Rounds"],
      kpr: +match["K/R Ratio"],
      adr: +match["ADR"] || +match["K/R Ratio"] * DMG_PER_KILL, // adr was added late june, so estimate it until it was added
      headshots: +match["Headshots"],
      assists: +match["Assists"],
    };
  });

  const kills = matchStats.reduce((prev, stat) => prev + stat.kills, 0);
  const deaths = matchStats.reduce((prev, stat) => prev + stat.deaths, 0);
  const kd = kills / deaths || 0;

  const dpr =
    matchStats.reduce((prev, stat) => prev + stat.deaths / stat.rounds, 0) /
    weight;
  const kpr = matchStats.reduce((prev, stat) => prev + stat.kpr, 0) / weight;
  const avgk = kills / weight;
  const adr = matchStats.reduce((prev, stat) => prev + stat.adr, 0) / weight;

  const hs = matchStats.reduce((prev, stat) => prev + stat.headshots, 0);
  const hsp = (hs / kills) * 100;
  const apr =
    matchStats.reduce((prev, stat) => prev + stat.assists / stat.rounds, 0) /
    weight;

  const kast =
    matchStats.reduce((prev, stat) => {
      const survived = stat.rounds - stat.deaths;
      const traded = TRADE_PERCENT * stat.rounds;
      const sum = (stat.kills + stat.assists + survived + traded) * 0.45;
      return prev + Math.min((sum / stat.rounds) * 100, 100);
    }, 0) / weight;

  const impact = Math.max(2.13 * kpr + 0.42 * apr - 0.41, 0);
  const rating = Math.max(
    0.0073 * kast +
      0.3591 * kpr +
      -0.5329 * dpr +
      0.2372 * impact +
      0.0032 * adr +
      0.1587,
    0,
  );

  return {
    kills,
    deaths,
    kd,
    dpr,
    kpr,
    avgk,
    adr,
    hs,
    hsp,
    apr,
    kast,
    impact,
    rating,
    weight,
  };
};

function useMatches(playerId?: string) {
  const [matches, setMatches] = useState<PlayerStats[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  const loadMatches = useCallback(async () => {
    if (!playerId) {
      setMatches([]);
      return;
    }

    let counter = 0;
    const loadedMatches: PlayerStats[] = [];

    do {
      const lastMatch = loadedMatches[loadedMatches.length - 1];

      const newMatches = await getMatches({
        playerId,
        skip: loadedMatches.length,
        to:
          loadedMatches.length > 200 && lastMatch
            ? lastMatch["Match Finished At"]
            : undefined,
      });

      loadedMatches.push(...newMatches);
      counter++;
    } while (counter * MAX_LIMIT.MATCHES === loadedMatches.length);

    setMatches(
      loadedMatches.filter(
        (match) => match["Competition Id"] === COMPETITION_ID,
      ),
    );

    setLoading(false);
  }, [playerId]);

  useEffect(() => {
    if (playerId) {
      loadMatches();
    }
  }, [playerId, loadMatches]);

  return {
    data: matches.map((match) => ({
      date: new Date(match["Created At"]),
      id: match["Match Id"],
      map: match["Map"],
      kills: +match["Kills"],
      deaths: +match["Deaths"],
      rating: calculateAverageStats([match]).rating,
      faceit: `https://www.faceit.com/en/cs2/room/${match["Match Id"]}`,
      result: +match["Result"],
      score: match.Score,
      headshot_precent: parseInt(match["Headshots %"]),
    })),
    isLoading,
    mutate: loadMatches,
  };
}

export default useMatches;
