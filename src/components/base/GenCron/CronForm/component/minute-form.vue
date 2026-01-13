<template>
  <div class="cron-config-list">
    <el-radio-group :model-value="type" @update:model-value="type = $event as any">
      <div class="item">
        <el-radio :value="TypeEnum.every" v-bind="beforeRadioAttrs">每分</el-radio>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.range" v-bind="beforeRadioAttrs">区间</el-radio>
        <div class="item-config">
          <span>从</span>
          <el-input-number v-model="valueRange.start" v-bind="typeRangeAttrs" />
          <span>分 至</span>
          <el-input-number v-model="valueRange.end" v-bind="typeRangeAttrs" />
          <span>分</span>
        </div>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.loop" v-bind="beforeRadioAttrs">循环</el-radio>
        <div class="item-config">
          <span>从</span>
          <el-input-number v-model="valueLoop.start" v-bind="typeLoopAttrs" />
          <span>分开始, 间隔</span>
          <el-input-number v-model="valueLoop.interval" v-bind="typeLoopAttrs" />
          <span>分</span>
        </div>
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
  import { useFormSetup } from './use-mixin'

  defineOptions({ name: 'MinuteForm' })

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
    minValue: 0,
    maxValue: 59,
    valueRange: { start: 0, end: 59 },
    valueLoop: { start: 0, interval: 1 }
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
