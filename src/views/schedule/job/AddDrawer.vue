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
        <legend>基础配置</legend>
        <ElRow :gutter="12">
          <ElCol v-bind="colProps">
            <ElFormItem label="任务组" prop="groupName">
              <ElSelect
                v-model="form.groupName"
                placeholder="请选择任务组"
                :options="groupList"
                filterable
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol v-bind="colProps">
            <ElFormItem label="任务名称" prop="jobName">
              <ElInput
                v-model="form.jobName"
                placeholder="请输入任务名称"
                :maxlength="64"
                show-word-limit
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="描述" prop="description">
          <ElInput
            v-model="form.description"
            type="textarea"
            placeholder="请输入描述"
            show-word-limit
            :maxlength="200"
            :rows="3"
          />
        </ElFormItem>
      </fieldset>
      <fieldset>
        <legend>调度配置</legend>
        <ElRow :gutter="12">
          <ElCol v-bind="colProps">
            <ElFormItem label="触发类型" prop="triggerType">
              <ElSelect
                v-model="form.triggerType"
                placeholder="请选择触发类型"
                :options="job_trigger_type_enum"
                @change="triggerTypeChange"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol v-bind="colProps">
            <ElFormItem v-if="form.triggerType === 2" label="间隔时长" prop="triggerInterval">
              <ElInput v-model="form.triggerInterval" placeholder="请输入间隔时长">
                <template #suffix>秒</template>
              </ElInput>
            </ElFormItem>
            <ElFormItem v-else label="Cron表达式" prop="triggerInterval">
              <div style="display: flex">
                <ElAutocomplete
                  v-model="form.triggerInterval"
                  :fetch-suggestions="querySearch"
                  placeholder="请输入Cron表达式"
                  clearable
                  style="flex: 1"
                >
                  <template #suffix>
                    <ElTooltip content="Cron表达式生成">
                      <ElButton
                        @click="openGeneratorCron(form.triggerInterval)"
                        :icon="Clock"
                        circle
                      />
                    </ElTooltip>
                  </template>
                </ElAutocomplete>
              </div>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </fieldset>
      <fieldset>
        <legend>任务配置</legend>
        <ElRow :gutter="12">
          <ElCol v-bind="colProps">
            <ElFormItem label="任务类型" prop="taskType">
              <ElSelect
                v-model="form.taskType"
                :options="job_task_type_enum"
                placeholder="请选择任务类型"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol v-bind="colProps">
            <ElFormItem label="执行器名称" prop="executorInfo">
              <ElInput
                v-model="form.executorInfo"
                placeholder="请输入执行器名称"
                :maxlength="255"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElFormItem label="任务参数" prop="argsStr">
          <ElInput
            v-if="form.taskType !== 3"
            v-model="form.argsStr"
            type="textarea"
            placeholder="请输入任务参数"
            :rows="3"
          />
          <div v-else class="args-container">
            <div v-for="(item, index) in args" :key="index" class="args-item">
              <ElFormItem hide-label :rules="[{ required: true, message: '请输入分片参数' }]">
                <ElInput v-model="item.value" :placeholder="`请输入分片参数 ${index + 1}`" />
              </ElFormItem>
              <ElButton type="danger" :icon="Delete" circle @click="onDeleteArgs(index)" />
            </div>
            <ElButton type="primary" :icon="Plus" @click="onAddArgs">添加分片参数</ElButton>
          </div>
        </ElFormItem>
      </fieldset>
      <fieldset>
        <legend>高级配置</legend>
        <ElRow :gutter="12">
          <ElCol v-bind="colProps">
            <ElFormItem label="路由策略" prop="routeKey">
              <ElSelect
                v-model="form.routeKey"
                placeholder="请选择路由策略"
                :options="job_route_strategy_enum"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol v-bind="colProps">
            <ElFormItem label="阻塞策略" prop="blockStrategy">
              <ElSelect
                v-model="form.blockStrategy"
                placeholder="请选择阻塞策略"
                :options="job_block_strategy_enum"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol v-bind="colProps">
            <ElFormItem label="超时时间" prop="executorTimeout">
              <ElInputNumber
                v-model="form.executorTimeout"
                placeholder="请输入超时时间"
                :min="1"
                controls-position="right"
              >
                <template #suffix>秒</template>
              </ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol v-bind="colProps">
            <ElFormItem label="最大重试次数" prop="maxRetryTimes">
              <ElInputNumber
                v-model="form.maxRetryTimes"
                placeholder="请输入最大重试次数"
                :min="0"
                controls-position="right"
              />
            </ElFormItem>
          </ElCol>
          <ElCol v-bind="colProps">
            <ElFormItem label="重试间隔" prop="retryInterval">
              <ElInputNumber
                v-model="form.retryInterval"
                placeholder="请输入重试间隔"
                :min="1"
                controls-position="right"
              >
                <template #suffix>秒</template>
              </ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol v-bind="colProps">
            <ElFormItem label="并行数" prop="parallelNum">
              <ElInputNumber
                v-model="form.parallelNum"
                placeholder="请输入并行数"
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
        <ElButton @click="visible = false">关闭</ElButton>
        <ElButton type="primary" @click="save">确定</ElButton>
      </div>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { addJob, listGroup, updateJob } from '@/apis/schedule/job'
  import { useDict, useResetReactive } from '@/hooks'
  import type { LabelValueState } from '@/types/global'
  import { Clock, Delete, Plus } from '@element-plus/icons-vue'
  import { useWindowSize } from '@vueuse/core'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import CronModal from '@/components/base/GenCron/CronModal/index.vue'

  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()

  const { width } = useWindowSize()

  const colProps = { xs: 24, sm: 24, md: 12, lg: 12, xl: 12, xxl: 12 }

  // 内置 Cron 表达式
  const cron_list = [
    { label: '每分钟', value: '0 * * * * ?' },
    { label: '每30分钟', value: '0 0/30 * * * ?' },
    { label: '每小时', value: '0 0 * * * ?' },
    { label: '每天零点', value: '0 0 0 * * ?' },
    { label: '每月1日零点', value: '0 0 0 1 * ?' },
    { label: '每月最后一天零点', value: '0 0 0 L * ?' },
    { label: '每月最后一个工作日零点', value: '0 0 0 LW * ?' },
    { label: '每周日零点', value: '0 0 0 ? * 1' }
  ]

  const dataId = ref<number>()
  const visible = ref(false)
  const isUpdate = computed(() => !!dataId.value)
  const title = computed(() => (isUpdate.value ? '修改任务' : '新增任务'))
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
    groupName: [{ required: true, message: '请选择任务组', trigger: 'change' }],
    jobName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
    triggerType: [{ required: true, message: '请选择触发类型', trigger: 'change' }],
    taskType: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
    executorInfo: [{ required: true, message: '请输入执行器名称', trigger: 'blur' }],
    routeKey: [{ required: true, message: '请选择路由策略', trigger: 'change' }],
    blockStrategy: [{ required: true, message: '请选择阻塞策略', trigger: 'change' }],
    executorTimeout: [{ required: true, message: '请输入超时时间', trigger: 'blur' }],
    maxRetryTimes: [{ required: true, message: '请输入最大重试次数', trigger: 'blur' }],
    retryInterval: [{ required: true, message: '请输入重试间隔', trigger: 'blur' }],
    parallelNum: [{ required: true, message: '请输入并行数', trigger: 'blur' }]
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
      ? cron_list.filter(
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
        ElMessage.success('修改成功')
      } else {
        await addJob(form)
        ElMessage.success('新增成功')
      }
      emit('save-success')
      visible.value = false
    } catch (error) {
      console.error(error)
    }
  }

  // 查询任务组列表
  const getGroupList = async () => {
    const { data } = await listGroup()
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
