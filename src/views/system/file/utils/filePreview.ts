import type { FileItem } from '@/apis/system/file'
import { isAudioFile, isCodeFile, isImageFile, isPdfFile, isVideoFile } from './fileIcons'

/** 预览类型 */
export enum PreviewType {
  IMAGE = 'image',
  PDF = 'pdf',
  VIDEO = 'video',
  AUDIO = 'audio',
  CODE = 'code',
  OFFICE = 'office',
  UNSUPPORTED = 'unsupported'
}

/** 预览信息 */
export interface PreviewInfo {
  type: PreviewType
  url: string
  canPreview: boolean
  needExternal?: boolean
  externalUrl?: string
}

/**
 * 获取文件预览类型
 */
export function getPreviewType(file: FileItem): PreviewType {
  const ext = file.extension?.toLowerCase()

  if (isImageFile(ext)) return PreviewType.IMAGE
  if (isPdfFile(ext)) return PreviewType.PDF
  if (isVideoFile(ext)) return PreviewType.VIDEO
  if (isAudioFile(ext)) return PreviewType.AUDIO
  if (isCodeFile(ext)) return PreviewType.CODE

  // Office 文档需要外部预览服务
  const officeExts = ['doc', 'docx', 'xls', 'xlsx']
  if (ext && officeExts.includes(ext)) return PreviewType.OFFICE

  return PreviewType.UNSUPPORTED
}

/**
 * 获取文件预览信息
 */
export function getPreviewInfo(file: FileItem | null): PreviewInfo {
  if (!file) {
    return {
      type: PreviewType.UNSUPPORTED,
      url: '',
      canPreview: false
    }
  }
  const type = getPreviewType(file)
  const url = file.url || ''

  return {
    type,
    url,
    canPreview: type !== PreviewType.UNSUPPORTED
  }
}

/**
 * 判断文件是否可预览
 */
export function canPreview(file: FileItem): boolean {
  return getPreviewInfo(file).canPreview
}

/**
 * 获取代码文件的语言类型（用于语法高亮）
 */
export function getCodeLanguage(extension: string): string {
  const langMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    vue: 'vue',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'scss',
    less: 'less',
    json: 'json',
    xml: 'xml',
    md: 'markdown',
    java: 'java',
    py: 'python',
    php: 'php',
    go: 'go',
    rs: 'rust',
    cpp: 'cpp',
    c: 'c',
    cs: 'csharp',
    swift: 'swift',
    kt: 'kotlin',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
    yaml: 'yaml',
    yml: 'yaml'
  }
  return langMap[extension.toLowerCase()] || 'text'
}

/**
 * 生成图片预览 URL（支持缩略图）
 */
export function getImagePreviewUrl(file: FileItem, useThumbnail = true): string {
  if (useThumbnail && file.thumbnailUrl) {
    return file.thumbnailUrl
  }
  return file.url || ''
}

/**
 * 获取 PDF 预览 URL
 */
export function getPdfPreviewUrl(file: FileItem): string {
  return file.url || ''
}

/**
 * 获取视频预览 URL
 */
export function getVideoPreviewUrl(file: FileItem): string {
  return file.url || ''
}

/**
 * 获取音频预览 URL
 */
export function getAudioPreviewUrl(file: FileItem): string {
  return file.url || ''
}

/**
 * Office 在线预览服务列表
 */
export const OFFICE_PREVIEW_SERVICES = {
  MICROSOFT: 'microsoft',
  GOOGLE: 'google',
  ONLY_OFFICE: 'onlyoffice'
}

/**
 * 纯前端支持的 Office 类型
 */
export type LocalOfficeType = 'word' | 'excel' | 'pdf'

/**
 * 判断是否为纯前端可预览的 Office 文档
 */
export function getLocalOfficeType(extension: string): LocalOfficeType | null {
  const ext = extension.toLowerCase()
  if (['doc', 'docx'].includes(ext)) return 'word'
  if (['xls', 'xlsx'].includes(ext)) return 'excel'
  if (ext === 'pdf') return 'pdf'
  return null
}

/**
 * 获取 Office 文档在线预览 URL
 */
export function getOfficePreviewUrl(
  fileUrl: string,
  service = OFFICE_PREVIEW_SERVICES.MICROSOFT
): string {
  const encodedUrl = encodeURIComponent(fileUrl)

  switch (service) {
    case OFFICE_PREVIEW_SERVICES.MICROSOFT:
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`
    case OFFICE_PREVIEW_SERVICES.GOOGLE:
      return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`
    case OFFICE_PREVIEW_SERVICES.ONLY_OFFICE:
      // OnlyOffice 需要自己部署服务
      return `${encodedUrl}`
    default:
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`
  }
}

/**
 * 视频支持的格式列表
 */
export const SUPPORTED_VIDEO_FORMATS = ['mp4', 'webm', 'ogg', 'm4v']

/**
 * 音频支持的格式列表
 */
export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac']

/**
 * 图片支持的格式列表
 */
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico']

/**
 * 检查浏览器是否支持该视频格式
 */
export function isVideoSupported(extension: string): boolean {
  const video = document.createElement('video')
  const ext = extension.toLowerCase()
  if (ext === 'mp4') return video.canPlayType('video/mp4') !== ''
  if (ext === 'webm') return video.canPlayType('video/webm') !== ''
  if (ext === 'ogg') return video.canPlayType('video/ogg') !== ''
  return SUPPORTED_VIDEO_FORMATS.includes(ext)
}

/**
 * 检查浏览器是否支持该音频格式
 */
export function isAudioSupported(extension: string): boolean {
  const audio = document.createElement('audio')
  const ext = extension.toLowerCase()
  if (ext === 'mp3') return audio.canPlayType('audio/mpeg') !== ''
  if (ext === 'wav') return audio.canPlayType('audio/wav') !== ''
  if (ext === 'ogg') return audio.canPlayType('audio/ogg') !== ''
  if (ext === 'm4a' || ext === 'aac') return audio.canPlayType('audio/mp4') !== ''
  return SUPPORTED_AUDIO_FORMATS.includes(ext)
}

/**
 * 获取文件 MIME 类型
 */
export function getFileMimeType(extension: string): string {
  const mimeMap: Record<string, string> = {
    // 图片
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',

    // 视频
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    mkv: 'video/x-matroska',

    // 音频
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    flac: 'audio/flac',
    aac: 'audio/aac',
    m4a: 'audio/mp4',
    wma: 'audio/x-ms-wma',

    // 文档
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    rtf: 'application/rtf',

    // 压缩包
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',

    // 代码
    json: 'application/json',
    xml: 'application/xml',
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    ts: 'application/typescript',
    md: 'text/markdown'
  }
  return mimeMap[extension.toLowerCase()] || 'application/octet-stream'
}
