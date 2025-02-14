import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StatProps = {
  name: string;
  value?: string | number;
  isLoading: boolean;
  progressPercentage?: number;
};

export default function Stat({
  name,
  value,
  isLoading = false,
  progressPercentage,
}: StatProps) {
  return (
    <Card>
      <CardHeader>{name}</CardHeader>
      <CardContent className="text-2xl font-bold">
        {isLoading ? <Skeleton className="h-8 w-16" /> : value}
      </CardContent>
      {progressPercentage !== undefined && (
        <CardFooter>
          <Progress
            value={progressPercentage}
            className={cn({
              "*:bg-green-600": progressPercentage >= 68,
              "*:bg-yellow-600":
                progressPercentage >= 34 && progressPercentage <= 67,
              "*:bg-red-600": progressPercentage <= 33,
            })}
          />
        </CardFooter>
      )}
    </Card>
  );
}
