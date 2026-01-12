<template>
  <div class="cron-inner">
    <div class="content">
      <!-- 设置表单 -->
      <el-tabs v-model="activeKey" size="small">
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
      <el-row :gutter="8">
        <!-- 快捷修改 -->
        <el-col :span="18" style="margin-top: 28px">
          <el-row :gutter="12">
            <!-- 秒 -->
            <el-col :span="8">
              <el-input v-model="cronInputs.second" @change="onInputChange">
                <template #prepend>
                  <span class="cron-allow-click" @click="activeKey = 'second'">秒</span>
                </template>
              </el-input>
            </el-col>
            <!-- 分 -->
            <el-col :span="8">
              <el-input v-model="cronInputs.minute" @change="onInputChange">
                <template #prepend>
                  <span class="cron-allow-click" @click="activeKey = 'minute'">分</span>
                </template>
              </el-input>
            </el-col>
            <!-- 时 -->
            <el-col :span="8">
              <el-input v-model="cronInputs.hour" @change="onInputChange">
                <template #prepend>
                  <span class="cron-allow-click" @click="activeKey = 'hour'">时</span>
                </template>
              </el-input>
            </el-col>
            <!-- 日 -->
            <el-col :span="8">
              <el-input v-model="cronInputs.day" @change="onInputChange">
                <template #prepend>
                  <span class="cron-allow-click" @click="activeKey = 'day'">日</span>
                </template>
              </el-input>
            </el-col>
            <!-- 月 -->
            <el-col :span="8">
              <el-input v-model="cronInputs.month" @change="onInputChange">
                <template #prepend>
                  <span class="cron-allow-click" @click="activeKey = 'month'">月</span>
                </template>
              </el-input>
            </el-col>
            <!-- 周 -->
            <el-col :span="8">
              <el-input v-model="cronInputs.week" @change="onInputChange">
                <template #prepend>
                  <span class="cron-allow-click" @click="activeKey = 'week'">周</span>
                </template>
              </el-input>
            </el-col>
            <!-- 年 -->
            <el-col :span="8">
              <el-input v-model="cronInputs.year" @change="onInputChange">
                <template #prepend>
                  <span class="cron-allow-click" @click="activeKey = 'year'">年</span>
                </template>
              </el-input>
            </el-col>
            <!-- 表达式 -->
            <el-col :span="16">
              <el-input
                v-model="cronInputs.cron"
                :placeholder="placeholder"
                @change="onInputCronChange"
              >
                <template #prepend>
                  <span class="cron-allow-click">表达式</span>
                </template>
              </el-input>
            </el-col>
          </el-row>
        </el-col>
        <!-- 执行时间 -->
        <el-col :span="6">
          <div class="cron-preview-times usn">近五次执行时间 (不解析年)</div>
          <el-input v-model="previewTimes" type="textarea" :rows="5" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { watch } from 'vue'
  import { useDebounceFn } from '@vueuse/core'
  import CronParser from 'cron-parser'
  import dayjs from 'dayjs'
  import DayForm from './component/day-form.vue'
  import HourForm from './component/hour-form.vue'
  import MinuteForm from './component/minute-form.vue'
  import MonthForm from './component/month-form.vue'
  import SecondForm from './component/second-form.vue'
  import WeekForm from './component/week-form.vue'
  import YearForm from './component/year-form.vue'
  import type { CronPropType } from './type'
  import '@/components/base/GenCron/index.scss'

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

  // 输入框值
  const cronInputs = reactive({
    second: '',
    minute: '',
    hour: '',
    day: '',
    month: '',
    week: '',
    year: '',
    cron: ''
  })

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
    return corn.split(' ').slice(0, -1).join(' ')
  }

  // 计算触发时间
  const calculateNextExecutionTimes = (corn: string = cronExpression.value) => {
    try {
      const parse = expressionNoYear(corn)
      const date = dayjs().format('YYYY-MM-DD HH:mm:ss')
      const iter = CronParser.parseExpression(parse, { currentDate: date })
      const result: string[] = []
      for (let i = 1; i <= 5; i++) {
        result.push(dayjs(iter.next() as any).format('YYYY-MM-DD HH:mm:ss'))
      }
      previewTimes.value = result.length > 0 ? result.join('\n') : '无执行时间'
      props.callback?.(cronExpression.value, +new Date(), true)
    } catch {
      previewTimes.value = '表达式错误'
      props.callback?.(cronExpression.value, +new Date(), false)
    }
  }

  const calcTriggerTimeList = useDebounceFn(calculateNextExecutionTimes, 500)

  // 监听 cron 修改
  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal !== cronExpression.value) {
        parseCron()
      }
    }
  )

  // 监听 cron 表达式变化
  watch(cronExpression, (newValue) => {
    calcTriggerTimeList()
    emit('change', newValue)
    emit('update:modelValue', newValue)
    assignInput()
  })

  // 根据 cron 解析
  const parseCron = () => {
    calcTriggerTimeList()
    if (!props.modelValue) return

    const values = props.modelValue.split(' ').filter(Boolean)
    if (!values.length) return

    let i = 0
    if (!props.hideSecond) second.value = values[i++]
    if (values.length > i) minute.value = values[i++]
    if (values.length > i) hour.value = values[i++]
    if (values.length > i) day.value = values[i++]
    if (values.length > i) month.value = values[i++]
    if (values.length > i) week.value = values[i++]
    if (values.length > i) year.value = values[i]

    assignInput()
  }

  // 重新分配输入值
  const assignInput = () => {
    Object.assign(cronInputs, {
      second: second.value,
      minute: minute.value,
      hour: hour.value,
      day: day.value,
      month: month.value,
      week: week.value,
      year: year.value,
      cron: cronExpression.value
    })
  }

  // 修改 cron 解析内容
  const onInputChange = () => {
    second.value = cronInputs.second
    minute.value = cronInputs.minute
    hour.value = cronInputs.hour
    day.value = cronInputs.day
    month.value = cronInputs.month
    week.value = cronInputs.week
    year.value = cronInputs.year
  }

  // 修改 cron 输入框
  const onInputCronChange = (value: string) => {
    emit('change', value)
    emit('update:modelValue', value)
  }

  // 校验日和周只能有一个为 ?
  const checkCron = () => day.value === '?' && week.value === '?'

  onMounted(() => {
    assignInput()
    parseCron()
    if (!props.modelValue) {
      emit('change', cronExpression.value)
      emit('update:modelValue', cronExpression.value)
    }
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
