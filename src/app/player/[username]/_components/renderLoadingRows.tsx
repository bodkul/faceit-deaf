import { range } from "lodash-es";

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export default function renderLoadingRows(count: number) {
  return range(count).map((index) => (
    <TableRow key={index}>
      <TableCell>
        <Skeleton className="mx-auto h-5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="mx-auto h-5 w-12" />
      </TableCell>
      <TableCell>
        <Skeleton className="mx-auto h-5 w-10" />
      </TableCell>
      <TableCell>
        <Skeleton className="mx-auto h-5 w-12" />
      </TableCell>
      <TableCell>
        <Skeleton className="mx-auto h-5 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="mx-auto h-5 w-8" />
      </TableCell>
    </TableRow>
  ));
}
