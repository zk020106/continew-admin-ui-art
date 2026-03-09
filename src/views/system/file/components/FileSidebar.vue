<template>
  <div class="flex h-full flex-col overflow-y-auto">
    <!-- 存储空间卡片 -->
    <StorageUsageCard
      v-if="!loading"
      class="shrink-0 border-b border-(--el-border-color-lighter) p-4"
      :statistics="statistics"
    />
    <div v-else class="shrink-0 border-b border-(--el-border-color-lighter) p-4">
      <ElSkeleton :rows="3" animated />
    </div>

    <!-- 快速访问 -->
    <div class="shrink-0 border-b border-(--el-border-color-lighter) px-4 py-3">
      <div class="mb-2 flex items-center justify-between text-[13px] font-medium text-(--el-text-color-secondary)">{{ t('file.sidebar.quickAccess') }}</div>
      <div class="flex flex-col gap-1">
        <div
          v-for="item in quickAccessItems"
          :key="item.path"
          :class="
            currentPath === item.path
              ? 'flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-(--el-color-primary) bg-(--el-color-primary-light-9)'
              : 'flex cursor-pointer items-center gap-2 rounded px-3 py-2 transition-all duration-200 hover:bg-(--el-fill-color)'
          "
          @click="$emit('navigate', item.path)"
        >
          <ArtSvgIcon :icon="item.icon" :size="18" />
          <span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px]">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- 最近访问 -->
    <div class="shrink-0 border-b border-(--el-border-color-lighter) px-4 py-3">
      <div class="mb-2 flex items-center justify-between text-[13px] font-medium text-(--el-text-color-secondary)">
        <span>{{ t('file.sidebar.recentAccess') }}</span>
        <el-button text size="small" @click="clearRecentPaths">
          <ArtSvgIcon icon="ri:delete-bin-line" :size="14" />
        </el-button>
      </div>
      <div class="flex flex-col gap-1">
        <div
          v-for="(path, index) in recentPaths"
          :key="index"
          :class="
            currentPath === path
              ? 'flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-(--el-color-primary) bg-(--el-color-primary-light-9)'
              : 'flex cursor-pointer items-center gap-2 rounded px-3 py-2 transition-all duration-200 hover:bg-(--el-fill-color)'
          "
          @click="$emit('navigate', path)"
        >
          <ArtSvgIcon icon="ri:time-line" :size="16" />
          <span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px]" :title="path">{{ getDisplayName(path) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FileStatisticsResp } from '@/apis'
import { ElSkeleton } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { STORAGE_KEYS } from '../utils/constants'
import StorageUsageCard from './StorageUsageCard.vue'

defineProps<{
  currentPath: string
  statistics: FileStatisticsResp
  loading?: boolean
}>()

defineEmits<{
  (e: 'navigate', path: string): void
}>()

const { t } = useI18n()

const recentPaths = ref<string[]>([])

// 快速访问项
const quickAccessItems = computed(() => [
  { path: '/', label: t('file.sidebar.allFiles'), icon: 'ri:folder-3-fill' },
  { path: '/images', label: t('file.sidebar.images'), icon: 'ri:image-fill' },
  { path: '/documents', label: t('file.sidebar.documents'), icon: 'ri:file-text-fill' },
  { path: '/videos', label: t('file.sidebar.videos'), icon: 'ri:film-fill' },
  { path: '/music', label: t('file.sidebar.music'), icon: 'ri:music-2-fill' }
])

// 加载最近访问
const loadRecentPaths = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.RECENT_PATHS)
    recentPaths.value = saved ? JSON.parse(saved) : []
  } catch {
    recentPaths.value = []
  }
}

// 清除最近访问
const clearRecentPaths = () => {
  localStorage.removeItem(STORAGE_KEYS.RECENT_PATHS)
  recentPaths.value = []
}

// 获取路径显示名称
const getDisplayName = (path: string): string => {
  if (path === '/') return t('file.sidebar.rootDirectory')
  const parts = path.split('/').filter(Boolean)
  return parts[parts.length - 1] || path
}

// 初始化
onMounted(() => {
  loadRecentPaths()
})
</script>

<style lang="scss" scoped>
  .directory-tree {
    flex: 1;
    overflow-y: auto;

    :deep(.el-tree) {
      color: var(--el-text-color-primary);
      background: transparent;
    }

    :deep(.el-tree-node__content) {
      height: 32px;
      border-radius: 4px;

      &:hover {
        background: var(--el-fill-color);
      }
    }

    :deep(.is-current > .el-tree-node__content) {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    .tree-node {
      display: flex;
      gap: 6px;
      align-items: center;

      .is-folder {
        color: var(--el-color-warning);
      }

      .node-label {
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 13px;
        white-space: nowrap;
      }
    }
  }
</style>
