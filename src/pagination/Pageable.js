
export class Pageable {
  sort;
  pageSize;
  pageNumber;
  offset;
  unpaged;
  paged;

  static DEFAULT_PAGE_SIZE = 20;
  static FIRST_PAGE_NUMBER = 0;

  constructor() {
    this.pageSize = Pageable.DEFAULT_PAGE_SIZE;
    this.pageNumber = Pageable.FIRST_PAGE_NUMBER;
  }
}
