<template>
  <div class="social-callback">
    <ElIcon class="is-loading text-2xl">
      <Loading />
    </ElIcon>
    <p class="mt-3 text-sm text-gray-600">
      {{ $t('login.socialProcessing') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'SocialCallback' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const buildLoginReq = (query: Record<string, unknown>) => {
  const req: Record<string, string> = {}
  if (typeof query.code === 'string') {
    req.code = query.code
  }
  if (typeof query.state === 'string') {
    req.state = query.state
  }
  return req
}

const handleSocialLogin = async () => {
  const source = typeof route.query.source === 'string' ? route.query.source : ''
  if (!source) {
    await router.replace({ name: 'Login' })
    return
  }

  const req = buildLoginReq(route.query as Record<string, unknown>)
  if (!req.code) {
    await router.replace({ name: 'Login', query: { source } })
    return
  }

  try {
    await userStore.socialLogin(source, req)
    ElMessage.success(t('login.success.title'))
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.replace(decodeURIComponent(redirect))
  } catch {
    await router.replace({ name: 'Login', query: { source } })
  }
}

onMounted(() => {
  handleSocialLogin()
})
</script>

<style scoped>
.social-callback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
}
</style>
