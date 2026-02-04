import { clamp, divide } from "lodash-es";

export function calculateAverageStats({
  rounds,
  assists,
  deaths,
  adr,
  kpr,
}: {
  rounds: number;
  assists: number;
  deaths: number;
  adr: number;
  kpr: number;
}) {
  const dpr = divide(deaths, rounds);
  const apr = divide(assists, rounds);

  const kast = clamp(
    85.77576693024515 +
      kpr * 14.59741003 +
      apr * 39.57510705 -
      dpr * 46.21062528,
    0,
    100,
  );

  const impact = clamp(2.13 * kpr + 0.42 * apr - 0.41, 0, Infinity);

  const rating = clamp(
    0.0073 * kast +
      0.3591 * kpr -
      0.5329 * dpr +
      0.2372 * impact +
      0.0032 * adr +
      0.1587,
    0,
    Infinity,
  );

  return {
    kast,
    rating,
  };
}
