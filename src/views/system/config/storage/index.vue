<template>
  <div v-loading="loading" class="storage-config-container">
    <div class="storage-content">
      <!-- 本地存储 -->
      <div class="storage-section">
        <div class="section-title">{{ t('system.config.storage.localStorage') }}</div>
        <ElRow :gutter="16">
          <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="6">
            <CardAdd :type="1" @save-success="fetchData" />
          </ElCol>
          <ElCol
            v-for="item in localList"
            :key="item.id"
            :xs="24"
            :sm="24"
            :md="12"
            :lg="8"
            :xl="6"
          >
            <CardBlock :loading="loading" :data="item" @save-success="fetchData" />
          </ElCol>
        </ElRow>
      </div>

      <!-- 对象存储 -->
      <div class="storage-section">
        <div class="section-title">{{ t('system.config.storage.objectStorage') }}</div>
        <ElRow :gutter="16">
          <ElCol :xs="24" :sm="24" :md="12" :lg="8" :xl="6">
            <CardAdd :type="2" @save-success="fetchData" />
          </ElCol>
          <ElCol v-for="item in ossList" :key="item.id" :xs="24" :sm="24" :md="12" :lg="8" :xl="6">
            <CardBlock :loading="loading" :data="item" @save-success="fetchData" />
          </ElCol>
        </ElRow>
      </div>
    </div>

    <AddModal ref="AddModalRef" @save-success="fetchData" />
  </div>
</template>

<script setup lang="ts">
  import { listStorage } from '@/apis/system/storage'
  import type { StorageQuery, StorageResp } from '@/apis/system/type'
  import { useI18n } from 'vue-i18n'
  import { groupBy } from 'xe-utils'
  import AddModal from './AddModal.vue'
  import CardAdd from './components/CardAdd.vue'
  import CardBlock from './components/CardBlock.vue'

  defineOptions({ name: 'StorageConfig' })

  const { t } = useI18n()
  const loading = ref(false)
  const storageList = ref<StorageResp[]>([])
  const dataMap = ref<Record<string, StorageResp[]>>({})

  const queryForm = reactive<StorageQuery>({
    sort: ['isDefault,desc', 'sort,asc']
  })

  const localList = computed(() => dataMap.value['1'] || [])
  const ossList = computed(() => dataMap.value['2'] || [])

  const fetchData = async () => {
    try {
      loading.value = true
      const data = await listStorage(queryForm)
      const list = data || []
      storageList.value = list
      dataMap.value = groupBy(list, 'type')
    } catch (error) {
      console.error('Failed to fetch storage list:', error)
    } finally {
      loading.value = false
    }
  }

  const AddModalRef = ref<InstanceType<typeof AddModal>>()

  onMounted(() => {
    fetchData()
  })
</script>

<style scoped lang="scss">
  .storage-config-container {
    padding: 20px;
  }

  .storage-content {
    margin-top: 16px;
  }

  .storage-section {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
</style>
