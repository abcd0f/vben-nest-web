import type { PageParams, PageResult, Status } from '#/api/common';

/**
 * 操作日志接口类型
 *
 * 与 `nest-claude` 后端 `libs/audit/src/dto/operation-log-*.dto.ts` 一一对应：
 * `operation-log-response.dto.ts` / `operation-log-query.dto.ts`。
 */
export namespace MonitorOperLogApi {
  /** 操作日志，对应后端 `OperationLogResponseDto` */
  export interface OperLog {
    /** 操作日志 ID（十进制字符串，库中为 BigInt） */
    operId: string;
    /** 模块标题，取自 `@Audit({ title })` 声明的标题 */
    title?: string;
    /** 控制器方法全限定名，如 `UserController.create` */
    method?: string;
    /** HTTP 请求方式，如 `POST` */
    requestMethod?: string;
    /** 操作人用户 ID（十进制字符串），未登录场景可能为空 */
    operUserId?: string;
    /** 请求地址 */
    operUrl?: string;
    /** 操作 IP */
    operIp?: string;
    /** 请求参数，落库前已脱敏，可直接展示 */
    operParam?: string;
    /** 操作状态：0 成功、1 失败 */
    status: Status;
    /** 错误消息，仅失败时写入 */
    errorMsg?: string;
    /** 耗时（毫秒） */
    costTime: number;
    /** 操作时间，后端格式化为 `YYYY-MM-DD HH:mm:ss` */
    operTime: string;
  }

  /** 列表查询参数，对应后端 `OperationLogQueryDto` */
  export interface ListParams extends PageParams {
    /** 模块标题（后端用 contains 模糊匹配） */
    title?: string;
    /** 操作人用户 ID，必须是纯数字字符串 */
    operUserId?: string;
    /** 操作状态：0 成功、1 失败 */
    status?: Status;
    /** 时间范围起点（含），可传本地日期时间或 ISO 8601 字符串 */
    startTime?: string;
    /** 时间范围终点（含），可传本地日期时间或 ISO 8601 字符串 */
    endTime?: string;
  }

  export type ListResult = PageResult<OperLog>;
}
