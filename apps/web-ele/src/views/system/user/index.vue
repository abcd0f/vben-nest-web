<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api/system/user/model';

import { onMounted, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { ElButton, ElMessage, ElMessageBox, ElSwitch } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deptListApi } from '#/api/system/dept';
import { deleteUserApi, updateUserApi, userListApi } from '#/api/system/user';
import DeptTree from '#/views/system/dept/dept-tree.vue';

import { columns, userSearchFormSchema } from './data';
import ResetPasswordModal from './reset-password-modal.vue';
import UserDrawerContent from './user-drawer.vue';

/** 抽屉入参 */
interface UserDrawerData {
  deptId?: string;
  update: boolean;
  userId?: string;
}

/** 重置密码弹窗入参 */
interface ResetPasswordData {
  record?: SystemUserApi.User;
}

const { hasAccessByCodes } = useAccess();

/** 左侧部门树当前选中项，只用于高亮 */
const selectedDeptId = ref<number | string>();
/** 实际参与查询的部门过滤条件；根部门视为「全部」 */
const filterDeptId = ref<string>();
/** 部门 ID → 部门名称，列表里 `deptId` 只回 ID */
const departmentNames = ref<Record<string, string>>({});

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
  },
  schema: userSearchFormSchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  // 重置时同时清掉部门树筛选，否则条件看着是空的、结果却还是某个部门的
  async handleReset() {
    selectedDeptId.value = undefined;
    filterDeptId.value = undefined;
    const { formApi } = gridApi;
    await formApi.reset();
    // query 取的是「最后一次提交的值」，重置后必须同步一次，否则仍按旧条件查
    formApi.setLatestSubmissionValues(await formApi.getValues());
    await gridApi.query();
  },
};

const gridOptions: VxeTableGridOptions = {
  columns,
  height: 'auto',
  id: 'system-user-index',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return userListApi({
          ...formValues,
          ...(filterDeptId.value ? { deptId: filterDeptId.value } : {}),
          page: page.currentPage,
          pageSize: page.pageSize,
        });
      },
    },
  },
  rowConfig: {
    keyField: 'userId',
  },
};

const [Grid, gridApi] = useVbenVxeGrid<SystemUserApi.User>({
  formOptions,
  gridOptions,
});

const [UserDrawer, drawerApi] = useVbenDrawer<UserDrawerData>({
  connectedComponent: UserDrawerContent,
});

const [ResetPassword, resetPasswordApi] = useVbenModal<ResetPasswordData>({
  connectedComponent: ResetPasswordModal,
});

async function loadDepartmentNames() {
  try {
    const departments = await deptListApi();
    departmentNames.value = Object.fromEntries(
      departments.map(({ deptId, deptName }) => [deptId, deptName]),
    );
  } catch (error) {
    console.error('[system/user] 加载部门名称失败', error);
  }
}

/**
 * 部门树点击
 *
 * 后端 `ListUserDto.deptId` 是精确匹配、不含子部门；根部门（parentId 为 "0"）
 * 下通常不直接挂用户，因此按「全部」处理，避免点一下整张表变空。
 */
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

function handleEdit(row: SystemUserApi.User) {
  drawerApi.setData({ update: true, userId: row.userId });
  drawerApi.open();
}

function handleResetPassword(row: SystemUserApi.User) {
  resetPasswordApi.setData({ record: row });
  resetPasswordApi.open();
}

/**
 * 状态开关
 *
 * 后端没有独立的状态接口，直接走 `PUT /system/user` 只传 `userId + status`，
 * 其余字段不传即保持原值。
 */
async function handleStatusChange(row: SystemUserApi.User, checked: boolean) {
  try {
    await updateUserApi({
      status: checked ? '0' : '1',
      userId: row.userId,
    });
    ElMessage.success(checked ? '已启用' : '已停用');
  } catch (error) {
    console.error('[system/user] 修改用户状态失败', error);
  } finally {
    // 失败时也要刷一次，把开关拨回真实状态
    await gridApi.query();
  }
}

async function handleDelete(row: SystemUserApi.User) {
  try {
    await ElMessageBox.confirm(
      `确认删除用户「${row.userName}」？`,
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

  await deleteUserApi(row.userId);
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
    <Grid class="min-w-0 flex-1 overflow-hidden" table-title="用户列表">
      <template #toolbar-tools>
        <ElButton
          v-access:code="['system:user:add']"
          type="primary"
          @click="handleCreate"
        >
          新增用户
        </ElButton>
      </template>
      <template #department="{ row }">
        {{ row.deptId ? departmentNames[row.deptId] || row.deptId : '未分配' }}
      </template>
      <template #status="{ row }">
        <ElSwitch
          :disabled="!hasAccessByCodes(['system:user:edit'])"
          :model-value="row.status === '0'"
          @change="(val) => handleStatusChange(row, Boolean(val))"
        />
      </template>
      <template #action="{ row }">
        <ElButton
          v-access:code="['system:user:edit']"
          link
          type="primary"
          @click="handleEdit(row)"
        >
          编辑
        </ElButton>
        <ElButton
          v-access:code="['system:user:resetPwd']"
          link
          type="primary"
          @click="handleResetPassword(row)"
        >
          重置密码
        </ElButton>
        <ElButton
          v-access:code="['system:user:remove']"
          link
          type="danger"
          @click="handleDelete(row)"
        >
          删除
        </ElButton>
      </template>
    </Grid>
    <UserDrawer @reload="gridApi.query()" />
    <ResetPassword @reload="gridApi.query()" />
  </Page>
</template>
