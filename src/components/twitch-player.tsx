import { IconBrandTwitch } from "@tabler/icons-react";

// Twitch only renders the embed on domains listed as `parent`.
const EMBED_PARENTS = ["csdeaf.pro", "www.csdeaf.pro", "localhost"];

export function TwitchPlayer({ login }: { login: string }) {
  const params = new URLSearchParams({
    channel: login,
    autoplay: "true",
    muted: "true",
  });
  for (const parent of EMBED_PARENTS) params.append("parent", parent);

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
          src={`https://player.twitch.tv/?${params}`}
          height="100%"
          width="100%"
          allowFullScreen
          title={`${login} live stream`}
          className="block"
          // The Twitch player needs scripts and its own origin to run.
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
}
