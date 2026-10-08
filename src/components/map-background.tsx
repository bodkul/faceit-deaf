import { cn } from "cn";
import Image from "next/image";

const KNOWN_MAPS = new Set([
  "de_ancient",
  "de_anubis",
  "de_cache",
  "de_dust2",
  "de_inferno",
  "de_mirage",
  "de_nuke",
  "de_overpass",
  "de_train",
  "de_vertigo",
]);

/** Decorative map screenshot behind a card; renders nothing for unknown maps. */
export function MapBackground({
  map,
  className,
}: {
  map: string | null | undefined;
  className?: string;
}) {
  if (!map || !KNOWN_MAPS.has(map)) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <Image
        src={`/img/maps/${map}.webp`}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className={cn("object-cover opacity-40", className)}
      />
      <div className="absolute inset-0 bg-linear-to-b from-card/40 via-card/85 to-card" />
    </div>
  );
}
