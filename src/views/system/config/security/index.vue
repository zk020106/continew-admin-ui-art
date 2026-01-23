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
      <ElFormItem prop="PASSWORD_ERROR_LOCK_COUNT">
        <template #label>
          {{ securityConfig.PASSWORD_ERROR_LOCK_COUNT?.name }}
        </template>
        <template #extra>
          {{ securityConfig.PASSWORD_ERROR_LOCK_COUNT?.description }}
        </template>
        <ElInputNumber
          v-model="form.PASSWORD_ERROR_LOCK_COUNT"
          :min="0"
          :max="10"
          controls-position="right"
        />
        <span class="unit">次</span>
      </ElFormItem>

      <ElFormItem prop="PASSWORD_ERROR_LOCK_MINUTES">
        <template #label>
          {{ securityConfig.PASSWORD_ERROR_LOCK_MINUTES?.name }}
        </template>
        <template #extra>
          {{ securityConfig.PASSWORD_ERROR_LOCK_MINUTES?.description }}
        </template>
        <ElInputNumber
          v-model="form.PASSWORD_ERROR_LOCK_MINUTES"
          :min="1"
          :max="1440"
          controls-position="right"
        />
        <span class="unit">分钟</span>
      </ElFormItem>

      <ElFormItem prop="PASSWORD_EXPIRATION_DAYS">
        <template #label>
          {{ securityConfig.PASSWORD_EXPIRATION_DAYS?.name }}
        </template>
        <template #extra>
          {{ securityConfig.PASSWORD_EXPIRATION_DAYS?.description }}
        </template>
        <ElInputNumber
          v-model="form.PASSWORD_EXPIRATION_DAYS"
          :min="0"
          :max="999"
          controls-position="right"
        />
        <span class="unit">天</span>
      </ElFormItem>

      <ElFormItem prop="PASSWORD_EXPIRATION_WARNING_DAYS">
        <template #label>
          {{ securityConfig.PASSWORD_EXPIRATION_WARNING_DAYS?.name }}
        </template>
        <template #extra>
          {{ securityConfig.PASSWORD_EXPIRATION_WARNING_DAYS?.description }}
        </template>
        <ElInputNumber
          v-model="form.PASSWORD_EXPIRATION_WARNING_DAYS"
          :min="0"
          :max="998"
          controls-position="right"
        />
        <span class="unit">天</span>
      </ElFormItem>

      <ElFormItem prop="PASSWORD_REPETITION_TIMES">
        <template #label>
          {{ securityConfig.PASSWORD_REPETITION_TIMES?.name }}
        </template>
        <template #extra>
          {{ securityConfig.PASSWORD_REPETITION_TIMES?.description }}
        </template>
        <ElInputNumber
          v-model="form.PASSWORD_REPETITION_TIMES"
          :min="3"
          :max="32"
          controls-position="right"
        />
        <span class="unit">次</span>
      </ElFormItem>

      <ElFormItem prop="PASSWORD_MIN_LENGTH">
        <template #label>
          {{ securityConfig.PASSWORD_MIN_LENGTH?.name }}
        </template>
        <template #extra>
          {{ securityConfig.PASSWORD_MIN_LENGTH?.description }}
        </template>
        <ElInputNumber
          v-model="form.PASSWORD_MIN_LENGTH"
          :min="8"
          :max="32"
          controls-position="right"
        />
      </ElFormItem>

      <ElFormItem prop="PASSWORD_ALLOW_CONTAIN_USERNAME">
        <template #label>
          {{ securityConfig.PASSWORD_ALLOW_CONTAIN_USERNAME?.name }}
        </template>
        <template #extra>
          {{ securityConfig.PASSWORD_ALLOW_CONTAIN_USERNAME?.description }}
        </template>
        <ElSwitch
          v-model="form.PASSWORD_ALLOW_CONTAIN_USERNAME"
          :active-value="1"
          :inactive-value="0"
          active-text="是"
          inactive-text="否"
        />
      </ElFormItem>

      <ElFormItem prop="PASSWORD_REQUIRE_SYMBOLS">
        <template #label>
          {{ securityConfig.PASSWORD_REQUIRE_SYMBOLS?.name }}
        </template>
        <template #extra>
          {{ securityConfig.PASSWORD_REQUIRE_SYMBOLS?.description }}
        </template>
        <ElSwitch
          v-model="form.PASSWORD_REQUIRE_SYMBOLS"
          :active-value="1"
          :inactive-value="0"
          active-text="是"
          inactive-text="否"
        />
      </ElFormItem>
    </ElForm>
    <div class="config-actions">
      <ElSpace>
        <ElButton v-if="!isUpdate" type="primary" @click="onUpdate">
          <ElIcon><Edit /></ElIcon>
          修改
        </ElButton>
        <ElButton v-if="!isUpdate" @click="onResetValue">
          <ElIcon><RefreshLeft /></ElIcon>
          恢复默认
        </ElButton>
        <ElButton v-if="isUpdate" type="primary" @click="handleSave">
          <ElIcon><Select /></ElIcon>
          保存
        </ElButton>
        <ElButton v-if="isUpdate" @click="reset">
          <ElIcon><Refresh /></ElIcon>
          重置
        </ElButton>
        <ElButton v-if="isUpdate" @click="handleCancel">
          <ElIcon><Close /></ElIcon>
          取消
        </ElButton>
      </ElSpace>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import type { OptionReq, OptionResp, SecurityConfig } from '@/apis/system/option'
import { Close, Edit, Refresh, RefreshLeft, Select } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listOption,
  resetOptionValue,
  updateOption

} from '@/apis/system/option'
import { useResetReactive } from '@/hooks'

defineOptions({ name: 'SecurityConfig' })

const loading = ref<boolean>(false)
const formRef = ref<FormInstance>()

const [form] = useResetReactive({
  PASSWORD_ERROR_LOCK_COUNT: 0,
  PASSWORD_ERROR_LOCK_MINUTES: 0,
  PASSWORD_EXPIRATION_DAYS: 0,
  PASSWORD_EXPIRATION_WARNING_DAYS: 0,
  PASSWORD_REPETITION_TIMES: 0,
  PASSWORD_MIN_LENGTH: 0,
  PASSWORD_ALLOW_CONTAIN_USERNAME: 0,
  PASSWORD_REQUIRE_SYMBOLS: 0
})

const rules: FormRules = {
  PASSWORD_ERROR_LOCK_COUNT: [{ required: true, message: '请输入值' }],
  PASSWORD_ERROR_LOCK_MINUTES: [{ required: true, message: '请输入值' }],
  PASSWORD_EXPIRATION_DAYS: [{ required: true, message: '请输入值' }],
  PASSWORD_EXPIRATION_WARNING_DAYS: [
    { required: true, message: '请输入值' },
    {
      validator: (_rule, value, callback) => {
        if (form.PASSWORD_EXPIRATION_DAYS > 0 && value >= form.PASSWORD_EXPIRATION_DAYS) {
          callback(new Error('密码到期提醒时间应小于密码有效期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  PASSWORD_REPETITION_TIMES: [{ required: true, message: '请输入值' }],
  PASSWORD_MIN_LENGTH: [{ required: true, message: '请输入值' }]
}

const securityConfig = ref<SecurityConfig>({
  PASSWORD_ERROR_LOCK_COUNT: {} as OptionResp,
  PASSWORD_ERROR_LOCK_MINUTES: {} as OptionResp,
  PASSWORD_EXPIRATION_DAYS: {} as OptionResp,
  PASSWORD_EXPIRATION_WARNING_DAYS: {} as OptionResp,
  PASSWORD_REPETITION_TIMES: {} as OptionResp,
  PASSWORD_MIN_LENGTH: {} as OptionResp,
  PASSWORD_ALLOW_CONTAIN_USERNAME: {} as OptionResp,
  PASSWORD_REQUIRE_SYMBOLS: {} as OptionResp
})

const isUpdate = ref(false)

const queryForm = {
  category: 'PASSWORD'
}

const reset = () => {
  formRef.value?.resetFields()
  form.PASSWORD_ERROR_LOCK_COUNT = Number(
    securityConfig.value.PASSWORD_ERROR_LOCK_COUNT.value || 0
  )
  form.PASSWORD_ERROR_LOCK_MINUTES = Number(
    securityConfig.value.PASSWORD_ERROR_LOCK_MINUTES.value || 0
  )
  form.PASSWORD_EXPIRATION_DAYS = Number(securityConfig.value.PASSWORD_EXPIRATION_DAYS.value || 0)
  form.PASSWORD_EXPIRATION_WARNING_DAYS = Number(
    securityConfig.value.PASSWORD_EXPIRATION_WARNING_DAYS.value || 0
  )
  form.PASSWORD_REPETITION_TIMES = Number(
    securityConfig.value.PASSWORD_REPETITION_TIMES.value || 0
  )
  form.PASSWORD_MIN_LENGTH = Number(securityConfig.value.PASSWORD_MIN_LENGTH.value || 0)
  form.PASSWORD_ALLOW_CONTAIN_USERNAME = Number(
    securityConfig.value.PASSWORD_ALLOW_CONTAIN_USERNAME.value || 0
  )
  form.PASSWORD_REQUIRE_SYMBOLS = Number(securityConfig.value.PASSWORD_REQUIRE_SYMBOLS.value || 0)
}

const getDataList = async () => {
  loading.value = true
  try {
    const data = await listOption(queryForm)
    securityConfig.value = data.reduce<SecurityConfig>((obj, option) => {
      obj[option.code as keyof SecurityConfig] = { ...option, value: option.value }
      return obj
    }, {} as SecurityConfig)
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
        const configKey = key as keyof SecurityConfig
        return {
          id: securityConfig.value[configKey].id,
          code: key,
          value: String(value)
        } as OptionReq
      })
    )
    ElMessage.success('保存成功')
    isUpdate.value = false
    await getDataList()
  } catch (error) {
    console.error('Failed to update security config:', error)
  }
}

const handleResetValue = async () => {
  try {
    await resetOptionValue(queryForm)
    ElMessage.success('恢复成功')
    await getDataList()
  } catch (error) {
    console.error('Failed to reset security config:', error)
  }
}

const onResetValue = () => {
  ElMessageBox.confirm('确认恢复安全配置为默认值吗？', '警告', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消'
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

  .unit {
    margin-left: 8px;
    color: var(--el-text-color-regular);
  }
</style>
