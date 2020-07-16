import { Pageable } from "./Pageable";

export class Page {
  content = [];
  pageable;
  last;
  totalPages;
  totalElements;
  first;
  sort;
  numberOfElements;
  size;
  number;
  

  constructor() {
    this.pageable = new Pageable();
  }
}
