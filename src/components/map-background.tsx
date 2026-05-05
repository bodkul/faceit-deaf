import Image from "next/image";

const BASE_PATH = "/img/maps";

export function getMapImage(mapName: string) {
  return `${BASE_PATH}/${mapName}.webp`;
}

export function MapBackground({ map }: { map: string }) {
  return (
    <div className="absolute inset-0">
      <Image
        src={getMapImage(map)}
        alt={`Map ${map}`}
        fill
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-linear-to-b from-neutral-950/60 via-neutral-950/80 to-neutral-950" />
    </div>
  );
}
