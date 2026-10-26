/**
 * 分页信息
 * @param items 结果集
 * @param meta 分页信息
 */
export interface PageResult<T> {
  items: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPage: number;
  };
}
