import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";
import { supabaseClient } from "@/lib/supabase";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

function getInitials(nickname: string) {
  return nickname
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

type StatsItem = {
  label: string;
  value: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername);

  const { data: player } = await supabaseClient
    .from("players")
    .select("id, nickname, skill_level, faceit_elo, avatar")
    .eq("nickname", username)
    .maybeSingle();

  if (!player) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0d12",
          color: "#f4f4f5",
          fontSize: 54,
          fontWeight: 700,
        }}
      >
        Player not found
      </div>,
      size,
    );
  }

  const [rankResult, matchesResult] = await Promise.all([
    supabaseClient
      .from("players")
      .select("id", { count: "exact", head: true })
      .gt("faceit_elo", player.faceit_elo),
    supabaseClient
      .from("player_matches")
      .select("win, kd_ratio")
      .eq("player_id", player.id),
  ]);

  const rank = (rankResult.count ?? 0) + 1;
  const matches = matchesResult.data ?? [];
  const validKd = matches
    .map((match) => match.kd_ratio)
    .filter((value): value is number => typeof value === "number");
  const wins = matches.filter((match) => match.win === true).length;
  const kdRatio = validKd.length
    ? (validKd.reduce((sum, value) => sum + value, 0) / validKd.length).toFixed(
        2,
      )
    : "0.00";
  const winRate = matches.length
    ? `${((wins / matches.length) * 100).toFixed(1)}%`
    : "0.0%";

  const stats: StatsItem[] = [
    { label: "ELO", value: formatNumber(player.faceit_elo) },
    { label: "Level", value: String(player.skill_level) },
    { label: "K/D", value: kdRatio },
    { label: "Winrate", value: winRate },
    { label: "Rank", value: `#${formatNumber(rank)}` },
  ];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at 20% 10%, #1d2330 0%, #0b0d12 45%, #05070a 100%)",
        color: "#f4f4f5",
        padding: "44px 52px",
        fontFamily:
          "ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: 42,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 999,
            overflow: "hidden",
            border: "4px solid rgba(255,255,255,0.16)",
            background: "rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {player.avatar ? (
            <img
              src={player.avatar}
              alt={player.nickname}
              width={220}
              height={220}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span
              style={{
                fontSize: 76,
                fontWeight: 700,
                color: "#d4d4d8",
              }}
            >
              {getInitials(player.nickname)}
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {player.nickname}
          </div>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            {stats.map((item) => (
              <div
                key={item.label}
                style={{
                  minWidth: 150,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.06)",
                  padding: "14px 18px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    color: "#a1a1aa",
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    marginTop: 6,
                    fontSize: 34,
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 34,
          right: 44,
          padding: "8px 14px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.18)",
          color: "#d4d4d8",
          background: "rgba(255,255,255,0.05)",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "0.02em",
          display: "flex",
        }}
      >
        {siteConfig.name}.pro
      </div>
    </div>,
    size,
  );
}
