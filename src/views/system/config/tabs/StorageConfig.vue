<template>
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
        <ElButton type="primary" size="small" link>编辑</ElButton>
        <ElButton type="primary" size="small" link v-if="!row.isDefault">设为默认</ElButton>
        <ElButton type="danger" size="small" link>删除</ElButton>
      </template>
    </ElTableColumn>
  </ElTable>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

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
</script>
