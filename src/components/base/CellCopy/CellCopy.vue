<template>
  <span class="cell-copy-wrapper">
    <span class="cell-copy-content">{{ props.content }}</span>
    <ElButton type="primary" link class="cell-copy-btn" @click="handleCopy">
      <ElIcon><DocumentCopy /></ElIcon>
    </ElButton>
  </span>
</template>

<script setup lang="ts">
  import { DocumentCopy } from '@element-plus/icons-vue'
  import { ElButton, ElIcon, ElMessage } from 'element-plus'

  defineOptions({ name: 'CellCopy' })

  const props = withDefaults(defineProps<Props>(), {
    content: ''
  })

  interface Props {
    content: string
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.content)
      ElMessage.success('复制成功')
    } catch {
      ElMessage.error('复制失败')
    }
  }
</script>

<style scoped lang="scss">
  .cell-copy-wrapper {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }

  .cell-copy-content {
    word-break: break-all;
  }

  .cell-copy-btn {
    padding: 0;
    margin-left: 2px;
  }
</style>
