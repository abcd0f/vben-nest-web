<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { SystemDeptApi } from '#/api/system/dept/model';

import { nextTick, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { ElButton, ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteDeptApi, deptListApi } from '#/api/system/dept';

import { columns } from './data';
import DeptDrawerContent from './dept-drawer.vue';

/** 抽屉入参 */
interface DeptDrawerData {
  /** 新增时的父部门 ID；编辑时为目标部门 ID */
  deptId?: string;
  /** true 编辑，false 新增 */
  update: boolean;
}

/** 全部展开状态，只用来切换按钮文案；数据每次加载完都会重置为「已全部展开」 */
const allExpanded = ref(true);

/**
 * 部门列表直接用后端返回的平级数组
 *
 * 后端 `/system/dept/list` 不分页，每行只带 `parentId`，
 * 层级关系交给 vxe 的 `treeConfig.transform` 在渲染时还原。
 */
const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  id: 'system-dept-index',
  keepSource: true,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      // 后端不分页，直接返回平级数组
      query: async (_, formValues = {}) => {
        const resp = await deptListApi({
          ...formValues,
        });
        return { items: resp };
      },
      // 默认展开全部：数据加载完成后展开所有节点，并同步按钮文案
      querySuccess: () => {
        allExpanded.value = true;
        // 等 vxe 把平级数据转成树并渲染完再展开，否则拿不到子节点
        nextTick(() => {
          gridApi.grid?.setAllTreeExpand(true);
        });
      },
    },
  },
  rowConfig: {
    keyField: 'deptId',
  },
  treeConfig: {
    // 默认展开全部
    expandAll: true,
    parentField: 'parentId',
    rowField: 'deptId',
    transform: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid<SystemDeptApi.Dept>({
  gridEvents: {
    // 双击行展开/收起子部门
    cellDblclick: ({ row }: { row: SystemDeptApi.Dept }) => {
      gridApi.grid?.toggleTreeExpand(row);
    },
  },
  gridOptions,
});

const [DeptDrawer, drawerApi] = useVbenDrawer<DeptDrawerData>({
  connectedComponent: DeptDrawerContent,
});

/** 展开/折叠全部：一个按钮来回切 */
async function toggleExpandAll() {
  allExpanded.value = !allExpanded.value;
  await gridApi.grid?.setAllTreeExpand(allExpanded.value);
}

/** 新增部门；传 row 表示在该部门下新增子部门 */
function handleCreate(row?: SystemDeptApi.Dept) {
  drawerApi.setData({ deptId: row?.deptId, update: false });
  drawerApi.open();
}

/** 编辑部门 */
function handleEdit(row: SystemDeptApi.Dept) {
  drawerApi.setData({ deptId: row.deptId, update: true });
  drawerApi.open();
}

/** 删除部门 */
async function handleDelete(row: SystemDeptApi.Dept) {
  try {
    await ElMessageBox.confirm(
      `确认删除部门「${row.deptName}」？`,
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
  await deleteDeptApi(row.deptId);
  ElMessage.success('删除成功');
  await gridApi.query();
}

/** 抽屉保存成功后刷新列表 */
async function handleReload() {
  await gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="部门列表" table-title-help="双击行可展开/收起子部门">
      <template #toolbar-tools>
        <ElButton @click="toggleExpandAll">
          {{ allExpanded ? '折叠全部' : '展开全部' }}
        </ElButton>

        <ElButton
          v-access:code="['system:dept:add']"
          type="primary"
          @click="handleCreate()"
        >
          新增
        </ElButton>
      </template>
      <template #action="{ row }">
        <ElButton
          v-access:code="['system:dept:add']"
          link
          type="primary"
          @click="handleCreate(row)"
        >
          新增子级
        </ElButton>
        <ElButton
          v-access:code="['system:dept:edit']"
          link
          type="primary"
          @click="handleEdit(row)"
        >
          编辑
        </ElButton>
        <ElButton
          v-access:code="['system:dept:remove']"
          link
          type="danger"
          @click="handleDelete(row)"
        >
          删除
        </ElButton>
      </template>
    </Grid>
    <DeptDrawer @reload="handleReload" />
  </Page>
</template>
