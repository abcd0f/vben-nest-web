<script lang="ts" setup>
import type { SystemMenuApi } from '#/api/system/menu/model';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  createMenuApi,
  menuInfoApi,
  menuListApi,
  updateMenuApi,
} from '#/api/system/menu';

import { menuFormSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

interface DrawerData {
  menuId?: string;
  parentId?: string;
  update: boolean;
}

interface MenuOption {
  children?: MenuOption[];
  label: string;
  value: string;
}

const isUpdate = ref(false);
const currentMenuId = ref<string>();
const currentIcon = ref<null | string>(null);
const title = computed(() => (isUpdate.value ? '编辑菜单' : '新增菜单'));

const [Form, formApi] = useVbenForm({
  commonConfig: { componentProps: { class: 'w-full' } },
  schema: menuFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

function buildOptions(
  list: SystemMenuApi.Menu[],
  exclude: Set<string>,
): MenuOption[] {
  const childrenOf = new Map<string, SystemMenuApi.Menu[]>();
  for (const item of list.filter((menu) => menu.menuType !== 'F')) {
    const children = childrenOf.get(item.parentId) ?? [];
    children.push(item);
    childrenOf.set(item.parentId, children);
  }

  const build = (parentId: string): MenuOption[] =>
    (childrenOf.get(parentId) ?? [])
      .filter((item) => !exclude.has(item.menuId))
      .map((item) => ({
        children: build(item.menuId),
        label: item.menuName,
        value: item.menuId,
      }));

  return [{ children: build('0'), label: '根菜单', value: '0' }];
}

function collectDescendants(list: SystemMenuApi.Menu[], menuId: string) {
  const exclude = new Set<string>([menuId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const item of list) {
      if (exclude.has(item.parentId) && !exclude.has(item.menuId)) {
        exclude.add(item.menuId);
        changed = true;
      }
    }
  }
  return exclude;
}

async function handleConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return;
  }

  drawerApi.lock(true);
  try {
    const values = (await formApi.getValues()) as SystemMenuApi.CreateParams;
    const menuType = values.menuType;
    const payload: SystemMenuApi.CreateParams = {
      ...values,
      menuType,
      menuName: values.menuName.trim(),
      path: menuType === 'F' ? null : values.path?.trim() || null,
      component: menuType === 'C' ? values.component?.trim() || null : null,
      query: values.query?.trim() || null,
      perms: menuType === 'M' ? null : values.perms?.trim() || null,
      icon: currentIcon.value,
      remark: values.remark?.trim() || null,
    };
    if (isUpdate.value && currentMenuId.value) {
      await updateMenuApi({ ...payload, menuId: currentMenuId.value });
    } else {
      await createMenuApi(payload);
    }
    emit('reload');
    drawerApi.close();
  } catch (error) {
    console.error('[system/menu] 保存菜单失败', error);
  } finally {
    drawerApi.lock(false);
  }
}

function handleClosed() {
  formApi.reset();
}

const [Drawer, drawerApi] = useVbenDrawer({
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }
    const { menuId, parentId, update } = (drawerApi.getData() ??
      {}) as DrawerData;
    isUpdate.value = !!update;
    currentMenuId.value = menuId;
    drawerApi.lock(true);
    try {
      const list = await menuListApi();
      formApi.updateSchema([
        {
          componentProps: {
            data: buildOptions(
              list,
              menuId ? collectDescendants(list, menuId) : new Set(),
            ),
          },
          fieldName: 'parentId',
        },
      ]);
      if (menuId && isUpdate.value) {
        const detail = await menuInfoApi(menuId);
        currentIcon.value = detail.icon ?? null;
        await formApi.setValues({
          ...detail,
          parentId: detail.parentId,
          path: detail.path ?? '',
          component: detail.component ?? '',
          query: detail.query ?? '',
          perms: detail.perms ?? '',
          remark: detail.remark ?? '',
        });
      } else {
        currentIcon.value = null;
        await formApi.setValues({
          component: '',
          isCache: '0',
          isFrame: '1',
          menuName: '',
          menuType: 'M',
          orderNum: 0,
          parentId: parentId ?? '0',
          path: '',
          perms: '',
          query: '',
          remark: '',
          status: '0',
          visible: '0',
        });
      }
    } catch (error) {
      console.error('[system/menu] 初始化菜单表单失败', error);
    } finally {
      drawerApi.lock(false);
    }
  },
});
</script>

<template>
  <Drawer :title="title" class="w-[600px]">
    <Form />
  </Drawer>
</template>
