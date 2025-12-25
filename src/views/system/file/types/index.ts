import type { FileItem } from '@/apis/system/file'

/** 视图模式 */
export type ViewMode = 'list' | 'grid' | 'tree'

/** 文件项类型（扩展 API 类型） */
export interface FileNode extends FileItem {
  children?: FileNode[]
  isExpanded?: boolean
  isSelected?: boolean
  level?: number
}

/** 排序字段 */
export type SortField = 'name' | 'size' | 'createTime' | 'updateTime' | 'extension'

/** 排序顺序 */
export type SortOrder = 'asc' | 'desc'

/** 排序信息 */
export interface SortInfo {
  field: SortField
  order: SortOrder
}

/** 文件类型分类 */
export enum FileCategory {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  ARCHIVE = 'archive',
  CODE = 'code',
  OTHER = 'other'
}

/** 右键菜单操作类型 */
export enum ContextMenuAction {
  OPEN = 'open',
  DOWNLOAD = 'download',
  PREVIEW = 'preview',
  RENAME = 'rename',
  MOVE = 'move',
  COPY = 'copy',
  DELETE = 'delete',
  SHARE = 'share',
  FAVORITE = 'favorite',
  INFO = 'info'
}

/** 右键菜单项 */
export interface ContextMenuItem {
  label: string
  icon: string
  action: ContextMenuAction
  divider?: boolean
  disabled?: boolean
  danger?: boolean
}

/** 上传任务状态 */
export enum UploadStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

/** 上传任务 */
export interface UploadTask {
  id: string
  file: File
  progress: number
  status: UploadStatus
  speed: number
  loaded: number
  total: number
  error?: string
  parentId?: string
  parentPath?: string
}

/** 分片上传信息 */
export interface MultipartUploadInfo {
  uploadId: string
  partSize: number
  totalParts: number
  uploadedParts: number[]
  path: string
}

/** 文件操作选项 */
export interface FileOperationOptions {
  skipConfirm?: boolean
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/** 移动/复制选项 */
export interface MoveCopyOptions {
  targetPath: string
  targetId: string
  overwrite?: boolean
}

/** 分享信息 */
export interface ShareInfo {
  id: string
  fileId: string
  shareCode: string
  shareUrl: string
  password?: string
  expireTime?: string
  downloadLimit?: number
  downloadCount: number
  createTime: string
}

/** 存储空间统计 */
export interface StorageUsage {
  total: number
  used: number
  available: number
  percentage: number
  byType: Record<FileCategory, number>
}

/** 导航历史 */
export interface NavigationHistory {
  path: string
  name: string
  canForward: boolean
  canBack: boolean
}

/** 文件选择模式 */
export type SelectionMode = 'single' | 'multiple' | 'none'

/** 面板类型 */
export type PanelType = 'detail' | 'info'

/** 文件筛选条件 */
export interface FileFilter {
  keyword?: string
  type?: FileCategory
  extensions?: string[]
  minSize?: number
  maxSize?: number
  startTime?: string
  endTime?: string
}
