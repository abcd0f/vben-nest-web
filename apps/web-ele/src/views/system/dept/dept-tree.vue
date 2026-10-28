<script setup lang="ts">
import type { PropType } from 'vue';

import type { SystemDeptApi } from '#/api/system/dept/model';

import { computed, onMounted, ref } from 'vue';

import { Refresh } from '@element-plus/icons-vue';
import { ElButton, ElEmpty, ElInput, ElSkeleton, ElTree } from 'element-plus';

import { getDeptTree } from '#/api/system/dept';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
  showSearch: true,
  api: getDeptTree,
});

const emit = defineEmits<{
  /**
   * 点击刷新按钮的事件
   */
  reload: [];
  /**
   * 点击节点的事件
   */
  select: [deptId: number | string | undefined, parentId: number | string];
}>();

interface Props {
  /**
   * 调用的接口
   */
  api?: () => Promise<SystemDeptApi.DeptTree[]>;
  /**
   * 是否显示搜索框
   */
  showSearch?: boolean;
}

const selectDeptId = defineModel('selectDeptId', {
  type: [Number, String] as PropType<number | string | undefined>,
});

const searchValue = defineModel('searchValue', {
  type: String,
  default: '',
});

/** 部门数据源 */
type DeptTreeArray = SystemDeptApi.DeptTree[];
const deptTreeArray = ref<DeptTreeArray>([]);
/** 骨架屏加载 */
const showTreeSkeleton = ref<boolean>(true);

function filterDeptTree(
  depts: DeptTreeArray,
  searchText: string,
): DeptTreeArray {
  const normalizedSearch = searchText.toUpperCase();
  return depts.flatMap((dept) => {
    if (dept.disabled) {
      return [];
    }

    const children = filterDeptTree(dept.children ?? [], searchText);
    const matchesSearch =
      !normalizedSearch || dept.label.toUpperCase().includes(normalizedSearch);

    if (!matchesSearch) {
      return children;
    }

    return [{ ...dept, children }];
  });
}

const deptTreeComputed = computed(() =>
  filterDeptTree(deptTreeArray.value, searchValue.value),
);

async function loadTree() {
  showTreeSkeleton.value = true;
  searchValue.value = '';
  selectDeptId.value = undefined;

  const ret = await props.api();

  deptTreeArray.value = ret;
  showTreeSkeleton.value = false;
}

async function handleReload() {
  await loadTree();
  emit('reload');
}

/**
 * ElTree 的 node-click 事件直接给出被点击节点的 data，
 * 这里手动维护单选部门 ID。
 */
function handleSelect(data: SystemDeptApi.DeptTree) {
  if (data.disabled) {
    return;
  }
  selectDeptId.value = data.id;
  emit('select', data.id, data.parentId);
}

onMounted(async () => {
  await loadTree();
});
</script>

<template>
  <div :class="$attrs.class">
    <ElSkeleton :loading="showTreeSkeleton" :rows="8" animated class="p-3">
      <div
        class="flex h-full flex-col overflow-y-auto rounded-lg bg-background"
      >
        <!-- 固定在顶部 必须加上bg-background背景色 否则会产生'穿透'效果 -->
        <div
          v-if="showSearch"
          class="sticky left-0 top-0 z-100 bg-background p-3"
        >
          <ElInput
            v-model="searchValue"
            placeholder="搜索"
            size="small"
            clearable
          >
            <template #append>
              <ElButton size="small" :icon="Refresh" @click="handleReload" />
            </template>
          </ElInput>
        </div>
        <div class="h-full overflow-x-hidden px-3">
          <ElTree
            class="w-full"
            v-if="deptTreeComputed.length > 0"
            v-bind="$attrs"
            :class="$attrs.class"
            :current-node-key="selectDeptId"
            :data="deptTreeComputed"
            :default-expand-all="true"
            :expand-on-click-node="false"
            :props="{
              label: 'label',
              children: 'children',
              disabled: 'disabled',
            }"
            highlight-current
            node-key="id"
            @node-click="handleSelect"
          >
            <template #default="{ data }">
              <span v-if="searchValue && data.label.includes(searchValue)">
                {{ data.label.substring(0, data.label.indexOf(searchValue)) }}
                <span class="text-primary">{{ searchValue }}</span>
                {{
                  data.label.substring(
                    data.label.indexOf(searchValue) + searchValue.length,
                  )
                }}
              </span>
              <span v-else>{{ data.label }}</span>
            </template>
          </ElTree>
          <!-- 仅本人数据权限 可以考虑直接不显示 -->
          <div v-else class="mt-5">
            <ElEmpty :image-size="60" description="无部门数据" />
          </div>
        </div>
      </div>
    </ElSkeleton>
  </div>
</template>
