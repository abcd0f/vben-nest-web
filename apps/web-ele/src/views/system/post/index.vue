<script setup lang="ts">
import type { VbenFormProps } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemPostApi } from '#/api/system/post/model';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { ElButton, ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deptListApi } from '#/api/system/dept';
import { deletePostApi, postListApi } from '#/api/system/post';
import DeptTree from '#/views/system/dept/dept-tree.vue';

import { columns, postSearchFormSchema } from './data';
import PostDrawerContent from './post-drawer.vue';

interface PostDrawerData {
  deptId?: string;
  postId?: string;
  update: boolean;
}

const selectedDeptId = ref<number | string>();
const filterDeptId = ref<string>();
const departmentNames = ref<Record<string, string>>({});

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
  },
  schema: postSearchFormSchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeTableGridOptions = {
  columns,
  height: 'auto',
  id: 'system-post-index',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return postListApi({
          ...formValues,
          ...(filterDeptId.value ? { deptId: filterDeptId.value } : {}),
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  rowConfig: {
    keyField: 'postId',
  },
};

const [Grid, gridApi] = useVbenVxeGrid<SystemPostApi.Post>({
  formOptions,
  gridOptions,
});

const [PostDrawer, drawerApi] = useVbenDrawer<PostDrawerData>({
  connectedComponent: PostDrawerContent,
});

async function loadDepartmentNames() {
  try {
    const departments = await deptListApi();
    departmentNames.value = Object.fromEntries(
      departments.map(({ deptId, deptName }) => [deptId, deptName]),
    );
  } catch (error) {
    console.error('[system/post] 加载部门名称失败', error);
  }
}

function handleDeptSelect(
  deptId: number | string | undefined,
  parentId: number | string,
) {
  filterDeptId.value = String(parentId) === '0' ? undefined : String(deptId);
  void gridApi.query();
}

async function handleDeptReload() {
  filterDeptId.value = undefined;
  await Promise.all([gridApi.query(), loadDepartmentNames()]);
}

function handleCreate() {
  drawerApi.setData({ deptId: filterDeptId.value, update: false });
  drawerApi.open();
}

function handleEdit(row: SystemPostApi.Post) {
  drawerApi.setData({ postId: row.postId, update: true });
  drawerApi.open();
}

async function handleDelete(row: SystemPostApi.Post) {
  try {
    await ElMessageBox.confirm(
      `确认删除岗位「${row.postName}」？`,
      '删除确认',
      {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        type: 'warning',
      },
    );
  } catch {
    return;
  }

  await deletePostApi(row.postId);
  ElMessage.success('删除成功');
  await gridApi.query();
}

onMounted(loadDepartmentNames);
</script>

<template>
  <Page auto-content-height content-class="flex w-full gap-3">
    <DeptTree
      v-model:select-dept-id="selectedDeptId"
      class="w-60 shrink-0 overflow-hidden"
      @reload="handleDeptReload"
      @select="handleDeptSelect"
    />
    <Grid class="min-w-0 flex-1 overflow-hidden" table-title="岗位列表">
      <template #toolbar-tools>
        <ElButton
          v-access:code="['system:post:add']"
          type="primary"
          @click="handleCreate"
        >
          新增岗位
        </ElButton>
      </template>
      <template #department="{ row }">
        {{ row.deptId ? departmentNames[row.deptId] || row.deptId : '未分配' }}
      </template>
      <template #action="{ row }">
        <ElButton
          v-access:code="['system:post:edit']"
          link
          type="primary"
          @click="handleEdit(row)"
        >
          编辑
        </ElButton>
        <ElButton
          v-access:code="['system:post:remove']"
          link
          type="danger"
          @click="handleDelete(row)"
        >
          删除
        </ElButton>
      </template>
    </Grid>
    <PostDrawer @reload="gridApi.query()" />
  </Page>
</template>
