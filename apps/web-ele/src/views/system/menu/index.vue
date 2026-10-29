<script lang="ts" setup>
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { SystemMenuApi } from '#/api/system/menu/model';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';
import { eachTree, listToTree } from '@vben/utils';

import { ElButton, ElMessage, ElMessageBox, ElTag } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteMenuApi, menuListApi } from '#/api/system/menu';

import { useColumns } from './data';
import MenuDrawer from './menu-drawer.vue';

const allExpanded = ref(false);

const gridOptions: VxeGridProps = {
  columns: useColumns(),
  height: 'auto',
  id: 'system-menu-index',
  keepSource: true,
  pagerConfig: { enabled: false },
  proxyConfig: {
    ajax: {
      query: async (_, formValues = {}) => {
        const items = await menuListApi(formValues);
        const treeData = listToTree<SystemMenuApi.Menu>(items, {
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
  rowConfig: { keyField: 'menuId', isCurrent: true },
  treeConfig: {
    parentField: 'parentId',
    rowField: 'menuId',
    hasChildField: 'hasChildren',
    transform: false,
    reserve: true,
    lazy: true,
    loadMethod: ({ row }) => row.children ?? [],
  },
};

const [Grid, gridApi] = useVbenVxeGrid<SystemMenuApi.Menu>({
  gridEvents: {
    cellDblclick: ({ row }: { row: SystemMenuApi.Menu }) => {
      gridApi.grid?.toggleTreeExpand(row);
    },
  },
  gridOptions,
});

const [Drawer, drawerApi] = useVbenDrawer<{
  id?: string;
  update: boolean;
}>({ connectedComponent: MenuDrawer });

function handleCreate(parentId?: string) {
  drawerApi.setData({ id: parentId, update: false });
  drawerApi.open();
}

function handleEdit(row: SystemMenuApi.Menu) {
  drawerApi.setData({ id: row.menuId, update: true });
  drawerApi.open();
}

async function handleDelete(row: SystemMenuApi.Menu) {
  try {
    await ElMessageBox.confirm(
      `确认删除菜单「${$t(row.menuName)}」？`,
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
}

function badgeTagType(variant?: string) {
  if (variant === 'destructive') return 'danger';
  if (variant === 'success' || variant === 'warning' || variant === 'primary')
    return variant;
  return 'info';
}

function badgeColor(variant?: string) {
  return (
    {
      destructive: 'bg-destructive',
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
    }[variant ?? ''] ?? 'bg-primary'
  );
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
      <template #title="{ row }">
        <div class="flex items-center gap-2">
          <IconifyIcon
            class="size-4 shrink-0"
            :icon="
              row.menuType === 'F'
                ? 'lucide:shield-check'
                : row.icon && row.icon !== '#'
                  ? row.icon
                  : 'lucide:circle-dashed'
            "
          />
          <span class="truncate">{{ $t(row.menuName) }}</span>
          <span
            v-if="row.meta?.badgeType === 'dot'"
            class="ml-auto size-2 shrink-0 rounded-full"
            :class="badgeColor(row.meta.badgeVariants)"
          ></span>
          <ElTag
            v-else-if="row.meta?.badgeType === 'normal' && row.meta.badge"
            size="small"
            class="ml-auto shrink-0"
            :type="badgeTagType(row.meta.badgeVariants)"
          >
            {{ row.meta.badge }}
          </ElTag>
        </div>
      </template>
      <template #action="{ row }">
        <ElButton
          v-if="['M', 'C'].includes(row.menuType) && row.isFrame !== '0'"
          v-access:code="['system:menu:add']"
          link
          type="primary"
          @click="handleCreate(row.menuId)"
        >
          新增下级
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
