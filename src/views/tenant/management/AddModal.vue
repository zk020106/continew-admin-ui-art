<template>
  <ElDialog
    v-model="visible"
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :width="600"
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
import type { TenantReq } from '@/apis'
import type { FormColumnItem } from '@/components/base/CaForm/type'
import type { LabelValueState } from '@/types/global'
import { QuestionFilled } from '@element-plus/icons-vue'
import { ElDialog, ElIcon, ElMessage, ElTooltip } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { listTenantPackageDict } from '@/apis/tenant'
import { addTenant, getTenant, updateTenant } from '@/apis/tenant/management'
import { useResetReactive } from '@/hooks'
import { encryptByRsa } from '@/utils/encrypt'

defineOptions({ name: 'TenantManagementAddModal' })

const emit = defineEmits<{
  'save-success': []
}>()

const { t } = useI18n()

const visible = ref(false)
const isEdit = ref(false)
const editId = ref<string>()
const saving = ref(false)
const packageList = ref<LabelValueState[]>([])
const formRef = ref()

const [form, resetForm] = useResetReactive<TenantReq>({
  name: '',
  domain: '',
  expireTime: '',
  description: '',
  packageId: '',
  adminUsername: '',
  adminPassword: '',
  status: 1
})

const formColumns = computed(
  () =>
    [
      {
        type: 'input',
        label: t('pages.tenantManagement.field.name'),
        field: 'name',
        props: {
          placeholder: t('pages.tenantManagement.field.name'),
          maxlength: 30
        },
        rules: [
          {
            required: true,
            message: t('components.form.validate.required', {
              label: t('pages.tenantManagement.field.name')
            })
          }
        ]
      },
      {
        type: 'input',
        labelRender: () =>
          h(
            ElTooltip,
            { content: t('pages.tenantManagement.tooltip.domain'), placement: 'top' },
            () => [t('pages.tenantManagement.field.domain'), h(ElIcon, () => h(QuestionFilled))]
          ),
        field: 'domain',
        props: {
          placeholder: t('pages.tenantManagement.field.domain')
        },
        slots: {
          prepend: () =>
            h('span', { style: { textAlign: 'center', width: '100%' } }, 'http(s)://')
        }
      },
      {
        type: 'date-picker',
        label: t('pages.tenantManagement.field.expireTime'),
        field: 'expireTime',
        props: {
          type: 'datetime',
          placeholder: t('pages.tenantManagement.field.expireTime'),
          valueFormat: 'YYYY-MM-DD HH:mm:ss'
        },
        rules: [
          {
            required: true,
            message: t('components.form.validate.required', {
              label: t('pages.tenantManagement.field.expireTime')
            })
          }
        ]
      },
      {
        type: 'select',
        label: t('pages.tenantManagement.field.package'),
        field: 'packageId',
        props: {
          placeholder: t('pages.tenantManagement.search.packagePlaceholder'),
          options: packageList.value
        },
        hide: isEdit.value,
        rules: [
          {
            required: !isEdit.value,
            message: t('components.form.validate.required', {
              label: t('pages.tenantManagement.field.package')
            })
          }
        ]
      },
      {
        type: 'input',
        labelRender: () =>
          h(
            ElTooltip,
            { content: t('pages.tenantManagement.tooltip.adminUsername'), placement: 'top' },
            () => [
              t('pages.tenantManagement.field.adminUsername'),
              h(ElIcon, () => h(QuestionFilled))
            ]
          ),
        field: 'adminUsername',
        props: {
          placeholder: t('register.placeholder.username'),
          maxlength: 64
        },
        hide: isEdit.value,
        rules: [
          {
            required: !isEdit.value,
            message: t('components.form.validate.required', {
              label: t('pages.tenantManagement.field.adminUsername')
            })
          }
        ]
      },
      {
        type: 'input',
        label: t('pages.tenantManagement.field.adminPassword'),
        field: 'adminPassword',
        props: {
          'type': 'password',
          'placeholder': t('register.placeholder.password'),
          'show-password': true,
          'maxlength': 32
        },
        hide: isEdit.value,
        rules: [
          {
            required: !isEdit.value,
            message: t('components.form.validate.required', {
              label: t('pages.tenantManagement.field.adminPassword')
            })
          }
        ]
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
        label: t('pages.tenantManagement.field.description'),
        field: 'description',
        props: {
          placeholder: t('pages.tenantManagement.field.description'),
          rows: 3,
          maxlength: 200,
          showWordLimit: true
        }
      }
    ] as any as FormColumnItem[]
)

const title = computed(() => (isEdit.value ? t('common.button.edit') : t('common.button.add')))

// 获取套餐列表
const getPackageList = async () => {
  packageList.value = await listTenantPackageDict()
}

// 关闭
const handleClose = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
  getPackageList()
  visible.value = false
}

// 新增
const onAdd = async () => {
  await getPackageList()
  isEdit.value = false
  editId.value = undefined
  resetForm()
  visible.value = true
}

// 修改
const onUpdate = async (id: string) => {
  await getPackageList()
  isEdit.value = true
  editId.value = id
  const data = await getTenant(id)
  Object.assign(form, {
    name: data.name,
    domain: data.domain,
    expireTime: data.expireTime,
    description: data.description,
    packageId: data.packageId,
    adminUsername: null,
    adminPassword: null,
    status: data.status
  })
  visible.value = true
}

// 确认
const handleConfirm = async () => {
  try {
    saving.value = true

    if (isEdit.value && editId.value) {
      await updateTenant(form, editId.value)
      ElMessage.success(t('message.updateSuccess'))
    } else {
      await addTenant({
        ...form,
        domain: form.domain || null,
        adminPassword: encryptByRsa(form.adminPassword || '')
      })
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
