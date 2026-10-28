import type { PageParams, PageResult, Status } from '#/api/common';

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
  export interface ListParams extends PageParams {
    /** 登录账号（模糊匹配） */
    userName?: string;
    /** 登录 IP（模糊匹配） */
    ipaddr?: string;
    /** 登录状态：0 成功、1 失败 */
    status?: Status;
    /** 时间范围起点（含），可传本地日期时间或 ISO 8601 字符串 */
    startTime?: string;
    /** 时间范围终点（含），可传本地日期时间或 ISO 8601 字符串 */
    endTime?: string;
  }

  export type ListResult = PageResult<LoginLog>;
}
