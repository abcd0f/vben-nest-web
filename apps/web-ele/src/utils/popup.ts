import type { MaybePromise } from '@vben/types';

import { ref } from 'vue';

import { ElMessageBox } from 'element-plus';

interface BeforeCloseDiffProps {
  initializedGetter: () => MaybePromise<string>;
  currentGetter: () => MaybePromise<string>;
}

/** 初始化后比较表单快照，关闭前提示未保存的修改。 */
export function useBeforeCloseDiff({
  initializedGetter,
  currentGetter,
}: BeforeCloseDiffProps) {
  const initialized = ref('');
  const isInitialized = ref(false);

  async function markInitialized() {
    initialized.value = await initializedGetter();
    isInitialized.value = true;
  }

  function resetInitialized() {
    initialized.value = '';
    isInitialized.value = false;
  }

  async function onBeforeClose() {
    if (!isInitialized.value || (await currentGetter()) === initialized.value) {
      return true;
    }
    try {
      await ElMessageBox.confirm('表单已修改，是否放弃修改并关闭？', '提示', {
        type: 'warning',
        confirmButtonText: '放弃修改',
        cancelButtonText: '继续编辑',
        confirmButtonType: 'danger',
        showClose: false,
        modal: false,
      });
      resetInitialized();
      return true;
    } catch {
      return false;
    }
  }

  return { onBeforeClose, markInitialized, resetInitialized };
}

export function defaultFormValueGetter(formApi: {
  getValues: () => Promise<object>;
}) {
  return async () => JSON.stringify(await formApi.getValues());
}
