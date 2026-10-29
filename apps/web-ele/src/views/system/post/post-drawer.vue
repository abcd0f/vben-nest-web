<script setup lang="ts">
import type { PostDeptOption } from './data';

import type { Status } from '#/api/common';
import type { SystemDeptApi } from '#/api/system/dept/model';
import type { SystemPostApi } from '#/api/system/post/model';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getDeptTree } from '#/api/system/dept';
import { createPostApi, postInfoApi, updatePostApi } from '#/api/system/post';

import { postFormSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

interface PostDrawerData {
  deptId?: string;
  postId?: string;
  update: boolean;
}

interface PostFormValues {
  deptId?: null | string;
  orderNum: number;
  postCode: string;
  postName: string;
  remark?: null | string;
  status: Status;
}

function buildDeptOptions(
  departments: SystemDeptApi.DeptTree[],
): PostDeptOption[] {
  return departments.map((department) => ({
    children: department.children
      ? buildDeptOptions(department.children)
      : undefined,
    disabled: department.disabled,
    label: department.label,
    value: String(department.id),
  }));
}

const isUpdate = ref(false);
const currentPostId = ref<string>();
const title = computed(() => (isUpdate.value ? '编辑岗位' : '新增岗位'));

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  schema: postFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

async function handleConfirm() {
  drawerApi.lock(true);
  try {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }

    const values = (await formApi.getValues()) as PostFormValues;
    const payload: SystemPostApi.CreateParams = {
      deptId: values.deptId || null,
      orderNum: values.orderNum,
      postCode: values.postCode.trim(),
      postName: values.postName.trim(),
      remark: values.remark?.trim() || null,
      status: values.status,
    };

    isUpdate.value && currentPostId.value
      ? await updatePostApi({ ...payload, postId: currentPostId.value })
      : await createPostApi(payload);

    emit('reload');
    drawerApi.close();
  } catch (error) {
    console.error('[system/post] 保存岗位失败', error);
  } finally {
    drawerApi.lock(false);
  }
}

async function handleClosed() {
  await formApi.reset();
}

const [Drawer, drawerApi] = useVbenDrawer({
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }

    const { deptId, postId, update } = (drawerApi.getData() ??
      {}) as PostDrawerData;
    isUpdate.value = !!update;
    currentPostId.value = postId;
    drawerApi.lock(true);
    try {
      const departments = await getDeptTree();
      formApi.updateSchema([
        {
          component: 'TreeSelect',
          componentProps: {
            data: buildDeptOptions(departments),
          },
          fieldName: 'deptId',
        },
      ]);

      if (isUpdate.value && postId) {
        const detail = await postInfoApi(postId);
        await formApi.setValues({
          deptId: detail.deptId ?? '',
          orderNum: detail.orderNum,
          postCode: detail.postCode,
          postName: detail.postName,
          remark: detail.remark ?? '',
          status: detail.status,
        });
      } else {
        await formApi.setValues({
          deptId: deptId ?? '',
          orderNum: 0,
          postCode: '',
          postName: '',
          remark: '',
          status: '0',
        });
      }
    } catch (error) {
      console.error('[system/post] 初始化岗位表单失败', error);
    } finally {
      drawerApi.lock(false);
    }
  },
});
</script>

<template>
  <Drawer :title="title" class="w-[560px]">
    <Form />
  </Drawer>
</template>
