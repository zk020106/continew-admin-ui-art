<template>
  <div class="cron-config-list">
    <el-radio-group :model-value="type" @update:model-value="type = $event as any">
      <div class="item">
        <ElRadio :value="TypeEnum.unset" v-bind="beforeRadioAttrs">
{{
          $t('components.genCron.type.unset')
        }}
</ElRadio>
        <span class="tip-info">{{ $t('components.genCron.tip.dayWeekConflict') }}</span>
      </div>
      <div class="item">
        <ElRadio :value="TypeEnum.every" v-bind="beforeRadioAttrs">
{{
          $t('components.genCron.type.every', { unit: $t('components.genCron.tab.day') })
        }}
</ElRadio>
      </div>
      <div class="item">
        <ElRadio :value="TypeEnum.range" v-bind="beforeRadioAttrs">
{{
          $t('components.genCron.type.range')
        }}
</ElRadio>
        <div class="item-config">
          <span>{{ $t('components.genCron.unit.from') }}</span>
          <el-input-number v-model="valueRange.start" v-bind="inputNumberAttrs" />
          <span>{{ $t('components.genCron.unit.to') }}</span>
          <el-input-number v-model="valueRange.end" v-bind="inputNumberAttrs" />
          <span>{{ $t('components.genCron.tab.day') }}</span>
        </div>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.work" v-bind="beforeRadioAttrs">
{{
          $t('components.genCron.type.work')
        }}
</el-radio>
        <div class="item-config">
          <span>{{ $t('components.genCron.unit.thisMonth') }}</span>
          <el-input-number v-model="valueWork" v-bind="typeWorkAttrs" />
          <span>{{ $t('components.genCron.unit.nearestWorkday') }}</span>
        </div>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.loop" v-bind="beforeRadioAttrs">
{{
          $t('components.genCron.type.loop')
        }}
</el-radio>
        <div class="item-config">
          <span>{{ $t('components.genCron.unit.from') }}</span>
          <el-input-number v-model="valueLoop.start" v-bind="typeLoopAttrs" />
          <span
            >{{ $t('components.genCron.unit.start') }},
            {{ $t('components.genCron.unit.interval') }}</span
          >
          <el-input-number v-model="valueLoop.interval" v-bind="typeLoopAttrs" />
          <span>{{ $t('components.genCron.tab.day') }}</span>
        </div>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.last" v-bind="beforeRadioAttrs">
{{
          $t('components.genCron.type.last')
        }}
</el-radio>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.specify" v-bind="beforeRadioAttrs">
{{
          $t('components.genCron.type.specify')
        }}
</el-radio>
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
import type { ComputedRef } from 'vue'
import type { FormSetupReturn } from './use-mixin'
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { TypeEnum, useFormSetup } from './use-mixin'

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

const { t: _t } = useI18n()

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
