<template>
  <div class="file-sidebar">
    <!-- 存储空间卡片 -->
    <StorageUsageCard v-if="!loading" class="storage-card" :statistics="statistics" />
    <div v-else class="storage-card storage-loading">
      <ElSkeleton :rows="3" animated />
    </div>

    <!-- 快速访问 -->
    <div class="sidebar-section">
      <div class="section-title">{{ t('file.sidebar.quickAccess') }}</div>
      <div class="quick-access-list">
        <div
          v-for="item in quickAccessItems"
          :key="item.path"
          class="quick-access-item" :class="[{ active: currentPath === item.path }]"
          @click="$emit('navigate', item.path)"
        >
          <ArtSvgIcon :icon="item.icon" :size="18" />
          <span class="item-label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- 最近访问 -->
    <div class="sidebar-section">
      <div class="section-title">
        <span>{{ t('file.sidebar.recentAccess') }}</span>
        <el-button text size="small" @click="clearRecentPaths">
          <ArtSvgIcon icon="ri:delete-bin-line" :size="14" />
        </el-button>
      </div>
      <div class="recent-list">
        <div
          v-for="(path, index) in recentPaths"
          :key="index"
          class="recent-item" :class="[{ active: currentPath === path }]"
          @click="$emit('navigate', path)"
        >
          <ArtSvgIcon icon="ri:time-line" :size="16" />
          <span class="item-label" :title="path">{{ getDisplayName(path) }}</span>
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
  .file-sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
  }

  .storage-card {
    flex-shrink: 0;
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .storage-loading {
    padding: 16px;
  }

  .sidebar-section {
    flex-shrink: 0;
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &.directory-tree-section {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
  }

  .quick-access-list,
  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .quick-access-item,
  .recent-item {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: var(--el-fill-color);
    }

    &.active {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    .item-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 13px;
      white-space: nowrap;
    }
  }

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
