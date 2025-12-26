import type { ContextMenuItem } from '../types'
import { ContextMenuAction } from '../types'

/** 文件大小单位 */
export const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'] as const

/** 默认分页大小 */
export const DEFAULT_PAGE_SIZE = 50

/** 分页大小选项 */
export const PAGE_SIZE_OPTIONS = [20, 50, 100, 200] as const

/** 默认排序 */
export const DEFAULT_SORT = {
  field: 'createTime' as const,
  order: 'desc' as const
}

/** 本地存储键名 */
export const STORAGE_KEYS = {
  VIEW_MODE: 'file_view_mode',
  SIDEBAR_WIDTH: 'file_sidebar_width',
  DETAIL_PANEL_VISIBLE: 'file_detail_panel_visible',
  DETAIL_PANEL_WIDTH: 'file_detail_panel_width',
  EXPANDED_FOLDERS: 'file_expanded_folders',
  SORT_PREFERENCE: 'file_sort_preference',
  RECENT_PATHS: 'file_recent_paths'
} as const

/** 最大上传文件大小（默认 5GB） */
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024 * 1024

/** 分片上传的块大小（5MB） */
export const CHUNK_SIZE = 5 * 1024 * 1024

/** 同时上传的最大并发数 */
export const MAX_CONCURRENT_UPLOADS = 3

/** 文件名最大长度 */
export const MAX_FILENAME_LENGTH = 255

/** 路径最大长度 */
export const MAX_PATH_LENGTH = 1024

/** 文件夹名称最大长度 */
export const MAX_FOLDER_NAME_LENGTH = 100

/** 不合法的文件名字符 */
export const INVALID_FILENAME_CHARS = /[\\:*?"<>|/]/g

/** 预览图片最大大小 */
export const MAX_PREVIEW_IMAGE_SIZE = 10 * 1024 * 1024

/** 支持拖拽的文件类型 */
export const DRAG_ACCEPT_TYPES = '*'

/** 文件列表默认每页数量 */
export const FILE_LIST_PAGE_SIZE = 50

/** 最近访问路径最多保存数量 */
export const MAX_RECENT_PATHS = 10

/** 默认右键菜单项 */
export const DEFAULT_CONTEXT_MENU_ITEMS: ContextMenuItem[] = [
  { label: '打开', icon: 'ri:folder-open-line', action: ContextMenuAction.OPEN },
  { label: '下载', icon: 'ri:download-2-line', action: ContextMenuAction.DOWNLOAD },
  { label: '预览', icon: 'ri:eye-line', action: ContextMenuAction.PREVIEW },
  { label: 'divider-1', icon: '', action: ContextMenuAction.INFO, divider: true },
  { label: '重命名', icon: 'ri:edit-line', action: ContextMenuAction.RENAME },
  // { label: '移动到', icon: 'ri:folder-transfer-line', action: ContextMenuAction.MOVE },
  // { label: '复制到', icon: 'ri:file-copy-line', action: ContextMenuAction.COPY },
  // { label: 'divider-2', icon: '', action: ContextMenuAction.INFO, divider: true },
  // { label: '分享', icon: 'ri:share-line', action: ContextMenuAction.SHARE },
  // { label: '收藏', icon: 'ri:star-line', action: ContextMenuAction.FAVORITE },
  { label: 'divider-2', icon: '', action: ContextMenuAction.INFO, divider: true },
  { label: '删除', icon: 'ri:delete-bin-line', action: ContextMenuAction.DELETE, danger: true }
]

/** 文件夹右键菜单项 */
export const FOLDER_CONTEXT_MENU_ITEMS: ContextMenuItem[] = [
  { label: '打开', icon: 'ri:folder-open-line', action: ContextMenuAction.OPEN },
  { label: 'divider-1', icon: '', action: ContextMenuAction.INFO, divider: true },
  { label: '重命名', icon: 'ri:edit-line', action: ContextMenuAction.RENAME },
  // { label: '移动到', icon: 'ri:folder-transfer-line', action: ContextMenuAction.MOVE },
  // { label: 'divider-2', icon: '', action: ContextMenuAction.INFO, divider: true },
  // { label: '分享', icon: 'ri:share-line', action: ContextMenuAction.SHARE },
  // { label: '收藏', icon: 'ri:star-line', action: ContextMenuAction.FAVORITE },
  { label: 'divider-2', icon: '', action: ContextMenuAction.INFO, divider: true },
  { label: '删除', icon: 'ri:delete-bin-line', action: ContextMenuAction.DELETE, danger: true }
]

/** 多选右键菜单项 */
export const MULTI_SELECT_CONTEXT_MENU_ITEMS: ContextMenuItem[] = [
  { label: '下载', icon: 'ri:download-2-line', action: ContextMenuAction.DOWNLOAD },
  { label: 'divider-1', icon: '', action: ContextMenuAction.INFO, divider: true },
  // { label: '移动到', icon: 'ri:folder-transfer-line', action: ContextMenuAction.MOVE },
  // { label: '复制到', icon: 'ri:file-copy-line', action: ContextMenuAction.COPY },
  { label: '删除', icon: 'ri:delete-bin-line', action: ContextMenuAction.DELETE, danger: true }
]

/** 空白区域右键菜单项 */
export const EMPTY_CONTEXT_MENU_ITEMS: ContextMenuItem[] = [
  { label: '新建文件夹', icon: 'ri:folder-add-line', action: ContextMenuAction.OPEN },
  { label: '上传文件', icon: 'ri:upload-2-line', action: ContextMenuAction.DOWNLOAD },
  { label: 'divider-1', icon: '', action: ContextMenuAction.INFO, divider: true },
  { label: '刷新', icon: 'ri:refresh-line', action: ContextMenuAction.RENAME },
  { label: '粘贴', icon: 'ri:clipboard-line', action: ContextMenuAction.COPY }
]

/** 文件操作成功提示 */
export const OPERATION_MESSAGES = {
  UPLOAD_SUCCESS: '上传成功',
  UPLOAD_FAILED: '上传失败',
  DELETE_SUCCESS: '删除成功',
  DELETE_FAILED: '删除失败',
  RENAME_SUCCESS: '重命名成功',
  RENAME_FAILED: '重命名失败',
  MOVE_SUCCESS: '移动成功',
  MOVE_FAILED: '移动失败',
  COPY_SUCCESS: '复制成功',
  COPY_FAILED: '复制失败',
  CREATE_FOLDER_SUCCESS: '文件夹创建成功',
  CREATE_FOLDER_FAILED: '文件夹创建失败'
} as const

/** 视图模式图标 */
export const VIEW_MODE_ICONS = {
  list: 'ri:list-unordered',
  grid: 'ri:grid-line',
  tree: 'ri:node-tree'
} as const

/** 排序选项 */
export const SORT_OPTIONS = [
  { label: '名称', value: 'name' },
  { label: '大小', value: 'size' },
  { label: '类型', value: 'extension' },
  { label: '修改时间', value: 'updateTime' }
] as const

/** 网格视图图标大小 */
export const GRID_ICON_SIZES = {
  SMALL: 40,
  MEDIUM: 56,
  LARGE: 72
} as const

/** 列表视图图标大小 */
export const LIST_ICON_SIZE = 24

/** 文件缩略图尺寸 */
export const THUMBNAIL_SIZES = {
  SMALL: 64,
  MEDIUM: 128,
  LARGE: 256
} as const

/** 默认侧边栏宽度 */
export const DEFAULT_SIDEBAR_WIDTH = 260

/** 最小侧边栏宽度 */
export const MIN_SIDEBAR_WIDTH = 200

/** 最大侧边栏宽度 */
export const MAX_SIDEBAR_WIDTH = 400

/** 默认详情面板宽度 */
export const DEFAULT_DETAIL_PANEL_WIDTH = 300

/** 最小详情面板宽度 */
export const MIN_DETAIL_PANEL_WIDTH = 250

/** 最大详情面板宽度 */
export const MAX_DETAIL_PANEL_WIDTH = 500

/** 上传进度刷新间隔 */
export const UPLOAD_PROGRESS_REFRESH_INTERVAL = 200

/** 拖拽预览缩放比例 */
export const DRAG_PREVIEW_SCALE = 0.6

/** 文件操作确认类型 */
export const CONFIRM_TYPES = {
  DELETE: 'delete',
  MOVE: 'move',
  OVERWRITE: 'overwrite'
} as const

/** 文件操作确认提示 */
export const CONFIRM_MESSAGES = {
  DELETE_SINGLE: '确定要删除该文件吗？',
  DELETE_MULTIPLE: '确定要删除选中的 {count} 个文件吗？',
  DELETE_FOLDER: '确定要删除该文件夹及其所有内容吗？',
  OVERWRITE: '目标位置已存在同名文件，是否覆盖？',
  MOVE_TO_ROOT: '确定要将文件移动到根目录吗？'
} as const

/** 文件类型图标（用于筛选） */
export const FILE_TYPE_FILTERS = [
  { label: '全部', value: 'all', icon: 'ri:file-line' },
  { label: '图片', value: 'image', icon: 'ri:image-line' },
  { label: '视频', value: 'video', icon: 'ri:film-line' },
  { label: '音频', value: 'audio', icon: 'ri:music-2-line' },
  { label: '文档', value: 'document', icon: 'ri:file-text-line' },
  { label: '压缩包', value: 'archive', icon: 'ri:file-zip-line' },
  { label: '代码', value: 'code', icon: 'ri:code-box-line' }
] as const

/** 上传状态颜色 */
export const UPLOAD_STATUS_COLORS = {
  pending: '#909399',
  uploading: '#409EFF',
  completed: '#67C23A',
  failed: '#F56C6C',
  cancelled: '#909399',
  paused: '#E6A23C'
} as const

/** 存储空间使用警告阈值 */
export const STORAGE_WARNING_THRESHOLD = 80

/** 存储空间使用危险阈值 */
export const STORAGE_DANGER_THRESHOLD = 95
