export default class PaginationDto<T> {
  constructor(
    page: number = 1,
    limit: number = 10,
    totalItems: number,
    data: T[],
  ) {
    this.page = page;
    this.limit = limit;
    this.totalItems = totalItems;
    this.data = data;
  }
  page: number;
  totalItems: number;
  limit: number;
  data: T[];
}
