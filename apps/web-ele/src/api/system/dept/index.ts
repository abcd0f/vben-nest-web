import type { SystemDeptApi } from './model';

import { requestClient } from '#/api/request';

/**
 * 获取部门列表
 *
 * 后端不分页，一次返回全部未删除部门（平级结构，靠 `parentId` 关联）。
 * 树形展示交给表格的 `treeConfig.transform`，需要树结构时前端自行组装。
 */
export function deptListApi(params?: SystemDeptApi.ListParams) {
  return requestClient.get<SystemDeptApi.Dept[]>('/system/dept/list', {
    params,
  });
}

/**
 * 获取部门详情
 * @param deptId 部门ID（十进制字符串）
 */
export function deptInfoApi(deptId: string) {
  return requestClient.get<SystemDeptApi.Dept>(`/system/dept/${deptId}`);
}

/**
 * 创建部门
 * @param data 创建参数，`parentId` 为 "0" 表示根部门
 * @returns 创建后的部门
 */
export function createDeptApi(data: SystemDeptApi.CreateParams) {
  return requestClient.post<SystemDeptApi.Dept>('/system/dept', data);
}

/**
 * 更新部门
 * @param deptId 部门ID（十进制字符串）
 * @param data 更新参数，仅提交需要变更的字段
 * @returns 更新后的部门
 */
export function updateDeptApi(
  deptId: string,
  data: SystemDeptApi.UpdateParams,
) {
  return requestClient.put<SystemDeptApi.Dept>(`/system/dept/${deptId}`, data);
}

/**
 * 删除部门
 *
 * 存在子部门或部门下有用户时后端会拒绝删除。
 * @param deptId 部门ID（十进制字符串）
 */
export function deleteDeptApi(deptId: string) {
  return requestClient.delete<null>(`/system/dept/${deptId}`);
}
