<template>
  <div class="cron-config-list">
    <el-radio-group :model-value="type" @update:model-value="type = $event">
      <div class="item">
        <el-radio :value="TypeEnum.unset" v-bind="beforeRadioAttrs">不设置</el-radio>
        <span class="tip-info">日和周只能设置其中之一</span>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.range" v-bind="beforeRadioAttrs">区间</el-radio>
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
      <div class="item">
        <el-radio :value="TypeEnum.loop" v-bind="beforeRadioAttrs">循环</el-radio>
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
  import { computed, watch } from 'vue'
  import {
    TypeEnum,
    WEEK_MAP,
    useFormProps,
    useFormSetup,
    useFromEmits,
    type FormSetupReturn
  } from './use-mixin'

  defineOptions({ name: 'WeekForm' })

  const props = defineProps(
    useFormProps({
      defaultValue: '?',
      props: {
        day: { type: String, default: '*' }
      }
    })
  )

  const emit = defineEmits(useFromEmits())

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
      size: string
      class: string[]
    }>
    typeRangeSelectAttrs: ComputedRef<{
      disabled: boolean
      size: string
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
    size: 'small',
    class: ['w80']
  }))

  const typeLoopSelectAttrs = computed(() => ({
    disabled: setup.typeLoopAttrs.value.disabled,
    size: 'small',
    class: ['w80']
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
    specifyRange,
    beforeRadioAttrs,
    typeRangeAttrs,
    typeLoopAttrs,
    typeSpecifyAttrs
  } = setup
</script>
