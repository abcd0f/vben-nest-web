<script lang="ts" setup>
import type { UserFormValues } from './data';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getDeptTree } from '#/api/system/dept';
import { postListApi } from '#/api/system/post';
import { roleOptionListApi } from '#/api/system/role';
import {
  createUserApi,
  updateUserApi,
  userAssignedIdsApi,
  userInfoApi,
} from '#/api/system/user';

import { toDeptTreeOptions, userFormSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

/** 抽屉入参 */
interface UserDrawerData {
  /** 新增时预填的部门 ID */
  deptId?: string;
  /** true 编辑，false 新增 */
  update: boolean;
  /** 编辑时的用户 ID */
  userId?: string;
}

/** 后端分页上限，取满页当作全量岗位选项 */
const POST_OPTION_PAGE_SIZE = 200;

const isUpdate = ref(false);
const currentUserId = ref<string>();
const title = computed(() => (isUpdate.value ? '编辑用户' : '新增用户'));

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 90,
  },
  schema: userFormSchema(false),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

/**
 * 按部门加载岗位选项
 *
 * 后端 `ListPostDto.deptId` 是精确筛选，切换部门后原选项全部失效。
 */
async function setupPostOptions(deptId?: null | string) {
  if (!deptId) {
    formApi.updateSchema([
      {
        componentProps: {
          options: [],
          placeholder: '请先选择部门',
        },
        fieldName: 'postIds',
      },
    ]);
    return;
  }

  try {
    const resp = await postListApi({
      deptId,
      page: 1,
      pageSize: POST_OPTION_PAGE_SIZE,
      status: '0',
    });
    formApi.updateSchema([
      {
        componentProps: {
          options: resp.items.map((item) => ({
            label: item.postName,
            value: item.postId,
          })),
          placeholder: resp.items.length > 0 ? '请选择' : '该部门下暂无岗位',
        },
        fieldName: 'postIds',
      },
    ]);
  } catch (error) {
    console.error('[system/user] 加载岗位选项失败', error);
  }
}

/** 加载部门树与角色选项 */
async function setupStaticOptions() {
  const [departments, roles] = await Promise.all([
    getDeptTree(),
    roleOptionListApi(),
  ]);

  formApi.updateSchema([
    {
      componentProps: {
        data: toDeptTreeOptions(departments),
        async onChange(deptId?: null | string) {
          // 部门变了，岗位必须重选，否则会提交到新部门下不存在的岗位
          await formApi.setFieldValue('postIds', []);
          await setupPostOptions(deptId ?? null);
        },
      },
      fieldName: 'deptId',
    },
    {
      componentProps: {
        options: roles.items.map((item) => ({
          label: item.roleName,
          value: item.roleId,
        })),
      },
      fieldName: 'roleIds',
    },
  ]);
}

function buildPayload(values: UserFormValues) {
  return {
    deptId: values.deptId || null,
    email: values.email?.trim() || null,
    nickName: values.nickName.trim(),
    phoneNumber: values.phoneNumber?.trim() || null,
    postIds: values.postIds ?? [],
    remark: values.remark?.trim() || null,
    roleIds: values.roleIds ?? [],
    sex: values.sex ?? '2',
    status: values.status ?? '0',
  };
}

async function handleConfirm() {
  drawerApi.lock(true);
  try {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }

    const values = (await formApi.getValues()) as UserFormValues;
    const payload = buildPayload(values);

    await (isUpdate.value && currentUserId.value
      ? updateUserApi({ ...payload, userId: currentUserId.value })
      : createUserApi({
          ...payload,
          password: values.password ?? '',
          userName: values.userName.trim(),
        }));

    emit('reload');
    drawerApi.close();
  } catch (error) {
    console.error('[system/user] 保存用户失败', error);
  } finally {
    drawerApi.lock(false);
  }
}

async function handleClosed() {
  await formApi.reset();
  formApi.setState({ schema: userFormSchema(false) });
}

const [Drawer, drawerApi] = useVbenDrawer({
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }

    const { deptId, update, userId } = (drawerApi.getData() ??
      {}) as UserDrawerData;
    isUpdate.value = !!update;
    currentUserId.value = userId;
    drawerApi.lock(true);

    try {
      // 编辑态不渲染密码框、账号只读，schema 必须整份重建
      formApi.setState({ schema: userFormSchema(isUpdate.value) });

      await setupStaticOptions();

      if (isUpdate.value && userId) {
        const [detail, assigned] = await Promise.all([
          userInfoApi(userId),
          userAssignedIdsApi(userId),
        ]);
        await formApi.setValues({
          deptId: detail.deptId ?? '',
          email: detail.email ?? '',
          nickName: detail.nickName,
          phoneNumber: detail.phoneNumber ?? '',
          postIds: assigned.postIds,
          remark: detail.remark ?? '',
          roleIds: assigned.roleIds,
          sex: detail.sex ?? '2',
          status: detail.status,
          userId: detail.userId,
          userName: detail.userName,
        });
        // 编辑时不会触发 TreeSelect 的 onChange，岗位选项要手动加载
        await setupPostOptions(detail.deptId);
      } else {
        await formApi.setValues({
          deptId: deptId ?? '',
          email: '',
          nickName: '',
          password: '',
          phoneNumber: '',
          postIds: [],
          remark: '',
          roleIds: [],
          sex: '2',
          status: '0',
          userId: '',
          userName: '',
        });
      }
    } catch (error) {
      console.error('[system/user] 初始化用户表单失败', error);
    } finally {
      drawerApi.lock(false);
    }
  },
});
</script>

<template>
  <Drawer :title="title" class="w-[640px]">
    <Form />
  </Drawer>
</template>
