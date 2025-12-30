<template>
  <div class="sms-config-wrapper">
    <div class="config-actions">
      <ElButton type="primary" @click="toggleDisabled">
        {{ isDisabled ? '启用编辑' : '修改默认禁用' }}
      </ElButton>
      <ElButton @click="resetToDefault">恢复默认</ElButton>
    </div>
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
          <ElButton type="primary" size="small" link :disabled="isDisabled">编辑</ElButton>
          <ElButton type="primary" size="small" link :disabled="isDisabled || row.isDefault"
            >设为默认</ElButton
          >
        </template>
      </ElTableColumn>
    </ElTable>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const isDisabled = ref(false)
  const tableData = ref([])

  const toggleDisabled = () => {
    isDisabled.value = !isDisabled.value
  }

  const resetToDefault = () => {
    tableData.value = []
    isDisabled.value = false
  }
</script>

<style scoped lang="scss">
  .sms-config-wrapper {
    padding: var(--page-content-padding);
  }

  .config-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }
</style>
