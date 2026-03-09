<template>
  <div class="flex h-full flex-col border-l border-(--el-border-color-lighter) bg-(--el-bg-color)">
    <!-- 关闭按钮 -->
    <div
      class="absolute right-2 top-2 z-[1] flex size-7 cursor-pointer items-center justify-center rounded text-(--el-text-color-secondary) transition-all duration-200 hover:bg-(--el-fill-color) hover:text-(--el-text-color-primary)"
      @click="$emit('close')"
    >
      <ArtSvgIcon icon="ri:close-line" :size="18" />
    </div>

    <!-- 内容 -->
    <div v-if="selectedFile" class="flex h-full flex-col gap-5 overflow-y-auto p-4">
      <!-- 文件预览图 -->
      <div class="flex flex-col items-center border-b border-(--el-border-color-lighter) pb-4">
        <div class="mb-3 flex size-20 items-center justify-center rounded-lg bg-(--el-fill-color-lighter)">
          <ArtSvgIcon
            :icon="getFileIconByType(selectedFile).icon"
            :size="64"
            :class="{ 'text-(--el-color-warning)': selectedFile.type === 0 }"
            :style="{
              color: selectedFile.type === 0 ? undefined : getFileIconByType(selectedFile).color,
            }"
          />
        </div>
        <div
          class="mb-1 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-medium text-(--el-text-color-primary)"
          :title="selectedFile.originalName"
        >
          {{ selectedFile.originalName }}
        </div>
        <div class="text-xs text-(--el-text-color-secondary)">
          {{
            selectedFile.type === 0
              ? t('file.list.folder')
              : (selectedFile.extension || '').toUpperCase()
          }}
        </div>
      </div>

      <!-- 文件信息 -->
      <div>
        <div class="mb-3 text-xs font-medium text-(--el-text-color-secondary)">{{ t('file.detail.fileInfo') }}</div>

        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <span class="text-xs text-(--el-text-color-secondary)">{{ t('file.detail.type') }}</span>
            <span class="break-all text-[13px] text-(--el-text-color-primary)">{{
              selectedFile.type === 0
                ? t('file.list.folder')
                : getFileTypeLabel(selectedFile.extension)
            }}</span>
          </div>

          <div v-if="selectedFile.type !== 0" class="flex flex-col gap-1">
            <span class="text-xs text-(--el-text-color-secondary)">{{ t('file.detail.size') }}</span>
            <span class="break-all text-[13px] text-(--el-text-color-primary)">{{ formatSize(selectedFile.size) }}</span>
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-xs text-(--el-text-color-secondary)">{{ t('file.detail.location') }}</span>
            <span class="break-all text-[13px] text-(--el-text-color-primary)" :title="selectedFile.path">{{
              formatPath(selectedFile.path)
            }}</span>
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-xs text-(--el-text-color-secondary)">{{ t('file.detail.createTime') }}</span>
            <span class="break-all text-[13px] text-(--el-text-color-primary)">{{ formatDateTime(selectedFile.createTime) }}</span>
          </div>

          <div v-if="selectedFile.updateTime" class="flex flex-col gap-1">
            <span class="text-xs text-(--el-text-color-secondary)">{{ t('file.detail.modifyTime') }}</span>
            <span class="break-all text-[13px] text-(--el-text-color-primary)">{{ formatDateTime(selectedFile.updateTime) }}</span>
          </div>

          <div v-if="selectedFile.sha256" class="flex flex-col gap-1">
            <span class="text-xs text-(--el-text-color-secondary)">{{ t('file.detail.sha256') }}</span>
            <span
              class="break-all font-mono text-[11px] text-(--el-text-color-secondary)"
              :title="selectedFile.sha256"
            >
              {{ formatHash(selectedFile.sha256) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex flex-col gap-2 border-t border-(--el-border-color-lighter) pt-4">
        <el-button
          v-if="selectedFile.type !== 0"
          class="!w-full !justify-start"
          type="primary"
          size="small"
          @click="$emit('download', selectedFile)"
        >
          <ArtSvgIcon icon="ri:download-2-line" :size="16" />
          {{ t('file.contextMenu.download') }}
        </el-button>

        <el-button
          v-if="canPreviewFile(selectedFile)"
          class="!w-full !justify-start"
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
          <el-button class="!w-full !justify-start" size="small">
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
    <div v-else class="flex h-full flex-col items-center justify-center gap-3 text-(--el-text-color-placeholder)">
      <ArtSvgIcon icon="ri:file-info-line" :size="48" color="var(--el-text-color-placeholder)" />
      <p class="text-[13px]">{{ t('file.detail.selectFile') }}</p>
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

