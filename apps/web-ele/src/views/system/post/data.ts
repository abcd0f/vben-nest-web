import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { SystemPostApi } from '#/api/system/post/model';

import { h } from 'vue';

import { ElTag } from 'element-plus';

export const POST_STATUS_OPTIONS = [
  { label: '启用', value: '0' },
  { label: '停用', value: '1' },
];

export const columns: VxeGridProps['columns'] = [
  { field: 'postCode', minWidth: 140, title: '岗位编码' },
  { field: 'postName', minWidth: 140, title: '岗位名称' },
  {
    field: 'deptId',
    minWidth: 220,
    slots: { default: 'department' },
    title: '所属部门',
  },
  { field: 'orderNum', title: '排序', width: 90 },
  {
    field: 'status',
    slots: {
      default: ({ row }: { row: SystemPostApi.Post }) =>
        h(ElTag, { type: row.status === '0' ? 'success' : 'danger' }, () =>
          row.status === '0' ? '启用' : '停用',
        ),
    },
    title: '状态',
    width: 90,
  },
  { field: 'createTime', minWidth: 170, title: '创建时间' },
  {
    field: 'action',
    fixed: 'right',
    resizable: false,
    slots: { default: 'action' },
    title: '操作',
    width: 140,
  },
];

export function postSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        clearable: true,
        placeholder: '输入岗位编码或名称',
      },
      fieldName: 'search',
      label: '关键字',
    },
    {
      component: 'Select',
      componentProps: { clearable: true, options: POST_STATUS_OPTIONS },
      fieldName: 'status',
      label: '岗位状态',
    },
  ];
}

export interface PostDeptOption {
  children?: PostDeptOption[];
  disabled?: boolean;
  label: string;
  value: string;
}

export function postFormSchema(
  departments: PostDeptOption[] = [],
): VbenFormSchema[] {
  return [
    {
      component: 'TreeSelect',
      componentProps: {
        checkStrictly: true,
        clearable: true,
        data: departments,
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
        maxlength: 64,
        placeholder: '请输入岗位编码',
        showWordLimit: true,
      },
      fieldName: 'postCode',
      label: '岗位编码',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        maxlength: 64,
        placeholder: '请输入岗位名称',
        showWordLimit: true,
      },
      fieldName: 'postName',
      label: '岗位名称',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: {
        class: 'w-full',
        max: 2_147_483_647,
        min: 0,
      },
      defaultValue: 0,
      fieldName: 'orderNum',
      label: '显示排序',
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        isButton: true,
        options: POST_STATUS_OPTIONS,
      },
      defaultValue: '0',
      fieldName: 'status',
      label: '岗位状态',
      rules: 'required',
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
  ];
}
