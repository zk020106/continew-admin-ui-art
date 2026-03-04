<!-- 布局容器 -->
<template>
  <div class="app-layout">
    <aside id="app-sidebar">
      <ArtSidebarMenu />
    </aside>

    <main id="app-main">
      <div id="app-header">
        <ArtHeaderBar />
      </div>
      <div id="app-content">
        <ArtPageContent />
      </div>
      <div id="app-footer">
        <ArtFooter />
      </div>
    </main>

    <div id="app-global">
      <ArtGlobalComponent />
    </div>

    <ArtNoticePopup ref="noticePopupRef" />
  </div>
</template>

<script setup lang="ts">
import ArtNoticePopup from '@/components/core/layouts/art-notice-popup/index.vue'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'AppLayout' })

const userStore = useUserStore()
const noticePopupRef = ref<InstanceType<typeof ArtNoticePopup>>()

const checkAndShowNotices = () => {
  if (!userStore.accessToken) return
  setTimeout(() => {
    noticePopupRef.value?.open()
  }, 1000)
}

onMounted(() => {
  checkAndShowNotices()
})
</script>

<style lang="scss" scoped>
  @use './style';
</style>
