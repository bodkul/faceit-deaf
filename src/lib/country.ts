export const countryMap: Record<string, string> = {
  France: "FR",
  Sweden: "SE",
  Germany: "DE",
  UK: "UK",
  Netherlands: "NL",
  Kazakhstan: "KZ",
  Finland: "FI",
  Moscow: "RU",
};

export function getCountryCode(country: string) {
  return countryMap[country];
}

export function getFlagUrl(country: string, size: "sm" | "lg"): string {
  const sizeMap = {
    sm: { width: 110, height: 55 },
    lg: { width: 428, height: 212 },
  };

  return `https://distribution.faceit-cdn.net/images/flags/v1/${country.toLowerCase()}.jpg?width=${sizeMap[size].width}&height=${sizeMap[size].height}`;
}

export type FlagWidth = 20 | 40 | 80 | 160 | 320 | 640 | 1280 | 2560;

export function getCountryFlagUrl(
  countryCode: string,
  width: FlagWidth,
): string {
  return `https://flagcdn.com/w${width}/${countryCode.toLowerCase()}.png`;
}
