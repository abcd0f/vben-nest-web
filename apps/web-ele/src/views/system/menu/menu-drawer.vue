<script lang="ts" setup>
import type { MenuFormValues } from './menu-form';

import type { SystemMenuApi } from '#/api/system/menu/model';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { addFullName, filterTree, listToTree } from '@vben/utils';

import { breakpointsTailwind, useBreakpoints } from '@vueuse/core';
import { ElMessage, ElSkeleton } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import {
  createMenuApi,
  menuInfoApi,
  menuListApi,
  updateMenuApi,
} from '#/api/system/menu';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { menuFormSchema } from './data';
import { decodeMenuForm, encodeMenuForm } from './menu-form';

interface DrawerData {
  /** 新增子级时为上级 ID，编辑时为当前菜单 ID。 */
  id?: string;
  update?: boolean;
}

const emit = defineEmits<{ reload: [] }>();
const isUpdate = ref(false);
const loading = ref(false);
const isHorizontal = useBreakpoints(breakpointsTailwind).greaterOrEqual('md');
const title = computed(() => (isUpdate.value ? '编辑菜单' : '新增菜单'));

const [Form, formApi] = useVbenForm<MenuFormValues>({
  commonConfig: {
    componentProps: { class: 'w-full' },
    labelWidth: 120,
    labelClass: 'whitespace-nowrap',
    formItemClass: 'col-span-2 md:col-span-1',
  },
  schema: menuFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2 gap-x-4',
});

async function setupMenuSelect(excludeId?: string) {
  const list = await menuListApi();
  list.forEach((item) => {
    item.menuName = $t(item.menuName);
  });
  const tree = listToTree<SystemMenuApi.Menu>(
    list.filter(
      (item) => ['C', 'M'].includes(item.menuType) && item.isFrame !== '0',
    ),
    { id: 'menuId', pid: 'parentId' },
  );
  const fullMenuTree = [
    {
      menuId: '0',
      menuName: '根菜单',
      // 建树后过滤会移除整个分支，避免将菜单挂到自身或后代下。
      children: filterTree(tree, (item) => item.menuId !== excludeId),
    },
  ];
  addFullName(fullMenuTree, 'menuName', ' / ');

  formApi.updateSchema([
    {
      componentProps: {
        data: fullMenuTree,
        filterNodeMethod(query: string, data: { menuName?: string }) {
          return !query || (data.menuName ?? '').includes(query);
        },
        nodeKey: 'menuId',
        props: { children: 'children', label: 'fullName', value: 'menuId' },
      },
      fieldName: 'parentId',
      renderComponentContent: () => ({
        default: ({ data }: { data: { menuName: string } }) => data.menuName,
      }),
    },
  ]);
}

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(formApi),
    currentGetter: defaultFormValueGetter(formApi),
  },
);

const [Drawer, drawerApi] = useVbenDrawer<DrawerData>({
  onBeforeClose,
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }
    drawerApi.lock(true);
    loading.value = true;
    try {
      const { id, update = false } = drawerApi.getData() ?? {};
      isUpdate.value = update;
      if (id) {
        await formApi.setFieldValue('parentId', id);
      }
      const [record] = await Promise.all([
        id && update ? menuInfoApi(id) : null,
        setupMenuSelect(update ? id : undefined),
      ]);
      if (record) {
        await formApi.setValues(decodeMenuForm(record));
      }
      await markInitialized();
    } catch (error) {
      console.error('[system/menu] 加载菜单失败', error);
      await drawerApi.close();
    } finally {
      drawerApi.lock(false);
      loading.value = false;
    }
  },
});

async function handleConfirm() {
  try {
    drawerApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = encodeMenuForm(await formApi.getValues());
    await (isUpdate.value
      ? updateMenuApi(data as SystemMenuApi.UpdateParams)
      : createMenuApi(data));
    ElMessage.success(isUpdate.value ? '修改成功' : '新增成功');
    resetInitialized();
    emit('reload');
    await drawerApi.close();
  } catch (error) {
    console.error('[system/menu] 保存菜单失败', error);
  } finally {
    drawerApi.lock(false);
  }
}

async function handleClosed() {
  await formApi.reset();
  resetInitialized();
}
</script>

<template>
  <Drawer :title="title" class="w-full max-w-[800px]">
    <ElSkeleton v-if="loading" animated />
    <Form
      v-show="!loading"
      :layout="isHorizontal ? 'horizontal' : 'vertical'"
    />
  </Drawer>
</template>
