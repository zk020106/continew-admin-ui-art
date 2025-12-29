<template>
  <ElTable :data="tableData" style="width: 100%">
    <ElTableColumn prop="name" label="配置名称" width="150" />
    <ElTableColumn prop="supplier" label="供应商" width="120" />
    <ElTableColumn prop="signature" label="签名" />
    <ElTableColumn prop="status" label="状态" width="100">
      <template #default="{ row }">
        <ElTag :type="row.status === 1 ? 'success' : 'danger'">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </ElTag>
      </template>
    </ElTableColumn>
    <ElTableColumn label="默认" width="100">
      <template #default="{ row }">
        <ElTag v-if="row.isDefault" type="success">是</ElTag>
        <span v-else>-</span>
      </template>
    </ElTableColumn>
    <ElTableColumn label="操作" width="150" fixed="right">
      <template #default="{ row }">
        <ElButton type="primary" size="small" link>编辑</ElButton>
        <ElButton type="primary" size="small" link v-if="!row.isDefault">设为默认</ElButton>
      </template>
    </ElTableColumn>
  </ElTable>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const tableData = ref([])
</script>
