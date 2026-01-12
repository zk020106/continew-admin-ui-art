<template>
  <CaForm
    ref="formRef"
    v-bind="formBindProps"
    :model-value="props.modelValue"
    :search="showButtonArea"
    :search-text="props.searchText"
    :hide-fold-btn="props.hideFoldBtn"
    :default-collapsed="props.defaultCollapsed"
    @update:model-value="handleModelValueUpdate"
    @search="handleSearch"
    @reset="handleReset"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
  </CaForm>
</template>

<script setup lang="ts">
  import { type FormExpose } from 'element-plus'
  import { computed, onMounted, ref, watch } from 'vue'
  import type { FormColumnItem, FormProps } from '@/components/base/CaForm/type'
  import type { QueryFormEmits, QueryFormExpose, QueryFormMode } from './type'

  interface CaQueryFormProps<T = any> extends Omit<FormProps, 'search' | 'modelValue'> {
    /**
     * 查询模式
     * - change-search: 表单内容改变时自动触发查询（防抖）
     * - click-search: 点击查询按钮时触发查询（默认）
     */
    mode?: QueryFormMode
    /**
     * 自动查询的防抖延迟（毫秒），仅在 mode 为 change-search 时生效
     * @default 300
     */
    debounceDelay?: number
    /**
     * 是否在组件挂载时自动触发一次查询
     * @default true
     */
    immediate?: boolean
    /**
     * 表单数据
     */
    modelValue: any
    /**
     * 是否显示查询按钮（仅在 click-search 模式下生效）
     * @default true
     */
    showSearchBtn?: boolean
    /**
     * 是否显示重置按钮
     * @default true
     */
    showResetBtn?: boolean
    /**
     * 查询按钮文本
     */
    searchText?: string
    /**
     * 是否隐藏折叠按钮
     * @default false
     */
    hideFoldBtn?: boolean
    /**
     * 默认折叠状态
     */
    defaultCollapsed?: boolean
  }

  const props = withDefaults(defineProps<CaQueryFormProps>(), {
    mode: 'click-search',
    debounceDelay: 300,
    immediate: true,
    showSearchBtn: true,
    showResetBtn: true,
    hideFoldBtn: false,
    defaultCollapsed: undefined,
    columns: () => [],
    labelWidth: 'auto',
    scrollToError: true,
    showMessage: true,
    gridItemProps: () => ({ span: { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 } }),
    fc: () => ({})
  })

  const emit = defineEmits<QueryFormEmits>()

  const formRef = ref<FormExpose>()

  // 是否显示按钮区域（click-search 模式且显示查询按钮时）
  const showButtonArea = computed(() => {
    return props.mode === 'click-search' && props.showSearchBtn
  })

  // 防抖定时器
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // 清除防抖定时器
  const clearDebounceTimer = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  // 触发查询
  const triggerSearch = () => {
    clearDebounceTimer()
    emit('search', props.modelValue)
  }

  // 处理表单数据更新
  const handleModelValueUpdate = (value: any) => {
    emit('update:modelValue', value)

    // change-search 模式下，表单值改变时自动触发查询
    if (props.mode === 'change-search') {
      clearDebounceTimer()
      debounceTimer = setTimeout(() => {
        triggerSearch()
      }, props.debounceDelay)
    }
  }

  // 处理查询按钮点击
  const handleSearch = () => {
    triggerSearch()
  }

  // 处理重置按钮点击
  const handleReset = () => {
    emit('reset')
    // 重置后自动触发查询
    triggerSearch()
  }

  // 计算传递给 CaForm 的 props
  const formBindProps = computed(() => {
    const { mode, debounceDelay, immediate, showSearchBtn, showResetBtn, searchText, ...rest } =
      props
    return rest
  })

  // 暴露方法
  const search = () => {
    triggerSearch()
  }

  const reset = () => {
    formRef.value?.formRef?.resetFields()
    handleReset()
  }

  // 监听 modelValue 的深层变化，用于处理对象/数组类型的字段变化
  watch(
    () => props.modelValue,
    (newVal, oldVal) => {
      // change-search 模式下，监听表单值变化
      if (props.mode === 'change-search' && newVal !== oldVal) {
        // 这里不需要额外处理，因为 handleModelValueUpdate 已经处理了
      }
    },
    { deep: true }
  )

  // 组件挂载时是否立即查询
  onMounted(() => {
    if (props.immediate) {
      triggerSearch()
    }
  })

  defineExpose({
    search,
    reset,
    formRef
  })
</script>

<style lang="scss" scoped>
  // 继承 CaForm 的样式
</style>
