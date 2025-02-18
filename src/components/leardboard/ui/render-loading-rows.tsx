import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export function renderLoadingRows(count: number, offset: number) {
  return Array.from({ length: count }).map((_, index) => (
    <TableRow key={index} className="h-[49px]">
      <TableCell>{offset + index + 1}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="size-6 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
    </TableRow>
  ));
}
