<template>
  <CaPageLayout class="file-page">
    <template #left>
      <FileSidebar :current-path="currentPath" :statistics="statistics" @navigate="navigateTo" />
    </template>

    <div class="file-content">
      <!-- 工具栏 -->
      <FileHeader
        :current-path="currentPath"
        :view-mode="viewMode"
        :sort-field="sortInfo.field"
        :sort-order="sortInfo.order"
        :can-go-back="navigationHistory.canBack"
        :can-go-forward="navigationHistory.canForward"
        :can-go-up="pathSegments.length > 0"
        @navigate="navigateTo"
        @go-back="goBack"
        @go-forward="goForward"
        @go-up="navigateBack"
        @create-folder="showNewFolderModal = true"
        @upload="handleUpload"
        @search="handleSearch"
        @sort="handleSort"
        @view-change="handleViewChange"
        @refresh="fetchFileList"
        @toggle-detail-panel="toggleDetailPanel"
        @select-all="selectAll"
      />

      <!-- 文件列表 -->
      <FileList
        :data="fileList"
        :loading="loading"
        :view-mode="viewMode"
        :selected-ids="selectedIds"
        :sort-field="sortInfo.field"
        :sort-order="sortInfo.order"
        :is-root="currentPath === '/'"
        :pagination="pagination"
        @select="handleSelection"
        @click="handleFileClick"
        @dblclick="handleFileDblClick"
        @contextmenu="handleContextMenu"
        @preview="handlePreview"
        @download="handleDownload"
        @rename="handleRename"
        @move="handleMove"
        @copy="handleCopy"
        @share="handleShare"
        @delete="handleDelete"
        @upload="handleUpload"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 详情面板（作为右侧边栏） -->
    <template v-if="showDetailPanel && selectedFile" #right>
      <FileDetailPanel
        :selected-file="selectedFile"
        @close="showDetailPanel = false"
        @download="handleDownload"
        @preview="handlePreview"
        @share="handleShare"
        @rename="handleRename"
        @delete="handleDelete"
      />
    </template>

    <!-- 右键菜单 -->
    <FileContextMenu
      :visible="contextMenu.visible"
      :position="contextMenu.position"
      :menu-items="contextMenu.menuItems"
      @update:visible="contextMenu.visible = $event"
      @action="handleContextMenuAction"
    />

    <!-- 弹窗 -->
    <NewFolderModal v-model="showNewFolderModal" @confirm="handleCreateFolder" />
    <RenameModal v-model="showRenameModal" :file="fileToRename" @confirm="handleRenameConfirm" />
    <!-- <MoveModal
      v-model="showMoveModal"
      :files="moveFiles"
      :mode="moveMode"
      @confirm="handleMoveConfirm"
    />
    <ShareModal v-model="showShareModal" :file="shareFile" /> -->

    <!-- 预览弹窗 -->
    <el-dialog
      v-model="showPreviewModal"
      :title="previewFile?.originalName"
      width="80%"
      top="5vh"
      destroy-on-close
      class="!h-[90vh] !flex !flex-col"
    >
      <div v-if="previewFile" class="preview-container">
        <!-- 纯前端 Office 预览 (vue-office) -->
        <OfficePreview
          v-if="localOfficeType"
          :file-url="previewInfo.url"
          :type="localOfficeType"
          @download="handleDownload(previewFile)"
        />

        <video
          v-else-if="previewInfo.type === 'video'"
          :src="previewInfo.url"
          controls
          class="w-full h-full object-contain"
        />

        <el-image
          v-else-if="previewInfo.type === 'image'"
          :src="previewInfo.url"
          fit="contain"
          class="w-full h-full"
        />

        <div v-else class="preview-unsupported">
          <ArtSvgIcon icon="ri:file-forbid-line" :size="64" />
          <p>{{ t('file.preview.unsupported') }}</p>
        </div>
      </div>
    </el-dialog>
  </CaPageLayout>
</template>

<script setup lang="ts">
  import type { FileItem, FileStatisticsResp } from '@/apis/system/file'
  import * as fileApi from '@/apis/system/file'
  import { useI18n } from 'vue-i18n'
  import { useFileContextMenu } from '../hooks/useFileContextMenu'
  import { useFileNavigation } from '../hooks/useFileNavigation'
  import { useFileOperations } from '../hooks/useFileOperations'
  import { useFileSelection } from '../hooks/useFileSelection'
  import { useFileUpload } from '../hooks/useFileUpload'
  import { ContextMenuAction, SelectionMode, SortField, ViewMode } from '../types'
  import type { PreviewInfo } from '../utils/filePreview'
  import { getLocalOfficeType, getPreviewInfo } from '../utils/filePreview'
  import FileContextMenu from './FileContextMenu.vue'
  import FileDetailPanel from './FileDetailPanel.vue'
  import FileHeader from './FileHeader.vue'
  import FileList from './FileList.vue'
  import FileSidebar from './FileSidebar.vue'
  import NewFolderModal from './modals/NewFolderModal.vue'
  import RenameModal from './modals/RenameModal.vue'
  import OfficePreview from './OfficePreview.vue'

  const { t } = useI18n()

  // 导航相关
  const {
    currentPath,
    pathSegments,
    navigationHistory,
    sortInfo,
    navigateTo,
    navigateBack,
    goBack,
    goForward,
    setSort
  } = useFileNavigation()

  // 选择相关
  const selectionMode = ref<SelectionMode>('multiple')
  const {
    selectedIds,
    getSelectedFiles,
    getSelectedTotalSize,
    selectOne,
    selectAll,
    clearSelection
  } = useFileSelection(selectionMode)

  // 操作相关
  const {
    loading,
    deleteFile,
    deleteFiles,
    downloadFile,
    downloadFiles,
    createFolder,
    renameFile
  } = useFileOperations()

  // 上传相关
  const { uploadFiles } = useFileUpload()

  // 右键菜单相关
  const {
    visible: contextMenuVisible,
    position: contextMenuPosition,
    menuItems: contextMenuItems,
    targetFiles: contextMenuTargetFiles,
    showContextMenu
  } = useFileContextMenu()

  // 状态
  const fileList = ref<FileItem[]>([])
  const statistics = ref<FileStatisticsResp>({
    size: 0,
    number: 0,
    unit: '',
    type: '',
    data: []
  })

  const viewMode = ref<ViewMode>('list')
  const showDetailPanel = ref(false)
  const searchKeyword = ref('')

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0
  })

  // 弹窗状态
  const showNewFolderModal = ref(false)
  const showRenameModal = ref(false)
  const showMoveModal = ref(false)
  const showShareModal = ref(false)
  const showPreviewModal = ref(false)

  // 操作目标
  const fileToRename = ref<FileItem | null>(null)
  const moveFiles = ref<FileItem[]>([])
  const moveMode = ref<'move' | 'copy'>('move')
  const shareFile = ref<FileItem | null>(null)
  const previewFile = ref<FileItem | null>(null)

  // 计算属性
  const selectedFile = computed(() => {
    const files = getSelectedFiles(fileList.value)
    return files.length === 1 ? files[0] : null
  })

  // 选中文件的总大小（供模板使用）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const selectedTotalSize = computed(() => getSelectedTotalSize(fileList.value))

  const previewInfo = computed((): PreviewInfo => {
    return getPreviewInfo(previewFile.value)
  })

  // 纯前端可预览的 Office 类型
  const localOfficeType = computed(() => {
    if (!previewFile.value?.extension) return null
    return getLocalOfficeType(previewFile.value.extension)
  })

  const contextMenu = computed(() => ({
    visible: contextMenuVisible.value,
    position: contextMenuPosition.value,
    menuItems: contextMenuItems.value
  }))

  // 获取文件列表
  const fetchFileList = async () => {
    loading.value = true
    try {
      const res = await fileApi.listFile({
        parentPath: currentPath.value,
        originalName: searchKeyword.value,
        sort: [`${sortInfo.value.field},${sortInfo.value.order}`],
        page: pagination.current,
        size: pagination.pageSize
      })
      fileList.value = res.list || []
      pagination.total = res.total || 0
    } catch (error: any) {
      ElMessage.error(error.message || '获取文件列表失败')
    } finally {
      loading.value = false
    }
  }

  // 加载文件统计数据
  const loadStatistics = async () => {
    try {
      const res = await fileApi.getFileStatistics()
      statistics.value = res
    } catch (error: any) {
      console.error('加载统计数据失败:', error)
    }
  }

  // 文件点击
  const handleFileClick = (file: FileItem, event: MouseEvent) => {
    selectOne(file.id, fileList.value, event)
  }

  // 文件双击
  const handleFileDblClick = (file: FileItem) => {
    if (file.type === 0) {
      navigateTo(file.path)
    } else {
      handlePreview(file)
    }
  }

  // 选择变化
  const handleSelection = (ids: string[]) => {
    selectedIds.value = ids
  }

  // 右键菜单
  const handleContextMenu = (files: FileItem[], event: MouseEvent) => {
    showContextMenu(event, files)
  }

  // 右键菜单操作
  const handleContextMenuAction = (action: ContextMenuAction) => {
    const files = contextMenuTargetFiles.value
    if (files.length === 0) return

    switch (action) {
      case ContextMenuAction.OPEN:
        if (files[0]?.type === 0) {
          navigateTo(files[0].path)
        }
        break
      case ContextMenuAction.DOWNLOAD:
        if (files.length === 1) {
          handleDownload(files[0])
        } else {
          handleBatchDownload()
        }
        break
      case ContextMenuAction.PREVIEW:
        if (files[0]?.type !== 0) {
          handlePreview(files[0])
        }
        break
      case ContextMenuAction.RENAME:
        handleRename(files[0])
        break
      case ContextMenuAction.MOVE:
        handleMove(files)
        break
      case ContextMenuAction.COPY:
        handleCopy(files)
        break
      case ContextMenuAction.DELETE:
        if (files.length === 1) {
          handleDelete(files[0])
        } else {
          handleBatchDelete()
        }
        break
      case ContextMenuAction.SHARE:
        handleShare(files[0])
        break
    }
  }

  // 上传
  const handleUpload = async (files: File[]) => {
    await uploadFiles(files, currentPath.value)
    fetchFileList()
  }

  // 搜索
  const handleSearch = (keyword: string) => {
    searchKeyword.value = keyword
    pagination.current = 1
    fetchFileList()
  }

  // 排序
  const handleSort = (field: SortField) => {
    setSort(field)
    fetchFileList()
  }

  // 分页大小变化
  const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.current = 1
    fetchFileList()
  }

  // 当前页变化
  const handleCurrentChange = (current: number) => {
    pagination.current = current
    fetchFileList()
  }

  // 视图切换
  const handleViewChange = (mode: ViewMode) => {
    viewMode.value = mode
  }

  // 切换详情面板
  const toggleDetailPanel = () => {
    showDetailPanel.value = !showDetailPanel.value
  }

  // 创建文件夹
  const handleCreateFolder = async (name: string) => {
    const success = await createFolder(currentPath.value, name, {
      onSuccess: () => fetchFileList()
    })
    return success
  }

  // 重命名
  const handleRename = (file: FileItem) => {
    fileToRename.value = file
    showRenameModal.value = true
  }

  const handleRenameConfirm = async (file: FileItem, newName: string) => {
    await renameFile(file, newName, {
      skipConfirm: true,
      onSuccess: () => fetchFileList()
    })
  }

  // 移动
  const handleMove = (files: FileItem[]) => {
    moveFiles.value = files
    moveMode.value = 'move'
    showMoveModal.value = true
  }

  // 复制
  const handleCopy = (files: FileItem[]) => {
    moveFiles.value = files
    moveMode.value = 'copy'
    showMoveModal.value = true
  }

  // 分享
  const handleShare = (file: FileItem) => {
    shareFile.value = file
    showShareModal.value = true
  }

  // 预览
  const handlePreview = (file: FileItem) => {
    previewFile.value = file
    showPreviewModal.value = true
  }

  // 下载
  const handleDownload = (file: FileItem) => {
    downloadFile(file)
  }

  // 批量下载
  const handleBatchDownload = () => {
    const files = getSelectedFiles(fileList.value)
    downloadFiles(files)
  }

  // 删除
  const handleDelete = async (file: FileItem) => {
    await deleteFile(file, {
      onSuccess: () => {
        fetchFileList()
        clearSelection()
      }
    })
  }

  // 批量删除
  const handleBatchDelete = async () => {
    const files = getSelectedFiles(fileList.value)
    await deleteFiles(files, {
      onSuccess: () => {
        fetchFileList()
        clearSelection()
      }
    })
  }

  // 格式化文件大小（供模板使用）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 初始化
  onMounted(() => {
    fetchFileList()
    loadStatistics()
  })

  // 监听路径变化
  watch(currentPath, () => {
    pagination.current = 1
    fetchFileList()
  })
</script>

<style lang="scss" scoped>
  .file-page {
    :deep(.gi-page-layout-left) {
      width: 260px;
      min-width: 260px;
      max-width: 400px;
      padding: 0;
      background: var(--el-fill-color-light);
      border-right: 1px solid var(--el-border-color-lighter);
    }

    :deep(.gi-page-layout-right) {
      width: 300px;
      min-width: 250px;
      max-width: 500px;
      padding: 0;
    }
  }

  .file-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .preview-container {
    display: block;
    height: 100%;

    iframe,
    video,
    audio {
      display: block;
      width: 100%;
    }
  }

  .preview-unsupported {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    justify-content: center;
    min-height: 30vh;
    color: var(--el-text-color-placeholder);

    p {
      font-size: 14px;
    }
  }

  .batch-actions-bar {
    position: fixed;
    bottom: 0;
    left: 50%;
    z-index: 100;
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 12px 24px;
    background: var(--el-color-primary);
    border-radius: 4px 4px 0 0;
    box-shadow: 0 -2px 12px rgb(0 0 0 / 10%);
    transform: translateX(-50%);

    .selection-info {
      font-size: 14px;
      color: #fff;
    }

    :deep(.el-button) {
      &:hover {
        color: var(--el-color-primary-light-3);
      }
    }
  }

  :deep(.el-dialog__body) {
    flex: 1;
    padding: 0;
    overflow: hidden;
  }
</style>
