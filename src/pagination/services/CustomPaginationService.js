import { Pageable } from "../Pageable";

class CustomPaginationService {

  getNextPage(page) {
    if (!page.last) {
      page.pageable.pageNumber = page.pageable.pageNumber + 1;
    }
    return page.pageable;
  }

  getPreviousPage(page) {
    if (!page.first) {
      page.pageable.pageNumber = page.pageable.pageNumber - 1;
    }
    return page.pageable;
  }

  getPageInNewSize(page, pageSize) {
    page.pageable.pageSize = pageSize;
    page.pageable.pageNumber = Pageable.FIRST_PAGE_NUMBER;

    return page.pageable;
  }
  
}

export default new CustomPaginationService();