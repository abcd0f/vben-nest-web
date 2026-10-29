import type { SystemRoleApi } from './model';

import { requestClient } from '#/api/request';

/** 后端分页上限，取一次满页当作「全量角色选项」 */
const ROLE_OPTION_PAGE_SIZE = 200;

/**
 * 获取角色列表（分页）
 */
export function roleListApi(params?: SystemRoleApi.ListParams) {
  return requestClient.get<SystemRoleApi.ListResult>('/system/role/list', {
    params,
  });
}

/**
 * 获取全部启用角色，用于用户表单的角色下拉
 *
 * 后端没有不分页的角色接口，这里固定取第一页的满页（200 条）。
 */
export function roleOptionListApi() {
  return roleListApi({
    page: 1,
    pageSize: ROLE_OPTION_PAGE_SIZE,
    status: '0',
  });
}
