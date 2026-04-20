import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlayerCardLoading() {
  return (
    <Card>
      <CardHeader className="flex flex-col items-center space-y-2 text-center">
        <div className="relative w-fit">
          <Skeleton className="size-28 rounded-full" />
          <Skeleton className="absolute -right-1 -bottom-1 size-10 rounded-full" />
        </div>
        <CardTitle className="text-2xl">
          <Skeleton className="h-6 w-32 rounded" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4">
        <Separator />
        <div className="flex justify-center gap-4">
          {["faceit", "steam", "twitch"].map((key) => (
            <Skeleton key={`skeleton-${key}`} className="size-10 border" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
