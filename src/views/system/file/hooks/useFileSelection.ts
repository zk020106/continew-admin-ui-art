import type { FileItem } from '@/apis/system/file'
import type { SelectionMode } from '../types'

/**
 * 文件选择 Hook
 * 处理单选、多选、全选、范围选择等
 */
export function useFileSelection(mode: Ref<SelectionMode>) {
  // 选中的文件 ID 列表
  const selectedIds = ref<string[]>([])
  // 最后选中的文件 ID（用于范围选择）
  const lastSelectedId = ref<string>()
  // 范围选择起始 ID
  const rangeStartId = ref<string>()

  /**
   * 获取选中的文件列表
   */
  const getSelectedFiles = (allFiles: FileItem[]): FileItem[] => {
    return allFiles.filter((file) => selectedIds.value.includes(file.id))
  }

  /**
   * 获取选中文件的总大小
   */
  const getSelectedTotalSize = (allFiles: FileItem[]): number => {
    return getSelectedFiles(allFiles).reduce((sum, file) => sum + (file.size || 0), 0)
  }

  /**
   * 选择单个文件
   */
  const selectOne = (id: string, allFiles: FileItem[], event?: MouseEvent | KeyboardEvent) => {
    if (mode.value === 'none') return

    // Ctrl/Cmd + 点击：切换选择
    if (event && (event.ctrlKey || event.metaKey)) {
      toggleSelection(id)
    }
    // Shift + 点击：范围选择
    else if (event && event.shiftKey && rangeStartId.value) {
      selectRange(id, allFiles)
    }
    // 普通点击：单选
    else {
      if (mode.value === 'single') {
        selectedIds.value = [id]
      } else {
        // 如果已选中且不是多选模式，则取消其他选择
        if (!selectedIds.value.includes(id)) {
          selectedIds.value = [id]
        }
      }
      rangeStartId.value = id
    }
    lastSelectedId.value = id
  }

  /**
   * 切换选择状态
   */
  const toggleSelection = (id: string) => {
    const index = selectedIds.value.indexOf(id)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    } else {
      selectedIds.value.push(id)
    }
  }

  /**
   * 范围选择
   */
  const selectRange = (endId: string, allFiles: FileItem[]) => {
    if (!rangeStartId.value) {
      selectedIds.value = [endId]
      rangeStartId.value = endId
      return
    }

    const startIndex = allFiles.findIndex((f) => f.id === rangeStartId.value)
    const endIndex = allFiles.findIndex((f) => f.id === endId)

    if (startIndex === -1 || endIndex === -1) return

    const min = Math.min(startIndex, endIndex)
    const max = Math.max(startIndex, endIndex)

    const rangeIds = allFiles.slice(min, max + 1).map((f) => f.id)
    selectedIds.value = rangeIds
  }

  /**
   * 全选
   */
  const selectAll = (allFiles: FileItem[]) => {
    if (mode.value === 'none') return
    selectedIds.value = allFiles.map((f) => f.id)
    rangeStartId.value = allFiles[0]?.id
  }

  /**
   * 反选
   */
  const invertSelection = (allFiles: FileItem[]) => {
    if (mode.value === 'none') return
    // const allIds = new Set(allFiles.map((f) => f.id))
    const newSelected = allFiles.filter((f) => !selectedIds.value.includes(f.id)).map((f) => f.id)
    selectedIds.value = newSelected
  }

  /**
   * 清空选择
   */
  const clearSelection = () => {
    selectedIds.value = []
    lastSelectedId.value = undefined
    rangeStartId.value = undefined
  }

  /**
   * 检查是否已选中
   */
  const isSelected = (id: string): boolean => {
    return selectedIds.value.includes(id)
  }

  /**
   * 获取选中数量
   */
  const selectedCount = computed(() => selectedIds.value.length)

  /**
   * 是否有任何选中
   */
  const hasSelection = computed(() => selectedIds.value.length > 0)

  /**
   * 是否全选
   */
  const isAllSelected = (allFiles: FileItem[]): boolean => {
    return allFiles.length > 0 && selectedIds.value.length === allFiles.length
  }

  /**
   * 是否部分选中
   */
  const isPartiallySelected = (allFiles: FileItem[]): boolean => {
    return selectedIds.value.length > 0 && selectedIds.value.length < allFiles.length
  }

  /**
   * 判断选中状态的复选框状态
   */
  const getCheckboxState = (allFiles: FileItem[]): 'checked' | 'indeterminate' | 'unchecked' => {
    if (selectedIds.value.length === 0) return 'unchecked'
    if (selectedIds.value.length === allFiles.length) return 'checked'
    return 'indeterminate'
  }

  return {
    selectedIds,
    lastSelectedId,
    selectedCount,
    hasSelection,
    getSelectedFiles,
    getSelectedTotalSize,
    selectOne,
    selectAll,
    invertSelection,
    clearSelection,
    isSelected,
    isAllSelected,
    isPartiallySelected,
    getCheckboxState
  }
}
