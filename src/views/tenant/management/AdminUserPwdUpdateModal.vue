<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="500px"
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
  import type { TenantAdminPwdReq } from '@/apis'
  import { updateTenantAdminUserPwd } from '@/apis/tenant/management'
  import type { FormColumnItem } from '@/components/base/CaForm/type'
  import { ElDialog, ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'TenantManagementAdminUserPwdUpdateModal' })

  const emit = defineEmits<{
    'save-success': []
  }>()

  const { t } = useI18n()

  const visible = ref(false)
  const tenantId = ref<string>()

  const form = ref<TenantAdminPwdReq>({
    password: ''
  })

  const formColumns = computed(
    () =>
      [
        {
          type: 'input',
          label: t('pages.tenantManagement.field.adminPassword'),
          field: 'password',
          props: {
            type: 'password',
            placeholder: t('pages.tenantManagement.placeholder.newPassword'),
            'show-password': true
          },
          rules: [
            {
              required: true,
              message: t('components.form.validate.required', {
                label: t('pages.tenantManagement.field.adminPassword')
              })
            }
          ]
        }
      ] as FormColumnItem[]
  )

  const title = computed(() => t('pages.tenantManagement.button.updateAdminPwd'))

  const open = (id: string) => {
    tenantId.value = id
    form.value = {
      password: ''
    }
    visible.value = true
  }

  const handleConfirm = async () => {
    if (!tenantId.value) return
    try {
      await updateTenantAdminUserPwd(form.value, tenantId.value)
      ElMessage.success(t('message.updateSuccess'))
      visible.value = false
      emit('save-success')
    } catch (error) {
      console.error('修改管理员密码失败:', error)
    }
  }

  const handleCancel = () => {
    visible.value = false
  }

  defineExpose({
    open
  })
</script>

<style scoped lang="scss"></style>
