export interface Page<T> {

  content: T[];
  pageable: {

    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };

    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;

  };

  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;

  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };

  empty: boolean;

}
