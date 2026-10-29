import type {
  PageResult,
  PageWithSearchAndStatusParams,
  Status,
} from '#/api/common';

/**
 * 用户接口类型
 *
 * 与 `nest-claude` 后端 `apps/gateway/src/modules/system/user/dto/*` 一一对应：
 * `user-response.dto.ts` / `create-user.dto.ts` / `update-user.dto.ts` /
 * `list-user.dto.ts` / `reset-password.dto.ts` / `assign-roles.dto.ts` / `assign-posts.dto.ts`。
 */
export namespace SystemUserApi {
  /** 性别：0 男、1 女、2 未知 */
  export type Sex = '0' | '1' | '2';

  /** 用户信息，对应后端 `UserResponseDto` */
  export interface User {
    /** 用户 ID（十进制字符串） */
    userId: string;
    /** 登录账号，全局唯一 */
    userName: string;
    /** 用户昵称 */
    nickName: string;
    /** 邮箱，未填写为 null */
    email?: null | string;
    /** 手机号，未填写为 null */
    phoneNumber?: null | string;
    /** 性别：0 男、1 女、2 未知 */
    sex?: Sex;
    /** 所属部门 ID，未分配为 null */
    deptId?: null | string;
    /** 状态：0 启用、1 停用 */
    status: Status;
    /** 最后登录 IP，从未登录为 null */
    loginIp?: null | string;
    /** 最后登录时间，从未登录为 null */
    loginDate?: null | string;
    /** 创建时间 */
    createTime: string;
    /** 更新时间，从未更新过为 null */
    updateTime?: null | string;
    /** 备注 */
    remark?: null | string;
  }

  /**
   * 列表查询参数，对应后端 `ListUserDto`
   *
   * `search` 同时模糊匹配 `userName` 与 `nickName`。
   */
  export interface ListParams extends PageWithSearchAndStatusParams {
    /** 部门 ID，精确匹配（不含子部门）；不传表示不限部门 */
    deptId?: string;
  }

  export type ListResult = PageResult<User>;

  /** 创建参数，对应后端 `CreateUserDto` */
  export interface CreateParams {
    /** 登录账号，最长 64 字符 */
    userName: string;
    /** 昵称，最长 100 字符 */
    nickName: string;
    /** 登录密码，6~255 字符 */
    password: string;
    /** 邮箱 */
    email?: null | string;
    /** 手机号（中国大陆格式） */
    phoneNumber?: null | string;
    /** 性别，缺省 2 */
    sex?: Sex;
    /** 状态，缺省 0 启用 */
    status?: Status;
    /** 所属部门 ID */
    deptId?: null | string;
    /** 角色 ID 列表，写入 `sys_user_role` */
    roleIds?: string[];
    /** 岗位 ID 列表，写入 `sys_user_post` */
    postIds?: string[];
    /** 备注，最长 500 字符 */
    remark?: null | string;
  }

  /**
   * 更新参数，对应后端 `UpdateUserDto`
   *
   * 无 `userName`（账号不可改）、无密码（走重置密码接口）。
   * `roleIds` / `postIds` 为全量替换语义：传空数组即清空。
   */
  export type UpdateParams = Partial<
    Omit<CreateParams, 'password' | 'userName'>
  > & {
    /** 用户 ID */
    userId: string;
  };

  /** 已分配的角色与岗位，对应 `GET /system/user/:userId/roles` */
  export interface AssignedIds {
    /** 岗位 ID 列表 */
    postIds: string[];
    /** 角色 ID 列表 */
    roleIds: string[];
  }
}
