<!-- 登录页面 -->
<template>
  <div class="flex w-full h-screen bg-(--art-color)">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form login-form">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <p class="sub-title">{{ $t('login.subTitle') }}</p>

          <div class="login-panel-stack">
            <section
              v-show="viewMode === 'account'"
              class="login-panel"
            >
              <AccountLoginForm
                v-model="tenantCode"
                :need-tenant-code="needTenantCode"
                @success="handleLoginSuccess"
              />

              <div class="login-entry-actions">
                <button
                  class="login-entry-button"
                  type="button"
                  @click="viewMode = 'phone'"
                >
                  {{ $t('login.actions.phone') }}
                </button>
                <button
                  class="login-entry-button"
                  type="button"
                  @click="viewMode = 'email'"
                >
                  {{ $t('login.actions.email') }}
                </button>
              </div>

              <div class="oauth-panel">
                <ElDivider>{{ $t('login.otherLogin') }}</ElDivider>
                <div class="oauth-list">
                  <button
                    class="oauth-item"
                    type="button"
                    :title="$t('login.oauth.gitee')"
                    @click="handleOauth('gitee')"
                  >
                    <ArtSvgIcon
                      icon="gitee"
                      class="oauth-icon"
                    />
                  </button>
                  <button
                    class="oauth-item"
                    type="button"
                    :title="$t('login.oauth.github')"
                    @click="handleOauth('github')"
                  >
                    <ArtSvgIcon
                      icon="github"
                      class="oauth-icon"
                    />
                  </button>
                  <button
                    class="oauth-item"
                    type="button"
                    :title="$t('login.oauth.wechat')"
                    @click="handleOauth('wechat_open')"
                  >
                    <ArtSvgIcon
                      icon="wechat"
                      class="oauth-icon"
                    />
                  </button>
                </div>
              </div>

              <div class="login-register-tip mt-5 text-sm text-gray-600">
                <span>{{ $t('login.noAccount') }}</span>
                <RouterLink
                  class="text-theme"
                  :to="{ name: 'Register' }"
                >
                  {{ $t('login.register') }}
                </RouterLink>
              </div>
            </section>

            <section
              v-show="viewMode === 'phone'"
              class="login-panel"
            >
              <PhoneLoginForm
                v-model="tenantCode"
                :need-tenant-code="needTenantCode"
                @success="handleLoginSuccess"
              />

              <button
                class="login-back-button"
                type="button"
                @click="viewMode = 'account'"
              >
                {{ $t('login.actions.backToAccount') }}
              </button>
            </section>

            <section
              v-show="viewMode === 'email'"
              class="login-panel"
            >
              <EmailLoginForm
                v-model="tenantCode"
                :need-tenant-code="needTenantCode"
                @success="handleLoginSuccess"
              />

              <button
                class="login-back-button"
                type="button"
                @click="viewMode = 'account'"
              >
                {{ $t('login.actions.backToAccount') }}
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  getTenantIdByDomain,
  getTenantStatus,
  socialAuth
} from '@/apis'
import { useTenantStore } from '@/store/modules/tenant'
import { useUserStore } from '@/store/modules/user'
import AccountLoginForm from './components/AccountLoginForm.vue'
import EmailLoginForm from './components/EmailLoginForm.vue'
import PhoneLoginForm from './components/PhoneLoginForm.vue'

defineOptions({ name: 'Login' })

const { t } = useI18n()
const userStore = useUserStore()
const tenantStore = useTenantStore()
const router = useRouter()
const route = useRoute()

const viewMode = ref<'account' | 'phone' | 'email'>('account')
const tenantCode = ref('')
const needTenantCode = computed(() => tenantStore.needInputTenantCode)

const handleLoginSuccess = async () => {
  const userInfo = userStore.info
  ElNotification({
    title: t('login.success.title'),
    type: 'success',
    duration: 2500,
    zIndex: 10000,
    message: `${t('login.success.message')}, ${userInfo?.nickname || ''}!`
  })

  const redirect = route.query.redirect as string | undefined
  await router.push(redirect || '/')
}

const handleOauth = async (source: string) => {
  try {
    const { authorizeUrl } = await socialAuth(source)
    window.location.href = authorizeUrl
  } catch {
    ElMessage.error(t('login.error.socialAuthFailed'))
  }
}

const initTenant = async () => {
  try {
    const tenantEnabled = await getTenantStatus()
    tenantStore.setTenantEnable(tenantEnabled)

    if (!tenantEnabled) {
      return
    }

    const domain = window.location.hostname
    const tenantId = await getTenantIdByDomain(domain)
    if (tenantId) {
      tenantStore.setTenantId(tenantId)
      tenantCode.value = ''
    }
  } catch (error) {
    console.error('[Login] init tenant failed:', error)
  }
}

onMounted(() => {
  initTenant()
})
</script>

<style scoped>
  @import './style.css';
</style>

<style lang="scss" scoped>
  :deep(.el-select__wrapper) {
    height: 40px !important;
  }
</style>
