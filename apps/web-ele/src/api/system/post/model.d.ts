import type {
  PageResult,
  PageWithSearchAndStatusParams,
  Status,
} from '#/api/common';

/** 岗位接口，与 nest-claude 后端 system/post DTO 对应。 */
export namespace SystemPostApi {
  export interface Post {
    postId: string;
    postCode: string;
    postName: string;
    deptId: null | string;
    orderNum: number;
    status: Status;
    createTime: string;
    updateTime?: null | string;
    remark?: null | string;
  }

  export interface ListParams extends PageWithSearchAndStatusParams {
    /** 精确部门筛选；根部门查看全部岗位时不传。 */
    deptId?: string;
  }

  export type ListResult = PageResult<Post>;

  export interface CreateParams {
    postCode: string;
    postName: string;
    deptId?: null | string;
    orderNum?: number;
    status?: Status;
    remark?: null | string;
  }

  export type UpdateParams = Partial<CreateParams>;
}
