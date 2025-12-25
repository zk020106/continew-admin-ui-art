import type { FileItem } from '@/apis/system/file'
import * as fileApi from '@/apis/system/file'
import * as multipartApi from '@/apis/system/multipart-upload'
import { ElMessage } from 'element-plus'
import type { MultipartUploadInfo, UploadStatus, UploadTask } from '../types'
import { CHUNK_SIZE, MAX_CONCURRENT_UPLOADS } from '../utils/constants'

/**
 * 文件上传 Hook
 * 支持普通上传、分片上传、断点续传
 */
export function useFileUpload() {
  // 上传任务列表
  const uploadTasks = ref<Map<string, UploadTask>>(new Map())
  // 正在上传的文件数量
  const uploadingCount = ref(0)
  // 暂停的上传 ID
  const pausedUploads = ref<Set<string>>(new Set())

  /**
   * 生成上传任务 ID
   */
  const generateTaskId = (file: File): string => {
    return `${file.name}-${file.size}-${Date.now()}`
  }

  /**
   * 计算 SHA256
   */
  const calculateSHA256 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer
          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
          resolve(hashHex)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * 检查文件是否已存在
   */
  const checkFileExists = async (sha256: string): Promise<FileItem | null> => {
    try {
      const res = await fileApi.checkFile(sha256)
      return res as unknown as FileItem
    } catch {
      return null
    }
  }

  /**
   * 初始化分片上传
   */
  const initMultipartUpload = async (
    file: File,
    sha256: string,
    parentPath: string
  ): Promise<MultipartUploadInfo | null> => {
    try {
      const req = {
        fileName: file.name,
        fileSize: file.size,
        fileMd5: sha256,
        parentPath,
        metaData: {
          contentType: file.type,
          lastModified: new Date(file.lastModified).toISOString()
        }
      }
      const res = await multipartApi.initMultipartUpload(req)
      return {
        uploadId: res.uploadId,
        partSize: res.partSize,
        totalParts: Math.ceil(file.size / res.partSize),
        uploadedParts: res.uploadedPartNumbers,
        path: res.path
      }
    } catch (error: any) {
      ElMessage.error(`初始化分片上传失败: ${error.message}`)
      return null
    }
  }

  /**
   * 上传单个分片
   */
  const uploadPart = async (
    uploadId: string,
    partNumber: number,
    chunk: Blob,
    path: string
  ): Promise<{ partNumber: number; eTag: string } | null> => {
    try {
      const res = await multipartApi.uploadPart({
        uploadId,
        partNumber,
        file: chunk,
        path
      })
      return { partNumber: res.partNumber, eTag: res.partETag }
    } catch {
      return null
    }
  }

  /**
   * 完成分片上传
   */
  const completeMultipartUpload = async (
    uploadId: string,
    partETags: Array<{ partNumber: number; eTag: string }>
  ): Promise<boolean> => {
    try {
      await multipartApi.completeMultipartUpload({ uploadId, partETags })
      return true
    } catch {
      return false
    }
  }

  /**
   * 取消分片上传
   */
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const abortMultipartUpload = async (uploadId: string): Promise<void> => {
    try {
      await multipartApi.cancelUpload({ uploadId })
    } catch {
      // ignore
    }
  }

  /**
   * 普通上传（小文件）
   */
  const uploadSmallFile = async (
    file: File,
    parentPath: string,
    taskId: string
  ): Promise<boolean> => {
    const task = uploadTasks.value.get(taskId)
    if (!task) return false

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('parentPath', parentPath)

      await fileApi.uploadFile(formData)
      ElMessage.success(`${file.name} 上传成功`)
      return true
    } catch (error: any) {
      ElMessage.error(error.message || `${file.name} 上传失败`)
      return false
    }
  }

  /**
   * 分片上传（大文件）
   */
  const uploadLargeFile = async (
    file: File,
    sha256: string,
    parentPath: string,
    taskId: string,
    onProgress?: (progress: number) => void
  ): Promise<boolean> => {
    const task = uploadTasks.value.get(taskId)
    if (!task) return false

    try {
      // 初始化分片上传
      const uploadInfo = await initMultipartUpload(file, sha256, parentPath)
      if (!uploadInfo) return false

      const { uploadId, partSize, uploadedParts } = uploadInfo

      // 计算总分片数
      const totalParts = Math.ceil(file.size / partSize)

      // 上传分片
      const partETags: Array<{ partNumber: number; eTag: string }> = []

      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        // 检查是否已暂停
        if (pausedUploads.value.has(taskId)) {
          task.status = 'paused' as UploadStatus
          return false
        }

        // 跳过已上传的分片
        if (uploadedParts.includes(partNumber)) {
          continue
        }

        const start = (partNumber - 1) * partSize
        const end = Math.min(start + partSize, file.size)
        const chunk = file.slice(start, end)

        const result = await uploadPart(uploadId, partNumber, chunk, uploadInfo.path)

        if (result) {
          partETags.push(result)
          onProgress?.(Math.round((partNumber / totalParts) * 100))
        } else {
          throw new Error(`分片 ${partNumber} 上传失败`)
        }
      }

      // 完成分片上传
      const success = await completeMultipartUpload(uploadId, partETags)
      if (success) {
        ElMessage.success(`${file.name} 上传成功`)
      }
      return success
    } catch (error: any) {
      ElMessage.error(`${file.name} 上传失败: ${error.message}`)
      return false
    }
  }

  /**
   * 上传文件
   */
  const uploadFile = async (
    file: File,
    parentPath: string,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    const taskId = generateTaskId(file)

    // 创建上传任务
    const task: UploadTask = {
      id: taskId,
      file,
      progress: 0,
      status: 'pending' as UploadStatus,
      speed: 0,
      loaded: 0,
      total: file.size,
      parentPath
    }
    uploadTasks.value.set(taskId, task)

    // 更新进度回调
    const updateProgress = (progress: number) => {
      task.progress = progress
      task.loaded = (file.size * progress) / 100
      onProgress?.(progress)
    }

    try {
      task.status = 'uploading' as UploadStatus
      uploadingCount.value++

      // 计算文件 SHA256
      const sha256 = await calculateSHA256(file)

      // 检查文件是否已存在（秒传）
      const existingFile = await checkFileExists(sha256)
      if (existingFile) {
        task.status = 'completed' as UploadStatus
        task.progress = 100
        ElMessage.success(`${file.name} 秒传成功`)
        return taskId
      }

      // 根据文件大小选择上传方式
      const isLargeFile = file.size > CHUNK_SIZE

      let success: boolean
      if (isLargeFile) {
        success = await uploadLargeFile(file, sha256, parentPath, taskId, updateProgress)
      } else {
        success = await uploadSmallFile(file, parentPath, taskId)
      }

      task.status = success ? ('completed' as UploadStatus) : ('failed' as UploadStatus)
    } catch (error: any) {
      task.status = 'failed' as UploadStatus
      task.error = error.message
      ElMessage.error(`${file.name} 上传失败: ${error.message}`)
    } finally {
      uploadingCount.value--
    }

    return taskId
  }

  /**
   * 批量上传文件
   */
  const uploadFiles = async (
    files: File[],
    parentPath: string,
    onProgress?: (taskId: string, progress: number) => void
  ): Promise<string[]> => {
    const taskIds: string[] = []

    // 并发上传，但限制并发数
    for (let i = 0; i < files.length; i += MAX_CONCURRENT_UPLOADS) {
      const batch = files.slice(i, i + MAX_CONCURRENT_UPLOADS)
      const promises = batch.map((file) =>
        uploadFile(file, parentPath, (progress) => {
          onProgress?.(uploadTasks.value.get(generateTaskId(file))!.id, progress)
        })
      )
      const ids = await Promise.all(promises)
      taskIds.push(...ids)
    }

    return taskIds
  }

  /**
   * 暂停上传
   */
  const pauseUpload = (taskId: string): void => {
    const task = uploadTasks.value.get(taskId)
    if (task && task.status === 'uploading') {
      pausedUploads.value.add(taskId)
      task.status = 'paused' as UploadStatus
    }
  }

  /**
   * 恢复上传
   */
  const resumeUpload = async (taskId: string): Promise<void> => {
    const task = uploadTasks.value.get(taskId)
    if (task && task.status === 'paused') {
      pausedUploads.value.delete(taskId)
      // TODO: 实现断点续传
      ElMessage.info('断点续传功能开发中')
    }
  }

  /**
   * 取消上传
   */
  const cancelUpload = async (taskId: string): Promise<void> => {
    const task = uploadTasks.value.get(taskId)
    if (task) {
      if (task.status === 'uploading' || task.status === 'paused') {
        pausedUploads.value.delete(taskId)
        // TODO: 取消分片上传
        // await abortMultipartUpload(uploadId)
      }
      task.status = 'cancelled' as UploadStatus
      uploadTasks.value.delete(taskId)
    }
  }

  /**
   * 重试上传
   */
  const retryUpload = async (taskId: string): Promise<void> => {
    const task = uploadTasks.value.get(taskId)
    if (task && task.status === 'failed') {
      await uploadFile(task.file, task.parentPath || '/')
    }
  }

  /**
   * 清除已完成的任务
   */
  const clearCompletedTasks = (): void => {
    for (const [id, task] of uploadTasks.value) {
      if (task.status === 'completed' || task.status === 'cancelled') {
        uploadTasks.value.delete(id)
      }
    }
  }

  /**
   * 获取上传进度
   */
  const getUploadProgress = (taskId: string): number => {
    const task = uploadTasks.value.get(taskId)
    return task?.progress || 0
  }

  return {
    uploadTasks,
    uploadingCount,
    uploadFile,
    uploadFiles,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    retryUpload,
    clearCompletedTasks,
    getUploadProgress
  }
}
