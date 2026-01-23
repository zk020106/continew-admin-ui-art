<template>
  <div :class="getClass" @click="handleClick">
    <ElIcon :size="props.iconSize">
      <ArrowRightBold v-if="collapsed" :size="iconSize" />
      <ArrowLeftBold v-else :size="iconSize" />
    </ElIcon>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftBold, ArrowRightBold } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'
import { computed } from 'vue'

/** 按钮类型 */
type ButtonType = 'default' | 'circle'

/** 组件属性定义 */
interface Props {
  /** 是否折叠状态 */
  collapsed?: boolean
  /** 按钮类型 */
  type?: ButtonType
  /** 图标大小 */
  iconSize?: number
  /** 是否禁用 */
  disabled?: boolean
}

/** 组件事件定义 */
interface Emits {
  (e: 'click'): void
  (e: 'update:collapsed', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  type: 'circle',
  iconSize: 10,
  disabled: false
})

const emit = defineEmits<Emits>()

/** 计算按钮类名 */
const getClass = computed(() => {
  const arr: string[] = ['ca-split-button', `ca-split-button--${props.type}`]
  if (props.collapsed) {
    arr.push('ca-split-button--collapsed')
  }
  if (props.disabled) {
    arr.push('ca-split-button--disabled')
  }
  return arr.join(' ')
})

/** 处理点击事件 */
const handleClick = () => {
  if (props.disabled) return
  emit('click')
  emit('update:collapsed', !props.collapsed)
}
</script>

<style lang="scss" scoped>
  .ca-split-button {
    position: absolute;
    top: 50%;
    z-index: 9;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    transform: translateY(-50%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform, background-color, border-color;

    &--disabled {
      pointer-events: none;
      cursor: not-allowed;
      opacity: 0.6;
    }

    &--default {
      left: 0;
      width: 18px;
      height: 40px;
      box-shadow: 2px 0 6px rgb(0 0 0 / 10%);
    }

    &--circle {
      left: -12px;
      width: 24px;
      height: 24px;
      overflow: hidden;
      border-radius: 50%;
      box-shadow: 0 4px 10px rgb(0 0 0 / 10%);

      &.ca-split-button--collapsed {
        left: -6px;
      }
    }
  }
</style>
