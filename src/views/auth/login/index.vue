<!-- 登录页面 -->
<template>
  <div class="flex w-full h-screen bg-[var(--art-color)]">
    <LoginLeftView />

    <div class="relative flex-1">
      <AuthTopBar />

      <div class="auth-right-wrap">
        <div class="form login-form">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <p class="sub-title">{{ $t('login.subTitle') }}</p>

          <ElTabs
            v-model="activeTab"
            class="login-tabs"
          >
            <ElTabPane
              :label="$t('login.tabs.account')"
              name="account"
            >
              <AccountLoginForm
                v-model="tenantCode"
                :need-tenant-code="needTenantCode"
                @success="handleLoginSuccess"
              />
            </ElTabPane>
            <ElTabPane
              :label="$t('login.tabs.phone')"
              name="phone"
            >
              <PhoneLoginForm
                v-model="tenantCode"
                :need-tenant-code="needTenantCode"
                @success="handleLoginSuccess"
              />
            </ElTabPane>
            <ElTabPane
              :label="$t('login.tabs.email')"
              name="email"
            >
              <EmailLoginForm
                v-model="tenantCode"
                :need-tenant-code="needTenantCode"
                @success="handleLoginSuccess"
              />
            </ElTabPane>
          </ElTabs>

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

          <div class="mt-5 text-sm text-gray-600">
            <span>{{ $t('login.noAccount') }}</span>
            <RouterLink
              class="text-theme"
              :to="{ name: 'Register' }"
            >
              {{ $t('login.register') }}
            </RouterLink>
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

const activeTab = ref<'account' | 'phone' | 'email'>('account')
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
