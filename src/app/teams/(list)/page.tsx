import { IconUsersGroup } from "@tabler/icons-react";
import type { Metadata } from "next";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
  PageHeaderTitle,
} from "@/components/layout/page-header";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { TeamCard } from "@/features/teams/components/team-card";
import { getTeams } from "@/features/teams/queries";
import { eventSources } from "@/lib/realtime/topics";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Teams",
  description:
    "Every team that has played a deaf CS2 event — records and rosters.",
};

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <div className="flex flex-col gap-6">
      <RealtimeRefresh sources={eventSources} />
      <PageHeader>
        <PageHeaderHeading>
          <PageHeaderTitle>Teams</PageHeaderTitle>
          <PageHeaderDescription>{metadata.description}</PageHeaderDescription>
        </PageHeaderHeading>
      </PageHeader>

      {teams.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.name} team={team} />
          ))}
        </div>
      ) : (
        <Empty className="rounded-xl border border-border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconUsersGroup />
            </EmptyMedia>
            <EmptyTitle>No teams yet</EmptyTitle>
            <EmptyDescription>
              Teams show up here once they play an event.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
