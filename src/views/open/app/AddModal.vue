<template>
  <ElDialog
    v-model="visible"
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :width="500"
    destroy-on-close
    @close="handleClose"
  >
    <CaForm ref="formRef" v-model="form" :columns="formColumns" />
    <template #footer>
      <CaButton type="cancel" @click="handleClose" />
      <CaButton type="confirm" :loading="saving" @click="handleConfirm" />
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { addApp, getApp, updateApp } from '@/apis/open/app'
  import type { FormColumnItem } from '@/components/base/CaForm/type'
  import { useResetReactive } from '@/hooks'
  import { ElDialog, ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'OpenAppAddModal' })

  interface AppFormData {
    name: string
    expireTime?: string
    description?: string
    status: 1 | 2
  }

  const emit = defineEmits<{
    'save-success': []
  }>()

  const { t } = useI18n()

  const visible = ref(false)
  const isEdit = ref(false)
  const editId = ref<string>()
  const saving = ref(false)
  const formRef = ref()

  const [form, resetForm] = useResetReactive<AppFormData>({
    name: '',
    expireTime: '',
    description: '',
    status: 1
  })

  const formColumns = computed(
    () =>
      [
        {
          type: 'input',
          label: t('pages.appManagement.field.name'),
          field: 'name',
          props: {
            placeholder: t('pages.appManagement.field.name'),
            maxlength: 30
          },
          rules: [
            {
              required: true,
              message: t('components.form.validate.required', {
                label: t('pages.appManagement.field.name')
              })
            }
          ]
        },
        {
          type: 'date-picker',
          label: t('pages.appManagement.field.expireTime'),
          field: 'expireTime',
          props: {
            type: 'datetime',
            placeholder: t('pages.appManagement.field.expireTime'),
            valueFormat: 'YYYY-MM-DD HH:mm:ss',
            clearable: true
          }
        },
        {
          type: 'switch',
          label: t('common.status'),
          field: 'status',
          props: {
            activeText: t('common.statusEnabled'),
            inactiveText: t('common.statusDisabled'),
            activeValue: 1,
            inactiveValue: 2,
            inlinePrompt: true,
            type: 'round'
          }
        },
        {
          type: 'textarea',
          label: t('pages.appManagement.field.description'),
          field: 'description',
          props: {
            placeholder: t('pages.appManagement.field.description'),
            rows: 3,
            maxlength: 200,
            showWordLimit: true
          }
        }
      ] as FormColumnItem[]
  )

  const title = computed(() => (isEdit.value ? t('common.button.edit') : t('common.button.add')))

  const handleClose = () => {
    formRef.value?.formRef?.resetFields()
    resetForm()
    visible.value = false
  }

  const onAdd = async () => {
    isEdit.value = false
    editId.value = undefined
    resetForm()
    visible.value = true
  }

  const onUpdate = async (id: string) => {
    isEdit.value = true
    editId.value = id
    const data = await getApp(id)
    Object.assign(form, {
      name: data.name,
      expireTime: data.expireTime,
      description: data.description,
      status: data.status
    })
    visible.value = true
  }

  const handleConfirm = async () => {
    try {
      saving.value = true

      if (isEdit.value && editId.value) {
        await updateApp(form as any, editId.value)
        ElMessage.success(t('message.updateSuccess'))
      } else {
        await addApp(form as any)
        ElMessage.success(t('message.addSuccess'))
      }

      emit('save-success')
      handleClose()
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      saving.value = false
    }
  }

  defineExpose({
    onAdd,
    onUpdate
  })
</script>

<style scoped lang="scss"></style>
