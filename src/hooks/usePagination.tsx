import * as React from "react";

export function usePagination(totalItems: number, pageSize: number = 20) {
  const [currentPageIndex, setCurrentPageIndex] = React.useState(0);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const canPreviousPage = currentPageIndex > 0;
  const canNextPage = currentPageIndex < totalPages - 1;

  const firstPage = React.useCallback(() => setCurrentPageIndex(0), []);
  const previousPage = React.useCallback(
    () => setCurrentPageIndex((p) => Math.max(0, p - 1)),
    [],
  );
  const nextPage = React.useCallback(
    () => setCurrentPageIndex((p) => Math.min(totalPages - 1, p + 1)),
    [totalPages],
  );
  const lastPage = React.useCallback(
    () => setCurrentPageIndex(totalPages - 1),
    [totalPages],
  );

  return {
    pageIndex: currentPageIndex + 1,
    totalPages,
    canPreviousPage,
    canNextPage,
    firstPage: canPreviousPage ? firstPage : null,
    previousPage: canPreviousPage ? previousPage : null,
    nextPage: canNextPage ? nextPage : null,
    lastPage: canNextPage ? lastPage : null,
    setCurrentPageIndex,
    pageOffset: currentPageIndex,
    pageSize,
  };
}
