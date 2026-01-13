<template>
  <div class="cron-config-list">
    <el-radio-group :model-value="type" @update:model-value="type = $event as any">
      <div class="item">
        <el-radio :value="TypeEnum.unset" v-bind="beforeRadioAttrs">不设置</el-radio>
        <span class="tip-info">日和周只能设置其中之一</span>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.range" v-bind="beforeRadioAttrs">区间</el-radio>
        <div class="item-config">
          <span>从</span>
          <el-select v-model="valueRange.start" v-bind="typeRangeSelectAttrs">
            <el-option
              v-for="item in weekOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span>至</span>
          <el-select v-model="valueRange.end" v-bind="typeRangeSelectAttrs">
            <el-option
              v-for="item in weekOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.loop" v-bind="beforeRadioAttrs">循环</el-radio>
        <div class="item-config">
          <span>从</span>
          <el-select v-model="valueLoop.start" v-bind="typeLoopSelectAttrs">
            <el-option
              v-for="item in weekOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span>开始, 间隔</span>
          <el-input-number v-model="valueLoop.interval" v-bind="typeLoopAttrs" />
          <span>天</span>
        </div>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.specify" v-bind="beforeRadioAttrs">指定</el-radio>
        <div class="list list-cn">
          <el-checkbox-group v-model="valueList">
            <template v-for="opt in weekOptions" :key="opt">
              <el-checkbox :value="opt.value" v-bind="typeSpecifyAttrs">
                {{ opt.label }}
              </el-checkbox>
            </template>
          </el-checkbox-group>
        </div>
      </div>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
  import { computed, watch, type ComputedRef } from 'vue'
  import { TypeEnum, WEEK_MAP, useFormSetup, type FormSetupReturn } from './use-mixin'

  defineOptions({ name: 'WeekForm' })

  const props = withDefaults(
    defineProps<{
      modelValue?: string
      disabled?: boolean
      day?: string
    }>(),
    {
      modelValue: '?',
      disabled: false,
      day: '*'
    }
  )

  const emit = defineEmits<{
    (e: 'change', value: string): void
    (e: 'update:modelValue', value: string): void
  }>()

  const disabledChoice = computed(() => {
    return (props.day && props.day !== '?') || props.disabled
  })

  const setup = useFormSetup(props, emit, {
    defaultType: TypeEnum.unset,
    defaultValue: '?',
    minValue: 1,
    maxValue: 7,
    valueRange: { start: 1, end: 7 },
    valueLoop: { start: 2, interval: 1 },
    disabled: disabledChoice
  }) as FormSetupReturn & {
    typeLoopSelectAttrs: ComputedRef<{
      disabled: boolean
      size: 'small'
      class: string[]
    }>
    typeRangeSelectAttrs: ComputedRef<{
      disabled: boolean
      size: 'small'
      class: string[]
    }>
  }

  const weekOptions = computed(() => {
    return Object.entries(WEEK_MAP).map(([key, label]) => ({
      value: Number.parseInt(key),
      label
    }))
  })

  const typeRangeSelectAttrs = computed(() => ({
    disabled: setup.typeRangeAttrs.value.disabled,
    size: 'small' as const,
    class: []
  }))

  const typeLoopSelectAttrs = computed(() => ({
    disabled: setup.typeLoopAttrs.value.disabled,
    size: 'small' as const,
    class: []
  }))

  watch(
    () => props.day,
    () => {
      setup.updateValue(disabledChoice.value ? '?' : setup.computeValue.value)
    }
  )

  const {
    type,
    valueRange,
    valueLoop,
    valueList,
    beforeRadioAttrs,
    typeLoopAttrs,
    typeSpecifyAttrs
  } = setup
</script>
