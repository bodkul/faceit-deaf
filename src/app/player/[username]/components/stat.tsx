import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type StatProps = {
  name: string;
  value?: string | number;
  isLoading: boolean;
};

export default function Stat({ name, value, isLoading = false }: StatProps) {
  return (
    <Card>
      <CardHeader>{name}</CardHeader>
      <CardContent className="text-2xl font-bold">
        {isLoading ? <Skeleton className="h-8 w-16" /> : value}
      </CardContent>
    </Card>
  );
}
