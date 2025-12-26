<template>
  <ElSplitter :class="getClass">
    <ElSplitterPanel v-if="slots.left" v-model:size="size">
      <div class="ca-page-layout__left" :style="props.leftStyle">
        <slot name="left"></slot>
      </div>
    </ElSplitterPanel>
    <div v-if="slots.left && props.collapse" class="ca-page-layout__split">
      <SplitButton :collapsed="Number(size) === 0" @click="handleClick"></SplitButton>
    </div>
    <ElSplitterPanel>
      <div class="ca-page-layout__right">
        <div v-if="slots.header" class="ca-page-layout__header" :style="props.headerStyle">
          <slot name="header"></slot>
        </div>
        <div v-if="slots.tool" class="ca-page-layout__tool" :style="props.toolStyle">
          <slot name="tool"></slot>
        </div>
        <div class="ca-page-layout__body" :style="props.bodyStyle">
          <slot></slot>
        </div>
      </div>
    </ElSplitterPanel>
  </ElSplitter>
</template>

<script lang="ts" setup>
  import { ElSplitter, ElSplitterPanel } from 'element-plus'
  import { computed, ref, useSlots } from 'vue'
  import SplitButton from './components/SplitButton.vue'
  import type { PageLayoutProps } from './type'

  const props = withDefaults(defineProps<PageLayoutProps>(), {
    size: 270,
    bordered: false,
    collapse: true,
    leftStyle: () => ({}),
    headerStyle: () => ({}),
    toolStyle: () => ({}),
    bodyStyle: () => ({})
  })

  defineSlots<{
    header: () => void
    left: () => void
    tool: () => void
    default: () => void
  }>()

  const slots = useSlots()
  const size = ref(props.size)
  const collapsing = ref(false)

  const getClass = computed(() => {
    const arr: string[] = ['ca-page-layout']
    if (props.bordered) {
      arr.push('ca-page-layout--bordered')
    }
    if (slots.header) {
      arr.push('ca-page-layout--has-header')
    }
    if (slots.tool) {
      arr.push('ca-page-layout--has-tool')
    }
    if (collapsing.value) {
      arr.push('ca-page-layout--collapsing')
    }
    return arr.join(' ')
  })

  function handleClick() {
    collapsing.value = true
    setTimeout(() => {
      collapsing.value = false
    }, 300)
    size.value = Number(size.value) > 30 ? 0 : props.size
  }
</script>

<style lang="scss" scoped>
  :deep(.el-splitter-bar__dragger-horizontal) {
    &::before,
    &::after {
      width: 1px;
    }
  }

  .ca-page-layout {
    display: flex;
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: var(--el-bg-color);

    &--bordered {
      border: 1px solid var(--el-border-color);
    }

    &__left {
      width: 100%;
      height: 100%;
    }

    &__right {
      position: relative;
      display: flex;
      flex: 1;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
  }

  .ca-page-layout__header {
    box-sizing: border-box;
    padding: var(--padding-x);
    padding-bottom: 0;
    border-bottom: 1px solid var(--el-border-color);
  }

  .ca-page-layout__tool {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: end;
    width: 100%;
    padding: var(--padding-x);
    padding-bottom: 0;
  }

  .ca-page-layout__body {
    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100%;
    padding: var(--padding-x);
    overflow: hidden;
  }

  .ca-page-layout__split {
    position: relative;
    width: 0;
    height: auto;
  }

  .ca-page-layout--has-header {
    .ca-page-layout__tool {
      padding-top: var(--padding-y);
    }
  }

  .ca-page-layout--has-header,
  .ca-page-layout--has-tool {
    .ca-page-layout__body {
      padding-top: var(--padding-y);
    }
  }

  .ca-page-layout--collapsing {
    :deep(.el-splitter-panel) {
      transition: flex-basis 0.3s;
    }
  }
</style>
