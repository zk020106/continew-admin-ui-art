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
        <CaForm
          v-model="queryForm"
          search
          :columns="queryFormColumns"
          @search="search"
          @reset="reset"
        />
      </template>
      <template #toolbar-right>
        <CaButton v-auth="['schedule:job:create']" type="add" @click="onAdd" />
      </template>
      <template #jobName="{ row }">
        <ElLink type="primary" @click="onDetail(row)">{{ row.jobName }}</ElLink>
      </template>
      <template #triggerType="{ row }">
        <span v-if="row.triggerType === 1">Cron</span>
        <span v-else-if="row.triggerType === 2">固定间隔 - {{ row.triggerInterval }} 秒</span>
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
          <ElPopconfirm title="是否确定立即执行一次任务?" @ok="onTrigger(row)">
            <template #reference>
              <ElLink v-auth="['schedule:job:trigger']" type="primary">执行</ElLink>
            </template>
          </ElPopconfirm>
          <ElLink v-auth="['schedule:job:update']" type="primary" @click="onUpdate(row)"
            >修改</ElLink
          >
          <ElDropdown
            v-if="hasAuth('schedule:log:list') || hasAuth('schedule:job:delete')"
            trigger="click"
          >
            <span class="action-more-icon">
              <ElIcon><MoreFilled /></ElIcon>
            </span>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem v-auth="['schedule:log:list']" @click="onLog(row)"
                  >查看日志</ElDropdownItem
                >
                <ElDropdownItem v-auth="['schedule:job:delete']" divided @click="onDelete(row)">
                  <ElLink type="danger" :underline="false">删除</ElLink>
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
  import {
    deleteJob,
    type JobQuery,
    type JobResp,
    listGroup,
    listJob,
    triggerJob,
    updateJobStatus
  } from '@/apis/schedule/job'
  import { FormColumnItem } from '@/components/base/CaForm/type'
  import type { TableColumnItem } from '@/components/base/CaTable/type'
  import { useAuth, useDict, useResetReactive, useTable } from '@/hooks'
  import { MoreFilled } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'
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
          label: '任务名称',
          field: 'jobName',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 6 } },
          props: {
            placeholder: '搜索任务名称',
            clearable: true
          }
        },
        {
          type: 'select',
          label: '任务组',
          field: 'groupName',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 6 } },
          props: {
            placeholder: '请选择任务组',
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
      label: '任务名称',
      prop: 'jobName',
      slotName: 'jobName',
      minWidth: 100,
      showOverflowTooltip: true,
      fixed: 'left'
    },
    { label: '调度类型', prop: 'triggerType', slotName: 'triggerType', minWidth: 130 },
    {
      label: '任务类型',
      prop: 'taskType',
      slotName: 'taskType',
      minWidth: 130,
      showOverflowTooltip: true
    },
    { label: '状态', prop: 'jobStatus', slotName: 'jobStatus', align: 'center', width: 80 },
    { label: '描述', prop: 'description', minWidth: 130, showOverflowTooltip: true },
    { label: '创建时间', prop: 'createDt', width: 180 },
    { label: '修改时间', prop: 'updateDt', width: 180, visible: false },
    {
      label: t('common.action'),
      prop: 'action',
      slotName: 'action',
      width: 160,
      align: 'center',
      fixed: 'right'
    }
  ]

  const groupList = ref<{ label: string; value: string }[]>([])

  // 查询任务组列表
  const getGroupList = async () => {
    const data = await listGroup()
    groupList.value = data?.map((item: string) => ({
      label: item,
      value: item
    }))
    search()
  }

  // 重置
  const reset = () => {
    resetForm()
    search()
  }

  // 删除
  const onDelete = (row: JobResp) => {
    handleDelete(() => deleteJob(row.id), {
      content: `是否确定删除任务「${row.jobName}」？`,
      confirmType: 'error',
      successTip: '删除成功'
    })
  }

  // 修改状态
  const onUpdateStatus = async (record: JobResp) => {
    const newVal = record.jobStatus === 1 ? 0 : 1
    try {
      await updateJobStatus({ jobStatus: newVal }, record.id)
      ElMessage.success(newVal === 1 ? '启用成功' : '禁用成功')
      return true
    } catch {
      return false
    }
  }

  // 执行
  const onTrigger = (record: JobResp) => {
    triggerJob(record.id).then(() => {
      ElMessage.success('执行请求已下发')
    })
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
