import { range } from "lodash-es";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function AvatarSkeleton() {
  return <Skeleton className="size-16 rounded-full ring-2 ring-border" />;
}

export default function Loading() {
  return (
    <>
      <Card className="gap-0 overflow-hidden py-0">
        <Skeleton className="h-48 w-full rounded-none rounded-t-xl" />

        <CardContent className="flex justify-between p-6">
          <AvatarSkeleton />
          <AvatarSkeleton />
        </CardContent>
      </Card>
      <div className="flex space-x-12">
        <div className="flex w-full flex-col space-y-6">
          <h5 className="font-bold text-3xl">Match Statistics</h5>
          {range(2).map((index) => (
            <Card key={index} className="gap-0 p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="flex w-5/10 items-center space-x-4">
                      <Skeleton className="size-8 rounded-full" />
                      <Skeleton className="h-5 w-28" />
                    </TableHead>
                    <TableHead className="w-1/10">K - D</TableHead>
                    <TableHead className="w-1/10">+/-</TableHead>
                    <TableHead className="w-1/10">ADR</TableHead>
                    <TableHead className="w-1/10">KAST</TableHead>
                    <TableHead className="w-1/10">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {range(5).map((index) => (
                    <TableRow key={index}>
                      <TableCell className="flex items-center space-x-4">
                        <Skeleton className="size-8 rounded-full" />
                        <Skeleton className="h-5 w-14" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-10" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-6" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-8" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
