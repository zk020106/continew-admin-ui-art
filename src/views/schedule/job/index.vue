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
      :disabled-column-keys="['jobName']"
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
      <template #toolbar-right>
        <CaButton v-auth="['schedule:job:create']" type="add" @click="onAdd" />
      </template>
      <template #jobName="{ row }">
        <ElLink type="primary" @click="onDetail(row)">{{ row.jobName }}</ElLink>
      </template>
      <template #triggerType="{ row }">
        <span v-if="row.triggerType === 1">{{ $t('schedule.job.triggerType.cron') }}</span>
        <span v-else-if="row.triggerType === 2"
          >{{ $t('schedule.job.triggerType.fixedInterval') }} - {{ row.triggerInterval }}
          {{ $t('schedule.job.triggerType.intervalUnit') }}</span
        >
        <span v-else>{{ row.triggerInterval }}</span>
      </template>
      <template #taskType="{ row }">
        <CaCellTag :value="row.taskType" :dict="job_task_type" />
        <span style="margin-left: 4px">{{ row.executorInfo }}</span>
      </template>
      <template #jobStatus="{ row }">
        <ElSwitch
          v-model="row.jobStatus"
          :active-value="1"
          :inactive-value="0"
          :disabled="!hasAuth('schedule:job:update')"
          :before-change="() => onUpdateStatus(row)"
        />
      </template>
      <template #action="{ row }">
        <ElSpace>
          <ElPopconfirm :title="$t('schedule.job.message.executeRequestSent')" @ok="onTrigger(row)">
            <template #reference>
              <ElLink v-auth="['schedule:job:trigger']" type="primary">
{{
                $t('schedule.job.button.execute')
              }}
</ElLink>
            </template>
          </ElPopconfirm>
          <ElLink v-auth="['schedule:job:update']" type="primary" @click="onUpdate(row)">
{{
            $t('schedule.job.button.edit')
          }}
</ElLink>
          <ElDropdown
            v-if="hasAuth('schedule:log:list') || hasAuth('schedule:job:delete')"
            trigger="click"
          >
            <span class="action-more-icon">
              <ElIcon><MoreFilled /></ElIcon>
            </span>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem v-if="hasAuth('schedule:log:list')" @click="onLog(row)">
{{
                  $t('schedule.job.button.viewLog')
                }}
</ElDropdownItem>
                <ElDropdownItem
                  v-if="hasAuth('schedule:job:delete')"
                  divided
                  @click="onDelete(row)"
                >
                  <span style="color: var(--el-color-danger)">{{
                    $t('schedule.job.button.delete')
                  }}</span>
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </ElSpace>
      </template>
    </CaTable>

    <AddDrawer ref="AddDrawerRef" @save-success="search" />
    <DetailDrawer ref="DetailDrawerRef" />
  </CaPageLayout>
</template>

<script setup lang="ts">
import type { JobQuery, JobResp } from '@/apis/schedule/job'
import type { FormColumnItem } from '@/components/base/CaForm/type'
import type { TableColumnItem } from '@/components/base/CaTable/type'
import { MoreFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  deleteJob,

  listGroup,
  listJob,
  triggerJob,
  updateJobStatus
} from '@/apis/schedule/job'
import CaQueryForm from '@/components/base/CaQueryForm'
import { useAuth, useDict, useResetReactive, useTable } from '@/hooks'
import AddDrawer from './AddDrawer.vue'
import DetailDrawer from './DetailDrawer.vue'

defineOptions({ name: 'ScheduleJob' })

const { t } = useI18n()
const { hasAuth } = useAuth()

// 任务类型字典
const { job_task_type } = useDict('job_task_type')

const [queryForm, resetForm] = useResetReactive<JobQuery>({
  groupName: ''
})

const { tableData, loading, pagination, search, handleDelete } = useTable<JobResp>(
  (page) => listJob({ ...queryForm, ...page }),
  { immediate: false }
)

// 搜索表单配置
const queryFormColumns = computed(
  () =>
    [
      {
        type: 'input',
        label: t('schedule.job.search.jobName'),
        field: 'jobName',
        gridItemProps: { span: { xs: 24, sm: 12, xxl: 6 } },
        props: {
          placeholder: t('schedule.job.search.jobNamePlaceholder'),
          clearable: true
        }
      },
      {
        type: 'select',
        label: t('schedule.job.search.groupName'),
        field: 'groupName',
        gridItemProps: { span: { xs: 24, sm: 12, xxl: 6 } },
        props: {
          placeholder: t('schedule.job.search.groupNamePlaceholder'),
          clearable: true,
          options: groupList.value,
          filterable: true
        }
      }
    ] as FormColumnItem<JobQuery>[]
)

const columns: TableColumnItem[] = [
  {
    label: t('common.index'),
    width: 66,
    align: 'center',
    render: ({ $index }) =>
      h('span', {}, $index + 1 + (pagination.current - 1) * pagination.pageSize),
    fixed: 'left'
  },
  {
    label: t('schedule.job.field.jobName'),
    prop: 'jobName',
    slotName: 'jobName',
    minWidth: 100,
    showOverflowTooltip: true,
    fixed: 'left'
  },
  {
    label: t('schedule.job.field.triggerType'),
    prop: 'triggerType',
    slotName: 'triggerType',
    minWidth: 130
  },
  {
    label: t('schedule.job.field.taskType'),
    prop: 'taskType',
    slotName: 'taskType',
    minWidth: 130,
    showOverflowTooltip: true
  },
  {
    label: t('schedule.job.field.jobStatus'),
    prop: 'jobStatus',
    slotName: 'jobStatus',
    align: 'center',
    width: 80
  },
  {
    label: t('schedule.job.field.description'),
    prop: 'description',
    minWidth: 130,
    showOverflowTooltip: true
  },
  { label: t('schedule.job.field.createDt'), prop: 'createDt', width: 180 },
  { label: t('schedule.job.field.updateDt'), prop: 'updateDt', width: 180, visible: false },
  {
    label: t('common.action'),
    prop: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: 'right'
  }
]

const groupList = ref<{ label: string, value: string }[]>([])

// 查询任务组列表
const getGroupList = async () => {
  const data = await listGroup()
  groupList.value = data?.map((item: string) => ({
    label: item,
    value: item
  }))
  search()
}

// 删除
const onDelete = (row: JobResp) => {
  handleDelete(() => deleteJob(row.id), {
    content: t('schedule.job.message.deleteConfirm', { name: row.jobName }),
    confirmType: 'error',
    successTip: t('schedule.job.message.deleteSuccess')
  })
}

// 修改状态
const onUpdateStatus = async (record: JobResp) => {
  const newVal = record.jobStatus === 1 ? 0 : 1
  try {
    await updateJobStatus({ jobStatus: newVal }, record.id)
    ElMessage.success(
      newVal === 1
        ? t('schedule.job.message.enableSuccess')
        : t('schedule.job.message.disableSuccess')
    )
    return true
  } catch {
    return false
  }
}

// 执行
const onTrigger = (record: JobResp) => {
  triggerJob(record.id).then(() => {
    ElMessage.success(t('schedule.job.message.executeRequestSent'))
  })
}

// 重置
const reset = () => {
  resetForm()
  search()
}

const AddDrawerRef = useTemplateRef('AddDrawerRef')
// 新增
const onAdd = () => {
  AddDrawerRef.value?.onAdd()
}

// 修改
const onUpdate = (record: JobResp) => {
  AddDrawerRef.value?.onUpdate(record)
}

const DetailDrawerRef = useTemplateRef('DetailDrawerRef')
// 详情
const onDetail = (record: JobResp) => {
  DetailDrawerRef.value?.onOpen(String(record.id))
}

// 日志
const onLog = (record: JobResp) => {
  // TODO: 跳转到日志页面
  console.log('跳转到日志页面', record.id)
}

// 初始化
onMounted(() => {
  getGroupList()
})
</script>

<style scoped lang="scss">
  .action-more-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }
</style>
