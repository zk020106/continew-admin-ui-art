<template>
  <ElConfigProvider size="default" :locale="locales[language]" :z-index="3000">
    <RouterView></RouterView>
  </ElConfigProvider>
</template>

<script setup lang="ts">
import en from 'element-plus/es/locale/lang/en'
import zh from 'element-plus/es/locale/lang/zh-cn'
import { initSiteConfig } from './config/modules/site'
import { initializeTheme } from './hooks/core/useTheme'
import { useUserStore } from './store/modules/user'
import { checkStorageCompatibility } from './utils/storage'
import { systemUpgrade } from './utils/sys'
import { toggleTransition } from './utils/ui/animation'

const userStore = useUserStore()
const { language } = storeToRefs(userStore)

const locales = {
  zh,
  en
}

onBeforeMount(() => {
  toggleTransition(true)
  initializeTheme()
})

onMounted(() => {
  checkStorageCompatibility()
  toggleTransition(false)
  systemUpgrade()
  initSiteConfig()
})
</script>
