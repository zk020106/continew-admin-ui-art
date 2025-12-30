<template>
  <div class="storage-config-wrapper">
    <div class="config-actions">
      <ElButton type="primary" @click="toggleDisabled">
        {{ isDisabled ? '启用编辑' : '修改默认禁用' }}
      </ElButton>
      <ElButton @click="resetToDefault">恢复默认</ElButton>
    </div>
    <ElTable :data="tableData" style="width: 100%">
      <ElTableColumn prop="name" label="存储名称" width="150" />
      <ElTableColumn prop="code" label="存储编码" width="120" />
      <ElTableColumn prop="type" label="类型" width="120">
        <template #default="{ row }">
          <ElTag>{{ getStorageTypeLabel(row.type) }}</ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="endpoint" label="Endpoint" />
      <ElTableColumn prop="bucketName" label="Bucket" width="150" />
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
      <ElTableColumn label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <ElButton type="primary" size="small" link :disabled="isDisabled">编辑</ElButton>
          <ElButton type="primary" size="small" link :disabled="isDisabled || row.isDefault"
            >设为默认</ElButton
          >
          <ElButton type="danger" size="small" link :disabled="isDisabled">删除</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const isDisabled = ref(false)
  const tableData = ref([])

  const storageTypeMap: Record<number, string> = {
    1: 'Local',
    2: 'Aliyun OSS',
    3: 'Tencent COS',
    4: 'MinIO',
    5: 'Amazon S3'
  }

  const getStorageTypeLabel = (type: number) => {
    return storageTypeMap[type] || '未知'
  }

  const toggleDisabled = () => {
    isDisabled.value = !isDisabled.value
  }

  const resetToDefault = () => {
    tableData.value = []
    isDisabled.value = false
  }
</script>

<style scoped lang="scss">
  .storage-config-wrapper {
    padding: var(--page-content-padding);
  }

  .config-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }
</style>
