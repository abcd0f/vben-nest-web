import type { MonitorOperLogApi } from './model';

import { requestClient } from '#/api/request';

/**
 * 查询操作日志列表
 *
 * 后端按 `operTime` 倒序分页返回，分页元数据位于 `meta`。
 */
export function operLogListApi(params?: MonitorOperLogApi.ListParams) {
  return requestClient.get<MonitorOperLogApi.ListResult>(
    '/system/operation-log',
    { params },
  );
}

/**
 * 删除单条操作日志
 * @param operId 操作日志 ID（十进制字符串）
 */
export function deleteOperLogApi(operId: string) {
  return requestClient.delete<null>(`/system/operation-log/${operId}`);
}

/**
 * 批量删除操作日志
 * @param operIds 操作日志 ID 列表
 * @returns 实际删除条数
 */
export function batchDeleteOperLogApi(operIds: string[]) {
  return requestClient.delete<number>('/system/operation-log', {
    data: { operIds },
  });
}

/**
 * 清空全部操作日志
 *
 * 不可恢复，调用前必须二次确认。
 */
export function clearOperLogApi() {
  return requestClient.delete<null>('/system/operation-log/clear/all');
}
