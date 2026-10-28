import type { MonitorLoginLogApi } from './model';

import { requestClient } from '#/api/request';

/**
 * 查询登录日志列表
 *
 * 后端按 `loginTime` 倒序分页返回，分页元数据位于 `meta`。
 */
export function loginLogListApi(params?: MonitorLoginLogApi.ListParams) {
  return requestClient.get<MonitorLoginLogApi.ListResult>('/system/login-log', {
    params,
  });
}

/**
 * 删除单条登录日志
 * @param infoId 访问 ID（十进制字符串）
 */
export function deleteLoginLogApi(infoId: string) {
  return requestClient.delete<null>(`/system/login-log/${infoId}`);
}

/**
 * 批量删除登录日志
 * @param infoIds 访问 ID 列表
 * @returns 实际删除条数
 */
export function batchDeleteLoginLogApi(infoIds: string[]) {
  return requestClient.delete<number>('/system/login-log', {
    data: { infoIds },
  });
}

/**
 * 清空全部登录日志
 *
 * 不可恢复，调用前必须二次确认。
 */
export function clearLoginLogApi() {
  return requestClient.delete<null>('/system/login-log/clear/all');
}
