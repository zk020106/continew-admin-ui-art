<template>
  <div class="cron-config-list">
    <el-radio-group :model-value="type" @update:model-value="type = $event as any">
      <div class="item">
        <el-radio :value="TypeEnum.every" v-bind="beforeRadioAttrs">{{
          $t('components.genCron.type.every', { unit: $t('components.genCron.unit.second') })
        }}</el-radio>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.range" v-bind="beforeRadioAttrs">{{
          $t('components.genCron.type.range')
        }}</el-radio>
        <div class="item-config">
          <span>{{ $t('components.genCron.unit.from') }}</span>
          <el-input-number v-model="valueRange.start" v-bind="typeRangeAttrs" />
          <span>{{ $t('components.genCron.unit.to') }}</span>
          <el-input-number v-model="valueRange.end" v-bind="typeRangeAttrs" />
          <span>{{ $t('components.genCron.unit.second') }}</span>
        </div>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.loop" v-bind="beforeRadioAttrs">{{
          $t('components.genCron.type.loop')
        }}</el-radio>
        <div class="item-config">
          <span>{{ $t('components.genCron.unit.from') }}</span>
          <el-input-number v-model="valueLoop.start" v-bind="typeLoopAttrs" />
          <span
            >{{ $t('components.genCron.unit.start') }},
            {{ $t('components.genCron.unit.interval') }}</span
          >
          <el-input-number v-model="valueLoop.interval" v-bind="typeLoopAttrs" />
          <span>{{ $t('components.genCron.unit.second') }}</span>
        </div>
      </div>
      <div class="item">
        <el-radio :value="TypeEnum.specify" v-bind="beforeRadioAttrs">{{
          $t('components.genCron.type.specify')
        }}</el-radio>
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
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'SecondForm' })

  const { t } = useI18n()

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
