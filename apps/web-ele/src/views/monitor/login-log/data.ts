import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { MonitorLoginLogApi } from '#/api/monitor/login-log/model';

import { h } from 'vue';

import { ElTag } from 'element-plus';

/** 登录日志列表列配置 */
export const columns: VxeGridProps['columns'] = [
  {
    type: 'checkbox',
    fixed: 'left',
    width: 50,
  },
  {
    field: 'userName',
    minWidth: 140,
    title: '登录账号',
  },
  {
    field: 'ipaddr',
    minWidth: 150,
    title: '登录 IP',
  },
  {
    field: 'status',
    slots: {
      default: ({ row }: { row: MonitorLoginLogApi.LoginLog }) =>
        h(ElTag, { type: row.status === '0' ? 'success' : 'danger' }, () =>
          row.status === '0' ? '成功' : '失败',
        ),
    },
    title: '状态',
    width: 90,
  },
  {
    field: 'msg',
    minWidth: 160,
    title: '提示消息',
  },
  {
    field: 'userAgent',
    minWidth: 220,
    title: '客户端',
  },
  {
    field: 'loginTime',
    title: '登录时间',
    width: 170,
  },
  {
    field: 'action',
    fixed: 'right',
    resizable: false,
    slots: { default: 'action' },
    title: '操作',
    width: 140,
  },
];

/**
 * 登录日志搜索表单
 *
 * 时间区间用 `timeRange` 单个字段承载，提交时由页面转成
 * `startTime` / `endTime`（见 `../shared.ts` 的 `toIsoTimeRange`）。
 */
export function loginLogFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        clearable: true,
        placeholder: '请输入登录账号',
      },
      fieldName: 'userName',
      label: '登录账号',
    },
    {
      component: 'Input',
      componentProps: {
        clearable: true,
        placeholder: '请输入登录 IP',
      },
      fieldName: 'ipaddr',
      label: '登录 IP',
    },
    {
      component: 'DatePicker',
      componentProps: {
        clearable: true,
        endPlaceholder: '结束日期',
        startPlaceholder: '开始日期',
        type: 'daterange',
        unlinkPanels: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
      fieldName: 'timeRange',
      label: '登录时间',
    },
  ];
}
