<template>
  <div v-loading="loading" class="storage-config-container">
    <div class="storage-toolbar">
      <ElTabs v-model="activeKey" type="card" @tab-change="handleTabChange">
        <ElTabPane name="all" :label="t('system.config.storage.all')" />
        <ElTabPane name="1" :label="t('system.config.storage.localStorage')" />
        <ElTabPane name="2" :label="t('system.config.storage.objectStorage')" />
      </ElTabs>
      <ElInput
        v-model="queryForm.description"
        clearable
        class="search-input"
        :placeholder="t('system.config.storage.searchPlaceholder')"
        @clear="fetchData"
        @keyup.enter="fetchData"
      >
        <template #append>
          <ElButton :icon="Search" @click="fetchData" />
        </template>
      </ElInput>
    </div>

    <div class="storage-content">
      <div
        v-for="section in renderSections"
        :key="section.key"
        class="storage-section"
      >
        <div v-if="activeKey === 'all'" class="section-title">
          {{ section.title }}
        </div>
        <ElRow :gutter="16">
          <ElCol v-if="canCreate" :xs="24" :sm="24" :md="12" :lg="8" :xl="6">
            <CardAdd :type="section.type" @save-success="fetchData" />
          </ElCol>

          <template v-if="section.list.length">
            <ElCol
              v-for="item in section.list"
              :key="item.id"
              :xs="24"
              :sm="24"
              :md="12"
              :lg="8"
              :xl="6"
            >
              <CardBlock :loading="loading" :data="item" @save-success="fetchData" />
            </ElCol>
          </template>

          <ElCol v-else-if="!canCreate" :span="24">
            <ElEmpty :description="t('system.config.storage.empty')" />
          </ElCol>
        </ElRow>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StorageQuery, StorageResp } from '@/apis/system/type'
import { Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { groupBy } from 'xe-utils'
import { listStorage } from '@/apis/system/storage'
import { useAuth, useResetReactive } from '@/hooks'
import CardAdd from './components/CardAdd.vue'
import CardBlock from './components/CardBlock.vue'

defineOptions({ name: 'StorageConfig' })

interface RenderSection {
  key: string
  type: number
  title: string
  list: StorageResp[]
}

const { t } = useI18n()
const { hasAuth } = useAuth()
const loading = ref(false)
const activeKey = ref<string>('all')
const dataMap = ref<Record<string, StorageResp[]>>({})

const [queryForm] = useResetReactive<StorageQuery>({
  sort: ['createTime,desc']
})

const canCreate = computed(() => hasAuth('system:storage:create'))
const localList = computed(() => dataMap.value['1'] || [])
const ossList = computed(() => dataMap.value['2'] || [])

const renderSections = computed<RenderSection[]>(() => {
  if (activeKey.value === 'all') {
    return [
      {
        key: '1',
        type: 1,
        title: t('system.config.storage.localStorage'),
        list: localList.value
      },
      {
        key: '2',
        type: 2,
        title: t('system.config.storage.objectStorage'),
        list: ossList.value
      }
    ]
  }
  const type = Number(activeKey.value)
  return [
    {
      key: String(type),
      type,
      title:
        type === 1 ? t('system.config.storage.localStorage') : t('system.config.storage.objectStorage'),
      list: type === 1 ? localList.value : ossList.value
    }
  ]
})

const fetchData = async () => {
  try {
    loading.value = true
    const data = await listStorage(queryForm)
    dataMap.value = groupBy(data || [], 'type')
  } catch (error) {
    console.error('Failed to fetch storage list:', error)
  } finally {
    loading.value = false
  }
}

const handleTabChange = (key: string | number) => {
  const tabKey = String(key)
  activeKey.value = tabKey
  queryForm.type = tabKey === 'all' ? undefined : Number(tabKey)
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
  .storage-config-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 16px 18px;
    overflow: hidden;
  }

  .storage-toolbar {
    display: flex;
    gap: 14px;
    align-items: flex-end;
    justify-content: space-between;
    padding-bottom: 8px;

    :deep(.el-tabs__header) {
      margin: 0;
    }
  }

  .search-input {
    width: 280px;
  }

  .storage-content {
    flex: 1;
    min-height: 0;
    padding-right: 4px;
    margin-top: 18px;
    overflow: hidden auto;
  }

  .storage-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  @media (width <= 768px) {
    .storage-toolbar {
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
      padding-bottom: 10px;
    }

    .search-input {
      width: 100%;
      max-width: 100%;
    }
  }
</style>
