import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";

export default function Loading() {
  return (
    <>
      <Card>
        <Skeleton className="w-[1212px] h-[120px] rounded-none rounded-t-xl" />

        <div className="flex justify-between p-6">
          <div className="w-1/3 flex items-center justify-center space-x-5 overflow-hidden">
            <Avatar className="size-16">
              <AvatarImage src={undefined} alt="First team's avatar" />
              <AvatarFallback></AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-start overflow-hidden">
              <span className="w-full overflow-hidden text-ellipsis font-bold text-3xl">
                <Skeleton className="h-8 w-52" />
              </span>

              <span className={cn("font-bold text-3xl")}>
                <Skeleton className="size-8" />
              </span>
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
            <div className="flex flex-col items-end overflow-hidden">
              <span className="w-full overflow-hidden text-ellipsis font-bold text-3xl">
                <Skeleton className="h-8 w-52" />
              </span>

              <span className={cn("font-bold text-3xl")}>
                <Skeleton className="size-8" />
              </span>
            </div>
            <Avatar className="size-16">
              <AvatarImage src={undefined} alt="Second team's avatar" />
              <AvatarFallback></AvatarFallback>
            </Avatar>
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
                    <TableHead className="w-[52.5%] flex items-center space-x-4">
                      <Avatar className="size-8">
                        <AvatarImage
                          src={undefined}
                          alt="First team's avatar"
                        />
                        <AvatarFallback></AvatarFallback>
                      </Avatar>

                      <Skeleton className="h-5 w-28" />
                    </TableHead>
                    <TableHead className="w-[10%]">K - D</TableHead>
                    <TableHead className="w-[7.5%]">+/-</TableHead>
                    <TableHead className="w-[10%]">ADR</TableHead>
                    <TableHead className="w-[10%]">KAST</TableHead>
                    <TableHead className="w-[10%]">Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }, (_, index) => (
                    <TableRow key={index}>
                      <TableCell className="w-[52.5%] space-x-6 flex items-center">
                        <Skeleton className="w-[22px] h-4 rounded-none" />
                        <Skeleton className="h-5 w-14" />
                      </TableCell>
                      <TableCell className="w-[10%]">
                        <Skeleton className="h-5 w-10" />
                      </TableCell>
                      <TableCell className={cn("w-[7.5%]")}>
                        <Skeleton className="h-5 w-6" />
                      </TableCell>
                      <TableCell className="w-[10%]">
                        <Skeleton className="h-5 w-8" />
                      </TableCell>
                      <TableCell className="w-[10%]">
                        <Skeleton className="h-5 w-8" />
                      </TableCell>
                      <TableCell className="w-[10%]">
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
