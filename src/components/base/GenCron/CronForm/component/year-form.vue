<template>
  <div class="cron-config-list">
    <el-radio-group :model-value="type" @update:model-value="type = $event">
      <div class="item">
        <el-radio :value="TypeEnum.every" v-bind="beforeRadioAttrs">每年</el-radio>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.range" v-bind="beforeRadioAttrs">区间</el-radio>
        <span>从</span>
        <el-input-number v-model="valueRange.start" v-bind="typeRangeAttrs" />
        <span>年 至</span>
        <el-input-number v-model="valueRange.end" v-bind="typeRangeAttrs" />
        <span>年</span>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.loop" v-bind="beforeRadioAttrs">循环</el-radio>
        <span>从</span>
        <el-input-number v-model="valueLoop.start" v-bind="typeLoopAttrs" />
        <span>年开始, 间隔</span>
        <el-input-number v-model="valueLoop.interval" v-bind="typeLoopAttrs" />
        <span>年</span>
      </div>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
  import { useFormProps, useFormSetup, useFromEmits } from './use-mixin'

  defineOptions({ name: 'YearForm' })

  const props = defineProps(
    useFormProps({
      defaultValue: '*'
    })
  )

  const emit = defineEmits(useFromEmits())

  const nowYear = new Date().getFullYear()

  const setup = useFormSetup(props, emit, {
    defaultValue: '*',
    minValue: 0,
    valueRange: { start: nowYear, end: nowYear + 100 },
    valueLoop: { start: nowYear, interval: 1 }
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
