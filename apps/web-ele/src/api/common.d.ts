/**
 * 接口层公共类型
 *
 * 与后端 `libs/common/src/dto/base.dto.ts`（`PageQueryDto` / `PageMetaDto` /
 * `PageResponseDto`）和 `libs/common/src/dto/list-query.dto.ts`（各 List 查询 DTO）
 * 一一对应，字段语义与可选性保持一致。
 */

/** 排序方向，对应后端 `SortOrder` 枚举 */
export type SortOrder = 'asc' | 'desc';

/** 通用状态位：0 启用、1 停用 */
export type Status = '0' | '1';

/** 分页元信息，对应后端 `PageMetaDto` */
export interface PageMeta {
  /** 当前页码，从 1 开始 */
  page: number;
  /** 页大小 */
  pageSize: number;
  /** 总记录数 */
  total: number;
  /** 总页数 */
  totalPage: number;
}

/** 分页结果，对应后端 `PageResponseDto<T>` */
export interface PageResult<T> {
  /** 当前页数据 */
  items: T[];
  /** 分页元信息 */
  meta: PageMeta;
}

/** 分页查询参数，对应后端 `PageQueryDto` */
export interface PageParams {
  /** 页码，从 1 开始，缺省 1 */
  page?: number;
  /** 页大小，缺省 20，上限 200 */
  pageSize?: number;
  /** 排序字段 */
  orderByColumn?: string;
  /** 排序方向 */
  isAsc?: SortOrder;
}

/** 带状态筛选的分页查询参数，对应后端 `ListWithStatusDto` */
export interface PageWithStatusParams extends PageParams {
  /** 状态：0 启用、1 停用 */
  status?: Status;
}

/** 带关键字搜索的分页查询参数，对应后端 `ListWithSearchDto` */
export interface PageWithSearchParams extends PageParams {
  /** 关键字，前后空白会被后端 trim 掉 */
  search?: string;
}

/**
 * 带关键字搜索和状态筛选的分页查询参数
 *
 * 对应后端 `ListWithSearchAndStatusDto`（继承 `ListWithSearchDto` 并追加 `status`）。
 */
export interface PageWithSearchAndStatusParams extends PageWithStatusParams {
  /** 关键字，前后空白会被后端 trim 掉 */
  search?: string;
}
