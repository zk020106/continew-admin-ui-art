import { computed, reactive, ref, watch, type ComputedRef, type Reactive, type Ref } from 'vue'

// 类型定义
export const TypeEnum = {
  unset: 'UNSET',
  every: 'EVERY',
  range: 'RANGE',
  loop: 'LOOP',
  work: 'WORK',
  last: 'LAST',
  specify: 'SPECIFY'
} as const

export type TypeEnumValue = (typeof TypeEnum)[keyof typeof TypeEnum]

// 周定义
export const WEEK_MAP: Record<number, string> = {
  1: '周日',
  2: '周一',
  3: '周二',
  4: '周三',
  5: '周四',
  6: '周五',
  7: '周六'
}

// 选项类型
export interface WeekOption {
  label: string
  value: number
}

// 表单配置选项
export interface FormSetupOptions {
  defaultValue?: string
  defaultType?: TypeEnumValue
  minValue?: number
  maxValue?: number
  valueRange?: { start: number; end: number }
  valueLoop?: { start: number; interval: number }
  disabled?: boolean | (() => boolean)
}

// 返回值类型
export interface FormSetupReturn {
  type: Ref<TypeEnumValue>
  TypeEnum: typeof TypeEnum
  defaultValue: Ref<string>
  valueRange: Reactive<{ start: number; end: number }>
  valueLoop: Reactive<{ start: number; interval: number }>
  valueList: Ref<number[]>
  valueWork: Ref<number>
  maxValue: Ref<number>
  minValue: Ref<number>
  computeValue: ComputedRef<string>
  specifyRange: ComputedRef<number[]>
  updateValue: (value: string) => void
  beforeRadioAttrs: ComputedRef<{
    class: string[]
    disabled: boolean
    size: string
  }>
  inputNumberAttrs: ComputedRef<{
    max: number
    min: number
    precision: number
    size: string
    class: string[]
  }>
  typeRangeAttrs: ComputedRef<{
    disabled: boolean
    max: number
    min: number
    precision: number
    size: string
    class: string[]
  }>
  typeLoopAttrs: ComputedRef<{
    disabled: boolean
    max: number
    min: number
    precision: number
    size: string
    class: string[]
  }>
  typeSpecifyAttrs: ComputedRef<{
    disabled: boolean
    class: string[]
    size: string
  }>
}

// 公共 props
export function useFormProps(options: { defaultValue?: string; props?: Record<string, any> }) {
  return {
    modelValue: {
      type: String,
      default: options.defaultValue ?? '?'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    ...options.props
  } as const
}

// 公共 emits
export function useFromEmits() {
  return ['change', 'update:modelValue'] as const
}

// 公共 setup
export function useFormSetup(
  props: Record<string, any>,
  context: { emit: (event: string, value: any) => void },
  options: FormSetupOptions = {}
): FormSetupReturn {
  const emit = context.emit
  const defaultValue = ref(options.defaultValue ?? '?')
  const type = ref<TypeEnumValue>(options.defaultType ?? TypeEnum.every)
  const valueList = ref<number[]>([])

  const valueRange = reactive(options.valueRange ?? { start: 0, end: 59 })
  const valueLoop = reactive(options.valueLoop ?? { start: 0, interval: 1 })
  const valueWork = ref(options.minValue ?? 1)
  const maxValue = ref(options.maxValue ?? 59)
  const minValue = ref(options.minValue ?? 0)

  // 根据不同的类型计算出的 value
  const computeValue = computed(() => {
    const valueArray: string[] = []
    switch (type.value) {
      case TypeEnum.unset:
        valueArray.push('?')
        break
      case TypeEnum.every:
        valueArray.push('*')
        break
      case TypeEnum.range:
        valueArray.push(`${valueRange.start}-${valueRange.end}`)
        break
      case TypeEnum.loop:
        valueArray.push(`${valueLoop.start}/${valueLoop.interval}`)
        break
      case TypeEnum.work:
        valueArray.push(`${valueWork.value}W`)
        break
      case TypeEnum.last:
        valueArray.push('L')
        break
      case TypeEnum.specify:
        if (valueList.value.length === 0) {
          valueList.value.push(minValue.value)
        }
        valueArray.push(valueList.value.join(','))
        break
      default:
        valueArray.push(defaultValue.value)
        break
    }
    return valueArray.length > 0 ? valueArray.join('') : defaultValue.value
  })

  // 指定值范围区间, 介于最小值和最大值之间
  const specifyRange = computed(() => {
    const range: number[] = []
    if (maxValue.value != null) {
      for (let i = minValue.value; i <= maxValue.value; i++) {
        range.push(i)
      }
    }
    return range
  })

  // 更新值
  const updateValue = (value: string) => {
    emit('change', value)
    emit('update:modelValue', value)
  }

  // 解析值
  const parseValue = (value: string) => {
    if (value === computeValue.value) {
      return
    }
    try {
      if (!value || value === defaultValue.value) {
        type.value = TypeEnum.every
      } else if (value.includes('?')) {
        type.value = TypeEnum.unset
      } else if (value.includes('-')) {
        type.value = TypeEnum.range
        const values = value.split('-')
        if (values.length >= 2) {
          valueRange.start = Number.parseInt(values[0])
          valueRange.end = Number.parseInt(values[1])
        }
      } else if (value.includes('/')) {
        type.value = TypeEnum.loop
        const values = value.split('/')
        if (values.length >= 2) {
          valueLoop.start = value[0] === '*' ? 0 : Number.parseInt(values[0])
          valueLoop.interval = Number.parseInt(values[1])
        }
      } else if (value.includes('W')) {
        type.value = TypeEnum.work
        const values = value.split('W')
        if (!values[0] && !Number.isNaN(values[0])) {
          valueWork.value = Number.parseInt(values[0])
        }
      } else if (value.includes('L')) {
        type.value = TypeEnum.last
      } else if (value.includes(',') || !Number.isNaN(value)) {
        type.value = TypeEnum.specify
        valueList.value = value.split(',').map((item) => Number.parseInt(item))
      } else {
        type.value = TypeEnum.every
      }
    } catch {
      type.value = TypeEnum.every
    }
  }

  // 获取 disabled 状态
  const getDisabled = () => {
    const optionDisabled = options.disabled
    if (typeof optionDisabled === 'function') {
      return optionDisabled()
    }
    return optionDisabled ?? false
  }

  // 更新值
  watch(
    () => props.modelValue,
    (val) => {
      if (val !== computeValue.value) {
        parseValue(val)
      }
    },
    { immediate: true }
  )

  // 更新值
  watch(computeValue, (v) => updateValue(v))

  // 单选框属性
  const beforeRadioAttrs = computed(() => ({
    class: ['choice'],
    disabled: props.disabled || getDisabled(),
    size: 'small'
  }))

  // 输入框属性
  const inputNumberAttrs = computed(() => ({
    max: maxValue.value,
    min: minValue.value,
    precision: 0,
    size: 'small',
    class: ['w60']
  }))

  // 区间属性
  const typeRangeAttrs = computed(() => ({
    disabled: type.value !== TypeEnum.range || props.disabled || getDisabled(),
    ...inputNumberAttrs.value
  }))

  // 间隔属性
  const typeLoopAttrs = computed(() => ({
    disabled: type.value !== TypeEnum.loop || props.disabled || getDisabled(),
    ...inputNumberAttrs.value
  }))

  // 指定属性
  const typeSpecifyAttrs = computed(() => ({
    disabled: type.value !== TypeEnum.specify || props.disabled || getDisabled(),
    class: ['list-check-item'],
    size: 'small'
  }))

  return {
    type,
    TypeEnum,
    defaultValue,
    valueRange,
    valueLoop,
    valueList,
    valueWork,
    maxValue,
    minValue,
    computeValue,
    specifyRange,
    updateValue,
    beforeRadioAttrs,
    inputNumberAttrs,
    typeRangeAttrs,
    typeLoopAttrs,
    typeSpecifyAttrs
  }
}
