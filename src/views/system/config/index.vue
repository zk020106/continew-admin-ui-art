<template>
  <CaPageLayout>
    <template #header>
      <ElTabs v-model="activeKey" @tab-click="handleTabClick">
        <ElTabPane v-for="item in configTabs" :key="item.key" :name="item.key" :label="item.name" />
      </ElTabs>
    </template>

    <component :is="activeComponent" />
  </CaPageLayout>
</template>

<script setup lang="ts">
  import CaPageLayout from '@/components/base/CaPageLayout/index.vue'
  import { ElTabPane, ElTabs } from 'element-plus'
  import { computed, defineAsyncComponent, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute, useRouter } from 'vue-router'

  defineOptions({ name: 'SystemConfig' })

  const { t } = useI18n()
  const router = useRouter()

  // 配置项标签页列表
  const configTabs = computed(() => [
    { key: 'site', name: t('system.config.tabs.site') },
    { key: 'security', name: t('system.config.tabs.security') },
    { key: 'login', name: t('system.config.tabs.login') },
    { key: 'mail', name: t('system.config.tabs.mail') },
    { key: 'sms', name: t('system.config.tabs.sms') },
    { key: 'storage', name: t('system.config.tabs.storage') },
    { key: 'client', name: t('system.config.tabs.client') }
  ])

  // 当前激活的标签页 key，从 URL query 参数读取
  const route = useRoute()
  const activeKey = ref<string>((route.query.tab as string) || 'site')

  // 标签页点击事件
  const handleTabClick = (tab: any) => {
    activeKey.value = tab.props.name
    router.replace({ query: { tab: activeKey.value } })
  }

  // 动态组件映射
  const components: Record<string, Component> = {
    site: defineAsyncComponent(() => import('./site/index.vue')),
    security: defineAsyncComponent(() => import('./security/index.vue')),
    login: defineAsyncComponent(() => import('./login/index.vue')),
    mail: defineAsyncComponent(() => import('./mail/index.vue')),
    sms: defineAsyncComponent(() => import('./sms/index.vue')),
    storage: defineAsyncComponent(() => import('./storage/index.vue')),
    client: defineAsyncComponent(() => import('./client/index.vue'))
  }

  // 当前激活的组件
  const activeComponent = computed(() => components[activeKey.value])
</script>

<style scoped lang="scss">
  :deep(.el-tabs__header) {
    padding: 0 16px;
    margin: 0;
  }
</style>
