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

    <ElFormItem prop="username">
      <ElInput
        v-model.trim="formData.username"
        class="custom-height"
        :placeholder="$t('login.placeholder.username')"
      />
    </ElFormItem>

    <ElFormItem prop="password">
      <ElInput
        v-model.trim="formData.password"
        class="custom-height"
        :placeholder="$t('login.placeholder.password')"
        type="password"
        autocomplete="off"
        show-password
      />
    </ElFormItem>

    <ElFormItem
      v-if="isCaptchaEnabled"
      prop="captcha"
    >
      <ElInput
        v-model.trim="formData.captcha"
        :placeholder="$t('login.placeholder.captcha')"
        :maxlength="4"
        clearable
        class="custom-height"
        style="flex: 1 1"
      />
      <div
        class="captcha-container"
        @click="getCaptcha"
      >
        <img
          :src="captchaImgBase64"
          :alt="$t('login.captcha')"
          class="captcha"
        >
        <div
          v-if="formData.expired"
          class="overlay"
        >
          <p>{{ $t('login.expired') }}</p>
        </div>
      </div>
    </ElFormItem>

    <div class="flex-cb mt-2 text-sm">
      <ElCheckbox v-model="formData.rememberPassword">
        {{ $t('login.rememberPwd') }}
      </ElCheckbox>
      <RouterLink
        class="text-theme"
        :to="{ name: 'ForgetPassword' }"
      >
        {{ $t('login.forgetPwd') }}
      </RouterLink>
    </div>

    <div style="margin-top: 24px">
      <ElButton
        class="w-full custom-height"
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
import { useStorage } from '@vueuse/core'
import { ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { getImageCaptcha } from '@/apis'
import { useUserStore } from '@/store/modules/user'
import { encryptByRsa } from '@/utils/encrypt'
import { HttpError } from '@/utils/http/error'

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
const isCaptchaEnabled = ref(true)
const captchaImgBase64 = ref('')

const loginConfig = useStorage('login-config', {
  rememberMe: true,
  username: 'admin',
  password: 'admin123'
})

const tenantCodeModel = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

const formData = reactive({
  username: loginConfig.value.username,
  password: loginConfig.value.password,
  captcha: '',
  uuid: '',
  expired: false,
  rememberPassword: loginConfig.value.rememberMe
})

const rules = computed<FormRules>(() => ({
  username: [{ required: true, message: t('login.placeholder.username'), trigger: 'blur' }],
  password: [{ required: true, message: t('login.placeholder.password'), trigger: 'blur' }],
  captcha: isCaptchaEnabled.value
    ? [{ required: true, message: t('login.placeholder.captcha'), trigger: 'blur' }]
    : []
}))

let timer: ReturnType<typeof setTimeout> | null = null

const startTimer = (expireTime: number, curTime = Date.now()) => {
  if (timer) {
    clearTimeout(timer)
  }
  const remainingTime = expireTime - curTime
  if (remainingTime <= 0) {
    formData.expired = true
    return
  }
  timer = setTimeout(() => {
    formData.expired = true
  }, remainingTime)
}

const getCaptcha = async () => {
  const { uuid, img, expireTime, isEnabled } = await getImageCaptcha()
  isCaptchaEnabled.value = isEnabled
  captchaImgBase64.value = img
  formData.uuid = uuid
  formData.expired = false
  formData.captcha = ''
  startTimer(expireTime, Date.now())
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (isCaptchaEnabled.value && formData.expired) {
      ElNotification.error(t('login.error.captchaExpired'))
      await getCaptcha()
      return
    }

    loading.value = true

    const encryptedPassword = encryptByRsa(formData.password)
    if (!encryptedPassword) {
      ElNotification.error(t('login.error.passwordEncrypt'))
      return
    }

    await userStore.accountLogin(
      {
        username: formData.username,
        password: encryptedPassword,
        captcha: isCaptchaEnabled.value ? formData.captcha : undefined,
        uuid: isCaptchaEnabled.value ? formData.uuid : undefined
      },
      tenantCodeModel.value || undefined
    )

    loginConfig.value.rememberMe = formData.rememberPassword
    loginConfig.value.username = formData.rememberPassword ? formData.username : ''
    loginConfig.value.password = formData.rememberPassword ? formData.password : ''
    emit('success')
  } catch (error) {
    if (error instanceof HttpError && isCaptchaEnabled.value) {
      await getCaptcha()
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getCaptcha()
})

onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer)
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

.captcha-container {
  position: relative;
  display: flex;
  margin-left: 5px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 4px;
}

.captcha {
  display: block;
  width: 111px;
  height: 36px;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(51 51 51 / 80%);
}

.overlay p {
  margin: 0;
  font-size: 12px;
  color: #fff;
}
</style>
