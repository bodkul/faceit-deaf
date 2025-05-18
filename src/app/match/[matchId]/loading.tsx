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
      <Card>
        <Skeleton className="w-[1212px] h-[120px] rounded-none rounded-t-xl" />
        <div className="flex justify-between p-6">
          <div className="w-1/3 flex items-center justify-center space-x-5">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex flex-col items-start gap-y-2">
              <Skeleton className="h-8 w-52" />
              <Skeleton className="size-8" />
            </div>
          </div>
          <div className="w-1/3 flex flex-col items-center text-center justify-center space-y-4">
            <span className="text-2xl">
              <Skeleton className="h-8 w-52" />
            </span>
            <div className="flex space-x-2 items-center rounded-4 overflow-hidden">
              <Skeleton className="w-16 h-8 rounded" />
              <Skeleton className="h-6 w-18" />
            </div>
            <span className="text-xl">
              <Skeleton className="h-6 w-28" />
            </span>
          </div>
          <div className="w-1/3 flex items-center justify-center space-x-5 overflow-hidden">
            <div className="flex flex-col items-end gap-y-2">
              <Skeleton className="h-8 w-52" />
              <Skeleton className="size-8" />
            </div>
            <Skeleton className="size-16 rounded-full" />
          </div>
        </div>
      </Card>
      <div className="flex space-x-12">
        <div className="flex flex-col space-y-6 w-full">
          <h5 className="text-3xl font-bold">Stats</h5>
          {Array.from({ length: 2 }, (_, index) => (
            <Card key={index}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-5/10 flex items-center space-x-4">
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
                  {Array.from({ length: 5 }, (_, index) => (
                    <TableRow key={index}>
                      <TableCell className="space-x-4 flex items-center">
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
