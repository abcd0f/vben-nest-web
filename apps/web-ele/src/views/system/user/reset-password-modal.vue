<script lang="ts" setup>
import type { SystemUserApi } from '#/api/system/user/model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { ElDescriptions, ElDescriptionsItem } from 'element-plus';

import { useVbenForm, z } from '#/adapter/form';
import { resetUserPasswordApi } from '#/api/system/user';

const emit = defineEmits<{ reload: [] }>();

/** 弹窗入参 */
interface ResetPasswordData {
  record?: SystemUserApi.User;
}

const currentUser = ref<null | SystemUserApi.User>(null);

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 90,
  },
  schema: [
    {
      component: 'Input',
      componentProps: {
        maxlength: 255,
        placeholder: '6~255 位',
        showPassword: true,
        type: 'password',
      },
      fieldName: 'newPassword',
      label: '新密码',
      rules: z
        .string()
        .min(6, '密码至少 6 位')
        .max(255, '密码最多 255 位'),
    },
    {
      component: 'Input',
      componentProps: {
        maxlength: 255,
        placeholder: '再次输入新密码',
        showPassword: true,
        type: 'password',
      },
      fieldName: 'confirmPassword',
      label: '确认密码',
      rules: 'required',
    },
  ],
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

async function handleConfirm() {
  const user = currentUser.value;
  if (!user) {
    return;
  }

  modalApi.lock(true);
  try {
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }

    const { confirmPassword, newPassword } = (await formApi.getValues()) as {
      confirmPassword: string;
      newPassword: string;
    };

    if (newPassword !== confirmPassword) {
      await formApi.setFieldError('confirmPassword', '两次输入的密码不一致');
      return;
    }

    await resetUserPasswordApi(user.userId, newPassword);
    emit('reload');
    modalApi.close();
  } catch (error) {
    console.error('[system/user] 重置密码失败', error);
  } finally {
    modalApi.lock(false);
  }
}

async function handleClosed() {
  currentUser.value = null;
  await formApi.reset();
}

const [Modal, modalApi] = useVbenModal({
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }
    const { record } = (modalApi.getData() ?? {}) as ResetPasswordData;
    currentUser.value = record ?? null;
  },
});
</script>

<template>
  <Modal :close-on-click-modal="false" title="重置密码">
    <div class="flex flex-col gap-3">
      <ElDescriptions v-if="currentUser" :column="1" border size="small">
        <ElDescriptionsItem label="用户账号">
          {{ currentUser.userName }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="用户昵称">
          {{ currentUser.nickName }}
        </ElDescriptionsItem>
      </ElDescriptions>
      <Form />
    </div>
  </Modal>
</template>
