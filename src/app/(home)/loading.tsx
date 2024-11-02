import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export default function Loading() {
  return Array.from({ length: 20 }).map((_, index) => (
    <TableRow key={index} className="h-[49px]">
      <TableCell>
        <Skeleton className="h-4 w-4" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-8 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-6 w-6 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
      </TableCell>
    </TableRow>
  ));
}
