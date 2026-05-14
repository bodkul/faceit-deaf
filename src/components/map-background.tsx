import Image from "next/image";

export function MapBackground({ map }: { map: string }) {
  return (
    <div className="absolute inset-0">
      <Image
        src={`/img/maps/${map}.webp`}
        alt={`Map ${map}`}
        fill
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-linear-to-b from-neutral-950/60 via-neutral-950/80 to-neutral-950" />
    </div>
  );
}
