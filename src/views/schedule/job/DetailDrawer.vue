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
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'ScheduleJobDetail' })

  const { t } = useI18n()

  const dataId = ref('')
  const dataDetail = ref<JobResp>()
  const visible = ref(false)
  const title = t('schedule.job.title')

  // 详情字段
  const detailFields: DetailField[] = [
    { key: 'id', label: t('schedule.job.field.id'), type: 'text', span: 2 },
    { key: 'jobName', label: t('schedule.job.field.jobName'), type: 'text' },
    { key: 'groupName', label: t('schedule.job.field.groupName'), type: 'text' },
    { key: 'description', label: t('schedule.job.field.description'), type: 'text', span: 2 },
    {
      key: 'jobStatus',
      label: t('schedule.job.field.jobStatus'),
      type: 'enum',
      enum: {
        '0': { label: t('common.statusDisabled'), type: 'danger' },
        '1': { label: t('common.statusEnabled'), type: 'success' }
      }
    },
    { key: 'executorInfo', label: t('schedule.job.field.executorInfo'), type: 'text' },
    { key: 'argsStr', label: t('schedule.job.field.argsStr'), type: 'text' },
    { key: 'executorTimeout', label: t('schedule.job.field.executorTimeout'), type: 'text' },
    { key: 'maxRetryTimes', label: t('schedule.job.field.maxRetryTimes'), type: 'text' },
    { key: 'retryInterval', label: t('schedule.job.field.retryInterval'), type: 'text' },
    { key: 'parallelNum', label: t('schedule.job.field.parallelNum'), type: 'text' },
    { key: 'createDt', label: t('schedule.job.field.createDt'), type: 'datetime' },
    { key: 'updateDt', label: t('schedule.job.field.updateDt'), type: 'datetime' }
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
