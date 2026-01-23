<template>
  <ElDialog
    v-model="visible"
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :width="width >= 500 ? 500 : '100%'"
    destroy-on-close
    @close="handleClose"
  >
    <CaForm ref="formRef" v-model="form" :columns="columns" />
    <template #footer>
      <CaButton type="cancel" @click="handleClose" />
      <CaButton type="confirm" :loading="saving" @click="handleConfirm" />
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import type { FormColumnItem } from '@/components/base/CaForm/type'
import { useWindowSize } from '@vueuse/core'
import { ElDialog, ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { addApp, getApp, updateApp } from '@/apis/open/app'
import { useResetReactive } from '@/hooks'

defineOptions({ name: 'OpenAppAddModal' })

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

interface AppFormData {
  name: string
  expireTime?: string
  description?: string
  status: 1 | 2
}

const { t } = useI18n()
const { width } = useWindowSize()

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
const columns = computed(
  () =>
    [
      {
        type: 'input',
        label: t('pages.appManagement.field.name'),
        field: 'name',
        props: {
          placeholder: t('pages.appManagement.field.name'),
          maxlength: 100,
          clearable: true
        },
        rules: [
          {
            required: true,
            message: t('components.form.validate.required', {
              label: t('pages.appManagement.field.name')
            }),
            trigger: 'blur'
          }
        ]
      },
      {
        type: 'date-picker',
        label: t('pages.appManagement.field.expireTime'),
        field: 'expireTime',
        props: {
          type: 'datetime',
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          format: 'YYYY-MM-DD HH:mm:ss',
          clearable: true
        }
      },
      {
        type: 'switch',
        label: t('common.status'),
        field: 'status',
        props: {
          activeValue: 1,
          inactiveValue: 2,
          inlinePrompt: true
        }
      },
      {
        type: 'textarea',
        label: t('pages.appManagement.field.description'),
        field: 'description',
        props: {
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

// 重置
const reset = () => {
  handleClose()
}

// 保存
const save = async () => {
  try {
    const valid = await formRef.value?.formRef?.validate()
    if (!valid) return false
    if (isEdit.value && editId.value) {
      await updateApp(form as any, editId.value)
      ElMessage.success(t('message.updateSuccess'))
    } else {
      await addApp(form as any)
      ElMessage.success(t('message.addSuccess'))
    }
    emit('save-success')
    handleClose()
    return true
  } catch (error) {
    console.error('保存失败:', error)
    return false
  }
}

const handleConfirm = async () => {
  await save()
}

// 新增
const onAdd = () => {
  isEdit.value = false
  editId.value = undefined
  resetForm()
  visible.value = true
}

// 修改
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

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
