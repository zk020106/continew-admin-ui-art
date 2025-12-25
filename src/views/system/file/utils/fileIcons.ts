import { FileCategory } from '../types'

/** 文件图标配置 */
export interface FileIconConfig {
  icon: string
  color: string
  category: FileCategory
}

/** 扩展名到图标映射 - 使用本地SVG图标 */
const EXTENSION_ICON_MAP: Record<string, FileIconConfig> = {
  // 图片
  jpg: { icon: 'file-image', color: '#409EFF', category: FileCategory.IMAGE },
  jpeg: { icon: 'file-image', color: '#409EFF', category: FileCategory.IMAGE },
  png: { icon: 'file-image', color: '#409EFF', category: FileCategory.IMAGE },
  gif: { icon: 'file-image', color: '#409EFF', category: FileCategory.IMAGE },
  bmp: { icon: 'file-image', color: '#409EFF', category: FileCategory.IMAGE },
  webp: { icon: 'file-image', color: '#409EFF', category: FileCategory.IMAGE },
  ico: { icon: 'file-image', color: '#409EFF', category: FileCategory.IMAGE },

  // 视频
  mp4: { icon: 'file-video', color: '#67C23A', category: FileCategory.VIDEO },
  avi: { icon: 'file-video', color: '#67C23A', category: FileCategory.VIDEO },
  mkv: { icon: 'file-video', color: '#67C23A', category: FileCategory.VIDEO },
  mov: { icon: 'file-video', color: '#67C23A', category: FileCategory.VIDEO },
  wmv: { icon: 'file-video', color: '#67C23A', category: FileCategory.VIDEO },
  flv: { icon: 'file-video', color: '#67C23A', category: FileCategory.VIDEO },
  webm: { icon: 'file-video', color: '#67C23A', category: FileCategory.VIDEO },
  m4v: { icon: 'file-video', color: '#67C23A', category: FileCategory.VIDEO },

  // 音频
  mp3: { icon: 'file-music', color: '#E6A23C', category: FileCategory.AUDIO },
  wav: { icon: 'file-music', color: '#E6A23C', category: FileCategory.AUDIO },
  flac: { icon: 'file-music', color: '#E6A23C', category: FileCategory.AUDIO },
  aac: { icon: 'file-music', color: '#E6A23C', category: FileCategory.AUDIO },
  ogg: { icon: 'file-music', color: '#E6A23C', category: FileCategory.AUDIO },
  m4a: { icon: 'file-music', color: '#E6A23C', category: FileCategory.AUDIO },
  wma: { icon: 'file-music', color: '#E6A23C', category: FileCategory.AUDIO },

  // 文档
  pdf: { icon: 'file-pdf', color: '#F56C6C', category: FileCategory.DOCUMENT },
  doc: { icon: 'file-other', color: '#409EFF', category: FileCategory.DOCUMENT },
  docx: { icon: 'file-other', color: '#409EFF', category: FileCategory.DOCUMENT },
  xls: { icon: 'file-excel', color: '#67C23A', category: FileCategory.DOCUMENT },
  xlsx: { icon: 'file-excel', color: '#67C23A', category: FileCategory.DOCUMENT },
  ppt: { icon: 'file-ppt', color: '#E6A23C', category: FileCategory.DOCUMENT },
  pptx: { icon: 'file-ppt', color: '#E6A23C', category: FileCategory.DOCUMENT },
  txt: { icon: 'file-txt', color: '#909399', category: FileCategory.DOCUMENT },

  // 压缩包
  zip: { icon: 'file-zip', color: '#F56C6C', category: FileCategory.ARCHIVE },
  rar: { icon: 'file-rar', color: '#F56C6C', category: FileCategory.ARCHIVE },
  '7z': { icon: 'file-zip', color: '#F56C6C', category: FileCategory.ARCHIVE },
  tar: { icon: 'file-zip', color: '#F56C6C', category: FileCategory.ARCHIVE },
  gz: { icon: 'file-zip', color: '#F56C6C', category: FileCategory.ARCHIVE },
  bz2: { icon: 'file-zip', color: '#F56C6C', category: FileCategory.ARCHIVE },

  // 代码
  js: { icon: 'file-js', color: '#F7DF1E', category: FileCategory.CODE },
  jsx: { icon: 'file-other', color: '#61DAFB', category: FileCategory.CODE },
  ts: { icon: 'file-typescript', color: '#3178C6', category: FileCategory.CODE },
  tsx: { icon: 'file-other', color: '#61DAFB', category: FileCategory.CODE },
  vue: { icon: 'file-vue', color: '#42B883', category: FileCategory.CODE },
  html: { icon: 'file-html', color: '#E34F26', category: FileCategory.CODE },
  htm: { icon: 'file-html', color: '#E34F26', category: FileCategory.CODE },
  css: { icon: 'file-css', color: '#1572B6', category: FileCategory.CODE },
  scss: { icon: 'file-css', color: '#CD6799', category: FileCategory.CODE },
  sass: { icon: 'file-css', color: '#CD6799', category: FileCategory.CODE },
  less: { icon: 'file-css', color: '#1D365D', category: FileCategory.CODE },
  json: { icon: 'file-json', color: '#F7DF1E', category: FileCategory.CODE },
  xml: { icon: 'file-xml', color: '#0060AC', category: FileCategory.CODE },
  md: { icon: 'file-other', color: '#083fa1', category: FileCategory.CODE },
  java: { icon: 'file-java', color: '#007396', category: FileCategory.CODE },
  py: { icon: 'file-other', color: '#3776AB', category: FileCategory.CODE },
  php: { icon: 'file-other', color: '#777BB4', category: FileCategory.CODE },
  go: { icon: 'file-other', color: '#00ADD8', category: FileCategory.CODE },
  rs: { icon: 'file-other', color: '#DEA584', category: FileCategory.CODE },
  cpp: { icon: 'file-other', color: '#00599C', category: FileCategory.CODE },
  c: { icon: 'file-other', color: '#00599C', category: FileCategory.CODE },
  cs: { icon: 'file-other', color: '#512BD4', category: FileCategory.CODE },
  swift: { icon: 'file-other', color: '#F05138', category: FileCategory.CODE },
  kt: { icon: 'file-other', color: '#7F52FF', category: FileCategory.CODE },
  sql: { icon: 'file-sql', color: '#00758F', category: FileCategory.CODE },
  sh: { icon: 'file-other', color: '#4B4B4B', category: FileCategory.CODE },
  bash: { icon: 'file-other', color: '#4B4B4B', category: FileCategory.CODE },
  yaml: { icon: 'file-other', color: '#CB171E', category: FileCategory.CODE },
  yml: { icon: 'file-other', color: '#CB171E', category: FileCategory.CODE },

  // 其他
  apk: { icon: 'file-other', color: '#3DDC84', category: FileCategory.OTHER },
  exe: { icon: 'file-exe', color: '#0078D6', category: FileCategory.OTHER },
  dmg: { icon: 'file-other', color: '#999999', category: FileCategory.OTHER },
  torrent: { icon: 'file-other', color: '#409EFF', category: FileCategory.OTHER }
}

/** 默认文件图标 - 使用本地SVG图标 */
export const DEFAULT_FILE_ICON: FileIconConfig = {
  icon: 'file-close',
  color: '#909399',
  category: FileCategory.OTHER
}

/** 文件夹图标 - 使用本地SVG图标 */
export const FOLDER_ICON: FileIconConfig = {
  icon: 'directory',
  color: '#FFA000',
  category: FileCategory.OTHER
}

/** 打开的文件夹图标 - 使用本地SVG图标 */
export const FOLDER_OPEN_ICON: FileIconConfig = {
  icon: 'directory-open',
  color: '#FFA000',
  category: FileCategory.OTHER
}

/**
 * 根据文件扩展名获取图标配置
 */
export function getFileIcon(extension: string | undefined): FileIconConfig {
  if (!extension) return DEFAULT_FILE_ICON
  const ext = extension.toLowerCase().replace('.', '')
  return EXTENSION_ICON_MAP[ext] || DEFAULT_FILE_ICON
}

/**
 * 根据文件名获取图标
 */
export function getFileIconByName(fileName: string): FileIconConfig {
  const ext = fileName.split('.').pop()?.toLowerCase()
  return getFileIcon(ext)
}

/**
 * 根据文件类型获取图标（用于 FileItem）
 */
export function getFileIconByType(file: { type: number; extension?: string }): FileIconConfig {
  // type === 0 表示文件夹
  if (file.type === 0) return FOLDER_ICON
  return getFileIcon(file.extension)
}

/**
 * 获取 SVG 图标名称（用于 ArtSvgIcon 组件）
 */
export function getIconName(extension: string | undefined): string {
  return getFileIcon(extension).icon
}

/**
 * 获取图标颜色
 */
export function getIconColor(extension: string | undefined): string {
  return getFileIcon(extension).color
}

/**
 * 获取文件分类
 */
export function getFileCategory(extension: string | undefined): FileCategory {
  return getFileIcon(extension).category
}

/**
 * 判断是否为图片文件
 */
export function isImageFile(extension?: string): boolean {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico']
  return extension ? imageExts.includes(extension.toLowerCase()) : false
}

/**
 * 判断是否为视频文件
 */
export function isVideoFile(extension?: string): boolean {
  const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v']
  return extension ? videoExts.includes(extension.toLowerCase()) : false
}

/**
 * 判断是否为音频文件
 */
export function isAudioFile(extension?: string): boolean {
  const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma']
  return extension ? audioExts.includes(extension.toLowerCase()) : false
}

/**
 * 判断是否为 PDF 文件
 */
export function isPdfFile(extension?: string): boolean {
  return extension?.toLowerCase() === 'pdf'
}

/**
 * 判断是否为可预览文件
 */
export function isPreviewable(extension?: string): boolean {
  return (
    isImageFile(extension) ||
    isPdfFile(extension) ||
    isVideoFile(extension) ||
    isAudioFile(extension)
  )
}

/**
 * 判断是否为代码文件
 */
export function isCodeFile(extension?: string): boolean {
  const codeExts = [
    'js',
    'jsx',
    'ts',
    'tsx',
    'vue',
    'html',
    'css',
    'scss',
    'json',
    'xml',
    'md',
    'java',
    'py',
    'php',
    'go',
    'rs',
    'cpp',
    'c',
    'cs',
    'swift',
    'kt',
    'sql',
    'sh',
    'yaml',
    'yml'
  ]
  return extension ? codeExts.includes(extension.toLowerCase()) : false
}
