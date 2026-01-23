<template>
  <span v-if="props.status === 1" class="status-item success">
    <el-icon><SuccessFilled /></el-icon>
    <span>{{ $t('common.statusEnabled') }}</span>
  </span>
  <span v-else-if="props.status === 2" class="status-item warning">
    <el-icon><WarningFilled /></el-icon>
    <span>{{ $t('common.statusDisabled') }}</span>
  </span>
</template>

<script setup lang="ts">
import { SuccessFilled, WarningFilled } from '@element-plus/icons-vue'

defineOptions({ name: 'CaCellStatus' })

const props = withDefaults(defineProps<Props>(), {
  status: 1
})

interface Props {
  status?: number | undefined
}
</script>

<style scoped lang="scss">
  .status-item {
    display: inline-flex;
    gap: 4px;
    align-items: center;

    &.success {
      color: var(--el-color-success);
    }

    &.warning {
      color: var(--el-color-warning);
    }
  }
</style>
