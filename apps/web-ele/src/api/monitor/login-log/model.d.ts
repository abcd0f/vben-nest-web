import type { Status } from '#/api/common';

/**
 * 登录日志接口类型
 *
 * 与 `nest-claude` 后端 `libs/audit/src/dto/login-log-*.dto.ts` 一一对应：
 * `login-log-response.dto.ts` / `login-log-query.dto.ts`。
 */
export namespace MonitorLoginLogApi {
  /** 登录日志，对应后端 `LoginLogResponseDto` */
  export interface LoginLog {
    /** 访问 ID（十进制字符串，库中为 BigInt） */
    infoId: string;
    /** 登录账号 */
    userName: string;
    /** 登录 IP */
    ipaddr?: string;
    /** 客户端 User-Agent 原文 */
    userAgent?: string;
    /** 登录状态：0 成功、1 失败 */
    status: Status;
    /** 提示消息，失败时记录原因（如「密码错误」「账号已停用」） */
    msg?: string;
    /** 登录时间，后端格式化为 `YYYY-MM-DD HH:mm:ss` */
    loginTime: string;
  }

  /**
   * 列表查询参数，对应后端 `LoginLogQueryDto`
   *
   * DTO 注释写的是「精确匹配」，但服务层实现用的是 `contains`，
   * 即 `userName` / `ipaddr` 实际是模糊匹配。
   */
  export interface ListParams {
    /** 登录账号（模糊匹配） */
    userName?: string;
    /** 登录 IP（模糊匹配） */
    ipaddr?: string;
    /** 登录状态：0 成功、1 失败 */
    status?: Status;
    /** 时间范围起点（含），需为 ISO 8601 字符串，后端直接交给 Prisma 过滤 DateTime */
    startTime?: string;
    /** 时间范围终点（含），需为 ISO 8601 字符串 */
    endTime?: string;
    /** 页码，从 1 开始 */
    page?: number;
    /** 每页数量 */
    pageSize?: number;
  }

  /**
   * 列表返回体
   *
   * 注意不是通用的 `PageResult`：后端把 `records / total / page / pageSize`
   * 平铺返回，没有 `meta` 包装。
   */
  export interface ListResult {
    /** 当前页记录 */
    records: LoginLog[];
    /** 总记录数 */
    total: number;
    /** 当前页码 */
    page: number;
    /** 每页数量 */
    pageSize: number;
  }
}
