"use client";

import {
  IconCalendar,
  IconMapPin,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { format, getYear } from "date-fns";
import { enUS } from "date-fns/locale";
import { notFound } from "next/navigation";

import { Meta } from "@/app/events/_components/meta";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import useRealtimeChannel from "@/hooks/useRealtimeChannel";
import { getEventBySlug } from "@/lib/db/events";

export function EventCard({ slug }: { slug: string }) {
  const queryKey = ["event-card", slug];

  const {
    data: event,
    isPending,
    isSuccess,
  } = useQuery({
    queryKey,
    queryFn: () => getEventBySlug(slug),
  });

  useRealtimeChannel(queryKey);

  if (isSuccess && !event) notFound();

  if (isPending || !event) {
    return (
      <Card className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 p-2 backdrop-blur-sm">
        <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/4 blur-3xl" />

        <Item>
          <Skeleton className="size-17 rounded-md md:size-18" />
          <ItemContent></ItemContent>
        </Item>
      </Card>
    );
  }

  const yearFormat = (date: string) =>
    getYear(date) === getYear(new Date()) ? "d MMM" : "d MMM yyyy";

  const start = format(event.start_date, yearFormat(event.start_date), {
    locale: enUS,
  });
  const end = event.end_date
    ? format(event.end_date, yearFormat(event.end_date), {
        locale: enUS,
      })
    : null;

  return (
    <Card className="relative overflow-hidden border-neutral-800/50 bg-neutral-900/30 p-2 backdrop-blur-sm">
      <div className="absolute -top-20 -right-20 size-40 rounded-full bg-red-500/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 size-40 rounded-full bg-red-500/4 blur-3xl" />

      <Item>
        <ItemMedia>
          <Avatar className="size-17 rounded-md after:rounded-md md:size-18">
            <AvatarImage
              className="rounded-md"
              src={event.logo_url}
              alt={event.name}
            />
            <AvatarFallback className="rounded-md">
              <IconUser size={32} />
            </AvatarFallback>
          </Avatar>
        </ItemMedia>

        <ItemContent>
          <ItemTitle className="font-bold text-xl md:text-2xl">
            {event.name}
          </ItemTitle>
          <ItemDescription className="flex items-center gap-4 text-neutral-500">
            <Meta icon={IconCalendar}>{end ? `${start} — ${end}` : start}</Meta>
            <Meta icon={IconUsersGroup}>{event.teams.count} teams</Meta>
            <Meta icon={IconMapPin}>Online</Meta>
          </ItemDescription>
        </ItemContent>
      </Item>
    </Card>
  );
}
