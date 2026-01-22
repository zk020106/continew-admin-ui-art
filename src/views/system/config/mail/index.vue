<template>
  <div v-loading="loading" class="config-page">
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="140px"
      :disabled="!isUpdate"
      class="config-form"
    >
      <ElFormItem prop="MAIL_PROTOCOL">
        <template #label>
          {{ mailConfig.MAIL_PROTOCOL?.name }}
        </template>
        <template #extra>
          {{ mailConfig.MAIL_PROTOCOL?.description }}
        </template>
        <ElSelect v-model="form.MAIL_PROTOCOL" style="width: 220px">
          <ElOption label="SMTP" value="smtp" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem prop="MAIL_HOST">
        <template #label>
          {{ mailConfig.MAIL_HOST?.name }}
        </template>
        <template #extra>
          {{ mailConfig.MAIL_HOST?.description }}
        </template>
        <ElInput v-model="form.MAIL_HOST" style="width: 220px" />
      </ElFormItem>

      <ElFormItem prop="MAIL_PORT">
        <template #label>
          {{ mailConfig.MAIL_PORT?.name }}
        </template>
        <template #extra>
          {{ mailConfig.MAIL_PORT?.description }}
        </template>
        <ElInputNumber v-model="form.MAIL_PORT" :min="1" :max="65535" controls-position="right" />
      </ElFormItem>

      <ElFormItem prop="MAIL_USERNAME">
        <template #label>
          {{ mailConfig.MAIL_USERNAME?.name }}
        </template>
        <template #extra>
          {{ mailConfig.MAIL_USERNAME?.description }}
        </template>
        <ElInput v-model="form.MAIL_USERNAME" style="width: 220px" />
      </ElFormItem>

      <ElFormItem prop="MAIL_PASSWORD">
        <template #label>
          {{ mailConfig.MAIL_PASSWORD?.name }}
        </template>
        <template #extra>
          {{ mailConfig.MAIL_PASSWORD?.description }}
        </template>
        <ElInput v-model="form.MAIL_PASSWORD" type="password" show-password style="width: 220px" />
      </ElFormItem>

      <ElFormItem prop="MAIL_SSL_ENABLED">
        <template #label>
          {{ mailConfig.MAIL_SSL_ENABLED?.name }}
        </template>
        <template #extra>
          {{ mailConfig.MAIL_SSL_ENABLED?.description }}
        </template>
        <ElSwitch
          v-model="form.MAIL_SSL_ENABLED"
          :active-value="1"
          :inactive-value="0"
          :active-text="t('common.statusEnabled')"
          :inactive-text="t('common.statusDisabled')"
        />
      </ElFormItem>

      <ElFormItem v-if="form.MAIL_SSL_ENABLED === 1" prop="MAIL_SSL_PORT">
        <template #label>
          {{ mailConfig.MAIL_SSL_PORT?.name }}
        </template>
        <template #extra>
          {{ mailConfig.MAIL_SSL_PORT?.description }}
        </template>
        <ElInputNumber
          v-model="form.MAIL_SSL_PORT"
          :min="1"
          :max="65535"
          controls-position="right"
        />
      </ElFormItem>
    </ElForm>
    <div class="config-actions">
      <ElSpace>
        <ElButton v-if="!isUpdate" type="primary" @click="onUpdate">
          <ElIcon><Edit /></ElIcon>
          {{ t('common.edit') }}
        </ElButton>
        <ElButton v-if="!isUpdate" @click="onResetValue">
          <ElIcon><RefreshLeft /></ElIcon>
          {{ t('common.restoreDefault') }}
        </ElButton>
        <ElButton v-if="isUpdate" type="primary" @click="handleSave">
          <ElIcon><Select /></ElIcon>
          {{ t('common.save') }}
        </ElButton>
        <ElButton v-if="isUpdate" @click="reset">
          <ElIcon><Refresh /></ElIcon>
          {{ t('common.reset') }}
        </ElButton>
        <ElButton v-if="isUpdate" @click="handleCancel">
          <ElIcon><Close /></ElIcon>
          {{ t('common.cancel') }}
        </ElButton>
      </ElSpace>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    listOption,
    resetOptionValue,
    updateOption,
    type MailConfig,
    type OptionReq,
    type OptionResp
  } from '@/apis/system/option'
  import { useResetReactive } from '@/hooks'
  import { Close, Edit, Refresh, RefreshLeft, Select } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'MailConfig' })

  const { t } = useI18n()
  const loading = ref<boolean>(false)
  const formRef = ref<FormInstance>()

  const [form] = useResetReactive({
    MAIL_PROTOCOL: '',
    MAIL_HOST: '',
    MAIL_PORT: 0,
    MAIL_USERNAME: '',
    MAIL_PASSWORD: '',
    MAIL_SSL_ENABLED: 0,
    MAIL_SSL_PORT: 0
  })

  const rules: FormRules = {
    MAIL_HOST: [{ required: true, message: '请输入值' }],
    MAIL_PORT: [{ required: true, message: '请输入值' }],
    MAIL_USERNAME: [{ required: true, message: '请输入值' }],
    MAIL_PASSWORD: [{ required: true, message: '请输入值' }],
    MAIL_SSL_PORT: [{ required: true, message: '请输入值' }]
  }

  const mailConfig = ref<MailConfig>({
    MAIL_PROTOCOL: {} as OptionResp,
    MAIL_HOST: {} as OptionResp,
    MAIL_PORT: {} as OptionResp,
    MAIL_USERNAME: {} as OptionResp,
    MAIL_PASSWORD: {} as OptionResp,
    MAIL_SSL_ENABLED: {} as OptionResp,
    MAIL_SSL_PORT: {} as OptionResp
  })

  const isUpdate = ref(false)

  const queryForm = {
    category: 'MAIL'
  }

  const reset = () => {
    formRef.value?.resetFields()
    form.MAIL_PROTOCOL = mailConfig.value.MAIL_PROTOCOL.value || ''
    form.MAIL_HOST = mailConfig.value.MAIL_HOST.value || ''
    form.MAIL_PORT = Number(mailConfig.value.MAIL_PORT.value || 0)
    form.MAIL_USERNAME = mailConfig.value.MAIL_USERNAME.value || ''
    form.MAIL_PASSWORD = mailConfig.value.MAIL_PASSWORD.value || ''
    form.MAIL_SSL_ENABLED = Number(mailConfig.value.MAIL_SSL_ENABLED.value || 0)
    form.MAIL_SSL_PORT = Number(mailConfig.value.MAIL_SSL_PORT.value || 0)
  }

  const getDataList = async () => {
    loading.value = true
    try {
      const data = await listOption(queryForm)
      // 使用默认配置作为初始值
      const defaultMailConfig: MailConfig = {
        MAIL_PROTOCOL: {} as OptionResp,
        MAIL_HOST: {} as OptionResp,
        MAIL_PORT: {} as OptionResp,
        MAIL_USERNAME: {} as OptionResp,
        MAIL_PASSWORD: {} as OptionResp,
        MAIL_SSL_ENABLED: {} as OptionResp,
        MAIL_SSL_PORT: {} as OptionResp
      }
      mailConfig.value = data.reduce<MailConfig>((obj, option) => {
        obj[option.code as keyof MailConfig] = {
          ...option,
          value: ['MAIL_PORT', 'MAIL_SSL_PORT', 'MAIL_SSL_ENABLED'].includes(option.code)
            ? Number.parseInt(option.value)
            : option.value
        }
        return obj
      }, defaultMailConfig)
      reset()
    } finally {
      loading.value = false
    }
  }

  const onUpdate = () => {
    isUpdate.value = true
  }

  const handleCancel = () => {
    reset()
    isUpdate.value = false
  }

  const handleSave = async () => {
    const isValid = await formRef.value?.validate()
    if (!isValid) return

    try {
      await updateOption(
        Object.entries(form).map(([key, value]) => {
          const configKey = key as keyof MailConfig
          return {
            id: mailConfig.value[configKey].id,
            code: key,
            value: String(value)
          } as OptionReq
        })
      )
      ElMessage.success(t('common.successSave'))
      await getDataList()
    } catch (error) {
      console.error('Failed to update mail config:', error)
    }
  }

  const handleResetValue = async () => {
    try {
      await resetOptionValue(queryForm)
      ElMessage.success(t('common.successRestore'))
      await getDataList()
    } catch (error) {
      console.error('Failed to reset mail config:', error)
    }
  }

  const onResetValue = () => {
    ElMessageBox.confirm(t('system.config.mail.resetConfirm'), t('common.tips'), {
      type: 'warning',
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel')
    })
      .then(async () => {
        await handleResetValue()
      })
      .catch(() => {})
  }

  onMounted(() => {
    getDataList()
  })
</script>

<style scoped lang="scss">
  .config-page {
    padding: 20px;
  }

  .config-form {
    max-width: 600px;
  }

  .config-actions {
    padding-left: 140px;
  }
</style>
