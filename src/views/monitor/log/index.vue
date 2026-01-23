<template>
  <CaPageLayout>
    <div class="system-log">
      <ElTabs v-model="activeKey" type="card" @change="change">
        <ElTabPane :label="t('pages.systemLog.loginTab')" name="1" />
        <ElTabPane :label="t('pages.systemLog.operationTab')" name="2" />
      </ElTabs>
      <div class="tab-content">
        <LoginLog v-if="activeKey === '1'" />
        <OperationLog v-if="activeKey === '2'" />
      </div>
    </div>
  </CaPageLayout>
</template>

<script setup lang="ts">
import { ElTabPane, ElTabs } from 'element-plus'
import { useI18n } from 'vue-i18n'
import LoginLog from './login/index.vue'
import OperationLog from './operation/index.vue'

defineOptions({ name: 'MonitorSystemLog' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const activeKey = ref('1')
watch(
  () => route.query,
  () => {
    if (route.query.tabKey) {
      activeKey.value = String(route.query.tabKey)
    }
  },
  { immediate: true }
)

const change = (key: string) => {
  router.replace({ path: route.path, query: { tabKey: key } })
}
</script>

<style lang="scss" scoped>
  .system-log {
    display: flex;
    flex-direction: column;
    height: 100%;

    .tab-content {
      flex: 1;
      overflow: auto;
    }
  }
</style>
