<template>
  <div class="cron-config-list">
    <el-radio-group :model-value="type" @update:model-value="type = $event as any">
      <div class="item">
        <el-radio :value="TypeEnum.unset" v-bind="beforeRadioAttrs">
{{
          $t('components.genCron.type.unset')
        }}
</el-radio>
        <span class="tip-info">{{ $t('components.genCron.tip.dayWeekConflict') }}</span>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.range" v-bind="beforeRadioAttrs">
{{
          $t('components.genCron.type.range')
        }}
</el-radio>
        <div class="item-config">
          <span>{{ $t('components.genCron.unit.from') }}</span>
          <el-select v-model="valueRange.start" v-bind="typeRangeSelectAttrs">
            <el-option
              v-for="item in weekOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span>{{ $t('components.genCron.unit.to') }}</span>
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
        <el-radio :value="TypeEnum.loop" v-bind="beforeRadioAttrs">
{{
          $t('components.genCron.type.loop')
        }}
</el-radio>
        <div class="item-config">
          <span>{{ $t('components.genCron.unit.from') }}</span>
          <el-select v-model="valueLoop.start" v-bind="typeLoopSelectAttrs">
            <el-option
              v-for="item in weekOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <span
            >{{ $t('components.genCron.unit.start') }},
            {{ $t('components.genCron.unit.interval') }}</span
          >
          <el-input-number v-model="valueLoop.interval" v-bind="typeLoopAttrs" />
          <span>{{ $t('components.genCron.unit.day') }}</span>
        </div>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.specify" v-bind="beforeRadioAttrs">
{{
          $t('components.genCron.type.specify')
        }}
</el-radio>
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
import type { ComputedRef } from 'vue'
import type { FormSetupReturn } from './use-mixin'
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { TypeEnum, useFormSetup } from './use-mixin'

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

const { t } = useI18n()

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
  const weekMap: Record<number, string> = {
    1: t('components.genCron.week.sunday'),
    2: t('components.genCron.week.monday'),
    3: t('components.genCron.week.tuesday'),
    4: t('components.genCron.week.wednesday'),
    5: t('components.genCron.week.thursday'),
    6: t('components.genCron.week.friday'),
    7: t('components.genCron.week.saturday')
  }
  return Object.entries(weekMap).map(([key, label]) => ({
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
