<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { SystemMenuApi } from '#/api/system/menu/model';

import { nextTick, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { eachTree, listToTree } from '@vben/utils';

import { ElButton, ElMessage, ElMessageBox } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteMenuApi, menuListApi } from '#/api/system/menu';

import { columns, menuSearchFormSchema } from './data';
import MenuDrawer from './menu-drawer.vue';

const allExpanded = ref(true);

const formOptions: VbenFormProps = {
  commonConfig: { componentProps: { clearable: true }, labelWidth: 80 },
  schema: menuSearchFormSchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const gridOptions: VxeGridProps = {
  columns,
  height: 'auto',
  id: 'system-menu-index',
  keepSource: true,
  pagerConfig: { enabled: false },
  proxyConfig: {
    ajax: {
      query: async (_, formValues = {}) => {
        const items = await menuListApi(formValues);
        const treeData = listToTree(items, {
          id: 'menuId',
          pid: 'parentId',
        });
        eachTree(treeData, (item) => {
          item.hasChildren = !!item.children?.length;
        });
        return { items: treeData };
      },
    },
  },
  rowConfig: { keyField: 'menuId' },
  treeConfig: {
    expandAll: true,
    parentField: 'parentId',
    rowField: 'menuId',
    hasChildField: 'hasChildren',
    transform: false,
  },
};

const [Grid, gridApi] = useVbenVxeGrid<SystemMenuApi.Menu>({
  formOptions,
  gridEvents: {
    cellDblclick: ({ row }: { row: SystemMenuApi.Menu }) => {
      gridApi.grid?.toggleTreeExpand(row);
    },
  },
  gridOptions,
});

const [Drawer, drawerApi] = useVbenDrawer<{
  menuId?: string;
  parentId?: string;
  update: boolean;
}>({ connectedComponent: MenuDrawer });

function handleCreate(parentId?: string) {
  drawerApi.setData({ parentId, update: false });
  drawerApi.open();
}

function handleCreateChild(row: SystemMenuApi.Menu) {
  if (row.menuType === 'F') {
    return;
  }
  handleCreate(row.menuId);
}

function handleEdit(row: SystemMenuApi.Menu) {
  drawerApi.setData({ menuId: row.menuId, update: true });
  drawerApi.open();
}

async function handleDelete(row: SystemMenuApi.Menu) {
  try {
    await ElMessageBox.confirm(
      `确认删除菜单「${row.menuName}」？后端会拒绝删除仍有子菜单或角色授权的节点。`,
      '删除确认',
      { cancelButtonText: '取消', confirmButtonText: '确定', type: 'warning' },
    );
    await deleteMenuApi(row.menuId);
    ElMessage.success('删除成功');
    await gridApi.query();
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('[system/menu] 删除菜单失败', error);
    }
  }
}

async function toggleExpandAll() {
  allExpanded.value = !allExpanded.value;
  await gridApi.grid?.setAllTreeExpand(allExpanded.value);
}

async function handleReload() {
  await gridApi.query();
  await nextTick();
  await gridApi.grid?.setAllTreeExpand(allExpanded.value);
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="菜单列表" table-title-help="双击行可展开或收起子菜单">
      <template #toolbar-tools>
        <ElButton @click="toggleExpandAll">
          {{ allExpanded ? '折叠全部' : '展开全部' }}
        </ElButton>
        <ElButton
          v-access:code="['system:menu:add']"
          type="primary"
          @click="handleCreate()"
        >
          新增菜单
        </ElButton>
      </template>
      <template #action="{ row }">
        <ElButton
          v-if="row.menuType !== 'F'"
          v-access:code="['system:menu:add']"
          link
          type="primary"
          @click="handleCreateChild(row)"
        >
          新增子级
        </ElButton>
        <ElButton
          v-access:code="['system:menu:edit']"
          link
          type="primary"
          @click="handleEdit(row)"
        >
          编辑
        </ElButton>
        <ElButton
          v-access:code="['system:menu:remove']"
          link
          type="danger"
          @click="handleDelete(row)"
        >
          删除
        </ElButton>
      </template>
    </Grid>
    <Drawer @reload="handleReload" />
  </Page>
</template>
