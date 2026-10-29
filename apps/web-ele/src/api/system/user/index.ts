import type { SystemUserApi } from './model';

import { requestClient } from '#/api/request';

/**
 * 获取用户列表（分页）
 *
 * `search` 同时模糊匹配账号与昵称；`deptId` 为精确部门筛选，不含子部门。
 */
export function userListApi(params?: SystemUserApi.ListParams) {
  return requestClient.get<SystemUserApi.ListResult>('/system/user/list', {
    params,
  });
}

/**
 * 获取用户详情
 * @param userId 用户 ID（十进制字符串）
 */
export function userInfoApi(userId: string) {
  return requestClient.get<SystemUserApi.User>(`/system/user/${userId}`);
}

/**
 * 获取用户已分配的角色与岗位 ID
 *
 * 详情接口出于精简不回传关联 ID，抽屉回显走这个接口。
 * @param userId 用户 ID（十进制字符串）
 */
export function userAssignedIdsApi(userId: string) {
  return requestClient.get<SystemUserApi.AssignedIds>(
    `/system/user/${userId}/roles`,
  );
}

/**
 * 创建用户
 * @param data 创建参数
 */
export function createUserApi(data: SystemUserApi.CreateParams) {
  return requestClient.post<SystemUserApi.User>('/system/user', data);
}

/**
 * 更新用户
 *
 * 只更新传入的字段；`roleIds` / `postIds` 传了就全量覆盖。
 * @param data 更新参数，必须包含用户 ID
 */
export function updateUserApi(data: SystemUserApi.UpdateParams) {
  return requestClient.put<SystemUserApi.User>('/system/user', data);
}

/**
 * 删除用户
 *
 * 后端同时清理 `sys_user_role` / `sys_user_post` 关联。
 * @param userId 用户 ID（十进制字符串）
 */
export function deleteUserApi(userId: string) {
  return requestClient.delete<null>(`/system/user/${userId}`);
}

/**
 * 分配角色（全量替换）
 * @param userId 用户 ID
 * @param roleIds 角色 ID 列表，空数组表示清空全部角色
 */
export function assignUserRolesApi(userId: string, roleIds: string[]) {
  return requestClient.put<null>(`/system/user/${userId}/roles`, { roleIds });
}

/**
 * 分配岗位（全量替换）
 * @param userId 用户 ID
 * @param postIds 岗位 ID 列表，空数组表示清空全部岗位
 */
export function assignUserPostsApi(userId: string, postIds: string[]) {
  return requestClient.put<null>(`/system/user/${userId}/posts`, { postIds });
}

/**
 * 重置用户密码
 *
 * 管理员直接设置新密码，不需要旧密码。
 * @param userId 用户 ID
 * @param newPassword 新密码，6~255 字符
 */
export function resetUserPasswordApi(userId: string, newPassword: string) {
  return requestClient.put<null>(`/system/user/${userId}/password`, {
    newPassword,
  });
}
