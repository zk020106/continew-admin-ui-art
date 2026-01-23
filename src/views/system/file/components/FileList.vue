<template>
  <div class="file-list-container" :class="`view-${viewMode}`">
    <!-- 拖拽上传覆盖层 -->
    <div v-if="isDragging" class="drag-overlay">
      <div class="drag-content">
        <ArtSvgIcon icon="ri:upload-cloud-2-line" :size="48" />
        <p>{{ t('file.list.dragUpload') }}</p>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && data.length === 0" class="empty-state">
      <el-empty :description="emptyDescription">
        <template v-if="!isRoot" #image>
          <ArtSvgIcon
            icon="ri:folder-open-line"
            :size="80"
            color="var(--el-text-color-placeholder)"
          />
        </template>
      </el-empty>
    </div>

    <!-- 列表视图 -->
    <div
      v-else-if="viewMode === 'list'"
      class="list-view"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="sortedData"
        :style="{ width: '100%' }"
        height="100%"
        row-key="id"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDblClick"
        @row-contextmenu="handleRowContextMenu"
      >
        <!-- 选择列 -->
        <el-table-column type="selection" width="50" fixed />

        <!-- 文件名 -->
        <el-table-column
          prop="originalName"
          :label="t('file.list.fileName')"
          min-width="280"
          fixed
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div class="file-name-cell">
              <!-- 图片缩略图 -->
              <el-image
                v-if="hasThumbnail(row)"
                :src="row.thumbnailUrl"
                :preview-src-list="getPreviewSrcList(row)"
                fit="cover"
                class="file-thumbnail"
                :preview-teleported="true"
                lazy
              >
                <template #error>
                  <ArtSvgIcon
                    :icon="getFileIconByType(row).icon"
                    :size="20"
                    :style="{ color: getFileIconByType(row).color }"
                  />
                </template>
                <template #placeholder>
                  <div class="image-placeholder">
                    <ArtSvgIcon icon="ri:image-line" :size="16" />
                  </div>
                </template>
              </el-image>
              <!-- 文件图标 -->
              <ArtSvgIcon
                v-else
                :icon="getFileIconByType(row).icon"
                :size="20"
                class="file-icon"
                :style="{ color: getFileIconByType(row).color }"
              />
              <span class="file-name">{{ row.originalName }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 大小 -->
        <el-table-column
          prop="size"
          :label="t('file.list.size')"
          width="120"
          align="center"
          sortable
        >
          <template #default="{ row }">
            {{ row.type === 0 ? '-' : formatSize(row.size) }}
          </template>
        </el-table-column>

        <!-- 类型 -->
        <el-table-column prop="extension" :label="t('file.list.type')" width="100" align="center">
          <template #default="{ row }">
            {{ row.type === 0 ? t('file.list.folder') : (row.extension || '-').toUpperCase() }}
          </template>
        </el-table-column>

        <!-- 修改时间 -->
        <el-table-column
          prop="updateTime"
          :label="t('file.list.modifyTime')"
          width="160"
          align="center"
          sortable
        >
          <template #default="{ row }">
            {{ formatTime(row.updateTime) }}
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column :label="t('common.action')" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-link v-if="row.type !== 0" type="primary" @click.stop="handlePreview(row)">
{{
                t('file.contextMenu.preview')
              }}
</el-link>
              <el-link type="primary" @click.stop="handleDownload(row)">
{{
                t('file.contextMenu.download')
              }}
</el-link>
              <el-link type="primary" @click.stop="handleRename(row)">
{{
                t('file.contextMenu.rename')
              }}
</el-link>
              <el-dropdown trigger="click" @command="(cmd) => handleMoreCommand(cmd, row)">
                <el-button text>
                  <ElIcon><MoreFilled /></ElIcon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <!-- <el-dropdown-item command="move">移动到</el-dropdown-item>
                    <el-dropdown-item command="copy">复制到</el-dropdown-item>
                    <el-dropdown-item command="share">分享</el-dropdown-item> -->
                    <el-dropdown-item
                      divided
                      command="delete"
                      style="color: var(--el-color-danger)"
                    >
                      {{ t('file.contextMenu.delete') }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-if="pagination.total > 0"
          :current-page="pagination.current"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 网格视图 -->
    <div
      v-else
      class="grid-view"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div v-loading="loading" class="grid-content">
        <div
          v-for="item in sortedData"
          :key="item.id"
          class="grid-item" :class="[{ selected: selectedIds.includes(item.id) }]"
          @click="handleItemClick(item, $event)"
          @dblclick="handleItemDblClick(item)"
          @contextmenu="handleItemContextMenu(item, $event)"
        >
          <div class="item-icon">
            <!-- 图片缩略图 -->
            <el-image
              v-if="hasThumbnail(item)"
              :src="item.thumbnailUrl"
              :preview-src-list="getPreviewSrcList(item)"
              fit="cover"
              class="grid-thumbnail"
              :preview-teleported="true"
              lazy
            >
              <template #error>
                <ArtSvgIcon
                  :icon="getFileIconByType(item).icon"
                  :size="48"
                  :style="{ color: getFileIconByType(item).color }"
                />
              </template>
              <template #placeholder>
                <div class="image-placeholder grid">
                  <ArtSvgIcon icon="ri:image-line" :size="24" />
                </div>
              </template>
            </el-image>
            <!-- 文件图标 -->
            <ArtSvgIcon
              v-else
              :icon="getFileIconByType(item).icon"
              :size="48"
              :style="{ color: getFileIconByType(item).color }"
            />
          </div>
          <div class="item-name" :title="item.originalName">{{ item.originalName }}</div>
          <div class="item-info">
            {{ item.type === 0 ? t('file.list.folder') : formatSize(item.size) }}
          </div>
          <!-- 选中标记 -->
          <div v-if="selectedIds.includes(item.id)" class="item-check">
            <ArtSvgIcon icon="ri:checkbox-circle-fill" :size="20" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SortField, SortOrder, ViewMode } from '../types'
import type { FileItem } from '@/apis/system/file'
import { MoreFilled } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { getFileIconByType, isImageFile } from '../utils/fileIcons'

const props = defineProps<{
  data: FileItem[]
  loading: boolean
  viewMode: ViewMode
  selectedIds: string[]
  sortField: SortField
  sortOrder: SortOrder
  isRoot: boolean
  pagination: {
    current: number
    pageSize: number
    total: number
  }
}>()

const emit = defineEmits<{
  (e: 'select', ids: string[]): void
  (e: 'click', file: FileItem, event: MouseEvent): void
  (e: 'dblclick', file: FileItem): void
  (e: 'contextmenu', file: FileItem[], event: MouseEvent): void
  (e: 'preview', file: FileItem): void
  (e: 'download', file: FileItem): void
  (e: 'rename', file: FileItem): void
  (e: 'move', file: FileItem): void
  (e: 'copy', file: FileItem): void
  (e: 'share', file: FileItem): void
  (e: 'delete', file: FileItem): void
  (e: 'upload', files: File[]): void
  (e: 'sizeChange', size: number): void
  (e: 'currentChange', current: number): void
}>()

const { t } = useI18n()

const tableRef = ref()
const isDragging = ref(false)

// 排序后的数据
const sortedData = computed(() => {
  const list = [...props.data]
  list.sort((a, b) => {
    // 文件夹排在前面
    if (a.type !== b.type) {
      return a.type === 0 ? -1 : 1
    }

    let compareResult = 0
    switch (props.sortField) {
      case 'name':
        compareResult = a.originalName.localeCompare(b.originalName, 'zh-CN', { numeric: true })
        break
      case 'size':
        compareResult = (a.size || 0) - (b.size || 0)
        break
      case 'extension':
        compareResult = (a.extension || '').localeCompare(b.extension || '')
        break
      case 'updateTime':
        compareResult
          = new Date(b.updateTime || 0).getTime() - new Date(a.updateTime || 0).getTime()
        break
    }

    return props.sortOrder === 'asc' ? compareResult : -compareResult
  })
  return list
})

// 空状态描述
const emptyDescription = computed(() => {
  if (props.isRoot) return t('file.list.empty.root')
  return t('file.list.empty.folder')
})

// 判断是否有缩略图
const hasThumbnail = (file: FileItem): boolean => {
  return file.type !== 0 && isImageFile(file.extension) && !!file.thumbnailUrl
}

// 获取预览图片列表
const getPreviewSrcList = (file: FileItem): string[] => {
  // 收集当前文件夹中所有图片的原始 URL（如果有 url 字段则使用 url，否则使用 thumbnailUrl）
  const allImages = props.data
    .filter((f) => f.type !== 0 && isImageFile(f.extension) && f.url)
    .map((f) => f.url as string)
  return allImages.length > 0 ? allImages : [file.thumbnailUrl || '']
}

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes === 0 || !bytes) return '-'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

// 格式化时间
const formatTime = (time: string): string => {
  if (!time) return '-'
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 列表视图选择变化
const handleSelectionChange = (rows: FileItem[]) => {
  emit(
    'select',
    rows.map((r) => r.id)
  )
}

// 行点击
const handleRowClick = (row: FileItem) => {
  emit('click', row, {} as MouseEvent)
}

// 行双击
const handleRowDblClick = (row: FileItem) => {
  emit('dblclick', row)
}

// 行右键菜单
const handleRowContextMenu = (row: FileItem, column: any, event: MouseEvent) => {
  event.preventDefault()
  emit('contextmenu', [row], event)
}

// 网格视图项点击
const handleItemClick = (item: FileItem, event: MouseEvent) => {
  emit('click', item, event)
}

// 网格视图项双击
const handleItemDblClick = (item: FileItem) => {
  emit('dblclick', item)
}

// 网格视图项右键菜单
const handleItemContextMenu = (item: FileItem, event: MouseEvent) => {
  event.preventDefault()
  emit('contextmenu', [item], event)
}

// 预览
const handlePreview = (file: FileItem) => {
  emit('preview', file)
}

// 下载
const handleDownload = (file: FileItem) => {
  emit('download', file)
}

// 重命名
const handleRename = (file: FileItem) => {
  emit('rename', file)
}

// 更多操作
const handleMoreCommand = (command: string, file: FileItem) => {
  switch (command) {
    case 'move':
      emit('move', file)
      break
    case 'copy':
      emit('copy', file)
      break
    case 'share':
      emit('share', file)
      break
    case 'delete':
      emit('delete', file)
      break
  }
}

// 拖拽处理
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  // 检查是否真的离开了区域
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  if (
    e.clientX <= rect.left
    || e.clientX >= rect.right
    || e.clientY <= rect.top
    || e.clientY >= rect.bottom
  ) {
    isDragging.value = false
  }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    emit('upload', Array.from(files))
  }
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  emit('sizeChange', size)
}

// 当前页变化
const handleCurrentChange = (current: number) => {
  emit('currentChange', current)
}
</script>

<style lang="scss" scoped>
  .file-list-container {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  .drag-overlay {
    position: absolute;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    background: rgb(var(--el-color-primary-rgb), 0.1);
    border: 2px dashed var(--el-color-primary);
  }

  .drag-content {
    color: var(--el-color-primary);
    text-align: center;

    p {
      margin-top: 12px;
      font-size: 16px;
    }
  }

  .empty-state {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
  }

  // 列表视图
  .list-view {
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-table) {
      flex: 1;
      height: auto;
    }

    :deep(.el-table__body-wrapper) {
      overflow-y: auto;
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      padding: 12px 16px;
      // background: var(--el-fill-color-light);
      // border-top: 1px solid var(--el-border-color-lighter);
    }

    .file-name-cell {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .file-thumbnail {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 4px;

      :deep(.el-image__inner) {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
      }
    }

    .image-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      color: var(--el-text-color-placeholder);
      background: var(--el-fill-color-light);
      border-radius: 4px;

      &.grid {
        width: 64px;
        height: 64px;
      }
    }

    .file-icon {
      flex-shrink: 0;
    }

    .file-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  // 网格视图
  .grid-view {
    flex: 1;
    padding: 16px;
    overflow: auto;
  }

  .grid-content {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 16px;
  }

  .grid-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: var(--el-fill-color-light);
    }

    &.selected {
      outline: 2px solid var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }
  }

  .item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    margin-bottom: 8px;

    :deep(.art-svg-icon) {
      width: 64px !important;
      height: 64px !important;
    }

    .grid-thumbnail {
      width: 64px;
      height: 64px;
      border-radius: 4px;

      :deep(.el-image__inner) {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
      }
    }

    .image-placeholder {
      width: 64px;
      height: 64px;
      background: var(--el-fill-color-light);
      border-radius: 4px;
    }
  }

  .item-name {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    color: var(--el-text-color-primary);
    text-align: center;
    white-space: nowrap;
  }

  .item-info {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .item-check {
    position: absolute;
    top: 4px;
    right: 4px;
    color: var(--el-color-primary);
  }
</style>
