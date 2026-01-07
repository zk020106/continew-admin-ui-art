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
      <ElButton @click="handleCancel">{{ t('common.button.cancel') }}</ElButton>
      <ElButton type="primary" @click="handleConfirm">{{ t('common.button.confirm') }}</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { TenantAdminPwdReq } from '@/apis'
  import { updateTenantAdminUserPwd } from '@/apis/tenant/management'
  import type { FormColumnItem } from '@/components/base/CaForm/type'
  import { ElButton, ElDialog, ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'TenantManagementAdminUserPwdUpdateModal' })

  const emit = defineEmits<{
    'save-success': []
  }>()

  const { t } = useI18n()

  const visible = ref(false)
  const tenantId = ref<string>()

  const form = ref<TenantAdminPwdReq>({
    password: '',
    confirmPassword: ''
  })

  const formColumns = computed(
    () =>
      [
        {
          type: 'input',
          label: t('user.field.password'),
          field: 'password',
          props: {
            type: 'password',
            placeholder: t('user.placeholder.password'),
            'show-password': true
          },
          rules: [
            {
              required: true,
              message: t('components.form.validate.required', { label: t('user.field.password') })
            }
          ]
        },
        {
          type: 'input',
          label: t('register.placeholder.confirmPassword'),
          field: 'confirmPassword',
          props: {
            type: 'password',
            placeholder: t('register.placeholder.confirmPassword')
          },
          rules: [
            {
              required: true,
              message: t('components.form.validate.required', {
                label: t('register.placeholder.confirmPassword')
              })
            },
            {
              validator: (rule: any, value: string, callback: any) => {
                if (value !== form.value.password) {
                  callback(new Error(t('register.rule.passwordMismatch')))
                } else {
                  callback()
                }
              },
              trigger: 'blur'
            }
          ]
        }
      ] as FormColumnItem[]
  )

  const title = computed(() => t('pages.tenantManagement.button.updateAdminPwd'))

  const open = (id: string) => {
    tenantId.value = id
    form.value = {
      password: '',
      confirmPassword: ''
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
