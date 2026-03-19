import { IconBrandTwitch } from "@tabler/icons-react";

export function TwitchPlayer({ login }: { login: string }) {
  const domain =
    process.env.NODE_ENV === "development" ? "localhost" : "csdeaf.pro";

  return (
    <div className="overflow-hidden rounded-2xl border border-[#9146ff]/20 bg-neutral-950">
      <div className="flex items-center gap-2 border-[#9146ff]/10 border-b px-4 py-2.5">
        <IconBrandTwitch size={14} className="text-[#9146ff]" />
        <span className="font-medium text-sm text-white">{login}</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 font-mono text-red-400 text-xs">
          <span className="size-1.5 animate-pulse rounded-full bg-red-400" />
          LIVE
        </span>
      </div>
      <div className="aspect-video w-full">
        <iframe
          src={`https://player.twitch.tv/?channel=${login}&parent=${domain}&autoplay=true&muted=true`}
          height="100%"
          width="100%"
          allowFullScreen
          title={`${login} live stream`}
          className="block"
        />
      </div>
    </div>
  );
}
