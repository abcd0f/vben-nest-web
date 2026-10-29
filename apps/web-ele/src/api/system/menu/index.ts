import type { SystemMenuApi } from './model';

import { requestClient } from '#/api/request';

/** 菜单管理使用的扁平列表，包含按钮，不分页。 */
export function menuListApi(params?: SystemMenuApi.ListParams) {
  return requestClient.get<SystemMenuApi.Menu[]>('/system/menu/list', {
    params,
  });
}

export function menuInfoApi(menuId: string) {
  return requestClient.get<SystemMenuApi.Menu>(`/system/menu/${menuId}`);
}

export function createMenuApi(data: SystemMenuApi.CreateParams) {
  return requestClient.post<SystemMenuApi.Menu>('/system/menu', data);
}

/** 编辑使用 PUT 提交完整表单。 */
export function updateMenuApi(data: SystemMenuApi.UpdateParams) {
  return requestClient.put<SystemMenuApi.Menu>('/system/menu', data);
}

export function deleteMenuApi(menuId: string) {
  return requestClient.delete<null>(`/system/menu/${menuId}`);
}
