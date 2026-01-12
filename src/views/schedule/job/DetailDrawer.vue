<template>
  <ElDrawer v-model="visible" :title="title" :size="600">
    <CaDetail
      v-if="dataDetail"
      :data="dataDetail"
      :fields="detailFields"
      :column="2"
      size="large"
      :border="true"
    />
  </ElDrawer>
</template>

<script setup lang="ts">
  import type { JobResp } from '@/apis/schedule/job'
  import CaDetail from '@/components/base/CaDetail/index.vue'
  import { DetailField } from '@/components/base/CaDetail/type'

  defineOptions({ name: 'ScheduleJobDetail' })

  const dataId = ref('')
  const dataDetail = ref<JobResp>()
  const visible = ref(false)
  const title = '任务详情'

  // TODO: 根据实际需求完善详情字段
  const detailFields: DetailField[] = [
    { key: 'id', label: 'ID', type: 'text', span: 2 },
    { key: 'jobName', label: '任务名称', type: 'text' },
    { key: 'groupName', label: '任务组', type: 'text' },
    { key: 'description', label: '描述', type: 'text', span: 2 },
    {
      key: 'jobStatus',
      label: '状态',
      type: 'enum',
      enum: { '0': { label: '禁用', type: 'danger' }, '1': { label: '启用', type: 'success' } }
    },
    { key: 'executorInfo', label: '执行器信息', type: 'text' },
    { key: 'argsStr', label: '执行参数', type: 'text' },
    { key: 'executorTimeout', label: '执行超时(ms)', type: 'text' },
    { key: 'maxRetryTimes', label: '最大重试次数', type: 'text' },
    { key: 'retryInterval', label: '重试间隔(秒)', type: 'text' },
    { key: 'parallelNum', label: '并行数', type: 'text' },
    { key: 'createDt', label: '创建时间', type: 'datetime' },
    { key: 'updateDt', label: '修改时间', type: 'datetime' }
  ]

  // 打开
  const onOpen = async (id: string) => {
    dataId.value = id
    // TODO: 加载详情数据
    // dataDetail.value = await getJob(id)
    visible.value = true
  }

  defineExpose({ onOpen })
</script>
