<template>
  <div v-if="data && data.length">
    <el-tag v-for="(item, index) in visibleTags" :key="index" size="small" class="pl-5">
      {{ getTagLabel(item) }}
    </el-tag>
    <el-tooltip v-if="overflowCount > 0" :content="overflowContent" placement="top">
      <el-tag type="primary" size="small" class="tag-item">+{{ overflowCount }}</el-tag>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
  import type { LabelValueState } from '@/types/global'

  defineOptions({ name: 'CaCellTags' })

  const props = withDefaults(defineProps<Props>(), {
    data: () => [],
    maxVisible: 3
  })

  interface Props {
    data: string[] | LabelValueState[] | undefined
    maxVisible?: number
  }

  // 获取标签显示文本
  const getTagLabel = (item: string | LabelValueState): string => {
    if (typeof item === 'string') {
      return item
    }
    return item.label ?? String(item.value)
  }

  const visibleTags = computed(() => {
    return props.data.slice(0, props.maxVisible)
  })

  const overflowCount = computed(() => {
    return Math.max(0, props.data.length - props.maxVisible)
  })

  const overflowContent = computed(() => {
    return props.data.slice(props.maxVisible).map(getTagLabel).join(', ')
  })
</script>

<style scoped lang="scss"></style>
