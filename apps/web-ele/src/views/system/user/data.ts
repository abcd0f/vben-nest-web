import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { Status } from '#/api/common';
import type { SystemDeptApi } from '#/api/system/dept/model';
import type { SystemUserApi } from '#/api/system/user/model';

import { z } from '#/adapter/form';

/** 用户状态选项，对应后端 `status`：0 启用、1 停用 */
export const USER_STATUS_OPTIONS = [
  { label: '启用', value: '0' },
  { label: '停用', value: '1' },
];

/** 性别选项，对应后端 `sex`：0 男、1 女、2 未知 */
export const USER_SEX_OPTIONS = [
  { label: '男', value: '0' },
  { label: '女', value: '1' },
  { label: '未知', value: '2' },
];

const SEX_LABELS: Record<string, string> = {
  '0': '男',
  '1': '女',
  '2': '未知',
};

/** 用户列表列配置 */
export const columns: VxeGridProps['columns'] = [
  { field: 'userName', minWidth: 140, title: '用户账号' },
  { field: 'nickName', minWidth: 140, title: '用户昵称' },
  {
    field: 'deptId',
    minWidth: 180,
    slots: { default: 'department' },
    title: '所属部门',
  },
  {
    field: 'phoneNumber',
    formatter: ({ cellValue }: { cellValue?: null | string }) =>
      cellValue || '暂无',
    minWidth: 140,
    title: '手机号',
  },
  {
    field: 'sex',
    formatter: ({ cellValue }: { cellValue?: string }) =>
      SEX_LABELS[cellValue ?? ''] ?? '未知',
    title: '性别',
    width: 80,
  },
  {
    field: 'status',
    slots: { default: 'status' },
    title: '状态',
    width: 100,
  },
  { field: 'createTime', minWidth: 170, title: '创建时间' },
  {
    field: 'loginDate',
    formatter: ({ cellValue }: { cellValue?: null | string }) =>
      cellValue || '从未登录',
    minWidth: 170,
    title: '最后登录',
  },
  {
    field: 'action',
    fixed: 'right',
    resizable: false,
    slots: { default: 'action' },
    title: '操作',
    width: 210,
  },
];

/** 用户列表搜索表单 */
export function userSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        clearable: true,
        placeholder: '输入账号或昵称',
      },
      fieldName: 'search',
      label: '关键字',
    },
    {
      component: 'Select',
      componentProps: { clearable: true, options: USER_STATUS_OPTIONS },
      fieldName: 'status',
      label: '用户状态',
    },
  ];
}

/**
 * 用户表单配置
 *
 * 后端 `UpdateUserDto` 不含 `userName` 与密码，因此编辑态账号只读、不渲染密码框；
 * 这里按模式整份重建 schema，避免依赖 `dependencies` 的触发时机。
 *
 * `deptId` / `roleIds` / `postIds` 的可选数据依赖接口返回，由抽屉打开时通过
 * `formApi.updateSchema` 注入，此处只声明静态部分。
 */
export function userFormSchema(isUpdate: boolean): VbenFormSchema[] {
  const schema: VbenFormSchema[] = [
    {
      component: 'Input',
      fieldName: 'userId',
      hide: true,
    },
    {
      component: 'Input',
      componentProps: {
        disabled: isUpdate,
        maxlength: 64,
        placeholder: '请输入登录账号',
        showWordLimit: true,
      },
      fieldName: 'userName',
      label: '用户账号',
      rules: 'required',
    },
  ];

  if (!isUpdate) {
    schema.push({
      component: 'Input',
      componentProps: {
        maxlength: 255,
        placeholder: '6~255 位',
        showPassword: true,
        type: 'password',
      },
      fieldName: 'password',
      label: '登录密码',
      rules: z.string().min(6, '密码至少 6 位').max(255, '密码最多 255 位'),
    });
  }

  schema.push(
    {
      component: 'Input',
      componentProps: {
        maxlength: 100,
        placeholder: '请输入用户昵称',
        showWordLimit: true,
      },
      fieldName: 'nickName',
      label: '用户昵称',
      rules: 'required',
    },
    {
      component: 'TreeSelect',
      componentProps: {
        checkStrictly: true,
        clearable: true,
        defaultExpandAll: true,
        filterable: true,
        placeholder: '请选择所属部门',
        renderAfterExpand: false,
      },
      fieldName: 'deptId',
      label: '所属部门',
    },
    {
      component: 'Input',
      componentProps: {
        maxlength: 20,
        placeholder: '请输入手机号',
      },
      fieldName: 'phoneNumber',
      label: '手机号码',
      rules: z
        .string()
        .regex(/^1[3-9]\d{9}$/, '请输入正确的手机号码')
        .optional()
        .or(z.literal('')),
    },
    {
      component: 'Input',
      componentProps: {
        maxlength: 100,
        placeholder: '请输入邮箱',
      },
      fieldName: 'email',
      label: '邮箱',
      rules: z.string().email('请输入正确的邮箱').optional().or(z.literal('')),
    },
    {
      component: 'RadioGroup',
      componentProps: {
        isButton: true,
        options: USER_SEX_OPTIONS,
      },
      defaultValue: '2',
      fieldName: 'sex',
      label: '性别',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        isButton: true,
        options: USER_STATUS_OPTIONS,
      },
      defaultValue: '0',
      fieldName: 'status',
      label: '状态',
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        filterable: true,
        multiple: true,
        options: [],
        placeholder: '请先选择部门',
      },
      fieldName: 'postIds',
      help: '岗位按所属部门过滤，切换部门后需重新选择',
      label: '岗位',
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        filterable: true,
        multiple: true,
        options: [],
      },
      fieldName: 'roleIds',
      label: '角色',
    },
    {
      component: 'Input',
      componentProps: {
        maxlength: 500,
        placeholder: '请输入备注',
        rows: 3,
        showWordLimit: true,
        type: 'textarea',
      },
      fieldName: 'remark',
      label: '备注',
    },
  );

  return schema;
}

/** TreeSelect 的部门节点 */
export interface DeptTreeOption {
  children?: DeptTreeOption[];
  disabled?: boolean;
  label: string;
  value: string;
}

/** 部门树节点转 TreeSelect 数据 */
export function toDeptTreeOptions(
  nodes: SystemDeptApi.DeptTree[],
): DeptTreeOption[] {
  return nodes.map((node) => ({
    children: node.children?.length
      ? toDeptTreeOptions(node.children)
      : undefined,
    disabled: node.disabled,
    label: node.label,
    value: String(node.id),
  }));
}

/** 表单值类型，避免各处重复声明 */
export interface UserFormValues {
  deptId?: null | string;
  email?: null | string;
  nickName: string;
  password?: string;
  phoneNumber?: null | string;
  postIds?: string[];
  remark?: null | string;
  roleIds?: string[];
  sex?: SystemUserApi.Sex;
  status?: Status;
  userId?: string;
  userName: string;
}
