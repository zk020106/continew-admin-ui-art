<template>
  <ElTable :data="tableData" style="width: 100%">
    <ElTableColumn prop="clientId" label="Client ID" width="150" />
    <ElTableColumn prop="clientType" label="客户端类型" width="120" />
    <ElTableColumn prop="authType" label="认证方式" width="120" />
    <ElTableColumn prop="timeout" label="超时时间" width="100" />
    <ElTableColumn prop="activeTimeout" label="活跃超时" width="100" />
    <ElTableColumn prop="status" label="状态" width="100">
      <template #default="{ row }">
        <ElTag :type="row.status === '1' ? 'success' : 'danger'">
          {{ row.status === '1' ? '启用' : '禁用' }}
        </ElTag>
      </template>
    </ElTableColumn>
    <ElTableColumn label="操作" width="180" fixed="right">
      <template #default>
        <ElButton type="primary" size="small" link>编辑</ElButton>
        <ElButton type="primary" size="small" link>高级配置</ElButton>
      </template>
    </ElTableColumn>
  </ElTable>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const tableData = ref([])
</script>
