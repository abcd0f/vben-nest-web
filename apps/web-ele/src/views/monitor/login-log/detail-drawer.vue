<script lang="ts" setup>
import type { MonitorLoginLogApi } from '#/api/monitor/login-log/model';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { ElDescriptions, ElDescriptionsItem, ElTag } from 'element-plus';

/** 抽屉入参 */
interface DetailDrawerData {
  record?: MonitorLoginLogApi.LoginLog;
}

const record = ref<MonitorLoginLogApi.LoginLog>();

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
  <Drawer title="登录日志详情">
    <ElDescriptions v-if="record" :column="1" border>
      <ElDescriptionsItem label="访问 ID">
        {{ record.infoId }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="登录账号">
        {{ record.userName }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="登录状态">
        <ElTag :type="record.status === '0' ? 'success' : 'danger'">
          {{ record.status === '0' ? '成功' : '失败' }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="登录 IP">
        {{ record.ipaddr || '-' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="登录时间">
        {{ record.loginTime }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="提示消息">
        {{ record.msg || '-' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="客户端">
        <span class="break-all">{{ record.userAgent || '-' }}</span>
      </ElDescriptionsItem>
    </ElDescriptions>
  </Drawer>
</template>
