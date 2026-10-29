import type {
  PageResult,
  PageWithSearchAndStatusParams,
  Status,
} from '#/api/common';

/**
 * 角色接口类型
 *
 * 仅覆盖当前用到的列表查询，与 `nest-claude` 后端
 * `apps/gateway/src/modules/system/role/dto/role-response.dto.ts` 对应。
 */
export namespace SystemRoleApi {
  /** 角色信息，对应后端 `RoleResponseDto` */
  export interface Role {
    /** 角色 ID（十进制字符串） */
    roleId: string;
    /** 角色名称 */
    roleName: string;
    /** 权限字符，如 `admin` */
    roleKey: string;
    /** 显示顺序 */
    orderNum: number;
    /** 数据范围：1 全部、2 本部门、3 本部门及以下、4 仅本人、5 自定义 */
    dataScope: string;
    /** 状态：0 启用、1 停用 */
    status: Status;
    /** 创建时间 */
    createTime: string;
    /** 更新时间 */
    updateTime?: null | string;
    /** 备注 */
    remark?: null | string;
  }

  /** 列表查询参数，对应后端 `ListRoleDto` */
  export type ListParams = PageWithSearchAndStatusParams;

  export type ListResult = PageResult<Role>;
}
