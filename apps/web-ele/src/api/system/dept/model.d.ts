import type { Status } from '#/api/common';

/**
 * 部门接口类型
 *
 * 与 `nest-claude` 后端 `apps/gateway/src/modules/system/dept/dto/*` 一一对应：
 * `dept-response.dto.ts` / `create-dept.dto.ts` / `update-dept.dto.ts` / `list-dept.dto.ts`。
 */
export namespace SystemDeptApi {
  /** 部门信息，对应后端 `DeptResponseDto` */
  export interface Dept {
    /** 部门 ID（十进制字符串） */
    deptId: string;
    /** 父部门 ID，根部门固定为 "0" */
    parentId: string;
    /** 部门名称，最长 64 字符 */
    deptName: string;
    /** 显示顺序，同级内升序 */
    orderNum: number;
    /** 负责人用户 ID，未设置时为 null */
    leaderId?: null | string;
    /** 部门状态：0 启用、1 停用 */
    status: Status;
    /** 创建时间 */
    createTime: string;
    /** 更新时间，从未更新过时为 null */
    updateTime?: null | string;
    /** 备注，最长 500 字符 */
    remark?: null | string;
  }

  /** 列表查询参数，对应后端 `ListDeptDto`（只有 status 生效，不分页） */
  export interface ListParams {
    /** 部门状态：0 启用、1 停用 */
    status?: Status;
  }

  /** 创建部门参数，对应后端 `CreateDeptDto` */
  export interface CreateParams {
    /** 父部门 ID，根部门固定为 "0" */
    parentId: string;
    /** 部门名称，最长 64 字符 */
    deptName: string;
    /** 显示顺序，缺省 0 */
    orderNum?: number;
    /** 负责人用户 ID（十进制字符串） */
    leaderId?: string;
    /** 部门状态，缺省启用 */
    status?: Status;
    /** 备注，最长 500 字符 */
    remark?: null | string;
  }

  /**
   * 更新部门参数，对应后端 `UpdateDeptDto`
   *
   * 所有字段可选，只更新传入的字段；未传字段保持原值，`remark` 传 null 表示清空。
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
    remark?: null | string;
  }

  /**
   * @description: 部门树
   */
  export interface DeptTree {
    id: number | string;
    /**
     * antd组件必须要这个属性 实际是没有这个属性的
     */
    key: string;
    parentId: number;
    label: string;
    weight: number;
    disabled: boolean;
    children?: DeptTree[];
  }
}
