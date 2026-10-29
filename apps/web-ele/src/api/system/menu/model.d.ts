import type { Status } from '#/api/common';

/** 菜单接口，与 nest-claude system/menu DTO 对应。 */
export namespace SystemMenuApi {
  export type MenuType = 'C' | 'F' | 'M';

  export interface Menu {
    menuId: string;
    parentId: string;
    menuName: string;
    menuType: MenuType;
    orderNum: number;
    path?: null | string;
    component?: null | string;
    query?: null | string;
    isFrame: '0' | '1';
    isCache: '0' | '1';
    visible: '0' | '1';
    status: Status;
    perms?: null | string;
    icon?: null | string;
    createTime: string;
    updateTime?: null | string;
    remark?: null | string;
    children?: Menu[];
  }

  export interface ListParams {
    menuName?: string;
    parentId?: string;
    status?: Status;
    visible?: '0' | '1';
  }

  export interface CreateParams {
    menuId?: string;
    parentId: string;
    menuName: string;
    menuType: MenuType;
    orderNum: number;
    path?: null | string;
    component?: null | string;
    query?: null | string;
    isFrame?: '0' | '1';
    isCache?: '0' | '1';
    visible?: '0' | '1';
    status?: Status;
    perms?: null | string;
    icon?: null | string;
    remark?: null | string;
  }

  export type UpdateParams = Omit<CreateParams, 'menuId'> & { menuId: string };
}
