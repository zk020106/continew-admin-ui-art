<template>
  <ElDrawer
    v-model="visible"
    :title="drawerTitle"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :size="width >= 600 ? 600 : '100%'"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <ElFormItem :label="t('system.config.sms.name')" prop="name">
        <ElInput
          v-model="formData.name"
          :placeholder="t('system.config.sms.namePlaceholder')"
          maxlength="100"
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.supplier')" prop="supplier">
        <ElSelect
          v-model="formData.supplier"
          :placeholder="t('system.config.sms.supplierPlaceholder')"
          style="width: 100%"
        >
          <ElOption label="AliYun" value="AliYun" />
          <ElOption label="Tencent" value="Tencent" />
          <ElOption label=" Huawei" value="Huawei" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.accessKey')" prop="accessKey">
        <ElInput
          v-model="formData.accessKey"
          :placeholder="t('system.config.sms.accessKeyPlaceholder')"
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.secretKey')" prop="secretKey">
        <ElInput v-model="formData.secretKey" type="password" show-password />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.signature')" prop="signature">
        <ElInput
          v-model="formData.signature"
          :placeholder="t('system.config.sms.signaturePlaceholder')"
          maxlength="100"
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.templateId')" prop="templateId">
        <ElInput
          v-model="formData.templateId"
          :placeholder="t('system.config.sms.templateIdPlaceholder')"
          maxlength="50"
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.weight')" prop="weight">
        <ElInputNumber v-model="formData.weight" :min="1" :max="100" />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.retryInterval')" prop="retryInterval">
        <ElInputNumber v-model="formData.retryInterval" :min="0" />
        <span class="unit">{{ t('system.config.sms.retryIntervalUnit') }}</span>
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.maxRetries')" prop="maxRetries">
        <ElInputNumber v-model="formData.maxRetries" :min="0" />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.maximum')" prop="maximum">
        <ElInputNumber v-model="formData.maximum" :min="1" />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.supplierConfig')" prop="supplierConfig">
        <ElInput
          v-model="formData.supplierConfig"
          type="textarea"
          :rows="3"
          placeholder='{"sdkAppId":""}'
        />
      </ElFormItem>
      <ElFormItem :label="t('common.status')" prop="status">
        <ElSwitch
          v-model="formData.status"
          :active-value="1"
          :inactive-value="2"
          :active-text="t('common.statusEnabled')"
          :inactive-text="t('common.statusDisabled')"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" @click="handleConfirm">{{ t('common.confirm') }}</ElButton>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { addSmsConfig, getSmsConfig, updateSmsConfig } from '@/apis/system/smsConfig'
  import type { SmsConfigReq } from '@/apis/system/type'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'SmsConfigAddDrawer' })

  const emit = defineEmits<{
    'save-success': []
  }>()

  const { t } = useI18n()
  const width = ref(document.documentElement.clientWidth)
  const visible = ref(false)
  const formRef = ref()
  const isEdit = ref(false)
  const currentId = ref('')

  const drawerTitle = computed(() =>
    isEdit.value ? t('system.config.sms.editTitle') : t('system.config.sms.addTitle')
  )

  const formData = ref<SmsConfigReq>({
    name: '',
    supplier: '',
    accessKey: '',
    secretKey: '',
    signature: '',
    templateId: '',
    weight: '10',
    retryInterval: '60',
    maxRetries: '3',
    maximum: '1000',
    supplierConfig: '',
    status: 1,
    isDefault: false
  })

  const formRules = computed(() => ({
    name: [{ required: true, message: t('system.config.sms.namePlaceholder'), trigger: 'blur' }],
    supplier: [
      { required: true, message: t('system.config.sms.supplierPlaceholder'), trigger: 'change' }
    ],
    accessKey: [
      { required: true, message: t('system.config.sms.accessKeyPlaceholder'), trigger: 'blur' }
    ],
    secretKey: [{ required: true, message: t('system.config.sms.secretKey'), trigger: 'blur' }],
    signature: [
      { required: true, message: t('system.config.sms.signaturePlaceholder'), trigger: 'blur' }
    ],
    templateId: [
      { required: true, message: t('system.config.sms.templateIdPlaceholder'), trigger: 'blur' }
    ]
  }))

  const onAdd = () => {
    isEdit.value = false
    currentId.value = ''
    resetForm()
    visible.value = true
  }

  const onUpdate = async (id: string) => {
    isEdit.value = true
    currentId.value = id
    try {
      const res = await getSmsConfig(id)
      formData.value = { ...res }
      visible.value = true
    } catch (error) {
      console.error('Failed to fetch SMS config detail:', error)
    }
  }

  const resetForm = () => {
    formData.value = {
      name: '',
      supplier: '',
      accessKey: '',
      secretKey: '',
      signature: '',
      templateId: '',
      weight: '10',
      retryInterval: '60',
      maxRetries: '3',
      maximum: '1000',
      supplierConfig: '',
      status: 1,
      isDefault: false
    }
    formRef.value?.clearValidate()
  }

  const handleConfirm = async () => {
    await formRef.value?.validate()
    try {
      if (isEdit.value) {
        await updateSmsConfig(formData.value, currentId.value)
      } else {
        await addSmsConfig(formData.value)
      }
      ElMessage.success(t('common.success'))
      visible.value = false
      emit('save-success')
    } catch (error) {
      console.error('Failed to save SMS config:', error)
    }
  }

  const handleClose = () => {
    visible.value = false
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
