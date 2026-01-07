<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="600px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <CaForm v-model="form" :columns="formColumns" :grid-row="1" :grid-span="24" />
    <template #footer>
      <CaButton type="cancel" @click="handleCancel" />
      <CaButton type="confirm" @click="handleConfirm" />
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { TenantReq } from '@/apis'
  import { addTenant, getTenant, updateTenant } from '@/apis/tenant/management'
  import type { FormColumnItem } from '@/components/base/CaForm/type'
  import { ElDialog, ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'TenantManagementAddModal' })

  const emit = defineEmits<{
    'save-success': []
  }>()

  const { t } = useI18n()

  const visible = ref(false)
  const isEdit = ref(false)
  const editId = ref<string>()

  const form = ref<TenantReq>({
    name: '',
    code: '',
    domain: '',
    expireTime: '',
    description: '',
    packageId: '',
    adminUsername: '',
    adminPassword: ''
  })

  const formColumns = computed(
    () =>
      [
        {
          type: 'input',
          label: t('pages.tenantManagement.field.name'),
          field: 'name',
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
          label: t('pages.tenantManagement.field.code'),
          field: 'code',
          rules: [
            {
              required: true,
              message: t('components.form.validate.required', {
                label: t('pages.tenantManagement.field.code')
              })
            }
          ]
        },
        {
          type: 'input',
          label: t('pages.tenantManagement.field.domain'),
          field: 'domain'
        },
        {
          type: 'date-picker',
          label: t('pages.tenantManagement.field.expireTime'),
          field: 'expireTime',
          props: {
            type: 'datetime',
            clearable: true
          }
        },
        {
          type: 'textarea',
          label: t('pages.tenantManagement.field.description'),
          field: 'description',
          props: {
            rows: 3
          }
        }
      ] as FormColumnItem[]
  )

  const title = computed(() => (isEdit.value ? t('common.button.edit') : t('common.button.add')))

  const onAdd = () => {
    isEdit.value = false
    editId.value = undefined
    form.value = {
      name: '',
      code: '',
      domain: '',
      expireTime: '',
      description: '',
      packageId: '',
      adminUsername: '',
      adminPassword: ''
    }
    visible.value = true
  }

  const onUpdate = async (id: string) => {
    isEdit.value = true
    editId.value = id
    try {
      const data = await getTenant(id)
      form.value = {
        name: data.name,
        code: data.code,
        domain: data.domain,
        expireTime: data.expireTime,
        description: data.description,
        packageId: data.packageId,
        adminUsername: '',
        adminPassword: ''
      }
      visible.value = true
    } catch (error) {
      console.error('获取租户详情失败:', error)
    }
  }

  const handleConfirm = async () => {
    try {
      if (isEdit.value && editId.value) {
        await updateTenant(form.value, editId.value)
        ElMessage.success(t('message.updateSuccess'))
      } else {
        await addTenant(form.value)
        ElMessage.success(t('message.addSuccess'))
      }
      visible.value = false
      emit('save-success')
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  const handleCancel = () => {
    visible.value = false
  }

  defineExpose({
    onAdd,
    onUpdate
  })
</script>

<style scoped lang="scss"></style>
