import type { ContextMenuAction, ContextMenuItem } from '../types'
import type { FileItem } from '@/apis/system/file'
import {
  DEFAULT_CONTEXT_MENU_ITEMS,
  EMPTY_CONTEXT_MENU_ITEMS,
  FOLDER_CONTEXT_MENU_ITEMS,
  MULTI_SELECT_CONTEXT_MENU_ITEMS
} from '../utils/constants'

/**
 * 文件右键菜单 Hook
 */
export function useFileContextMenu() {
  // 菜单显示状态
  const visible = ref(false)
  // 菜单位置
  const position = ref({ x: 0, y: 0 })
  // 当前菜单项
  const menuItems = ref<ContextMenuItem[]>([])
  // 关联的文件
  const targetFile = ref<FileItem | null>(null)
  // 关联的文件列表（多选）
  const targetFiles = ref<FileItem[]>([])
  // 是否为空白区域
  const isEmptyArea = ref(false)

  /**
   * 显示右键菜单
   */
  const showContextMenu = (event: MouseEvent, files: FileItem[], isEmpty = false) => {
    event.preventDefault()
    event.stopPropagation()

    // 获取鼠标位置
    const x = event.clientX
    const y = event.clientY

    // 确保菜单不会超出视口
    const menuWidth = 200
    const menuHeight = 300
    const adjustedX = x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : x
    const adjustedY = y + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 10 : y

    position.value = { x: adjustedX, y: adjustedY }
    isEmptyArea.value = isEmpty
    targetFiles.value = files
    targetFile.value = files.length === 1 ? files[0] : null

    // 根据情况选择菜单项
    if (isEmpty) {
      menuItems.value = EMPTY_CONTEXT_MENU_ITEMS
    } else if (files.length > 1) {
      menuItems.value = MULTI_SELECT_CONTEXT_MENU_ITEMS
    } else if (files[0]?.type === 0) {
      menuItems.value = FOLDER_CONTEXT_MENU_ITEMS
    } else {
      menuItems.value = DEFAULT_CONTEXT_MENU_ITEMS
    }

    visible.value = true
  }

  /**
   * 隐藏右键菜单
   */
  const hideContextMenu = () => {
    visible.value = false
    targetFile.value = null
    targetFiles.value = []
    isEmptyArea.value = false
  }

  /**
   * 处理菜单项点击
   */
  const handleMenuClick = (action: ContextMenuAction) => {
    hideContextMenu()
    return action
  }

  /**
   * 判断操作是否可用
   */
  const isActionEnabled = (action: ContextMenuAction): boolean => {
    const item = menuItems.value.find((i) => i.action === action)
    return item ? !item.disabled : false
  }

  /**
   * 根据文件类型自定义菜单项
   */
  const customizeMenuItems = (
    customItems: ContextMenuItem[] | ((items: ContextMenuItem[]) => ContextMenuItem[])
  ) => {
    if (typeof customItems === 'function') {
      menuItems.value = customItems(menuItems.value)
    } else {
      menuItems.value = customItems
    }
  }

  /**
   * 添加菜单项
   */
  const addMenuItem = (item: ContextMenuItem, insertAfter?: ContextMenuAction) => {
    if (insertAfter !== undefined) {
      const index = menuItems.value.findIndex((i) => i.action === insertAfter)
      if (index !== -1) {
        menuItems.value.splice(index + 1, 0, item)
      } else {
        menuItems.value.push(item)
      }
    } else {
      menuItems.value.push(item)
    }
  }

  /**
   * 移除菜单项
   */
  const removeMenuItem = (action: ContextMenuAction) => {
    menuItems.value = menuItems.value.filter((i) => i.action !== action)
  }

  /**
   * 修改菜单项
   */
  const updateMenuItem = (action: ContextMenuAction, updates: Partial<ContextMenuItem>) => {
    const index = menuItems.value.findIndex((i) => i.action === action)
    if (index !== -1) {
      menuItems.value[index] = { ...menuItems.value[index], ...updates }
    }
  }

  // 监听全局点击事件，关闭菜单
  onMounted(() => {
    document.addEventListener('click', hideContextMenu)
    document.addEventListener('contextmenu', hideContextMenu)
  })

  onUnmounted(() => {
    document.removeEventListener('click', hideContextMenu)
    document.removeEventListener('contextmenu', hideContextMenu)
  })

  return {
    visible,
    position,
    menuItems,
    targetFile,
    targetFiles,
    isEmptyArea,
    showContextMenu,
    hideContextMenu,
    handleMenuClick,
    isActionEnabled,
    customizeMenuItems,
    addMenuItem,
    removeMenuItem,
    updateMenuItem
  }
}
