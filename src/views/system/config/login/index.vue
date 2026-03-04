<template>
  <div v-loading="loading" class="config-page">
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="180px"
      :disabled="!isUpdate"
      class="config-form"
    >
      <ElFormItem prop="LOGIN_CAPTCHA_ENABLED">
        <template #label>
          {{ loginConfig.LOGIN_CAPTCHA_ENABLED?.name }}
        </template>
        <ElSwitch
          v-model="form.LOGIN_CAPTCHA_ENABLED"
          :active-value="1"
          :inactive-value="0"
          :active-text="t('common.true')"
          :inactive-text="t('common.false')"
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
import type { FormInstance, FormRules } from 'element-plus'
import type { LoginConfig, OptionReq, OptionResp } from '@/apis/system/option'
import { Close, Edit, Refresh, RefreshLeft, Select } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  listOption,
  resetOptionValue,
  updateOption

} from '@/apis/system/option'
import { useResetReactive } from '@/hooks'

defineOptions({ name: 'LoginConfig' })

const { t } = useI18n()
const loading = ref<boolean>(false)
const formRef = ref<FormInstance>()

const [form] = useResetReactive({
  LOGIN_CAPTCHA_ENABLED: 1
})

const rules: FormRules = {
  LOGIN_CAPTCHA_ENABLED: [{ required: true, message: t('common.placeholder.select') }]
}

const loginConfig = ref<LoginConfig>({
  LOGIN_CAPTCHA_ENABLED: {} as OptionResp
})

const isUpdate = ref(false)

const queryForm = {
  category: 'LOGIN'
}

const reset = () => {
  formRef.value?.resetFields()
  form.LOGIN_CAPTCHA_ENABLED = loginConfig.value.LOGIN_CAPTCHA_ENABLED.value
    ? Number.parseInt(loginConfig.value.LOGIN_CAPTCHA_ENABLED.value)
    : 0
}

const getDataList = async () => {
  loading.value = true
  try {
    const data = await listOption(queryForm)
    loginConfig.value = data.reduce<LoginConfig>((obj, option) => {
      obj[option.code as keyof LoginConfig] = { ...option, value: option.value }
      return obj
    }, {} as LoginConfig)
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
        const configKey = key as keyof LoginConfig
        return {
          id: loginConfig.value[configKey].id,
          code: key,
          value: String(value)
        } as OptionReq
      })
    )
    ElMessage.success(t('common.successSave'))
    isUpdate.value = false
    await getDataList()
  } catch (error) {
    console.error('Failed to update login config:', error)
  }
}

const handleResetValue = async () => {
  try {
    await resetOptionValue(queryForm)
    ElMessage.success(t('common.successRestore'))
    await getDataList()
  } catch (error) {
    console.error('Failed to reset login config:', error)
  }
}

const onResetValue = () => {
  ElMessageBox.confirm(t('system.config.login.resetConfirm'), t('common.warning'), {
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
    padding-left: 180px;
  }
</style>
