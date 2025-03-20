import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import renderLoadingRows from "./components/renderLoadingRows";

export default function Loading() {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Skeleton className="size-20 rounded-full" />
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-6 w-40" />
              <div className="flex space-x-1">
                <Skeleton className="size-6" />
                <Skeleton className="size-6" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>Elo</CardHeader>
              <CardContent className="text-2xl font-bold">
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>Rating 2.0</CardHeader>
              <CardContent className="text-2xl font-bold">
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>K/D</CardHeader>
              <CardContent className="text-2xl font-bold">
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>HS %</CardHeader>
              <CardContent className="text-2xl font-bold">
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Match Histories</CardTitle>
          <CardDescription>0 matches played</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[20%]">Date</TableHead>
                    <TableHead className="w-[16%]">Map</TableHead>
                    <TableHead className="w-[16%]">Score</TableHead>
                    <TableHead className="w-[16%]">K - D</TableHead>
                    <TableHead className="w-[16%]">K/D</TableHead>
                    <TableHead className="w-[16%]">Rating 2.0</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderLoadingRows(20)}</TableBody>
              </Table>
            </div>

            <Pagination>
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page 1 of 1
                </div>
                <PaginationContent className="gap-2">
                  <PaginationItem>
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      disabled={true}
                    >
                      <span className="sr-only">Go to first page</span>
                      <ChevronsLeft />
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      disabled={true}
                    >
                      <span className="sr-only">Go to previous page</span>
                      <ChevronLeft />
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      disabled={true}
                    >
                      <span className="sr-only">Go to next page</span>
                      <ChevronRight />
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      disabled={true}
                    >
                      <span className="sr-only">Go to last page</span>
                      <ChevronsRight />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </div>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
