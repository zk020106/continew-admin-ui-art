import type { FileOperationOptions, MoveCopyOptions } from '../types'
import type { FileItem } from '@/apis/system/file'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as fileApi from '@/apis/system/file'

/**
 * 文件操作 Hook
 * 处理文件的增删改查、移动、复制等操作
 */
export function useFileOperations() {
  const loading = ref(false)
  const operatingIds = ref<Set<string>>(new Set())

  /**
   * 设置文件操作状态
   */
  const setOperating = (id: string, isOperating: boolean) => {
    if (isOperating) {
      operatingIds.value.add(id)
    } else {
      operatingIds.value.delete(id)
    }
  }

  /**
   * 检查文件是否正在操作
   */
  const isOperating = (id: string): boolean => {
    return operatingIds.value.has(id)
  }

  /**
   * 获取文件详情
   */
  const getFileDetail = async (id: string): Promise<FileItem | null> => {
    try {
      const res = await fileApi.getFile(id)
      return res as unknown as FileItem
    } catch (error: any) {
      ElMessage.error(error.message || '获取文件详情失败')
      return null
    }
  }

  /**
   * 创建文件夹
   */
  const createFolder = async (
    parentPath: string,
    name: string,
    options?: FileOperationOptions
  ): Promise<boolean> => {
    if (!options?.skipConfirm) {
      try {
        await ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[^/\\:*?"<>|]+$/,
          inputErrorMessage: '文件夹名称不能包含 / \\ : * ? " < > | 字符',
          inputValue: name
        })
      } catch {
        return false
      }
    }

    loading.value = true
    try {
      await fileApi.createDir(parentPath, name)
      ElMessage.success('文件夹创建成功')
      options?.onSuccess?.()
      return true
    } catch (error: any) {
      ElMessage.error(error.message || '文件夹创建失败')
      options?.onError?.(error)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 重命名文件
   */
  const renameFile = async (
    file: FileItem,
    newName: string,
    options?: FileOperationOptions
  ): Promise<boolean> => {
    if (!options?.skipConfirm) {
      try {
        const { value } = await ElMessageBox.prompt('请输入新名称', '重命名', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /^[^/\\:*?"<>|]+$/,
          inputErrorMessage: '名称不能包含 / \\ : * ? " < > | 字符',
          inputValue: newName
        })
        newName = value
      } catch {
        return false
      }
    }

    setOperating(file.id, true)
    try {
      await fileApi.updateFile({ originalName: newName }, file.id)
      ElMessage.success('重命名成功')
      options?.onSuccess?.()
      return true
    } catch (error: any) {
      ElMessage.error(error.message || '重命名失败')
      options?.onError?.(error)
      return false
    } finally {
      setOperating(file.id, false)
    }
  }

  /**
   * 删除单个文件
   */
  const deleteFile = async (file: FileItem, options?: FileOperationOptions): Promise<boolean> => {
    const isFolder = file.type === 0
    const message = isFolder
      ? `确定要删除文件夹 "${file.originalName}" 及其所有内容吗？`
      : `确定要删除文件 "${file.originalName}" 吗？`

    if (!options?.skipConfirm) {
      try {
        await ElMessageBox.confirm(message, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch {
        return false
      }
    }

    setOperating(file.id, true)
    try {
      await fileApi.deleteFile([file.id])
      ElMessage.success('删除成功')
      options?.onSuccess?.()
      return true
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
      options?.onError?.(error)
      return false
    } finally {
      setOperating(file.id, false)
    }
  }

  /**
   * 批量删除文件
   */
  const deleteFiles = async (
    files: FileItem[],
    options?: FileOperationOptions
  ): Promise<boolean> => {
    if (files.length === 0) return false

    const message = `确定要删除选中的 ${files.length} 个文件吗？`

    if (!options?.skipConfirm) {
      try {
        await ElMessageBox.confirm(message, '批量删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
      } catch {
        return false
      }
    }

    loading.value = true
    try {
      const ids = files.map((f) => f.id)
      await fileApi.deleteFile(ids)
      ElMessage.success(`成功删除 ${ids.length} 个文件`)
      options?.onSuccess?.()
      return true
    } catch (error: any) {
      ElMessage.error(error.message || '删除失败')
      options?.onError?.(error)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 下载单个文件
   */
  const downloadFile = async (file: FileItem): Promise<void> => {
    try {
      if (file.url) {
        // 直接打开 URL
        window.open(file.url, '_blank')
      } else {
        // 获取下载 URL
        const res = await fileApi.getDownloadUrl(file.id, file.originalName)
        const url = (res as any).url || res.url
        if (url) {
          window.open(url, '_blank')
        }
      }
    } catch (error: any) {
      ElMessage.error(error.message || '下载失败')
    }
  }

  /**
   * 批量下载文件
   */
  const downloadFiles = async (files: FileItem[]): Promise<void> => {
    if (files.length === 0) return

    if (files.length === 1) {
      await downloadFile(files[0])
      return
    }

    // TODO: 实现批量下载（需要后端支持打包下载）
    ElMessage.info('批量下载功能开发中，请逐个下载')
  }

  /**
   * 移动文件（暂时未实现）
   */
  const moveFile = async (
    _file: FileItem,
    _options: MoveCopyOptions,
    _operationOptions?: FileOperationOptions
  ): Promise<boolean> => {
    // TODO: 实现文件移动（需要后端 API 支持）
    ElMessage.info('文件移动功能开发中')
    return false
  }

  /**
   * 复制文件（暂时未实现）
   */
  const copyFile = async (
    _file: FileItem,
    _options: MoveCopyOptions,
    _operationOptions?: FileOperationOptions
  ): Promise<boolean> => {
    // TODO: 实现文件复制（需要后端 API 支持）
    ElMessage.info('文件复制功能开发中')
    return false
  }

  /**
   * 批量移动文件（暂时未实现）
   */
  const moveFiles = async (
    _files: FileItem[],
    _options: MoveCopyOptions,
    _operationOptions?: FileOperationOptions
  ): Promise<boolean> => {
    // TODO: 实现批量移动（需要后端 API 支持）
    ElMessage.info('批量移动功能开发中')
    return false
  }

  /**
   * 批量复制文件（暂时未实现）
   */
  const copyFiles = async (
    _files: FileItem[],
    _options: MoveCopyOptions,
    _operationOptions?: FileOperationOptions
  ): Promise<boolean> => {
    // TODO: 实现批量复制（需要后端 API 支持）
    ElMessage.info('批量复制功能开发中')
    return false
  }

  /**
   * 检查文件是否存在（根据 SHA256）
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
   * 计算文件夹大小
   */
  const calculateFolderSize = async (folderId: string): Promise<number> => {
    try {
      const res = await fileApi.calcDirSize(folderId)
      return (res as any).size || 0
    } catch {
      return 0
    }
  }

  return {
    loading,
    operatingIds,
    isOperating,
    getFileDetail,
    createFolder,
    renameFile,
    deleteFile,
    deleteFiles,
    downloadFile,
    downloadFiles,
    moveFile,
    copyFile,
    moveFiles,
    copyFiles,
    checkFileExists,
    calculateFolderSize
  }
}
