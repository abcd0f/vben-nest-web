<script lang="ts" setup>
import type { Status } from '#/api/common';
import type { SystemDeptApi } from '#/api/system/dept/model';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  createDeptApi,
  deptInfoApi,
  deptListApi,
  updateDeptApi,
} from '#/api/system/dept';

import { deptFormSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

/** 抽屉入参 */
interface DeptDrawerData {
  /** 新增时的父部门 ID；编辑时为目标部门 ID */
  deptId?: string;
  /** true 编辑，false 新增 */
  update: boolean;
}

/** 表单取值结构 */
interface DeptFormValues {
  deptName: string;
  orderNum: number;
  parentId: string;
  remark?: string;
  status: Status;
}

/** TreeSelect 节点：使用 Element Plus 默认的 value / label / children 字段 */
interface DeptTreeOption {
  children: DeptTreeOption[];
  label: string;
  value: string;
}

const isUpdate = ref(false);
const currentDeptId = ref<string>();

const title = computed(() => (isUpdate.value ? '编辑部门' : '新增部门'));

const [Form, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
  },
  schema: deptFormSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-1',
});

/**
 * 把平级的部门列表组装成 TreeSelect 需要的树
 *
 * 后端返回的是平级数组（只有 `parentId`），这里按父子关系递归组装；
 * 顶层节点 = `parentId` 不在本列表里的行（根部门的 `parentId` 是 "0"）。
 * `exclude` 命中时整棵子树都不会被挂上，后端也不允许把部门挂到自己的后代下面。
 */
function buildTreeOptions(
  list: SystemDeptApi.Dept[],
  exclude: Set<string>,
): DeptTreeOption[] {
  const childrenOf = new Map<string, SystemDeptApi.Dept[]>();
  for (const dept of list) {
    const siblings = childrenOf.get(dept.parentId) ?? [];
    siblings.push(dept);
    childrenOf.set(dept.parentId, siblings);
  }

  const build = (parentId: string): DeptTreeOption[] =>
    (childrenOf.get(parentId) ?? [])
      .filter((dept) => !exclude.has(dept.deptId))
      .map((dept) => ({
        children: build(dept.deptId),
        label: dept.deptName,
        value: dept.deptId,
      }));

  const ids = new Set(list.map((dept) => dept.deptId));
  return list
    .filter((dept) => !ids.has(dept.parentId) && !exclude.has(dept.deptId))
    .map((dept) => ({
      children: build(dept.deptId),
      label: dept.deptName,
      value: dept.deptId,
    }));
}

/** 组装上级部门下拉数据：直接用真实部门树，不额外造虚拟根节点 */
async function buildParentTree(deptId?: string): Promise<DeptTreeOption[]> {
  const list = await deptListApi();
  const exclude = new Set<string>(isUpdate.value && deptId ? [deptId] : []);
  return buildTreeOptions(list, exclude);
}

async function handleConfirm() {
  const { valid } = await formApi.validate();
  if (!valid) {
    return;
  }
  const values = (await formApi.getValues()) as DeptFormValues;
  const payload: SystemDeptApi.CreateParams = {
    deptName: values.deptName,
    orderNum: values.orderNum,
    parentId: values.parentId,
    // 空字符串视为清空备注，显式传 null
    remark: values.remark || null,
    status: values.status,
  };

  const updatingId = isUpdate.value ? currentDeptId.value : undefined;

  drawerApi.lock(true);
  try {
    await (updatingId
      ? updateDeptApi({ ...payload, deptId: updatingId })
      : createDeptApi(payload));
    emit('reload');
    drawerApi.close();
  } catch (error) {
    // 错误提示已由请求拦截器统一处理，这里只保证抽屉不被锁死
    console.error('[system/dept] 保存部门失败', error);
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
    const { deptId, update } = (drawerApi.getData() ?? {}) as DeptDrawerData;
    isUpdate.value = !!update;
    currentDeptId.value = deptId;

    drawerApi.lock(true);
    try {
      formApi.updateSchema([
        {
          component: 'TreeSelect',
          componentProps: { data: await buildParentTree(deptId) },
          fieldName: 'parentId',
        },
      ]);

      if (isUpdate.value && deptId) {
        const detail = await deptInfoApi(deptId);
        await formApi.setValues({
          deptName: detail.deptName,
          orderNum: detail.orderNum,
          parentId: detail.parentId,
          remark: detail.remark ?? '',
          status: detail.status,
        });
      } else {
        await formApi.setValues({
          deptName: '',
          orderNum: 0,
          // 从工具栏「新增部门」进入时没有上级，必须在下拉里选一个真实部门
          parentId: deptId,
          remark: '',
          status: '0',
        });
      }
    } finally {
      drawerApi.lock(false);
    }
  },
});
</script>

<template>
  <Drawer :title="title">
    <Form />
  </Drawer>
</template>
