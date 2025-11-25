import { range } from "lodash";

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export function renderLoadingRows(count: number, offset: number) {
  return range(count).map((index) => (
    <TableRow key={index}>
      <TableCell>{offset + index + 1}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-2.5 w-3.75 rounded-xs" />
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
