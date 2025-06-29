"use client";

import { useQuery } from "@supabase-cache-helpers/postgrest-swr";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";

export default function TeamsPage() {
  const router = useRouter();

  const { data: teams } = useQuery(
    supabase
      .from("teams")
      .select("id, name, avatar")
      .order("name", { ascending: true }),
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Teams</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Maps</TableHead>
                <TableHead>K-D Diff</TableHead>
                <TableHead>K/D</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams?.map((team) => (
                <TableRow
                  key={team.id}
                  className="h-[49px] cursor-pointer"
                  onClick={() => router.push(`/team/${team.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <Avatar className="size-8">
                        <AvatarImage
                          src={team.avatar!}
                          alt={`Avatar of ${team.name}`}
                        />
                        <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{team.name}</div>
                    </div>
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )) ??
                Array.from({ length: 10 }, (_, index) => (
                  <TableRow key={index} className="h-[49px]">
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
