import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept/model';

import { h } from 'vue';

import { ElTag } from 'element-plus';

/** 部门状态选项，对应后端 `status`：0 启用、1 停用 */
export const DEPT_STATUS_OPTIONS = [
  { label: '启用', value: '0' },
  { label: '停用', value: '1' },
];

/** 部门列表列配置 */
export const columns: VxeGridProps['columns'] = [
  {
    field: 'deptName',
    // treeNode 指定哪一列渲染树形展开图标
    treeNode: true,
    minWidth: 300,
    title: '部门名称',
  },
  {
    field: 'orderNum',
    title: '排序',
  },
  {
    field: 'status',
    slots: {
      default: ({ row }: { row: SystemDeptApi.Dept }) =>
        h(ElTag, { type: row.status === '0' ? 'success' : 'danger' }, () =>
          row.status === '0' ? '启用' : '停用',
        ),
    },
    title: '状态',
  },
  {
    field: 'createTime',
    title: '创建时间',
  },
  {
    field: 'action',
    fixed: 'right',
    resizable: false,
    slots: { default: 'action' },
    title: '操作',
    width: 190,
  },
];

/**
 * 部门表单配置
 *
 * `parentId` 的可选树数据依赖接口返回，由抽屉在打开时通过
 * `formApi.updateSchema` 注入，这里只声明静态部分。
 */
export function deptFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'TreeSelect',
      componentProps: {
        checkStrictly: true,
        clearable: true,
        defaultExpandAll: true,
        filterable: true,
        placeholder: '请选择上级部门',
        renderAfterExpand: false,
      },
      fieldName: 'parentId',
      label: '上级部门',
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      componentProps: {
        maxlength: 64,
        placeholder: '请输入部门名称',
        showWordLimit: true,
      },
      fieldName: 'deptName',
      label: '部门名称',
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
        options: DEPT_STATUS_OPTIONS,
      },
      defaultValue: '0',
      fieldName: 'status',
      label: '部门状态',
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
