export type PaginationQueryParam = {
  page: number;
  size: number;
};

export type PaginationResult = {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
};
