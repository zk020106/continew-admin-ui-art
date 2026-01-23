<template>
  <ElDialog
    v-model="visible"
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :width="width >= 600 ? 600 : '100%'"
    destroy-on-close
    @close="handleClose"
  >
    <CaForm ref="formRef" label-position="top" v-model="form" :columns="columns" />
    <template #footer>
      <ElButton @click="handleClose">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" :loading="saveLoading" @click="handleConfirm">{{
        t('common.confirm')
      }}</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { addClient, getClient, updateClient } from '@/apis/system/client'
  import type { ClientReq } from '@/apis/system/type'
  import type { FormColumnItem } from '@/components/base/CaForm/type'
  import { useDict, useResetReactive } from '@/hooks'
  import { useWindowSize } from '@vueuse/core'
  import { ElDialog, ElMessage } from 'element-plus'
  import { computed, h, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'ClientConfigAddModal' })

  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()

  const { t } = useI18n()
  const { width } = useWindowSize()
  const { client_type, auth_type_enum, replaced_range_enum, logout_mode_enum } = useDict(
    'client_type',
    'auth_type_enum',
    'replaced_range_enum',
    'logout_mode_enum'
  )

  const visible = ref(false)
  const saveLoading = ref(false)
  const formRef = ref()
  const isUpdate = ref(false)
  const currentId = ref('')

  const title = computed(() =>
    isUpdate.value ? t('system.config.client.editTitle') : t('system.config.client.addTitle')
  )

  const [form, resetForm] = useResetReactive({
    clientId: '',
    clientType: '',
    authType: [],
    activeTimeout: 1800,
    timeout: 3600,
    status: 1,
    isConcurrent: 0,
    maxLoginCount: null,
    replacedRange: null,
    overflowLogoutMode: null
  })

  const columns = computed(
    () =>
      [
        {
          type: 'input',
          label: t('system.config.client.clientId'),
          field: 'clientId',
          span: 24,
          props: {
            placeholder: t('common.placeholder.status', {
              label: t('system.config.client.clientId')
            }),
            disabled: isUpdate.value
          },
          rules: [
            {
              required: true,
              message: t('common.placeholder.status', { label: t('system.config.client.clientId') })
            }
          ]
        },
        {
          type: 'select',
          label: t('system.config.client.clientType'),
          field: 'clientType',
          span: 12,
          props: {
            placeholder: t('common.placeholder.select', {
              label: t('system.config.client.clientType')
            }),
            options: client_type.value
          },
          rules: [
            {
              required: true,
              message: t('common.placeholder.select', {
                label: t('system.config.client.clientType')
              })
            }
          ]
        },
        {
          type: 'select',
          label: t('system.config.client.authType'),
          field: 'authType',
          span: 12,
          props: {
            placeholder: t('common.placeholder.select', {
              label: t('system.config.client.authType')
            }),
            options: auth_type_enum.value,
            multiple: true
          },
          rules: [
            {
              required: true,
              message: t('common.placeholder.select', { label: t('system.config.client.authType') })
            }
          ]
        },
        {
          type: 'input-number',
          label: t('system.config.client.activeTimeout'),
          field: 'activeTimeout',
          span: 12,
          props: {
            min: 0
          },
          slots: {
            append: () =>
              h(
                'span',
                { style: { width: '30px', textAlign: 'center' } },
                t('system.config.client.activeTimeoutUnit')
              )
          }
        },
        {
          type: 'input-number',
          label: t('system.config.client.timeout'),
          field: 'timeout',
          span: 12,
          props: {
            min: 0
          },
          slots: {
            append: () =>
              h(
                'span',
                { style: { width: '30px', textAlign: 'center' } },
                t('system.config.client.timeoutUnit')
              )
          }
        },
        {
          type: 'switch',
          label: t('system.config.client.isConcurrent'),
          field: 'isConcurrent',
          span: 12,
          props: {
            checkedValue: true,
            uncheckedValue: false,
            activeText: t('common.allow'),
            inactiveText: t('common.notAllow')
          }
        },
        {
          type: 'select',
          label: t('system.config.client.replacedRange'),
          field: 'replacedRange',
          span: 12,
          props: {
            placeholder: t('common.placeholder.select', {
              label: t('system.config.client.replacedRange')
            }),
            options: replaced_range_enum.value,
            disabled: () => {
              return form.isConcurrent === 1
            }
          }
        },
        {
          type: 'input-number',
          label: t('system.config.client.maxLoginCount'),
          field: 'maxLoginCount',
          span: 12,
          props: {
            min: 1,
            disabled: () => {
              return form.isConcurrent !== 1
            }
          },
          slots: {
            append: () =>
              h(
                'span',
                { style: { width: '30px', textAlign: 'center' } },
                t('system.config.client.maxLoginCountUnit')
              )
          }
        },
        {
          type: 'select',
          label: t('system.config.client.overflowLogoutMode'),
          field: 'overflowLogoutMode',
          span: 12,
          props: {
            placeholder: t('common.placeholder.select', {
              label: t('system.config.client.overflowLogoutMode')
            }),
            options: logout_mode_enum.value,
            disabled: () => {
              return form.maxLoginCount === -1 || form.maxLoginCount === 0
            }
          }
        },
        {
          type: 'switch',
          label: t('common.status'),
          field: 'status',
          span: 24,
          props: {
            inlinePrompt: true,
            activeValue: 1,
            inactiveValue: 2,
            activeText: t('common.statusEnabled'),
            inactiveText: t('common.statusDisabled')
          }
        }
      ] as FormColumnItem[]
  )

  const handleClose = () => {
    formRef.value?.formRef?.resetFields()
    resetForm()
  }

  const handleConfirm = async () => {
    try {
      saveLoading.value = true
      const isValid = await formRef.value?.formRef?.validate()
      if (!isValid) return

      if (isUpdate.value) {
        await updateClient(form as unknown as ClientReq, currentId.value)
        ElMessage.success(t('common.success'))
      } else {
        await addClient(form as unknown as ClientReq)
        ElMessage.success(t('common.success'))
      }

      emit('save-success')
      visible.value = false
    } catch (error) {
      console.error('Failed to save client:', error)
    } finally {
      saveLoading.value = false
    }
  }

  const onAdd = () => {
    resetForm()
    isUpdate.value = false
    currentId.value = ''
    visible.value = true
  }

  const onUpdate = async (id: string) => {
    isUpdate.value = true
    currentId.value = id
    try {
      const data = await getClient(id)
      Object.assign(form, data)
      visible.value = true
      console.log(form)
    } catch (error) {
      console.error('Failed to fetch client detail:', error)
    }
  }

  defineExpose({
    onAdd,
    onUpdate
  })
</script>

<style scoped lang="scss">
  :deep(.el-input-group__append) {
    padding: 0;

    .el-button {
      border: 1px solid transparent;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
</style>
