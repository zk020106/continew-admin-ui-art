<template>
  <ElDrawer
    v-model="visible"
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :size="width >= 700 ? 700 : '100%'"
    :with-header="width >= 700"
    :body-style="{ maxHeight: width >= 700 ? '76vh' : '100vh' }"
    @close="reset"
  >
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      size="large"
      label-width="auto"
      :layout="width >= 700 ? 'inline' : 'vertical'"
    >
      <fieldset>
        <legend>{{ $t('schedule.job.form.basicConfig') }}</legend>
        <ElRow :gutter="12">
          <ElCol v-bind="colProps">
            <ElFormItem :label="t('schedule.job.form.groupName')" prop="groupName">
              <ElSelect
                v-model="form.groupName"
                :placeholder="t('schedule.job.form.groupNamePlaceholder')"
                :options="groupList"
                filterable
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol v-bind="colProps">
            <ElFormItem :label="t('schedule.job.form.jobName')" prop="jobName">
              <ElInput
                v-model="form.jobName"
                :placeholder="t('schedule.job.form.jobNamePlaceholder')"
                :maxlength="64"
                show-word-limit
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem :label="t('schedule.job.form.description')" prop="description">
          <ElInput
            v-model="form.description"
            type="textarea"
            :placeholder="t('schedule.job.form.descriptionPlaceholder')"
            show-word-limit
            :maxlength="200"
            :rows="3"
          />
        </ElFormItem>
      </fieldset>
      <fieldset>
        <legend>{{ $t('schedule.job.form.scheduleConfig') }}</legend>
        <ElRow :gutter="12">
          <ElCol v-bind="colProps">
            <ElFormItem :label="t('schedule.job.form.triggerType')" prop="triggerType">
              <ElSelect
                v-model="form.triggerType"
                :placeholder="t('schedule.job.form.triggerTypePlaceholder')"
                :options="job_trigger_type_enum"
                @change="triggerTypeChange"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol v-bind="colProps">
            <ElFormItem
              v-if="form.triggerType === 2"
              :label="t('schedule.job.form.triggerInterval.interval')"
              prop="triggerInterval"
            >
              <ElInput
                v-model="form.triggerInterval"
                :placeholder="t('schedule.job.form.triggerInterval.intervalPlaceholder')"
              >
                <template #suffix>{{
                  $t('schedule.job.form.triggerInterval.intervalUnit')
                }}</template>
              </ElInput>
            </ElFormItem>
            <ElFormItem
              v-else
              :label="t('schedule.job.form.triggerInterval.cron')"
              prop="triggerInterval"
            >
              <div style="display: flex">
                <ElInput
                  v-model="form.triggerInterval"
                  :fetch-suggestions="querySearch"
                  :placeholder="t('schedule.job.form.triggerInterval.cronPlaceholder')"
                  clearable
                  style="flex: 1"
                >
                  <template #append>
                    <ElTooltip :content="t('components.genCron.title')">
                      <ElButton @click="openGeneratorCron(form.triggerInterval)" :icon="Clock" />
                    </ElTooltip>
                  </template>
                </ElInput>
              </div>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </fieldset>
      <fieldset>
        <legend>{{ $t('schedule.job.form.taskConfig') }}</legend>
        <ElRow :gutter="12">
          <ElCol v-bind="colProps">
            <ElFormItem :label="t('schedule.job.form.taskType')" prop="taskType">
              <ElSelect
                v-model="form.taskType"
                :options="job_task_type_enum"
                :placeholder="t('schedule.job.form.taskTypePlaceholder')"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol v-bind="colProps">
            <ElFormItem :label="t('schedule.job.form.executorInfo')" prop="executorInfo">
              <ElInput
                v-model="form.executorInfo"
                :placeholder="t('schedule.job.form.executorInfoPlaceholder')"
                :maxlength="255"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem :label="t('schedule.job.form.argsStr')" prop="argsStr">
          <ElInput
            v-if="form.taskType !== 3"
            v-model="form.argsStr"
            type="textarea"
            :placeholder="t('schedule.job.form.argsStrPlaceholder')"
            :rows="3"
          />
          <div v-else class="args-container">
            <div v-for="(item, index) in args" :key="index" class="args-item">
              <ElFormItem
                hide-label
                :rules="[
                  {
                    required: true,
                    message: t('schedule.job.form.sliceParamPlaceholder', { index: index + 1 })
                  }
                ]"
              >
                <ElInput
                  v-model="item.value"
                  :placeholder="t('schedule.job.form.sliceParamPlaceholder', { index: index + 1 })"
                />
              </ElFormItem>
              <ElButton type="danger" :icon="Delete" circle @click="onDeleteArgs(index)" />
            </div>
            <ElButton type="primary" :icon="Plus" @click="onAddArgs">{{
              $t('schedule.job.form.sliceParam')
            }}</ElButton>
          </div>
        </ElFormItem>
      </fieldset>
      <fieldset>
        <legend>{{ $t('schedule.job.form.advancedConfig') }}</legend>
        <ElRow :gutter="12">
          <ElCol v-bind="colProps">
            <ElFormItem :label="t('schedule.job.form.routeKey')" prop="routeKey">
              <ElSelect
                v-model="form.routeKey"
                :placeholder="t('schedule.job.form.routeKeyPlaceholder')"
                :options="job_route_strategy_enum"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol v-bind="colProps">
            <ElFormItem :label="t('schedule.job.form.blockStrategy')" prop="blockStrategy">
              <ElSelect
                v-model="form.blockStrategy"
                :placeholder="t('schedule.job.form.blockStrategyPlaceholder')"
                :options="job_block_strategy_enum"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol v-bind="colProps">
            <ElFormItem :label="t('schedule.job.form.executorTimeout')" prop="executorTimeout">
              <ElInputNumber
                v-model="form.executorTimeout"
                :placeholder="t('schedule.job.form.executorTimeoutPlaceholder')"
                :min="1"
                controls-position="right"
              >
                <template #suffix>{{ $t('schedule.job.form.executorTimeoutUnit') }}</template>
              </ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol v-bind="colProps">
            <ElFormItem :label="t('schedule.job.form.maxRetryTimes')" prop="maxRetryTimes">
              <ElInputNumber
                v-model="form.maxRetryTimes"
                :placeholder="t('schedule.job.form.maxRetryTimesPlaceholder')"
                :min="0"
                controls-position="right"
              />
            </ElFormItem>
          </ElCol>
          <ElCol v-bind="colProps">
            <ElFormItem :label="t('schedule.job.form.retryInterval')" prop="retryInterval">
              <ElInputNumber
                v-model="form.retryInterval"
                :placeholder="t('schedule.job.form.retryIntervalPlaceholder')"
                :min="1"
                controls-position="right"
              >
                <template #suffix>{{ $t('schedule.job.form.retryIntervalUnit') }}</template>
              </ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol v-bind="colProps">
            <ElFormItem :label="t('schedule.job.form.parallelNum')" prop="parallelNum">
              <ElInputNumber
                v-model="form.parallelNum"
                :placeholder="t('schedule.job.form.parallelNumPlaceholder')"
                :min="1"
                controls-position="right"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </fieldset>
    </ElForm>

    <CronModal ref="cronModal" @ok="(e) => (form.triggerInterval = e)" />

    <template #footer>
      <div style="display: flex; flex: 1; gap: 12px; justify-content: flex-end">
        <ElButton @click="visible = false">{{ $t('common.cancel') }}</ElButton>
        <ElButton type="primary" @click="save">{{ $t('common.confirm') }}</ElButton>
      </div>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { addJob, listGroup, updateJob } from '@/apis/schedule/job'
  import CronModal from '@/components/base/GenCron/CronModal/index.vue'
  import { useDict, useResetReactive } from '@/hooks'
  import type { LabelValueState } from '@/types/global'
  import { Clock, Delete, Plus } from '@element-plus/icons-vue'
  import { useWindowSize } from '@vueuse/core'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()

  const { t } = useI18n()
  const { width } = useWindowSize()

  const colProps = { xs: 24, sm: 24, md: 12, lg: 12, xl: 12, xxl: 12 }

  // 内置 Cron 表达式
  const cron_list = computed(() => [
    { label: t('components.cronPreset.everyMinute'), value: '0 * * * * ?' },
    { label: t('components.cronPreset.every30Minutes'), value: '0 0/30 * * * ?' },
    { label: t('components.cronPreset.everyHour'), value: '0 0 * * * ?' },
    { label: t('components.cronPreset.everyDay'), value: '0 0 0 * * ?' },
    { label: t('components.cronPreset.everyMonth'), value: '0 0 0 1 * ?' },
    { label: t('components.cronPreset.everyMonthLast'), value: '0 0 0 L * ?' },
    { label: t('components.cronPreset.everyMonthLastWorkday'), value: '0 0 0 LW * ?' },
    { label: t('components.cronPreset.everyWeek'), value: '0 0 0 ? * 1' }
  ])

  const dataId = ref<number>()
  const visible = ref(false)
  const isUpdate = computed(() => !!dataId.value)
  const title = computed(() =>
    isUpdate.value ? t('schedule.job.button.edit') : t('schedule.job.button.add')
  )
  const formRef = ref<FormInstance>()
  const groupList = ref<LabelValueState[]>([])
  const {
    job_trigger_type_enum,
    job_task_type_enum,
    job_route_strategy_enum,
    job_block_strategy_enum
  } = useDict(
    'job_trigger_type_enum',
    'job_task_type_enum',
    'job_route_strategy_enum',
    'job_block_strategy_enum'
  )
  const rules: FormRules = {
    groupName: [
      { required: true, message: t('schedule.job.form.groupNamePlaceholder'), trigger: 'change' }
    ],
    jobName: [
      { required: true, message: t('schedule.job.form.jobNamePlaceholder'), trigger: 'blur' }
    ],
    triggerType: [
      { required: true, message: t('schedule.job.form.triggerTypePlaceholder'), trigger: 'change' }
    ],
    taskType: [
      { required: true, message: t('schedule.job.form.taskTypePlaceholder'), trigger: 'change' }
    ],
    executorInfo: [
      { required: true, message: t('schedule.job.form.executorInfoPlaceholder'), trigger: 'blur' }
    ],
    routeKey: [
      { required: true, message: t('schedule.job.form.routeKeyPlaceholder'), trigger: 'change' }
    ],
    blockStrategy: [
      {
        required: true,
        message: t('schedule.job.form.blockStrategyPlaceholder'),
        trigger: 'change'
      }
    ],
    executorTimeout: [
      {
        required: true,
        message: t('schedule.job.form.executorTimeoutPlaceholder'),
        trigger: 'blur'
      }
    ],
    maxRetryTimes: [
      { required: true, message: t('schedule.job.form.maxRetryTimesPlaceholder'), trigger: 'blur' }
    ],
    retryInterval: [
      { required: true, message: t('schedule.job.form.retryIntervalPlaceholder'), trigger: 'blur' }
    ],
    parallelNum: [
      { required: true, message: t('schedule.job.form.parallelNumPlaceholder'), trigger: 'blur' }
    ]
  }

  const [form, resetForm] = useResetReactive({
    groupName: '',
    jobName: '',
    description: '',
    triggerType: 2,
    triggerInterval: '60',
    taskType: 1,
    executorInfo: '',
    argsStr: '',
    routeKey: 4,
    blockStrategy: 1,
    executorTimeout: 60,
    maxRetryTimes: 3,
    retryInterval: 1,
    parallelNum: 1
  })

  const args = ref<{ value: string }[]>([{ value: '' }])

  // 重置
  const reset = () => {
    formRef.value?.resetFields()
    args.value = [{ value: '' }]
    resetForm()
  }

  // 触发类型切换
  const triggerTypeChange = () => {
    switch (form.triggerType) {
      case 2:
        form.triggerInterval = '60'
        break
      case 3:
        form.triggerInterval = '0 * * * * ?'
        break
    }
  }

  // 新增切片参数
  const onAddArgs = () => {
    args.value.push({ value: '' })
  }

  // 删除切片参数
  const onDeleteArgs = (index: number) => {
    args.value.splice(index, 1)
  }

  // Cron 表达式自动完成查询
  const querySearch = (queryString: string, cb: (results: { value: string }[]) => void) => {
    const results = queryString
      ? cron_list.value.filter(
          (item) => item.label.includes(queryString) || item.value.includes(queryString)
        )
      : cron_list
    cb(results.map((item) => ({ value: item.value })))
  }

  const cronModal = ref()

  // 打开生成表达式
  const openGeneratorCron = (cron: string) => {
    cronModal.value.open(cron)
  }

  // 保存
  const save = async () => {
    try {
      // 切片任务，将参数转换为 JSON 数组
      if (form.taskType === 3) {
        form.argsStr = JSON.stringify(args.value.map((arg) => arg.value))
      }
      await formRef.value?.validate()
      if (isUpdate.value) {
        await updateJob(form, dataId.value!)
        ElMessage.success(t('schedule.job.message.editSuccess'))
      } else {
        await addJob(form)
        ElMessage.success(t('schedule.job.message.addSuccess'))
      }
      emit('save-success')
      visible.value = false
    } catch (error) {
      console.error(error)
    }
  }

  // 查询任务组列表
  const getGroupList = async () => {
    const data = await listGroup()
    groupList.value = data?.map((item: string) => ({
      label: item,
      value: item
    }))
  }

  // 新增
  const onAdd = async () => {
    reset()
    dataId.value = undefined
    if (!groupList.value.length) {
      await getGroupList()
    }
    visible.value = true
  }

  // 修改
  const onUpdate = async (record: any) => {
    reset()
    dataId.value = record.id
    if (!groupList.value.length) {
      await getGroupList()
    }
    Object.assign(form, record)
    // 切片任务，解析 argsStr 并赋值给 args
    if (form.taskType === 3 && form.argsStr) {
      try {
        const parsedArgs = JSON.parse(form.argsStr)
        args.value = parsedArgs.map((arg: any) => ({ value: arg }))
      } catch (error: any) {
        ElMessage.error(error.message)
      }
    }
    visible.value = true
  }

  defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss">
  fieldset {
    padding: 15px 15px 0;
    margin-bottom: 15px;
    border: 1px solid var(--el-border-color);
    border-radius: 3px;

    legend {
      padding: 2px 5px;
      color: var(--el-text-color-primary);
      border: 1px solid var(--el-border-color);
      border-radius: 3px;
    }
  }

  .args-container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .args-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    > *:not(:last-child) {
      margin-right: 10px;
    }
  }
</style>
