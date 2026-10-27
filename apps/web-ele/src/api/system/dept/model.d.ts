import type { PageWithStatusParams, Status } from '#/api/common';

export namespace SystemDeptApi {
  /**
   * 部门列表查询参数
   *
   * 对应后端 `ListDeptDto`（继承 `ListWithStatusDto`），可用字段：
   * `page`、`pageSize`、`orderByColumn`、`isAsc`、`status`。
   */
  export type ListParams = PageWithStatusParams;

  /** 部门信息 */
  export interface Dept {
    /** 部门 ID（十进制字符串） */
    deptId: string;
    /** 父部门 ID，根节点为 "0" */
    parentId: string;
    /** 部门名称 */
    deptName: string;
    /** 显示顺序 */
    orderNum: number;
    /** 负责人用户 ID，未设置时为 null */
    leaderId?: null | string;
    /** 部门状态：0 启用、1 停用 */
    status: Status;
    /** 创建时间 */
    createTime: string;
    /** 更新时间，从未更新过时为 null */
    updateTime?: null | string;
    /** 备注 */
    remark?: null | string;
  }

  /** 创建部门参数 */
  export interface CreateParams {
    /** 父部门 ID，根节点固定为 "0" */
    parentId: string;
    /** 部门名称，最长 64 字符 */
    deptName: string;
    /** 显示顺序，同级内升序，缺省 0 */
    orderNum?: number;
    /** 负责人用户 ID（十进制字符串） */
    leaderId?: string;
    /** 部门状态，缺省启用 */
    status?: Status;
    /** 备注，最长 500 字符 */
    remark?: string;
  }

  /**
   * 更新部门参数
   *
   * 所有字段可选，只更新传入的字段；未传字段保持原值。
   */
  export interface UpdateParams {
    /** 父部门 ID，不能指向自身或自身的后代，否则形成环 */
    parentId?: string;
    /** 部门名称，最长 64 字符 */
    deptName?: string;
    /** 显示顺序 */
    orderNum?: number;
    /** 负责人用户 ID（十进制字符串） */
    leaderId?: string;
    /** 部门状态：0 启用、1 停用 */
    status?: Status;
    /** 备注，最长 500 字符 */
    remark?: string;
  }
}
