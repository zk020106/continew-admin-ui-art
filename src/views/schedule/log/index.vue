<template>
  <CaPageLayout>
    <CaTable
      row-key="id"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1300 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      @refresh="search"
    >
      <template #top>
        <CaQueryForm
          v-model="queryForm"
          mode="change-search"
          :immediate="false"
          :columns="queryFormColumns"
        />
      </template>

      <template #toolbar-left>
        <CaButton type="reset" @click="reset" />
      </template>

      <template #taskBatchStatus="{ row }">
        <CaCellTag :value="row.taskBatchStatus" :dict="job_execute_status_enum" />
      </template>

      <template #operationReason="{ row }">
        <CaCellTag :value="row.operationReason" :dict="job_execute_reason_enum" />
      </template>

      <template #action="{ row }">
        <ElSpace>
          <ElPopconfirm :title="$t('schedule.log.message.stopConfirm')" @ok="onStop(row)">
            <template #reference>
              <ElLink
                v-if="row.taskBatchStatus === 2"
                v-auth="['schedule:log:stop']"
                type="danger"
                :underline="false"
              >
                {{ $t('schedule.log.button.stop') }}
              </ElLink>
            </template>
          </ElPopconfirm>
          <ElPopconfirm :title="$t('schedule.log.message.retryConfirm')" @ok="onRetry(row)">
            <template #reference>
              <ElLink
                v-if="
                  row.taskBatchStatus === 4 ||
                  row.taskBatchStatus === 5 ||
                  row.taskBatchStatus === 6
                "
                v-auth="['schedule:log:retry']"
                type="danger"
                :underline="false"
              >
                {{ $t('schedule.log.button.retry') }}
              </ElLink>
            </template>
          </ElPopconfirm>
        </ElSpace>
      </template>
    </CaTable>
  </CaPageLayout>
</template>

<script setup lang="ts">
  import type { JobLogQuery, JobLogResp } from '@/apis/schedule'
  import { listGroup, listJobLog, retryJob, stopJob } from '@/apis/schedule'
  import CaButton from '@/components/base/CaButton/index.vue'
  import CaCellTag from '@/components/base/CaCell/CaCellTag.vue'
  import type { FormColumnItem } from '@/components/base/CaForm/type'
  import CaQueryForm from '@/components/base/CaQueryForm'
  import type { TableColumnItem } from '@/components/base/CaTable/type'
  import { useDict, useResetReactive, useTable } from '@/hooks'
  import { dayjs, ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'ScheduleLog' })

  const { t } = useI18n()

  const { job_execute_reason_enum, job_execute_status_enum } = useDict(
    'job_execute_reason_enum',
    'job_execute_status_enum'
  )

  const [queryForm, resetForm] = useResetReactive<JobLogQuery>({
    datetimeRange: [
      dayjs().subtract(6, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
    ]
  })

  const { tableData, loading, pagination, search } = useTable<JobLogResp>(
    (page) => listJobLog({ ...queryForm, ...page }),
    { immediate: false }
  )

  const groupList = ref<{ label: string; value: string }[]>([])

  // Search form configuration
  const queryFormColumns = computed(
    () =>
      [
        {
          type: 'select',
          label: t('schedule.log.search.groupName'),
          field: 'groupName',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 6 } },
          props: {
            placeholder: t('schedule.log.search.groupNamePlaceholder'),
            clearable: true,
            options: groupList.value,
            filterable: true
          }
        },
        {
          type: 'input',
          label: t('schedule.log.search.jobName'),
          field: 'jobName',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 6 } },
          props: {
            placeholder: t('schedule.log.search.jobNamePlaceholder'),
            clearable: true
          }
        },
        {
          type: 'select',
          label: t('schedule.log.search.taskBatchStatus'),
          field: 'taskBatchStatus',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 6 } },
          props: {
            placeholder: t('schedule.log.search.taskBatchStatusPlaceholder'),
            clearable: true,
            options: job_execute_status_enum.value
          }
        },
        {
          type: 'daterange',
          label: t('schedule.log.search.datetimeRange'),
          field: 'datetimeRange',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
          props: {
            placeholder: t('schedule.log.search.datetimeRangePlaceholder'),
            'range-separator': t('common.datePicker.rangeSeparator'),
            'start-placeholder': t('common.datePicker.startDatePlaceholder'),
            'end-placeholder': t('common.datePicker.endDatePlaceholder'),
            'value-format': 'YYYY-MM-DD HH:mm:ss'
          }
        }
      ] as FormColumnItem<JobLogQuery>[]
  )

  const columns: TableColumnItem[] = [
    {
      label: t('common.index'),
      width: 66,
      align: 'center',
      render: ({ $index }) =>
        h('span', {}, $index + 1 + (pagination.current - 1) * pagination.pageSize)
    },
    {
      label: t('schedule.log.field.groupName'),
      prop: 'groupName',
      minWidth: 80,
      showOverflowTooltip: true
    },
    {
      label: t('schedule.log.field.jobName'),
      prop: 'jobName',
      minWidth: 80,
      showOverflowTooltip: true
    },
    { label: t('schedule.log.field.createDt'), prop: 'createDt', width: 180 },
    {
      label: t('schedule.log.field.taskBatchStatus'),
      prop: 'taskBatchStatus',
      slotName: 'taskBatchStatus',
      align: 'center',
      width: 100
    },
    {
      label: t('schedule.log.field.operationReason'),
      prop: 'operationReason',
      slotName: 'operationReason',
      minWidth: 80,
      showOverflowTooltip: true
    },
    { label: t('schedule.log.field.executionAt'), prop: 'executionAt', width: 180 },
    {
      label: t('common.action'),
      prop: 'action',
      slotName: 'action',
      width: 130,
      align: 'center',
      fixed: 'right'
    }
  ]

  // Fetch task group list
  const getGroupList = async () => {
    const data = await listGroup()
    groupList.value = data?.map((item: string) => ({
      label: item,
      value: item
    }))
  }

  // Reset
  const reset = () => {
    resetForm()
    search()
  }

  // Stop
  const onStop = (record: JobLogResp) => {
    stopJob(record.id).then(() => {
      ElMessage.success(t('schedule.log.message.stopSuccess'))
    })
  }

  // Retry
  const onRetry = (record: JobLogResp) => {
    retryJob(record.id).then(() => {
      ElMessage.success(t('schedule.log.message.retrySuccess'))
    })
  }

  onMounted(() => {
    getGroupList()
    search()
  })
</script>

<style scoped lang="scss"></style>
