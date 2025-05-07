export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPrevious:boolean;
  hasNext:boolean;
}

export class PaginatedResult<T> {
  dataItems?: T;
  pagination?: Pagination;
}
