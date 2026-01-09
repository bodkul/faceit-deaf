import ky from "ky";
import last from "lodash-es/last";
import pThrottle from "p-throttle";
import * as z from "zod";

import { COMPETITION_ID } from "@/lib/faceit";

const throttle = pThrottle({ limit: 5, interval: 1000 });

const faceitClient = ky.create({
  prefixUrl: "https://www.faceit.com/api",
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

const FaceitCs2TimeStatSchema = z.object({
  matchId: z.string(),
  competitionId: z.string(),
  date: z.number(),
  elo: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined)),
  elo_delta: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined)),
});

type FaceitCs2TimeStat = z.infer<typeof FaceitCs2TimeStatSchema>;

const FaceitCs2TimeStatArraySchema = z.array(FaceitCs2TimeStatSchema);

export const fetchFaceitCs2TimeStats = async (
  playerId: string,
  to?: number,
): Promise<FaceitCs2TimeStat[]> => {
  const searchParams = new URLSearchParams({
    game_mode: "5v5",
    size: "100",
  });

  if (to) searchParams.append("to", to.toString());

  const data = await faceitClient(
    `stats/v1/stats/time/users/${playerId}/games/cs2`,
    { searchParams },
  ).json();

  return FaceitCs2TimeStatArraySchema.parse(data);
};

export const fetchFaceitCs2TimeStatsWithLogging = async (playerId: string) => {
  let to: number | undefined;
  let requestCount = 0;
  const timeStats: FaceitCs2TimeStat[] = [];

  console.log(`    🔄 Загрузка временных статистик для игрока: ${playerId}`);

  while (true) {
    requestCount++;

    console.log(`      📥 Запрос ${requestCount + 1}`);

    const items = await fetchFaceitCs2TimeStats(playerId, to);

    timeStats.push(...items);

    console.log(
      `      ✅ Получено ${items.length} временных статистик (всего: ${timeStats.length})`,
    );

    if (items.length !== 100) {
      console.log(`      🏁 Достигнут конец временных статистик`);
      break;
    }

    to = last(items)?.date;
  }

  const filteredTimeStats = timeStats.filter(
    (m) => m.competitionId === COMPETITION_ID,
  );

  console.log(
    `    🔍 Отфильтровано по competitionId=${COMPETITION_ID} (всего: ${filteredTimeStats.length})`,
  );

  return {
    count: filteredTimeStats.length,
    data: filteredTimeStats,
  };
};
