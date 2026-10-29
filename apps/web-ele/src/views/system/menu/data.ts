import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { SystemMenuApi } from '#/api/system/menu/model';

import { h } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { ElTag } from 'element-plus';

import { z } from '#/adapter/form';

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
  {
    field: 'menuName',
    minWidth: 220,
    title: '菜单名称',
    treeNode: true,
    align: 'left',
    slots: {
      default: ({ row }: { row: SystemMenuApi.Menu }) => $t(row.menuName),
    },
  },
  {
    field: 'icon',
    title: '图标',
    width: 80,
    slots: {
      default: ({ row }: { row: SystemMenuApi.Menu }) =>
        row.icon && row.icon !== '#'
          ? h('span', { class: 'flex justify-center' }, [
              h(IconifyIcon, { icon: row.icon }),
            ])
          : '',
    },
  },
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
  {
    field: 'visible',
    title: '显示',
    width: 90,
    slots: {
      default: ({ row }: { row: SystemMenuApi.Menu }) =>
        h(ElTag, { type: row.visible === '0' ? 'success' : 'info' }, () =>
          row.visible === '0' ? '显示' : '隐藏',
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

export function menuFormSchema(): VbenFormSchema<SystemMenuApi.CreateParams>[] {
  return [
    {
      component: 'Input',
      fieldName: 'menuId',
      hide: true,
    },
    {
      component: 'TreeSelect',
      componentProps: {
        checkStrictly: true,
        defaultExpandAll: true,
        filterable: true,
        placeholder: '请选择上级菜单',
        renderAfterExpand: false,
      },
      defaultValue: '0',
      fieldName: 'parentId',
      label: '上级菜单',
      rules: 'selectRequired',
    },
    {
      component: 'RadioGroup',
      componentProps: { isButton: true, options: MENU_TYPE_OPTIONS },
      defaultValue: 'M',
      dependencies: {
        triggerFields: ['menuType'],
        resolve: ({ actions }) => {
          Object.keys(actions.errors).forEach((key) => {
            actions.setFieldError(key, undefined);
          });
          return {};
        },
      },
      fieldName: 'menuType',
      label: '菜单类型',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 100, placeholder: '如 lucide:menu' },
      dependencies: {
        triggerFields: ['menuType', 'icon'],
        resolve: ({ values }) => ({
          show: values.menuType !== 'F',
          renderComponentContent: {
            prepend: () =>
              values.icon && values.icon !== '#'
                ? h(IconifyIcon, { icon: values.icon })
                : null,
            append: () =>
              h(
                'a',
                {
                  href: 'https://icon-sets.iconify.design/',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                },
                '搜索图标',
              ),
          },
        }),
      },
      fieldName: 'icon',
      label: '菜单图标',
      help: '搜索 Iconify 图标并粘贴图标名称',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 64, placeholder: '请输入菜单名称' },
      dependencies: {
        triggerFields: ['menuName'],
        resolve: ({ values }) => ({
          renderComponentContent: {
            append: () =>
              h(
                'span',
                { class: 'text-muted-foreground text-sm' },
                values.menuName ? $t(values.menuName) : '',
              ),
          },
        }),
      },
      fieldName: 'menuName',
      label: '菜单名称',
      help: '支持国际化键名',
      rules: z.string().trim().min(1, '请输入菜单名称').max(64),
    },
    {
      component: 'InputNumber',
      componentProps: { class: 'w-full', min: 0, precision: 0 },
      defaultValue: 1,
      fieldName: 'orderNum',
      label: '显示排序',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 200 },
      dependencies: {
        triggerFields: ['isFrame', 'menuType'],
        resolve: ({ values }) => ({
          componentProps: {
            placeholder:
              values.isFrame === '0'
                ? '请输入 http(s):// 链接'
                : '如 menu、user 或 http(s):// 链接',
          },
          rules:
            values.isFrame === '0'
              ? z.string().regex(/^https?:\/\//, '请输入正确的链接地址')
              : z
                  .string()
                  .min(1, '请输入路由地址')
                  .refine(
                    (value) => !value.startsWith('/'),
                    '路由地址不需要带 / 前缀',
                  ),
          show: values.menuType !== 'F',
        }),
      },
      fieldName: 'path',
      label: '路由地址',
      help: '路由地址不带 / 前缀；链接以 http(s):// 开头',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 255, placeholder: '如 system/menu/index' },
      dependencies: {
        triggerFields: ['menuType'],
        resolve: ({ values }) => ({
          // 当前后端要求所有 C 类型菜单都提交组件路径，包括外链。
          rules: z
            .string()
            .min(1, '请输入组件路径')
            .refine(
              (value) => !value.startsWith('/') && !value.endsWith('/'),
              '组件路径开头和末尾不需要带 /',
            ),
          show: values.menuType === 'C',
        }),
      },
      fieldName: 'component',
      label: '组件路径',
      help: '填写 src/views 下的组件路径，如 system/menu/index',
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
      help: '与后端权限标识一致，如 system:menu:add',
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
      help: '隐藏后不显示在菜单栏，仍可通过路由访问',
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
      help: '停用后不显示在菜单栏，也无法访问',
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
      help: '控制路由的 keepAlive 属性',
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
