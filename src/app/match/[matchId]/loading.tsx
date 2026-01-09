import { range } from "lodash-es";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Loading() {
  return (
    <>
      <Card className="gap-0 p-0">
        <Skeleton className="h-30 w-auto rounded-none rounded-t-xl" />
        <div className="flex justify-between p-6">
          <div className="flex w-1/3 items-center justify-center space-x-5">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex flex-col items-start gap-y-2">
              <Skeleton className="h-8 w-52" />
              <Skeleton className="size-8" />
            </div>
          </div>
          <div className="flex w-1/3 flex-col items-center justify-center space-y-4 text-center">
            <span className="text-2xl">
              <Skeleton className="h-8 w-52" />
            </span>
            <div className="flex items-center space-x-2 overflow-hidden rounded-4">
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-6 w-18" />
            </div>
            <span className="text-xl">
              <Skeleton className="h-6 w-28" />
            </span>
          </div>
          <div className="flex w-1/3 items-center justify-center space-x-5 overflow-hidden">
            <div className="flex flex-col items-end gap-y-2">
              <Skeleton className="h-8 w-52" />
              <Skeleton className="size-8" />
            </div>
            <Skeleton className="size-16 rounded-full" />
          </div>
        </div>
      </Card>
      <div className="flex space-x-12">
        <div className="flex w-full flex-col space-y-6">
          <h5 className="font-bold text-3xl">Stats</h5>
          {range(2).map((index) => (
            <Card className="gap-0 p-0" key={index}>
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
