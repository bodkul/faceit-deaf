import { TableHead, TableRow } from "@/components/ui/table";

export function MatchHistoryTableHead() {
  return (
    <TableRow>
      <TableHead className="w-1/9 text-center">Date</TableHead>
      <TableHead className="w-1/9 text-center">Result</TableHead>
      <TableHead className="w-1/9 text-center">Score</TableHead>
      <TableHead className="w-1/9 text-center">K - D</TableHead>
      <TableHead className="w-1/9 text-center">K/D</TableHead>
      <TableHead className="w-1/9 text-center">ADR</TableHead>
      <TableHead className="w-1/9 text-center">HS%</TableHead>
      <TableHead className="w-1/9 text-center">Map</TableHead>
      <TableHead className="w-1/9 text-center">Elo +/-</TableHead>
    </TableRow>
  );
}
