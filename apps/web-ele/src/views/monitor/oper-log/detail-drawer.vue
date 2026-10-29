<script lang="ts" setup>
import type { MonitorOperLogApi } from '#/api/monitor/oper-log/model';

import { computed, ref } from 'vue';

import { JsonViewer, useVbenDrawer } from '@vben/common-ui';

import {
  ElDescriptions,
  ElDescriptionsItem,
  ElTag,
  ElText,
} from 'element-plus';

/** 抽屉入参 */
interface DetailDrawerData {
  record?: MonitorOperLogApi.OperLog;
}

const record = ref<MonitorOperLogApi.OperLog>();

/** 请求参数尽量格式化成缩进 JSON，解析失败就原样展示 */
const paramText = computed(() => {
  const raw = record.value?.operParam;
  if (!raw) {
    return '-';
  }
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
});

const [Drawer, drawerApi] = useVbenDrawer({
  // 纯只读详情，不需要底部操作区
  footer: false,
  onOpenChange(isOpen) {
    if (!isOpen) {
      return;
    }
    const data = (drawerApi.getData() ?? {}) as DetailDrawerData;
    record.value = data.record;
  },
});
</script>

<template>
  <Drawer title="操作日志详情">
    <ElDescriptions v-if="record" :column="1" border>
      <ElDescriptionsItem label="日志 ID">
        {{ record.operId }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="模块标题">
        {{ record.title || '-' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="操作状态">
        <ElTag :type="record.status === '0' ? 'success' : 'danger'">
          {{ record.status === '0' ? '成功' : '失败' }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="操作人ID">
        {{ record.operUserId || '-' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="请求方式">
        {{ record.requestMethod || '-' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="请求地址">
        <span class="break-all">{{ record.operUrl || '-' }}</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="操作 IP">
        {{ record.operIp || '-' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="控制器方法">
        <span class="break-all">{{ record.method || '-' }}</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="耗时">
        {{ record.costTime }} ms
      </ElDescriptionsItem>
      <ElDescriptionsItem label="操作时间">
        {{ record.operTime }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="请求参数">
        <JsonViewer :value="paramText" boxed />
      </ElDescriptionsItem>
      <ElDescriptionsItem label="错误消息">
        <ElText class="break-all" type="danger">
          {{ record.errorMsg || '-' }}
        </ElText>
      </ElDescriptionsItem>
    </ElDescriptions>
  </Drawer>
</template>
