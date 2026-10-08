import { ensureTeamExists } from "@/features/teams/queries";

export default async function TeamLayout({
  children,
  params,
}: LayoutProps<"/teams/[name]">) {
  const { name } = await params;
  await ensureTeamExists(decodeURIComponent(name));

  return children;
}
