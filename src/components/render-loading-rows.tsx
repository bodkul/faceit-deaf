import { range } from "lodash-es";

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

interface RenderLoadingRowsOptions {
  /** Number of rows to render */
  count: number;
  /** Number of columns to render */
  columns: number;
  /** Optional offset for row numbering (displays rank/position) */
  offset?: number;
  /** Custom skeleton configurations per column */
  skeletonConfig?: Array<{
    className?: string;
    wrapper?: (skeleton: React.ReactNode) => React.ReactNode;
  }>;
}

/**
 * Renders loading skeleton rows for tables
 * @param options Configuration for loading rows
 * @returns Array of TableRow components with skeleton loaders
 */
export function renderLoadingRows({
  count,
  columns,
  offset,
  skeletonConfig,
}: RenderLoadingRowsOptions) {
  return range(count).map((index) => (
    <TableRow key={index}>
      {offset !== undefined && <TableCell>{offset + index + 1}</TableCell>}
      {range(columns).map((colIndex) => {
        const config = skeletonConfig?.[colIndex];
        const skeleton = (
          <Skeleton className={config?.className || "mx-auto h-5 w-12"} />
        );

        return (
          <TableCell key={colIndex}>
            {config?.wrapper ? config.wrapper(skeleton) : skeleton}
          </TableCell>
        );
      })}
    </TableRow>
  ));
}

/**
 * Preset for match history table loading rows (6 columns)
 */
export function renderMatchHistoryLoadingRows(count: number) {
  return renderLoadingRows({
    count,
    columns: 6,
    skeletonConfig: [
      { className: "mx-auto h-5 w-24" }, // Date
      { className: "mx-auto h-5 w-12" }, // Result
      { className: "mx-auto h-5 w-10" }, // Score
      { className: "mx-auto h-5 w-12" }, // Map
      { className: "mx-auto h-5 w-8" }, // K/D
      { className: "mx-auto h-5 w-8" }, // Rating
    ],
  });
}

/**
 * Preset for ranking table loading rows (3 columns + rank)
 */
export function renderRankingLoadingRows(count: number, offset: number) {
  return renderLoadingRows({
    count,
    columns: 3,
    offset,
    skeletonConfig: [
      {
        // Player name with flag
        wrapper: () => (
          <div className="flex items-center space-x-2">
            <Skeleton className="h-2.5 w-3.75 rounded-xs" />
            <Skeleton className="h-4 w-24" />
          </div>
        ),
      },
      { className: "size-6 rounded-full" }, // Skill level
      { className: "h-4 w-12" }, // ELO
    ],
  });
}
