import type { VbenFormSchema } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { MonitorOperLogApi } from '#/api/monitor/oper-log/model';

import { h } from 'vue';

import { ElTag } from 'element-plus';

import { z } from '#/adapter/form';

/** 请求方式对应的标签颜色 */
const METHOD_TAG_TYPE: Record<
  string,
  'danger' | 'info' | 'success' | 'warning'
> = {
  DELETE: 'danger',
  GET: 'info',
  PATCH: 'warning',
  POST: 'success',
  PUT: 'warning',
};

/** 操作日志列表列配置 */
export const columns: VxeGridProps['columns'] = [
  {
    type: 'checkbox',
    fixed: 'left',
    width: 50,
  },
  {
    field: 'title',
    minWidth: 140,
    title: '模块标题',
  },
  {
    field: 'requestMethod',
    slots: {
      default: ({ row }: { row: MonitorOperLogApi.OperLog }) =>
        h(
          ElTag,
          { type: METHOD_TAG_TYPE[row.requestMethod ?? ''] ?? 'info' },
          () => row.requestMethod || '-',
        ),
    },
    title: '请求方式',
    width: 100,
  },
  {
    field: 'operUserId',
    slots: {
      default: ({ row }: { row: MonitorOperLogApi.OperLog }) =>
        row.operUserId || '-',
    },
    title: '操作人ID',
    width: 110,
  },
  {
    field: 'operUrl',
    minWidth: 220,
    title: '请求地址',
  },
  {
    field: 'operIp',
    minWidth: 150,
    title: '操作 IP',
  },
  {
    field: 'status',
    slots: {
      default: ({ row }: { row: MonitorOperLogApi.OperLog }) =>
        h(ElTag, { type: row.status === '0' ? 'success' : 'danger' }, () =>
          row.status === '0' ? '成功' : '失败',
        ),
    },
    title: '状态',
    width: 90,
  },
  {
    field: 'costTime',
    slots: {
      default: ({ row }: { row: MonitorOperLogApi.OperLog }) =>
        `${row.costTime} ms`,
    },
    title: '耗时',
    width: 100,
  },
  {
    field: 'operTime',
    title: '操作时间',
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
 * 操作日志搜索表单
 *
 * 操作人只能按用户 ID 精确筛选：后端 `oper_user_id` 是外键裸字段，
 * 响应 DTO 里也不带昵称，没有可用的姓名搜索。
 */
export function operLogFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      componentProps: {
        clearable: true,
        placeholder: '请输入模块标题',
      },
      fieldName: 'title',
      label: '模块标题',
    },
    {
      component: 'Input',
      componentProps: {
        clearable: true,
        placeholder: '请输入操作人用户 ID',
      },
      fieldName: 'operUserId',
      label: '操作人ID',
      // 后端 operUserId 会走 parseId 转 BigInt，非数字直接 400，前端先拦掉
      rules: z.string().regex(/^\d*$/, '只能输入数字').optional(),
    },
    {
      component: 'DatePicker',
      componentProps: {
        clearable: true,
        endPlaceholder: '结束日期',
        startPlaceholder: '开始日期',
        type: 'daterange',
        unlinkPanels: true,
        valueFormat: 'x',
      },
      fieldName: 'timeRange',
      label: '操作时间',
    },
  ];
}
