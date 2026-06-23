export type SortDirection = 'asc' | 'desc';

export type APIPageableFetchType = {
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  size: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
};

export type AxiosResponseError = {
  error: string;
  message: string;
  path: string;
  status: number;
  stackTrace: string;
  timestamp: string;
};

export type CommonSortingParams = {
  page: number;
  size: number;
  sort: {
    columnName: string;
    sort: SortDirection;
  };
};
