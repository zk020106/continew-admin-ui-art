import http from '@/utils/http'
import type * as T from './type'

export type * from './type'

const BASE_URL = '/system/file'

/** @desc 上传文件 */
export function uploadFile(data: FormData) {
  return http.post(`${BASE_URL}/upload`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/** @desc 查询文件列表 */
export function listFile(query: T.FilePageQuery) {
  return http.get<PageRes<T.FileItem[]>>(`${BASE_URL}`, query)
}

/** @desc 查询文件详情 */
export function getFile(id: string) {
  return http.get<T.FileItem>(`${BASE_URL}/${id}`)
}

/** @desc 修改文件 */
export function updateFile(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除文件 */
export function deleteFile(ids: string[]) {
  return http.del(`${BASE_URL}`, { ids })
}

/** @desc 查询文件资源统计统计 */
export function getFileStatistics() {
  return http.get<T.FileStatisticsResp>(`${BASE_URL}/statistics`)
}

/** @desc 根据sha256检测文件是否已经在服务器存在 */
export function checkFile(sha256: string) {
  return http.get<T.FileItem>(`${BASE_URL}/check`, { fileHash: sha256 })
}

/** @desc 创建文件夹 */
export function createDir(parentPath: string, name: string) {
  return http.post<T.FileItem>(`${BASE_URL}/dir`, { parentPath, originalName: name })
}

/** @desc 查询文件夹大小 */
export function calcDirSize(id: string) {
  return http.get<T.FileDirCalcSizeResp>(`${BASE_URL}/dir/${id}/size`)
}

/** @desc 获取文件下载URL */
export function getDownloadUrl(id: string, name: string) {
  return http.get<{ url: string }>(`${BASE_URL}/${id}/download`, { name })
}

/** @desc 移动文件 */
export function moveFile(data: { ids: string[]; targetPath: string }) {
  return http.post(`${BASE_URL}/move`, data)
}

/** @desc 复制文件 */
export function copyFile(data: { ids: string[]; targetPath: string }) {
  return http.post(`${BASE_URL}/copy`, data)
}

/** @desc 创建分享链接 */
export function createShare(data: {
  fileId: string
  needPassword?: boolean
  password?: string
  expireDays?: number
}) {
  return http.post<{ shareCode: string; shareUrl: string }>(`${BASE_URL}/share`, data)
}

/** @desc 获取分享文件信息 */
export function getShareInfo(shareCode: string) {
  return http.get<T.FileItem>(`${BASE_URL}/share/${shareCode}`)
}

/** @desc 发送文件给用户 */
export function sendToUser(data: { fileIds: string[]; userIds: string[]; message?: string }) {
  return http.post(`${BASE_URL}/send`, data)
}
