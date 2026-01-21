<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="140px">
      <ElFormItem :label="t('system.config.client.clientId')" prop="clientId">
        <ElInput
          v-model="formData.clientId"
          :placeholder="
            t('common.placeholder.status', { label: t('system.config.client.clientId') })
          "
          :disabled="isUpdate"
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.client.clientType')" prop="clientType">
        <ElSelect
          v-model="formData.clientType"
          :placeholder="
            t('common.placeholder.select', { label: t('system.config.client.clientType') })
          "
          style="width: 100%"
        >
          <ElOption
            v-for="item in client_type"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="t('system.config.client.authType')" prop="authType">
        <ElSelect
          v-model="formData.authType"
          :placeholder="
            t('common.placeholder.select', { label: t('system.config.client.authType') })
          "
          style="width: 100%"
        >
          <ElOption
            v-for="item in auth_type"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="t('system.config.client.activeTimeout')" prop="activeTimeout">
        <ElInputNumber v-model="formData.activeTimeout" :min="0" />
        <span class="unit">{{ t('system.config.client.activeTimeoutUnit') }}</span>
      </ElFormItem>
      <ElFormItem :label="t('system.config.client.timeout')" prop="timeout">
        <ElInputNumber v-model="formData.timeout" :min="0" />
        <span class="unit">{{ t('system.config.client.timeoutUnit') }}</span>
      </ElFormItem>
      <ElFormItem :label="t('system.config.client.isConcurrent')" prop="isConcurrent">
        <ElSwitch
          v-model="formData.isConcurrent"
          :active-value="1"
          :inactive-value="0"
          :active-text="t('common.true')"
          :inactive-text="t('common.false')"
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.client.replacedRange')" prop="replacedRange">
        <ElSelect
          v-model="formData.replacedRange"
          :placeholder="
            t('common.placeholder.select', { label: t('system.config.client.replacedRange') })
          "
          style="width: 100%"
        >
          <ElOption label="All" value="All" />
          <ElOption label="Current" value="Current" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="t('system.config.client.maxLoginCount')" prop="maxLoginCount">
        <ElInputNumber v-model="formData.maxLoginCount" :min="1" />
        <span class="unit">{{ t('system.config.client.maxLoginCountUnit') }}</span>
      </ElFormItem>
      <ElFormItem :label="t('system.config.client.overflowLogoutMode')" prop="overflowLogoutMode">
        <ElSelect
          v-model="formData.overflowLogoutMode"
          :placeholder="
            t('common.placeholder.select', { label: t('system.config.client.overflowLogoutMode') })
          "
          style="width: 100%"
        >
          <ElOption label="First" value="First" />
          <ElOption label="Last" value="Last" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="t('common.status')" prop="status">
        <ElSwitch
          v-model="formData.status"
          :active-value="'Valid'"
          :inactive-value="'Invalid'"
          :active-text="t('common.statusEnabled')"
          :inactive-text="t('common.statusDisabled')"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="visible = false">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" :loading="saveLoading" @click="handleConfirm">{{
        t('common.confirm')
      }}</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import type { ClientReq } from '@/apis/system/type'
  import { addClient, getClient, updateClient } from '@/apis/system/client'
  import { useResetReactive } from '@/hooks'
  import { useDict } from '@/hooks'
  import { ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()

  const { t } = useI18n()
  const { client_type, auth_type } = useDict('client_type', 'auth_type')
  const visible = ref(false)
  const saveLoading = ref(false)
  const formRef = ref<FormInstance>()
  const isUpdate = ref(false)
  const currentId = ref('')

  const title = computed(() =>
    isUpdate.value ? t('system.config.client.editTitle') : t('system.config.client.addTitle')
  )

  const [formData, resetFormData] = useResetReactive({
    clientId: '',
    clientType: '',
    authType: '',
    activeTimeout: 1800,
    timeout: 3600,
    status: 'Valid' as 'Valid' | 'Invalid',
    isConcurrent: 0,
    maxLoginCount: 1,
    replacedRange: 'All',
    overflowLogoutMode: 'First'
  })

  const formRules: FormRules = {
    clientId: [
      {
        required: true,
        message: t('common.placeholder.status', { label: t('system.config.client.clientId') }),
        trigger: 'blur'
      }
    ],
    clientType: [
      {
        required: true,
        message: t('common.placeholder.select', { label: t('system.config.client.clientType') }),
        trigger: 'change'
      }
    ],
    authType: [
      {
        required: true,
        message: t('common.placeholder.select', { label: t('system.config.client.authType') }),
        trigger: 'change'
      }
    ]
  }

  const handleClose = () => {
    formRef.value?.resetFields()
    resetFormData()
  }

  const handleConfirm = async () => {
    const isValid = await formRef.value?.validate()
    if (!isValid) return

    saveLoading.value = true

    try {
      if (isUpdate.value) {
        await updateClient(formData as unknown as ClientReq, currentId.value)
        ElMessage.success(t('common.success'))
      } else {
        await addClient(formData as unknown as ClientReq)
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
    isUpdate.value = false
    currentId.value = ''
    visible.value = true
  }

  const onUpdate = async (id: string) => {
    isUpdate.value = true
    currentId.value = id
    try {
      const res = await getClient(id)
      Object.assign(formData, res)
      visible.value = true
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
  .unit {
    margin-left: 8px;
    color: var(--el-text-color-regular);
  }
</style>
