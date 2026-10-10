import { IconBrandTwitch } from "@tabler/icons-react";

import { StatusPill } from "@/components/status-pill";

// Twitch only renders the embed on domains listed as `parent`.
const EMBED_PARENTS = [
  "csdeaf.vercel.app",
  "csdeaf.pro",
  "www.csdeaf.pro",
  "localhost",
];

export function TwitchPlayer({
  login,
  nickname,
}: {
  login: string;
  nickname: string;
}) {
  const params = new URLSearchParams({
    channel: login,
    autoplay: "true",
    muted: "true",
  });
  for (const parent of EMBED_PARENTS) params.append("parent", parent);

  return (
    <div className="overflow-hidden rounded-xl border border-[#9146ff]/25 bg-card">
      <div className="flex items-center gap-2 border-[#9146ff]/10 border-b px-4 py-2.5">
        <IconBrandTwitch size={16} className="shrink-0 text-[#b58cff]" />
        <span className="truncate font-medium text-foreground text-sm">
          {nickname}
        </span>
        <a
          href={`https://www.twitch.tv/${login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-muted-foreground text-xs transition-colors hover:text-[#b58cff]"
        >
          twitch.tv/{login}
        </a>
        <StatusPill tone="live" pulse className="ml-auto shrink-0">
          Live
        </StatusPill>
      </div>
      <div className="aspect-video w-full">
        <iframe
          src={`https://player.twitch.tv/?${params}`}
          height="100%"
          width="100%"
          allowFullScreen
          loading="lazy"
          title={`${nickname} live stream`}
          className="block"
          // The Twitch player needs scripts and its own origin to run; links
          // out to twitch.tv open as normal, unsandboxed tabs.
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
        />
      </div>
    </div>
  );
}
