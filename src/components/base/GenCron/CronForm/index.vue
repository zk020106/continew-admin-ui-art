<template>
  <div class="cron-inner">
    <div class="content">
      <!-- 设置表单 -->
      <el-tabs v-model="activeKey">
        <!-- 秒 -->
        <el-tab-pane v-if="!hideSecond" key="second" name="second" label="秒">
          <SecondForm v-model="second" :disabled="disabled" />
        </el-tab-pane>
        <!-- 分 -->
        <el-tab-pane key="minute" name="minute" label="分">
          <MinuteForm v-model="minute" :disabled="disabled" />
        </el-tab-pane>
        <!-- 时 -->
        <el-tab-pane key="hour" name="hour" label="时">
          <HourForm v-model="hour" :disabled="disabled" />
        </el-tab-pane>
        <!-- 日 -->
        <el-tab-pane key="day" name="day" label="日">
          <DayForm v-model="day" :week="week" :disabled="disabled" />
        </el-tab-pane>
        <!-- 月 -->
        <el-tab-pane key="month" name="month" label="月">
          <MonthForm v-model="month" :disabled="disabled" />
        </el-tab-pane>
        <!-- 周 -->
        <el-tab-pane key="week" name="week" label="周">
          <WeekForm v-model="week" :day="day" :disabled="disabled" />
        </el-tab-pane>
        <!-- 年 -->
        <el-tab-pane v-if="!hideYear && !hideSecond" key="year" name="year" label="年">
          <YearForm v-model="year" :disabled="disabled" />
        </el-tab-pane>
      </el-tabs>

      <!-- 执行时间预览 -->
      <el-row :gutter="12" class="mt-4">
        <!-- 快捷修改 -->
        <el-col :xs="24" :sm="18">
          <el-row :gutter="8">
            <el-col v-for="item in unitList" :key="item.key" :span="8" class="mb-2">
              <el-input v-model="item.value.value" @change="calcTriggerTimeList">
                <template #prepend>
                  <span class="cron-allow-click" @click="activeKey = item.key">{{
                    item.label
                  }}</span>
                </template>
              </el-input>
            </el-col>

            <!-- 表达式 -->
            <el-col :span="16">
              <el-input v-model="cronInput" :placeholder="placeholder" @change="onInputCronChange">
                <template #prepend>
                  <span class="cron-allow-click">表达式</span>
                </template>
              </el-input>
            </el-col>
          </el-row>
        </el-col>

        <!-- 执行时间 -->
        <el-col :xs="24" :sm="6">
          <div class="cron-preview-times usn">近五次执行时间 (不解析年)</div>
          <el-input v-model="previewTimes" type="textarea" :rows="5" readonly />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
  import '@/components/base/GenCron/index.scss'
  import { useDebounceFn } from '@vueuse/core'
  import CronParser from 'cron-parser'
  import dayjs from 'dayjs'
  import { computed, onMounted, ref, watch } from 'vue'
  import DayForm from './component/day-form.vue'
  import HourForm from './component/hour-form.vue'
  import MinuteForm from './component/minute-form.vue'
  import MonthForm from './component/month-form.vue'
  import SecondForm from './component/second-form.vue'
  import WeekForm from './component/week-form.vue'
  import YearForm from './component/year-form.vue'
  import type { CronPropType } from './type'

  defineOptions({ name: 'CronForm' })

  const props = withDefaults(defineProps<Partial<CronPropType>>(), {
    disabled: false,
    hideSecond: false,
    hideYear: false,
    placeholder: '请输入 Cron 表达式'
  })

  const emit = defineEmits(['change', 'update:modelValue'])

  const activeKey = ref(props.hideSecond ? 'minute' : 'second')

  // 时间单位值
  const second = ref('*')
  const minute = ref('*')
  const hour = ref('*')
  const day = ref('*')
  const month = ref('*')
  const week = ref('?')
  const year = ref('*')

  // UI 配置列表
  const unitList = computed(() => {
    const list = [
      { key: 'second', label: '秒', value: second, hide: props.hideSecond },
      { key: 'minute', label: '分', value: minute, hide: false },
      { key: 'hour', label: '时', value: hour, hide: false },
      { key: 'day', label: '日', value: day, hide: false },
      { key: 'month', label: '月', value: month, hide: false },
      { key: 'week', label: '周', value: week, hide: false },
      { key: 'year', label: '年', value: year, hide: props.hideYear || props.hideSecond }
    ]
    return list.filter((item) => !item.hide)
  })

  // 表达式文本框
  const cronInput = ref('')

  const previewTimes = ref('执行预览')

  // cron 表达式
  const cronExpression = computed(() => {
    const result: string[] = []
    if (!props.hideSecond) {
      result.push(second.value || '*')
    }
    result.push(minute.value || '*')
    result.push(hour.value || '*')
    result.push(day.value || '*')
    result.push(month.value || '*')
    result.push(week.value || '?')
    if (!props.hideYear && !props.hideSecond) {
      result.push(year.value || '*')
    }
    return result.join(' ')
  })

  // 不含年的 cron 表达式
  const expressionNoYear = (corn: string) => {
    if (props.hideYear || props.hideSecond) return corn
    const parts = corn.split(' ')
    return parts.length > 6 ? parts.slice(0, 6).join(' ') : corn
  }

  // 计算触发时间
  const calculateNextExecutionTimes = (corn: string = cronExpression.value) => {
    try {
      const parse = expressionNoYear(corn)
      const date = dayjs().format('YYYY-MM-DD HH:mm:ss')
      const iter = CronParser.parse(parse, { currentDate: date })
      const result: string[] = []
      for (let i = 1; i <= 5; i++) {
        result.push(dayjs(iter.next() as any).format('YYYY-MM-DD HH:mm:ss'))
      }
      previewTimes.value = result.length > 0 ? result.join('\n') : '无执行时间'
      props.callback?.(cronExpression.value, +new Date(), true)
    } catch (error) {
      previewTimes.value = '表达式错误'
      props.callback?.(cronExpression.value, +new Date(), false)
    }
  }

  const calcTriggerTimeList = useDebounceFn(calculateNextExecutionTimes, 500)

  // 监听 v-model
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal !== cronExpression.value) {
        parseCron(newVal)
      }
    }
  )

  // 监听内部表达式变化
  watch(cronExpression, (newValue) => {
    calcTriggerTimeList()
    emit('change', newValue)
    emit('update:modelValue', newValue)
    cronInput.value = newValue
  })

  // 解析 cron
  const parseCron = (value: string | undefined) => {
    if (!value) return
    const values = value.split(' ').filter(Boolean)
    if (!values.length) return

    let i = 0
    if (!props.hideSecond && values.length > i) second.value = values[i++]
    if (values.length > i) minute.value = values[i++]
    if (values.length > i) hour.value = values[i++]
    if (values.length > i) day.value = values[i++]
    if (values.length > i) month.value = values[i++]
    if (values.length > i) week.value = values[i++]
    if (!props.hideYear && !props.hideSecond && values.length > i) year.value = values[i]

    cronInput.value = cronExpression.value
    calcTriggerTimeList()
  }

  // 修改 cron 输入框
  const onInputCronChange = (value: string) => {
    emit('change', value)
    emit('update:modelValue', value)
    parseCron(value)
  }

  // 校验日和周只能有一个为 ?
  const checkCron = () => day.value === '?' && week.value === '?'

  onMounted(() => {
    if (props.modelValue) {
      parseCron(props.modelValue)
    } else {
      emit('change', cronExpression.value)
      emit('update:modelValue', cronExpression.value)
    }
    cronInput.value = cronExpression.value
  })

  defineExpose({ checkCron })
</script>

<style lang="scss" scoped>
  .cron-inner {
    user-select: none;
  }

  :deep(.el-input-group__prepend) {
    padding: 0 !important;
  }
</style>
