<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { MonitorLoginLogApi } from '#/api/monitor/login-log/model';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { ElButton, ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  batchDeleteLoginLogApi,
  clearLoginLogApi,
  deleteLoginLogApi,
  loginLogListApi,
} from '#/api/monitor/login-log';

import { columns, loginLogFormSchema } from './data';
import LoginLogDetailDrawer from './detail-drawer.vue';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
  },
  schema: loginLogFormSchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  fieldMappingTime: [
    [
      'timeRange',
      ['startTime', 'endTime'],
      ['YYYY-MM-DD 00:00:00', 'YYYY-MM-DD 23:59:59'],
    ],
  ],
};

/** 当前勾选的行，用于批量删除 */
const selectedRows = ref<MonitorLoginLogApi.LoginLog[]>([]);

const gridOptions: VxeTableGridOptions = {
  checkboxConfig: {
    highlight: true,
    // 翻页时保留勾选，支持跨页批量删除
    reserve: true,
    trigger: 'row',
  },
  columns,
  height: 'auto',
  id: 'monitor-login-log-index',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        const resp = await loginLogListApi({
          ...formValues,
          page: page.currentPage,
          pageSize: page.pageSize,
        });
        return { items: resp.items, total: resp.meta.total };
      },
    },
  },
  rowConfig: {
    keyField: 'infoId',
  },
  toolbarConfig: {
    search: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid<MonitorLoginLogApi.LoginLog>({
  formOptions,
  gridEvents: {
    checkboxAll: syncSelection,
    checkboxChange: syncSelection,
  },
  gridOptions,
});

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: LoginLogDetailDrawer,
});

/** 同步勾选状态，驱动批量删除按钮的可用性与数量文案 */
function syncSelection() {
  selectedRows.value = gridApi.grid?.getCheckboxRecords() ?? [];
}

/**
 * 刷新列表
 *
 * 先清掉跨页保留的勾选，否则删除完成后已删行仍留在 reserve 集合里，
 * 批量删除按钮会显示错误的条数。
 */
async function refresh() {
  await gridApi.grid?.clearCheckboxReserve?.();
  selectedRows.value = [];
  await gridApi.query();
}

/** 查看详情 */
function handleDetail(row: MonitorLoginLogApi.LoginLog) {
  detailDrawerApi.setData({ record: row });
  detailDrawerApi.open();
}

/** 删除单条 */
async function handleDelete(row: MonitorLoginLogApi.LoginLog) {
  try {
    await ElMessageBox.confirm(
      `确认删除「${row.userName}」于 ${row.loginTime} 的登录记录？`,
      '删除确认',
      {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning',
      },
    );
  } catch {
    // 用户取消
    return;
  }
  await deleteLoginLogApi(row.infoId);
  ElMessage.success('删除成功');
  await refresh();
}

/** 批量删除 */
async function handleBatchDelete() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先勾选要删除的日志');
    return;
  }
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${selectedRows.value.length} 条登录日志？`,
      '批量删除确认',
      {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning',
      },
    );
  } catch {
    // 用户取消
    return;
  }
  await batchDeleteLoginLogApi(selectedRows.value.map((row) => row.infoId));
  ElMessage.success('删除成功');
  await refresh();
}

/** 清空全部 */
async function handleClear() {
  try {
    await ElMessageBox.confirm(
      '清空后无法恢复，确认清空全部登录日志？',
      '清空确认',
      {
        cancelButtonText: '取消',
        confirmButtonText: '确认清空',
        type: 'error',
      },
    );
  } catch {
    // 用户取消
    return;
  }
  await clearLoginLogApi();
  ElMessage.success('已清空');
  await refresh();
}
</script>

<template>
  <Page auto-content-height>
    <Grid
      table-title="登录日志"
      table-title-help="按登录时间倒序，仅保留最近记录"
    >
      <template #toolbar-tools>
        <ElButton
          v-access:code="['system:loginLog:remove']"
          :disabled="selectedRows.length === 0"
          type="danger"
          @click="handleBatchDelete"
        >
          批量删除{{
            selectedRows.length > 0 ? `(${selectedRows.length})` : ''
          }}
        </ElButton>
        <ElButton
          v-access:code="['system:loginLog:remove']"
          type="danger"
          plain
          @click="handleClear"
        >
          清空
        </ElButton>
      </template>
      <template #action="{ row }">
        <ElButton link type="primary" @click="handleDetail(row)">详情</ElButton>
        <ElButton
          v-access:code="['system:loginLog:remove']"
          link
          type="danger"
          @click="handleDelete(row)"
        >
          删除
        </ElButton>
      </template>
    </Grid>
    <DetailDrawer />
  </Page>
</template>
