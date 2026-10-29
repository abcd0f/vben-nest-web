import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { SystemMenuApi } from '#/api/system/menu/model';

import { h } from 'vue';

import { ElTag } from 'element-plus';

export const MENU_TYPE_OPTIONS = [
  { label: '目录', value: 'M' },
  { label: '菜单', value: 'C' },
  { label: '按钮', value: 'F' },
];

export const MENU_STATUS_OPTIONS = [
  { label: '启用', value: '0' },
  { label: '停用', value: '1' },
];

export const MENU_VISIBLE_OPTIONS = [
  { label: '显示', value: '0' },
  { label: '隐藏', value: '1' },
];

export const MENU_FRAME_OPTIONS = [
  { label: '否', value: '1' },
  { label: '是', value: '0' },
];

export const MENU_CACHE_OPTIONS = [
  { label: '是', value: '0' },
  { label: '否', value: '1' },
];

export const columns: VxeGridProps['columns'] = [
  { field: 'menuName', minWidth: 220, title: '菜单名称', treeNode: true },
  { field: 'orderNum', title: '排序', width: 80 },
  {
    field: 'menuType',
    title: '类型',
    width: 90,
    slots: {
      default: ({ row }: { row: SystemMenuApi.Menu }) =>
        h(ElTag, { type: row.menuType === 'F' ? 'warning' : 'info' }, () =>
          row.menuType === 'M'
            ? '目录'
            : row.menuType === 'C'
              ? '菜单'
              : '按钮',
        ),
    },
  },
  { field: 'perms', title: '权限标识', minWidth: 180 },
  { field: 'component', title: '组件路径', minWidth: 180 },
  {
    field: 'status',
    title: '状态',
    width: 90,
    slots: {
      default: ({ row }: { row: SystemMenuApi.Menu }) =>
        h(ElTag, { type: row.status === '0' ? 'success' : 'danger' }, () =>
          row.status === '0' ? '启用' : '停用',
        ),
    },
  },
  { field: 'createTime', title: '创建时间', minWidth: 170 },
  {
    field: 'action',
    fixed: 'right',
    resizable: false,
    slots: { default: 'action' },
    title: '操作',
    width: 220,
  },
];

export function menuSearchFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: { clearable: true, placeholder: '输入菜单名称' },
      fieldName: 'menuName',
      label: '菜单名称',
    },
    {
      component: 'Select',
      componentProps: { clearable: true, options: MENU_STATUS_OPTIONS },
      fieldName: 'status',
      label: '菜单状态',
    },
    {
      component: 'Select',
      componentProps: { clearable: true, options: MENU_VISIBLE_OPTIONS },
      fieldName: 'visible',
      label: '显示状态',
    },
  ];
}

export function menuFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'TreeSelect',
      componentProps: {
        checkStrictly: true,
        defaultExpandAll: true,
        filterable: true,
        placeholder: '请选择上级菜单',
      },
      fieldName: 'parentId',
      label: '上级菜单',
      rules: 'selectRequired',
    },
    {
      component: 'RadioGroup',
      componentProps: { isButton: true, options: MENU_TYPE_OPTIONS },
      defaultValue: 'M',
      fieldName: 'menuType',
      label: '菜单类型',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 64, placeholder: '请输入菜单名称' },
      fieldName: 'menuName',
      label: '菜单名称',
      rules: 'required',
    },
    {
      component: 'InputNumber',
      componentProps: { class: 'w-full', min: 0 },
      defaultValue: 0,
      fieldName: 'orderNum',
      label: '显示排序',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 200, placeholder: '如 system/menu' },
      dependencies: {
        triggerFields: ['menuType'],
        resolve: ({ values }) => ({
          rules: values.menuType === 'C' ? 'required' : undefined,
          show: values.menuType !== 'F',
        }),
      },
      fieldName: 'path',
      label: '路由地址',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 255, placeholder: '如 system/menu/index' },
      dependencies: {
        triggerFields: ['menuType'],
        resolve: ({ values }) => ({
          rules: values.menuType === 'C' ? 'required' : undefined,
          show: values.menuType === 'C',
        }),
      },
      fieldName: 'component',
      label: '组件路径',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 100 },
      dependencies: {
        triggerFields: ['menuType'],
        resolve: ({ values }) => ({ show: values.menuType !== 'M' }),
      },
      fieldName: 'perms',
      label: '权限标识',
    },
    {
      component: 'RadioGroup',
      componentProps: { isButton: true, options: MENU_FRAME_OPTIONS },
      defaultValue: '1',
      dependencies: {
        triggerFields: ['menuType'],
        resolve: ({ values }) => ({ show: values.menuType !== 'F' }),
      },
      fieldName: 'isFrame',
      label: '是否外链',
    },
    {
      component: 'RadioGroup',
      componentProps: { isButton: true, options: MENU_VISIBLE_OPTIONS },
      defaultValue: '0',
      dependencies: {
        triggerFields: ['menuType'],
        resolve: ({ values }) => ({ show: values.menuType !== 'F' }),
      },
      fieldName: 'visible',
      label: '是否显示',
    },
    {
      component: 'RadioGroup',
      componentProps: { isButton: true, options: MENU_STATUS_OPTIONS },
      defaultValue: '0',
      dependencies: {
        triggerFields: ['menuType'],
        resolve: ({ values }) => ({ show: values.menuType !== 'F' }),
      },
      fieldName: 'status',
      label: '菜单状态',
    },
    {
      component: 'RadioGroup',
      componentProps: { isButton: true, options: MENU_CACHE_OPTIONS },
      defaultValue: '0',
      dependencies: {
        triggerFields: ['menuType'],
        resolve: ({ values }) => ({ show: values.menuType === 'C' }),
      },
      fieldName: 'isCache',
      label: '是否缓存',
    },
    {
      component: 'Input',
      componentProps: {
        maxlength: 255,
        placeholder: 'JSON 格式，如 {"id":"1"}',
      },
      dependencies: {
        triggerFields: ['menuType'],
        resolve: ({ values }) => ({ show: values.menuType === 'C' }),
      },
      fieldName: 'query',
      label: '路由参数',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 500, rows: 3, type: 'textarea' },
      fieldName: 'remark',
      label: '备注',
    },
  ];
}
