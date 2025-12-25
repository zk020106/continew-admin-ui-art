<template>
  <div class="file-header">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-section">
      <FileBreadcrumb :path="currentPath" @navigate="$emit('navigate', $event)" />
    </div>

    <!-- 工具栏 -->
    <div class="toolbar-section">
      <div class="toolbar-left">
        <!-- 返回/前进 -->
        <el-button-group>
          <el-button :disabled="!canGoBack" @click="$emit('go-back')">
            <ArtSvgIcon icon="ri:arrow-left-s-line" :size="18" />
          </el-button>
          <el-button :disabled="!canGoForward" @click="$emit('go-forward')">
            <ArtSvgIcon icon="ri:arrow-right-s-line" :size="18" />
          </el-button>
          <el-button :disabled="!canGoUp" @click="$emit('go-up')">
            <ArtSvgIcon icon="ri:arrow-up-s-line" :size="18" />
          </el-button>
        </el-button-group>

        <!-- 上传 -->
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :show-file-list="false"
          :multiple="true"
          @change="handleFileChange"
        >
          <el-button type="primary">
            <ArtSvgIcon icon="ri:upload-2-line" :size="16" />
            {{ t('file.header.upload') }}
          </el-button>
        </el-upload>

        <!-- 新建文件夹 -->
        <el-button @click="$emit('create-folder')">
          <ArtSvgIcon icon="ri:folder-add-line" :size="16" />
          {{ t('file.header.newFolder') }}
        </el-button>
      </div>

      <div class="toolbar-center">
        <!-- 搜索 -->
        <el-input
          v-model="searchKeyword"
          :placeholder="t('file.header.searchPlaceholder')"
          prefix-icon="Search"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>

      <div class="toolbar-right">
        <!-- 排序 -->
        <el-dropdown trigger="click" @command="handleSortCommand">
          <el-button>
            <ArtSvgIcon icon="ri:sort-desc" :size="16" />
            {{ t('file.header.sort') }}
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="option in sortOptions"
                :key="option.value"
                :command="option.value"
                :class="{ 'is-active': sortField === option.value }"
              >
                <span class="sort-label">{{ option.label }}</span>
                <ArtSvgIcon
                  v-if="sortField === option.value"
                  :icon="sortOrder === 'asc' ? 'ri:arrow-up-line' : 'ri:arrow-down-line'"
                  :size="14"
                />
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 视图切换 -->
        <el-button-group>
          <el-button
            :type="viewMode === 'list' ? 'primary' : ''"
            @click="$emit('view-change', 'list')"
          >
            <ArtSvgIcon icon="ri:list-unordered" :size="16" />
          </el-button>
          <el-button
            :type="viewMode === 'grid' ? 'primary' : ''"
            @click="$emit('view-change', 'grid')"
          >
            <ArtSvgIcon icon="ri:grid-line" :size="16" />
          </el-button>
        </el-button-group>

        <!-- 更多操作 -->
        <el-dropdown trigger="click">
          <el-button>
            <ArtSvgIcon icon="ri:more-2-fill" :size="16" />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$emit('toggle-detail-panel')">
                <ArtSvgIcon icon="ri:side-bar-line" :size="16" />
                {{ t('file.header.detailPanel') }}
              </el-dropdown-item>
              <el-dropdown-item @click="$emit('refresh')">
                <ArtSvgIcon icon="ri:refresh-line" :size="16" />
                {{ t('file.header.refresh') }}
              </el-dropdown-item>
              <el-dropdown-item divided @click="$emit('select-all')">
                <ArtSvgIcon icon="ri:checkbox-circle-line" :size="16" />
                {{ t('file.header.selectAll') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div v-if="hasFilters" class="filter-bar">
      <div class="filter-items">
        <el-tag
          v-for="filter in activeFilters"
          :key="filter.key"
          :closable="true"
          @close="handleRemoveFilter(filter.key)"
        >
          {{ filter.label }}: {{ filter.value }}
        </el-tag>
      </div>
      <el-button text size="small" @click="handleClearFilters">{{
        t('file.header.clearFilters')
      }}</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { Search } from '@element-plus/icons-vue'
  import type { UploadFile } from 'element-plus'
  import type { SortField, SortOrder, ViewMode } from '../types'
  import FileBreadcrumb from './FileBreadcrumb.vue'

  const { t } = useI18n()

  defineProps<{
    currentPath: string
    viewMode: ViewMode
    sortField: SortField
    sortOrder: SortOrder
    canGoBack: boolean
    canGoForward: boolean
    canGoUp: boolean
  }>()

  const emit = defineEmits<{
    (e: 'navigate', path: string): void
    (e: 'go-back'): void
    (e: 'go-forward'): void
    (e: 'go-up'): void
    (e: 'create-folder'): void
    (e: 'upload', files: File[]): void
    (e: 'search', keyword: string): void
    (e: 'sort', field: SortField): void
    (e: 'view-change', mode: ViewMode): void
    (e: 'refresh'): void
    (e: 'toggle-detail-panel'): void
    (e: 'select-all'): void
  }>()

  const uploadRef = ref()
  const searchKeyword = ref('')

  const sortOptions = computed(() => [
    { label: t('file.header.sortOptions.name'), value: 'name' as SortField },
    { label: t('file.header.sortOptions.size'), value: 'size' as SortField },
    { label: t('file.header.sortOptions.type'), value: 'extension' as SortField },
    { label: t('file.header.sortOptions.updateTime'), value: 'updateTime' as SortField }
  ])

  // 筛选相关
  const filters = ref<Record<string, any>>({})

  const activeFilters = computed(() => {
    return Object.entries(filters.value)
      .filter(([value]) => value !== undefined && value !== '')
      .map(([key, value]) => ({
        key,
        label: getFilterLabel(key),
        value: getFilterValueLabel(key, value)
      }))
  })

  const hasFilters = computed(() => activeFilters.value.length > 0)

  const getFilterLabel = (key: string): string => {
    return t(`file.filter.${key}`)
  }

  const getFilterValueLabel = (key: string, value: any): string => {
    if (key === 'type') {
      const typeMap: Record<string, string> = {
        image: t('file.statistics.image'),
        video: t('file.statistics.video'),
        audio: t('file.statistics.audio'),
        document: t('file.statistics.document'),
        archive: t('file.statistics.archive'),
        code: t('file.statistics.code')
      }
      return typeMap[value] || value
    }
    return String(value)
  }

  const handleFileChange = (file: UploadFile) => {
    if (file.raw) {
      emit('upload', [file.raw])
    }
  }

  const handleSearch = () => {
    emit('search', searchKeyword.value)
  }

  const handleSortCommand = (field: SortField) => {
    emit('sort', field)
  }

  const handleRemoveFilter = (key: string) => {
    delete filters.value[key]
  }

  const handleClearFilters = () => {
    filters.value = {}
  }
</script>

<style lang="scss" scoped>
  .file-header {
    display: flex;
    flex-direction: column;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .breadcrumb-section {
    padding: 8px 16px;
    background: var(--el-fill-color-light);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .toolbar-section {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
  }

  .toolbar-left,
  .toolbar-right {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .toolbar-center {
    flex: 1;
    max-width: 400px;
  }

  .search-input {
    width: 100%;
  }

  .filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: var(--el-fill-color-lighter);
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .filter-items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  :deep(.el-dropdown-menu__item.is-active) {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  .sort-label {
    display: inline-block;
    min-width: 60px;
  }
</style>
