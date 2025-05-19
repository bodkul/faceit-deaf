import { TableHead, TableRow } from "@/components/ui/table";

export function MatchHistoryTableHead() {
  return (
    <TableRow>
      <TableHead className="w-[20%]">Date</TableHead>
      <TableHead className="w-[16%]">Map</TableHead>
      <TableHead className="w-[16%]">Score</TableHead>
      <TableHead className="w-[16%]">K - D</TableHead>
      <TableHead className="w-[16%]">K/D</TableHead>
      <TableHead className="w-[16%]">Rating 2.0</TableHead>
    </TableRow>
  );
}
