<template>
  <div class="cron-config-list">
    <el-radio-group :model-value="type" @update:model-value="type = $event as any">
      <div class="item">
        <el-radio :value="TypeEnum.every" v-bind="beforeRadioAttrs">每年</el-radio>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.range" v-bind="beforeRadioAttrs">区间</el-radio>
        <div class="item-config">
          <span>从</span>
          <el-input-number v-model="valueRange.start" v-bind="typeRangeAttrs" />
          <span>年 至</span>
          <el-input-number v-model="valueRange.end" v-bind="typeRangeAttrs" />
          <span>年</span>
        </div>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.loop" v-bind="beforeRadioAttrs">循环</el-radio>
        <div class="item-config">
          <span>从</span>
          <el-input-number v-model="valueLoop.start" v-bind="typeLoopAttrs" />
          <span>年开始, 间隔</span>
          <el-input-number v-model="valueLoop.interval" v-bind="typeLoopAttrs" />
          <span>年</span>
        </div>
      </div>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
  import { useFormSetup } from './use-mixin'

  defineOptions({ name: 'YearForm' })

  const props = withDefaults(
    defineProps<{
      modelValue?: string
      disabled?: boolean
    }>(),
    {
      modelValue: '*',
      disabled: false
    }
  )

  const emit = defineEmits<{
    (e: 'change', value: string): void
    (e: 'update:modelValue', value: string): void
  }>()

  const setup = useFormSetup(props, emit, {
    defaultValue: '*',
    minValue: 2024,
    maxValue: 2099,
    valueRange: { start: 2024, end: 2099 },
    valueLoop: { start: 2024, interval: 1 }
  })

  const {
    type,
    TypeEnum,
    valueRange,
    valueLoop,
    valueList,
    specifyRange,
    beforeRadioAttrs,
    typeRangeAttrs,
    typeLoopAttrs,
    typeSpecifyAttrs
  } = setup
</script>
