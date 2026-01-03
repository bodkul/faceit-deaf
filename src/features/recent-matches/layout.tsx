import { MatchHistoryTableHead } from "@/app/player/[username]/_components/MatchHistoryTableHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHeader } from "@/components/ui/table";

export function RecentMatchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Matches</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex rounded-md border">
          <Table>
            <TableHeader>
              <MatchHistoryTableHead />
            </TableHeader>
            <TableBody>{children}</TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
