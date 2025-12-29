<template>
  <CaPageLayout :size="220" :left-style="{ padding: '16px 0' }" :header-style="{ padding: 0 }">
    <template #left>
      <ElMenu
        mode="vertical"
        :default-active="activeTab"
        class="config-menu"
        @select="handleSelect"
      >
        <ElMenuItem v-for="item in menuList" :key="item.key" :index="item.key">
          <ArtSvgIcon :icon="item.icon" :size="18" />
          <span>{{ item.name }}</span>
        </ElMenuItem>
      </ElMenu>
    </template>

    <template #header>
      <div v-if="!isDesktop" class="mobile-tabs">
        <ElTabs v-model="activeTab" class="config-tabs">
          <ElTabPane v-for="item in menuList" :key="item.key" :name="item.key" :label="item.name" />
        </ElTabs>
      </div>
    </template>

    <div class="config-body">
      <Transition name="el-fade-in-linear" mode="out-in">
        <component :is="currentComponent" :key="activeTab" />
      </Transition>
    </div>
  </CaPageLayout>
</template>

<script setup lang="ts">
  import CaPageLayout from '@/components/base/CaPageLayout/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import has from '@/utils/sys/permission'
  import { useBreakpoints } from '@vueuse/core'
  import { ElMenu, ElMenuItem, ElTabPane, ElTabs } from 'element-plus'
  import type { Component } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  // 组件导入
  import ClientConfig from './tabs/ClientConfig.vue'
  import EmailConfig from './tabs/EmailConfig.vue'
  import LoginConfig from './tabs/LoginConfig.vue'
  import SecurityConfig from './tabs/SecurityConfig.vue'
  import SiteConfig from './tabs/SiteConfig.vue'
  import SmsConfig from './tabs/SmsConfig.vue'
  import StorageConfig from './tabs/StorageConfig.vue'

  defineOptions({ name: 'SystemConfig' })

  const route = useRoute()
  const router = useRouter()
  const breakpoints = useBreakpoints({
    md: 768
  })
  const isDesktop = breakpoints.greater('md')

  // Tab 配置数据（icon 使用本地 svg 文件名或 iconify）
  const tabData = [
    {
      name: '网站配置',
      key: 'site',
      icon: 'config',
      permissions: ['system:siteConfig:get'],
      component: SiteConfig
    },
    {
      name: '安全配置',
      key: 'security',
      icon: 'ri:shield-check-line',
      permissions: ['system:securityConfig:get'],
      component: SecurityConfig
    },
    {
      name: '登录配置',
      key: 'login',
      icon: 'lock',
      permissions: ['system:loginConfig:get'],
      component: LoginConfig
    },
    {
      name: '邮件配置',
      key: 'mail',
      icon: 'email',
      permissions: ['system:mailConfig:get'],
      component: EmailConfig
    },
    {
      name: '短信配置',
      key: 'sms',
      icon: 'ri:message-3-line',
      permissions: ['system:smsConfig:list'],
      component: SmsConfig
    },
    {
      name: '存储配置',
      key: 'storage',
      icon: 'cloud',
      permissions: ['system:storage:list'],
      component: StorageConfig
    },
    {
      name: '客户端配置',
      key: 'client',
      icon: 'apps',
      permissions: ['system:client:list'],
      component: ClientConfig
    }
  ]

  // 根据权限过滤菜单
  const menuList = computed(() => {
    return tabData.filter((item) => has.hasPermOr(item.permissions))
  })

  // 当前激活的 tab
  const activeTab = ref('site')

  // 监听路由 query 参数变化
  watch(
    () => route.query.tab,
    (tab) => {
      if (tab && menuList.value.some((item) => item.key === tab)) {
        activeTab.value = tab as string
      }
    },
    { immediate: true }
  )

  // 当前组件
  const currentComponent = computed<Component>(() => {
    const item = menuList.value.find((item) => item.key === activeTab.value)
    return item?.component || SiteConfig
  })

  // 菜单选择处理
  const handleSelect = (key: string) => {
    activeTab.value = key
  }

  // Tab 切换时更新路由
  watch(activeTab, (key) => {
    router.replace({ path: route.path, query: { tab: key } })
  })
</script>

<style scoped lang="scss">
  .config-menu {
    width: 100%;
    border-right: none;

    :deep(.el-menu-item) {
      height: 48px;
      padding: 0 12px;
      margin: 0 8px;
      line-height: 48px;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        background: var(--el-fill-color-light);
      }

      &.is-active {
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
      }

      .art-svg-icon {
        margin-right: 8px;
      }
    }
  }

  .mobile-tabs {
    padding: 0 16px;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-lighter);

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }
  }

  .config-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: auto;
  }
</style>
