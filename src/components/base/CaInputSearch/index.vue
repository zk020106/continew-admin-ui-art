<template>
  <InputGroup class="ca-input-search">
    <ElInput
      v-model="model"
      :disabled="props.disabled"
      :readonly="!props.disabled"
      :placeholder="placeholder"
    >
    </ElInput>
    <ElButton
      v-if="showButton"
      :icon="Search"
      :disabled="props.disabled"
      @click="emit('search')"
    ></ElButton>
    <ElButton
      v-if="showButton"
      :icon="Close"
      :disabled="props.disabled"
      @click="emit('clear')"
    ></ElButton>
  </InputGroup>
</template>

<script setup lang="ts">
import type { InputSearchProps } from './type'
import { Close, Search } from '@element-plus/icons-vue'
import { ElButton, ElInput } from 'element-plus'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const model = defineModel({ type: String })

const props = withDefaults(defineProps<InputSearchProps>(), {
  disabled: false,
  readonly: false,
  placeholder: undefined,
  disabledHideButton: false
})

const emit = defineEmits<{
  (e: 'search'): void
  (e: 'clear'): void
}>()

const { t } = useI18n()

const placeholder = computed(() => {
  return props.placeholder || t('components.inputSearch.placeholder')
})

const showButton = computed(() => {
  if (props.readonly) return false
  if (props.disabled) {
    return !props.disabledHideButton
  }
  return true
})
</script>

<style lang="scss" scoped>
  :deep(.el-button) {
    padding-right: 12px;
    padding-left: 12px;
  }
</style>
