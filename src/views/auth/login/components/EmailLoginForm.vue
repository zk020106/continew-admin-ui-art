<template>
  <ElForm
    ref="formRef"
    :model="formData"
    :rules="rules"
    @keyup.enter="handleSubmit"
  >
    <ElFormItem v-if="needTenantCode">
      <ElInput
        v-model.trim="tenantCodeModel"
        class="custom-height"
        :placeholder="$t('login.placeholder.tenantCode')"
      />
    </ElFormItem>

    <ElFormItem prop="email">
      <ElInput
        v-model.trim="formData.email"
        class="custom-height"
        :placeholder="$t('login.placeholder.email')"
      />
    </ElFormItem>

    <ElFormItem prop="captcha">
      <ElInput
        v-model.trim="formData.captcha"
        class="custom-height"
        :placeholder="$t('login.placeholder.emailCaptcha')"
      >
        <template #append>
          <ElButton
            :loading="sending"
            :disabled="countdown > 0"
            @click="handleSendCaptcha"
          >
            {{ captchaBtnText }}
          </ElButton>
        </template>
      </ElInput>
    </ElFormItem>

    <div class="mt-6">
      <ElButton
        class="w-full login-submit-button"
        type="primary"
        :loading="loading"
        @click="handleSubmit"
      >
        {{ $t('login.btnText') }}
      </ElButton>
    </div>
  </ElForm>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { getEmailCaptcha } from '@/apis'
import { useUserStore } from '@/store/modules/user'
import { validateEmail } from '@/utils/form/validator'

interface Props {
  modelValue: string
  needTenantCode: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'success': []
}>()

const { t } = useI18n()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const sending = ref(false)
const countdown = ref(0)

const tenantCodeModel = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const formData = reactive({
  email: '',
  captcha: ''
})

const rules = computed<FormRules>(() => ({
  email: [
    { required: true, message: t('login.placeholder.email'), trigger: 'blur' },
    {
      validator: (_rule, value: string, callback) => {
        if (!value || validateEmail(value)) {
          callback()
          return
        }
        callback(new Error(t('login.error.invalidEmail')))
      },
      trigger: 'blur'
    }
  ],
  captcha: [{ required: true, message: t('login.placeholder.emailCaptcha'), trigger: 'blur' }]
}))

const captchaBtnText = computed(() => {
  if (sending.value) {
    return t('login.sendingCaptcha')
  }
  if (countdown.value > 0) {
    return t('login.resendCaptchaIn', { seconds: countdown.value })
  }
  return t('login.sendCaptcha')
})

let countdownTimer: ReturnType<typeof setInterval> | null = null

const startCountdown = () => {
  countdown.value = 60
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  countdownTimer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

const handleSendCaptcha = async () => {
  if (!formRef.value || sending.value || countdown.value > 0) return

  try {
    await formRef.value.validateField('email')
    sending.value = true
    await getEmailCaptcha(formData.email, { captchaVerification: '' })
    startCountdown()
    ElMessage.success(t('login.message.emailSent'))
  } finally {
    sending.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true
    await userStore.emailLogin(
      {
        email: formData.email,
        captcha: formData.captcha
      },
      tenantCodeModel.value || undefined
    )
    emit('success')
  } catch {
    formData.captcha = ''
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped lang="scss">
:deep(.custom-height .el-input__wrapper) {
  height: 40px;
}

:deep(.custom-height .el-input__inner) {
  line-height: 40px;
}
</style>
