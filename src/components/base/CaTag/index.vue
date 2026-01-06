<template>
  <ElTag v-bind="bindProps">
    <span v-if="dot" class="ca-tag-dot" :class="[`ca-tag-dot--${type}`]" />
    <slot>{{ text }}</slot>
  </ElTag>
</template>

<script setup lang="ts">
  import type { TagProps as ElTagProps } from 'element-plus'
  import { ElTag } from 'element-plus'
  import { computed } from 'vue'

  export interface CaTagProps {
    /** 标签类型 */
    type?: '' | 'success' | 'info' | 'warning' | 'danger'
    /** 是否显示点 */
    dot?: boolean
    /** 标签文本 */
    text?: string
  }

  const props = withDefaults(defineProps<CaTagProps>(), {
    type: '',
    dot: false
  })

  const bindProps = computed<Partial<ElTagProps>>(() => ({
    type: props.type || undefined
  }))
</script>

<style lang="scss" scoped>
  .ca-tag-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 6px;
    border-radius: 50%;
    animation: ca-tag-pulse 2s ease-in-out infinite;

    &--success {
      background-color: var(--el-color-success);
    }

    &--info {
      background-color: var(--el-color-info);
    }

    &--warning {
      background-color: var(--el-color-warning);
    }

    &--danger {
      background-color: var(--el-color-danger);
    }
  }

  @keyframes ca-tag-pulse {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.4;
    }
  }
</style>
