import { NextResponse } from "next/server";

import { fetchPlayers, getAllHubMembers } from "@/lib/faceit/api";
import { getExistingPlayers, upsertPlayers } from "@/lib/supabase/mutations";

const HUB_ID = "c28b4096-66a9-48bb-92e6-ef2808a49c1a";

const BLACKLISTED_USER_IDS = new Set<string>([
  "c303c67d-ff05-4453-b8f6-48f80f4e2063",
  "7d5ca3d8-61da-4b9a-a43f-ad9ab03db2f8", // savko666
  "10b4d90e-8d10-4f78-a48a-64d8ea65439e", // Ya1m
  "c9c3191f-d303-4179-999d-37d4cebf7615", // -Xod_boX-
  "0697ca64-02e0-4bcb-a01b-a1816a71ef5c", // b1w111
]);

export async function GET() {
  const members = await getAllHubMembers(HUB_ID);
  const filteredMembers = members.filter(
    (member) => !BLACKLISTED_USER_IDS.has(member.user_id),
  );
  const filteredMemberIds = filteredMembers.map((member) => member.user_id);

  const existingPlayers = await getExistingPlayers(filteredMemberIds);
  const existingPlayerIds = new Set(existingPlayers.map((player) => player.id));

  const newPlayers = filteredMembers.filter(
    (member) => !existingPlayerIds.has(member.user_id),
  );
  const newPlayerIds = newPlayers.flatMap((player) => player.user_id);

  const players = await fetchPlayers(newPlayerIds);

  players.sort((a, b) => b.games.cs2.faceit_elo - a.games.cs2.faceit_elo);

  return NextResponse.json({
    count: players.length,
    data: players.flatMap((player) => ({
      id: player.player_id,
      nickname: player.nickname,
      skill_level: player.games.cs2.skill_level,
      faceit_elo: player.games.cs2.faceit_elo,
    })),
  });

  await upsertPlayers(
    players.map((player) => ({
      id: player.player_id,
      avatar: player.avatar,
      nickname: player.nickname,
      skill_level: player.games.cs2.skill_level,
      faceit_elo: player.games.cs2.faceit_elo,
      steam_id_64: player.steam_id_64,
    })),
  );
}
