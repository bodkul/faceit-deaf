export function formatMapPicks(
  data: { map_pick: string; count: number }[] = [],
) {
  return data.map(({ map_pick, count }) => ({
    map: map_pick
      .replace("de_", "")
      .replace(/^./, (char) => char.toUpperCase()),
    count,
  }));
}
