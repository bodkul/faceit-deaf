import { format, formatDistanceStrict } from "date-fns";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MatchType } from "@/types/match";

import { getCountryCode, getFlagUrl } from "./country";

export function MatchHeader({ match }: { match: MatchType }) {
  return (
    <Card>
      {match.map_pick && (
        <Image
          src={`/img/maps/${match.map_pick.slice(3).toLowerCase()}.webp`}
          alt="Map"
          className="w-[1212px] h-[120px] rounded-t-xl object-cover"
          width={1212}
          height={120}
        />
      )}

      <div className="flex justify-between p-6">
        <div className="w-1/3 flex items-center justify-center space-x-5 overflow-hidden">
          <Avatar className="size-16">
            <AvatarImage
              src={match.teams[0].avatar ?? undefined}
              alt="First team's avatar"
            />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start overflow-hidden">
            <span className="w-full overflow-hidden text-ellipsis font-bold text-3xl">
              {match.teams[0].name}
            </span>
            <span
              className={cn("font-bold text-3xl", {
                "text-green-500": match.teams[0].team_win === true,
                "text-red-500": match.teams[0].team_win === false,
              })}
            >
              {match.teams[0].final_score}
            </span>
          </div>
        </div>
        <div className="w-1/3 flex flex-col items-center text-center justify-center space-y-4">
          <span className="text-2xl">
            {format(match.started_at!, "HH:mm dd/hh/yyyy")}
          </span>
          {match.location_pick && (
            <div className="flex space-x-2 items-center rounded-4 overflow-hidden">
              <Image
                src={getFlagUrl(getCountryCode(match.location_pick), "sm")}
                alt="Server location country"
                className="rounded"
                width={60}
                height={30}
              />
              <span>{match.location_pick}</span>
            </div>
          )}
          <span className="text-xl">
            {match.finished_at && match.started_at
              ? formatDistanceStrict(match.finished_at, match.started_at)
              : null}
          </span>
        </div>
        <div className="w-1/3 flex items-center justify-center space-x-5 overflow-hidden">
          <div className="flex flex-col items-end overflow-hidden">
            <span className="w-full overflow-hidden text-ellipsis font-bold text-3xl">
              {match.teams[1].name}
            </span>
            <span
              className={cn("font-bold text-3xl", {
                "text-green-500": match.teams[1].team_win === true,
                "text-red-500": match.teams[1].team_win === false,
              })}
            >
              {match.teams[1].final_score}
            </span>
          </div>
          <Avatar className="size-16">
            <AvatarImage
              src={match.teams[1].avatar ?? undefined}
              alt="Second team's avatar"
            />
            <AvatarFallback></AvatarFallback>
          </Avatar>
        </div>
      </div>
    </Card>
  );
}
