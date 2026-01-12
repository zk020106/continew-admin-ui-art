<template>
  <ElDrawer
    v-model="visible"
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :size="600"
    @close="reset"
  >
    <CaForm ref="formRef" v-model="form" :columns="columns" />
    <template #footer>
      <CaButton type="cancel" @click="visible = false" />
      <CaButton type="confirm" @click="save" />
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import type { JobReq } from '@/apis/schedule/job'
  import { addJob, updateJob } from '@/apis/schedule/job'
  import CaButton from '@/components/base/CaButton/index.vue'
  import { FormColumnItem } from '@/components/base/CaForm/type'
  import { useResetReactive } from '@/hooks'

  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()

  const dataId = ref('')
  const visible = ref(false)
  const isUpdate = computed(() => !!dataId.value)
  const title = computed(() => (isUpdate.value ? '修改任务' : '新增任务'))
  const formRef = useTemplateRef('formRef')

  const [form, resetForm] = useResetReactive<JobReq>({
    groupName: '',
    jobName: '',
    triggerType: 1,
    executorType: 1,
    taskType: 1,
    routeKey: 1,
    blockStrategy: 1
  })

  // TODO: 根据实际需求完善表单字段
  const columns: FormColumnItem<JobReq>[] = [
    { label: '任务组', field: 'groupName', type: 'input', required: true, span: 24 },
    { label: '任务名称', field: 'jobName', type: 'input', required: true, span: 24 },
    { label: '描述', field: 'description', type: 'textarea', span: 24 }
  ]

  // 重置
  const reset = () => {
    formRef.value?.formRef?.resetFields()
    resetForm()
  }

  // 保存
  const save = async () => {
    try {
      await formRef.value?.formRef?.validate()
      if (isUpdate.value) {
        await updateJob(form, Number(dataId.value))
        window.$message?.success('修改成功')
      } else {
        await addJob(form)
        window.$message?.success('新增成功')
      }
      emit('save-success')
      visible.value = false
    } catch (err) {
      console.error(err)
    }
  }

  // 新增
  const onAdd = () => {
    reset()
    dataId.value = ''
    visible.value = true
  }

  // 修改
  const onUpdate = async (record: { id: number }) => {
    reset()
    dataId.value = String(record.id)
    // TODO: 加载详情数据
    // const data = await getJob(record.id)
    // Object.assign(form, data)
    visible.value = true
  }

  defineExpose({ onAdd, onUpdate })
</script>
