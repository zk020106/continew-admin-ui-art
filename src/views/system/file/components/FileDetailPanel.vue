<template>
  <div class="file-detail-panel">
    <!-- 关闭按钮 -->
    <div class="panel-close" @click="$emit('close')">
      <ArtSvgIcon icon="ri:close-line" :size="18" />
    </div>

    <!-- 内容 -->
    <div v-if="selectedFile" class="panel-content">
      <!-- 文件预览图 -->
      <div class="preview-section">
        <div class="preview-icon">
          <ArtSvgIcon
            :icon="getFileIconByType(selectedFile).icon"
            :size="64"
            :class="{ 'is-folder': selectedFile.type === 0 }"
            :style="{
              color: selectedFile.type === 0 ? undefined : getFileIconByType(selectedFile).color,
            }"
          />
        </div>
        <div class="preview-name" :title="selectedFile.originalName">
          {{ selectedFile.originalName }}
        </div>
        <div class="preview-type">
          {{
            selectedFile.type === 0
              ? t('file.list.folder')
              : (selectedFile.extension || '').toUpperCase()
          }}
        </div>
      </div>

      <!-- 文件信息 -->
      <div class="info-section">
        <div class="section-title">{{ t('file.detail.fileInfo') }}</div>

        <div class="info-list">
          <div class="info-item">
            <span class="info-label">{{ t('file.detail.type') }}</span>
            <span class="info-value">{{
              selectedFile.type === 0
                ? t('file.list.folder')
                : getFileTypeLabel(selectedFile.extension)
            }}</span>
          </div>

          <div v-if="selectedFile.type !== 0" class="info-item">
            <span class="info-label">{{ t('file.detail.size') }}</span>
            <span class="info-value">{{ formatSize(selectedFile.size) }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">{{ t('file.detail.location') }}</span>
            <span class="info-value" :title="selectedFile.path">{{
              formatPath(selectedFile.path)
            }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">{{ t('file.detail.createTime') }}</span>
            <span class="info-value">{{ formatDateTime(selectedFile.createTime) }}</span>
          </div>

          <div v-if="selectedFile.updateTime" class="info-item">
            <span class="info-label">{{ t('file.detail.modifyTime') }}</span>
            <span class="info-value">{{ formatDateTime(selectedFile.updateTime) }}</span>
          </div>

          <div v-if="selectedFile.sha256" class="info-item">
            <span class="info-label">{{ t('file.detail.sha256') }}</span>
            <span class="info-value hash" :title="selectedFile.sha256">
              {{ formatHash(selectedFile.sha256) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button
          v-if="selectedFile.type !== 0"
          type="primary"
          size="small"
          @click="$emit('download', selectedFile)"
        >
          <ArtSvgIcon icon="ri:download-2-line" :size="16" />
          {{ t('file.contextMenu.download') }}
        </el-button>

        <el-button
          v-if="canPreviewFile(selectedFile)"
          size="small"
          @click="$emit('preview', selectedFile)"
        >
          <ArtSvgIcon icon="ri:eye-line" :size="16" />
          {{ t('file.contextMenu.preview') }}
        </el-button>

        <!-- <el-button size="small" @click="$emit('share', selectedFile)">
          <ArtSvgIcon icon="ri:share-line" :size="16" />
          分享
        </el-button> -->

        <el-dropdown trigger="click" @command="(cmd) => handleMoreCommand(cmd, selectedFile!)">
          <el-button size="small">
            <ArtSvgIcon icon="ri:more-2-fill" :size="16" />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="rename">
                <ArtSvgIcon icon="ri:edit-line" :size="14" />
                {{ t('file.contextMenu.rename') }}
              </el-dropdown-item>
              <!-- <el-dropdown-item command="move">
                <ArtSvgIcon icon="ri:folder-transfer-line" :size="14" />
                移动到
              </el-dropdown-item>
              <el-dropdown-item command="copy">
                <ArtSvgIcon icon="ri:file-copy-line" :size="14" />
                复制到
              </el-dropdown-item> -->
              <el-dropdown-item divided command="delete" style="color: var(--el-color-danger)">
                <ArtSvgIcon icon="ri:delete-bin-line" :size="14" />
                {{ t('file.contextMenu.delete') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="panel-empty">
      <ArtSvgIcon icon="ri:file-info-line" :size="48" color="var(--el-text-color-placeholder)" />
      <p>{{ t('file.detail.selectFile') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FileItem } from '@/apis/system/file'
import { useI18n } from 'vue-i18n'
import {
  getFileIconByType,
  isAudioFile,
  isCodeFile,
  isImageFile,
  isPdfFile,
  isVideoFile
} from '../utils/fileIcons'
import { canPreview } from '../utils/filePreview'

withDefaults(
  defineProps<{
    selectedFile?: FileItem
  }>(),
  {
    selectedFile: undefined
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'download', file: FileItem): void
  (e: 'preview', file: FileItem): void
  (e: 'share', file: FileItem): void
  (e: 'rename', file: FileItem): void
  (e: 'move', file: FileItem): void
  (e: 'copy', file: FileItem): void
  (e: 'delete', file: FileItem): void
}>()

const { t } = useI18n()

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes === 0 || !bytes) return '-'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

// 格式化路径
const formatPath = (path: string): string => {
  if (path.length > 30) {
    return `...${path.slice(-30)}`
  }
  return path
}

// 格式化哈希值
const formatHash = (hash: string): string => {
  if (hash.length > 16) {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }
  return hash
}

// 格式化日期时间
const formatDateTime = (datetime: string): string => {
  if (!datetime) return '-'
  const date = new Date(datetime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 获取文件类型标签
const getFileTypeLabel = (extension: string | undefined): string => {
  if (!extension) return t('file.detail.type')
  const ext = extension.toLowerCase()

  if (isImageFile(ext)) return t('file.detail.image')
  if (isVideoFile(ext)) return t('file.detail.video')
  if (isAudioFile(ext)) return t('file.detail.audio')
  if (isPdfFile(ext)) return t('file.detail.pdf')
  if (isCodeFile(ext)) return t('file.detail.code')

  const docExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf']
  if (docExts.includes(ext)) return t('file.detail.document')

  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz']
  if (archiveExts.includes(ext)) return t('file.detail.archive')

  return `${ext.toUpperCase()} 文件`
}

// 判断是否可以预览
const canPreviewFile = (file: FileItem): boolean => {
  return file.type !== 0 && canPreview(file)
}

// 更多操作
const handleMoreCommand = (command: string, file: FileItem) => {
  switch (command) {
    case 'rename':
      emit('rename', file)
      break
    case 'move':
      emit('move', file)
      break
    case 'copy':
      emit('copy', file)
      break
    case 'delete':
      emit('delete', file)
      break
  }
}
</script>

<style lang="scss" scoped>
  .file-detail-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--el-bg-color);
    border-left: 1px solid var(--el-border-color-lighter);
  }

  .panel-close {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      color: var(--el-text-color-primary);
      background: var(--el-fill-color);
    }
  }

  .panel-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
    padding: 16px;
    overflow-y: auto;
  }

  .preview-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .preview-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    margin-bottom: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;

    .is-folder {
      color: var(--el-color-warning);
    }
  }

  .preview-name {
    width: 100%;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    text-align: center;
    white-space: nowrap;
  }

  .preview-type {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .info-section {
    .section-title {
      margin-bottom: 12px;
      font-size: 12px;
      font-weight: 500;
      color: var(--el-text-color-secondary);
    }
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .info-value {
    font-size: 13px;
    color: var(--el-text-color-primary);
    word-break: break-all;

    &.hash {
      font-family: monospace;
      font-size: 11px;
      color: var(--el-text-color-secondary);
    }
  }

  .action-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);

    .el-button {
      justify-content: flex-start;
      width: 100%;
    }
  }

  .panel-empty {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--el-text-color-placeholder);

    p {
      font-size: 13px;
    }
  }
</style>
