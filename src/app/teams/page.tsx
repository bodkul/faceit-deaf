"use client";

import { IconUsers } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { useTeams } from "@/hooks/useTeams";
import { getCountryFlagUrl } from "@/lib/country";

function TeamCard({
  team,
}: {
  team: {
    id: string;
    name: string;
    avatar: string | null;
    country: string | null;
  };
}) {
  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
            {team.avatar ? (
              <Image
                src={team.avatar}
                alt={team.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center font-bold text-muted-foreground text-xl">
                {team.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex flex-1 items-center gap-2">
            {team.country && (
              <Image
                src={getCountryFlagUrl(team.country, 20)}
                alt={team.country}
                width={20}
                height={13}
                className="shrink-0"
              />
            )}
            <span className="font-semibold">{team.name}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function TeamsPage() {
  const { data: teams, isLoading } = useTeams();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teams</CardTitle>
        <CardDescription>
          Deaf CS2 teams participating in events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : !teams?.length ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconUsers />
              </EmptyMedia>
              <EmptyTitle>No teams yet</EmptyTitle>
              <EmptyDescription>
                Teams will appear here once they are added.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
