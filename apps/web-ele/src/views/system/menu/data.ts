import type { MenuFormValues } from './menu-form';

import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridColumns } from '#/adapter/vxe-table';
import type { SystemMenuApi } from '#/api/system/menu/model';

import { listIcons } from '@vben/icons';
import { $t, $te } from '@vben/locales';

import { z } from '#/adapter/form';

export const MENU_TYPE_OPTIONS = [
  { label: '目录', value: 'M', type: 'info' },
  { label: '菜单', value: 'C', type: 'info' },
  { label: '按钮', value: 'F', type: 'danger' },
  { label: '内嵌', value: 'E', type: 'success' },
  { label: '外链', value: 'L', type: 'warning' },
];

export function useColumns(): VxeTableGridColumns<SystemMenuApi.Menu> {
  return [
    {
      field: 'menuName',
      title: '菜单标题',
      fixed: 'left',
      width: 250,
      treeNode: true,
      align: 'left',
      slots: { default: 'title' },
    },
    {
      field: 'menuType',
      title: '类型',
      width: 90,
      cellRender: { name: 'CellTag', props: { options: MENU_TYPE_OPTIONS } },
    },
    { field: 'perms', title: '权限标识', width: 200, align: 'left' },
    { field: 'path', title: '路由地址', width: 200, align: 'left' },
    {
      field: 'component',
      title: '组件',
      minWidth: 220,
      align: 'left',
      formatter: ({ row }: { row: SystemMenuApi.Menu }) => {
        if (row.isFrame === '0') return row.path ?? '';
        if (row.menuType === 'E') return row.meta?.iframeSrc ?? '';
        if (row.menuType === 'L') return row.meta?.link ?? '';
        return row.component ?? '';
      },
    },
    {
      field: 'status',
      title: '状态',
      width: 90,
      cellRender: {
        name: 'CellTag',
        props: {
          options: [
            { label: '启用', value: '0', type: 'success' },
            { label: '停用', value: '1', type: 'danger' },
          ],
        },
      },
    },
    {
      field: 'action',
      fixed: 'right',
      resizable: false,
      slots: { default: 'action' },
      title: '操作',
      width: 220,
    },
  ];
}
function showFor(...types: SystemMenuApi.MenuType[]) {
  return {
    triggerFields: ['menuType'],
    show: (values: Partial<MenuFormValues>) =>
      !!values.menuType && types.includes(values.menuType),
  };
}

/**
 * 本地已注册的全部离线图标快照，共 68 个：
 * - iconify 离线图标（@vben/icons 的 iconify-offline/offline-icons.ts）
 * - 本地 svg 转成的 svg:xxx（@vben/icons 的 svg/load.ts）
 *
 * IconPicker 在 prefix 为空时直接使用这份列表，不会请求 api.iconify.design。
 */
const OFFLINE_ICONS = listIcons();

export function menuFormSchema(): VbenFormSchema<MenuFormValues>[] {
  return [
    { component: 'Input', fieldName: 'menuId', hide: true },
    { component: 'Input', fieldName: 'query', hide: true },
    { component: 'Input', fieldName: 'remark', hide: true },
    {
      component: 'RadioGroup',
      componentProps: { isButton: true, options: MENU_TYPE_OPTIONS },
      defaultValue: 'C',
      fieldName: 'menuType',
      label: '菜单类型',
      rules: 'required',
      formItemClass: 'col-span-2 md:col-span-2',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 100, placeholder: '如 SystemMenu' },
      fieldName: 'routeName',
      label: '菜单名称',
      help: '路由的唯一名称',
      rules: z.string().trim().min(2, '至少输入 2 个字符').max(100),
    },
    {
      component: 'TreeSelect',
      componentProps: {
        checkStrictly: true,
        defaultExpandAll: true,
        filterable: true,
        renderAfterExpand: false,
      },
      defaultValue: '0',
      fieldName: 'parentId',
      label: '上级菜单',
      rules: 'selectRequired',
    },
    {
      component: 'Input',
      componentProps: { maxlength: 64, placeholder: '支持国际化键名' },
      fieldName: 'menuName',
      label: '菜单标题',
      dependencies: {
        triggerFields: ['menuName'],
        resolve: ({ values }) => ({
          renderComponentContent:
            values.menuName && $te(values.menuName)
              ? { append: () => $t(values.menuName) }
              : {},
        }),
      },
      rules: z.string().trim().min(1, '请输入菜单标题').max(64),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 200, placeholder: '如 /system/menu' },
      fieldName: 'path',
      label: '路由地址',
      dependencies: {
        ...showFor('M', 'C', 'E'),
        rules: () =>
          z
            .string()
            .trim()
            .min(1, '请输入路由地址')
            .max(200)
            .refine(
              (value) => !/^\w+:/.test(value),
              '请填写路由路径，链接请填写在链接地址中',
            ),
      },
    },
    {
      component: 'Input',
      componentProps: {
        clearable: true,
        maxlength: 200,
        placeholder: '如 /system/user',
      },
      fieldName: 'meta.activePath',
      label: '激活路径',
      help: '当前页面打开时高亮的菜单路径',
      dependencies: showFor('C', 'E'),
      rules: z.string().optional(),
    },
    {
      component: 'IconPicker',
      componentProps: { prefix: '', icons: OFFLINE_ICONS },
      fieldName: 'icon',
      label: '菜单图标',
      dependencies: showFor('M', 'C', 'E', 'L'),
    },
    {
      component: 'IconPicker',
      componentProps: { prefix: '', icons: OFFLINE_ICONS },
      fieldName: 'meta.activeIcon',
      label: '激活图标',
      dependencies: showFor('M', 'C', 'E'),
    },
    {
      component: 'Input',
      componentProps: {
        clearable: true,
      },
      fieldName: 'component',
      label: '组件路径',
      dependencies: {
        ...showFor('C'),
        rules: (values) => (values.menuType === 'C' ? 'required' : null),
      },
    },
    {
      component: 'Input',
      componentProps: { maxlength: 2000, placeholder: 'https://example.com' },
      fieldName: 'linkSrc',
      label: '链接地址',
      dependencies: showFor('E', 'L'),
      rules: z
        .url('请输入有效链接')
        .refine((value) => /^https?:\/\//i.test(value), '仅支持 HTTP(S) 链接'),
    },
    {
      component: 'Input',
      componentProps: { maxlength: 100, placeholder: '如 system:menu:add' },
      fieldName: 'perms',
      label: '权限标识',
      dependencies: {
        ...showFor('M', 'C', 'E', 'F'),
        rules: (values) =>
          values.menuType === 'F'
            ? z.string().trim().min(1, '请输入权限标识')
            : null,
      },
    },
    {
      component: 'RadioGroup',
      componentProps: {
        isButton: true,
        options: [
          { label: '启用', value: '0' },
          { label: '停用', value: '1' },
        ],
      },
      defaultValue: '0',
      fieldName: 'status',
      label: '状态',
    },
    {
      component: 'InputNumber',
      componentProps: { min: 0, precision: 0 },
      defaultValue: 1,
      fieldName: 'orderNum',
      label: '显示排序',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        options: [
          { label: '点', value: 'dot' },
          { label: '文本', value: 'normal' },
        ],
      },
      fieldName: 'meta.badgeType',
      label: '徽标类型',
      dependencies: showFor('M', 'C', 'E', 'L'),
    },
    {
      component: 'Input',
      componentProps: { clearable: true, maxlength: 100 },
      fieldName: 'meta.badge',
      label: '徽标内容',
      dependencies: {
        ...showFor('M', 'C', 'E', 'L'),
        triggerFields: ['menuType', 'meta.badgeType'],
        disabled: (values) => values.meta?.badgeType !== 'normal',
      },
    },
    {
      component: 'Select',
      componentProps: {
        clearable: true,
        options: [
          'default',
          'destructive',
          'primary',
          'success',
          'warning',
        ].map((value) => ({ label: value, value })),
      },
      fieldName: 'meta.badgeVariants',
      label: '徽标颜色',
      dependencies: showFor('M', 'C', 'E', 'L'),
    },
    {
      component: 'Divider',
      fieldName: 'advancedDivider',
      hideLabel: true,
      formItemClass: 'col-span-2 md:col-span-2',
      renderComponentContent: () => ({ default: () => '高级设置' }),
      dependencies: showFor('M', 'C', 'E', 'L'),
    },
    {
      component: 'Checkbox',
      componentProps: { trueValue: '0', falseValue: '1' },
      defaultValue: '1',
      fieldName: 'isCache',
      hideLabel: true,
      renderComponentContent: () => ({ default: () => '缓存页面' }),
      dependencies: showFor('C'),
    },
    {
      component: 'Checkbox',
      defaultValue: false,
      fieldName: 'meta.affixTab',
      hideLabel: true,
      renderComponentContent: () => ({ default: () => '固定标签页' }),
      dependencies: showFor('C', 'E'),
    },
    {
      component: 'Checkbox',
      componentProps: { trueValue: '1', falseValue: '0' },
      defaultValue: '0',
      fieldName: 'visible',
      hideLabel: true,
      renderComponentContent: () => ({ default: () => '在菜单中隐藏' }),
      dependencies: showFor('M', 'C', 'E', 'L'),
    },
    {
      component: 'Checkbox',
      defaultValue: false,
      fieldName: 'meta.hideChildrenInMenu',
      hideLabel: true,
      renderComponentContent: () => ({ default: () => '隐藏子菜单' }),
      dependencies: showFor('M', 'C'),
    },
    {
      component: 'Checkbox',
      defaultValue: false,
      fieldName: 'meta.hideInBreadcrumb',
      hideLabel: true,
      renderComponentContent: () => ({ default: () => '在面包屑中隐藏' }),
      dependencies: showFor('M', 'C', 'E'),
    },
    {
      component: 'Checkbox',
      defaultValue: false,
      fieldName: 'meta.hideInTab',
      hideLabel: true,
      renderComponentContent: () => ({ default: () => '在标签栏中隐藏' }),
      dependencies: showFor('M', 'C', 'E'),
    },
  ];
}
