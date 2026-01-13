<template>
  <div class="cron-config-list">
    <el-radio-group :model-value="type" @update:model-value="type = $event as any">
      <div class="item">
        <ElRadio :value="TypeEnum.unset" v-bind="beforeRadioAttrs">不设置</ElRadio>
        <span class="tip-info">日和周只能设置其中之一</span>
      </div>
      <div class="item">
        <ElRadio :value="TypeEnum.every" v-bind="beforeRadioAttrs">每日</ElRadio>
      </div>
      <div class="item">
        <ElRadio :value="TypeEnum.range" v-bind="beforeRadioAttrs">区间</ElRadio>
        <div class="item-config">
          <span>从</span>
          <el-input-number v-model="valueRange.start" v-bind="inputNumberAttrs" />
          <span>日 至</span>
          <el-input-number v-model="valueRange.end" v-bind="inputNumberAttrs" />
          <span>日</span>
        </div>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.work" v-bind="beforeRadioAttrs">工作日</el-radio>
        <div class="item-config">
          <span>本月</span>
          <el-input-number v-model="valueWork" v-bind="typeWorkAttrs" />
          <span>日，最近的工作日</span>
        </div>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.loop" v-bind="beforeRadioAttrs">循环</el-radio>
        <div class="item-config">
          <span>从</span>
          <el-input-number v-model="valueLoop.start" v-bind="typeLoopAttrs" />
          <span>日开始, 间隔</span>
          <el-input-number v-model="valueLoop.interval" v-bind="typeLoopAttrs" />
          <span>日</span>
        </div>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.last" v-bind="beforeRadioAttrs">最后一日</el-radio>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.specify" v-bind="beforeRadioAttrs">指定</el-radio>
        <div class="list">
          <el-checkbox-group v-model="valueList">
            <el-checkbox v-for="i in specifyRange" :key="i" :value="i" v-bind="typeSpecifyAttrs">
              {{ i }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
  import { computed, watch, type ComputedRef } from 'vue'
  import { TypeEnum, useFormSetup, type FormSetupReturn } from './use-mixin'

  defineOptions({ name: 'DayForm' })

  const props = withDefaults(
    defineProps<{
      modelValue?: string
      disabled?: boolean
      week?: string
    }>(),
    {
      modelValue: '*',
      disabled: false,
      week: '?'
    }
  )

  const emit = defineEmits<{
    (e: 'change', value: string): void
    (e: 'update:modelValue', value: string): void
  }>()

  const isDisabled = computed(() => {
    return (props.week && props.week !== '?') || props.disabled
  })

  const setup = useFormSetup(props, emit, {
    defaultValue: '*',
    valueWork: 1,
    minValue: 1,
    maxValue: 31,
    valueRange: { start: 1, end: 31 },
    valueLoop: { start: 1, interval: 1 },
    disabled: isDisabled
  }) as FormSetupReturn & {
    typeWorkAttrs: ComputedRef<{
      disabled: boolean
      max: number
      min: number
      precision: number
      size: 'small'
      controlsPosition: 'right'
      class: string[]
    }>
  }

  const typeWorkAttrs = computed(() => ({
    disabled: setup.type.value !== TypeEnum.work || props.disabled || isDisabled.value,
    ...setup.inputNumberAttrs.value
  }))

  watch(
    () => props.week,
    () => {
      setup.updateValue(isDisabled.value ? '?' : setup.computeValue.value)
    }
  )

  const {
    type,
    valueRange,
    valueLoop,
    valueList,
    valueWork,
    specifyRange,
    beforeRadioAttrs,
    inputNumberAttrs,
    typeLoopAttrs,
    typeSpecifyAttrs
  } = setup
</script>
