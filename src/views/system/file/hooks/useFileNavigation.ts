import type { NavigationHistory, SortInfo } from '../types'
import { STORAGE_KEYS } from '../utils/constants'

/**
 * 文件导航 Hook
 * 处理目录导航、面包屑、历史记录等
 */
export function useFileNavigation() {
  // 当前路径
  const currentPath = ref('/')
  // 导航历史栈
  const historyStack = ref<string[]>(['/'])
  // 历史索引
  const historyIndex = ref(0)
  // 排序信息
  const sortInfo = ref<SortInfo>({
    field: 'createTime',
    order: 'desc'
  })

  // 路径列表（用于面包屑）
  const pathSegments = computed(() => {
    if (currentPath.value === '/') return []
    const parts = currentPath.value.split('/').filter(Boolean)
    return parts.map((part, index) => ({
      name: part,
      path: '/' + parts.slice(0, index + 1).join('/')
    }))
  })

  // 导航历史信息
  const navigationHistory = computed<NavigationHistory>(() => ({
    path: currentPath.value,
    name: pathSegments.value[pathSegments.value.length - 1]?.name || '根目录',
    canBack: historyIndex.value > 0,
    canForward: historyIndex.value < historyStack.value.length - 1
  }))

  /**
   * 跳转到指定路径
   */
  const navigateTo = (path: string, addToHistory = true) => {
    currentPath.value = path

    if (addToHistory) {
      // 如果当前不在历史末尾，则删除当前位置之后的所有历史
      if (historyIndex.value < historyStack.value.length - 1) {
        historyStack.value = historyStack.value.slice(0, historyIndex.value + 1)
      }
      historyStack.value.push(path)
      historyIndex.value = historyStack.value.length - 1
    }

    // 保存最近访问路径
    saveRecentPath(path)
  }

  /**
   * 返回上一级
   */
  const navigateBack = () => {
    const segments = pathSegments.value
    if (segments.length > 0) {
      const parentPath = segments[segments.length - 2]?.path || '/'
      navigateTo(parentPath)
    }
  }

  /**
   * 后退
   */
  const goBack = () => {
    if (navigationHistory.value.canBack && historyIndex.value > 0) {
      historyIndex.value--
      const path = historyStack.value[historyIndex.value]
      currentPath.value = path
    }
  }

  /**
   * 前进
   */
  const goForward = () => {
    if (navigationHistory.value.canForward && historyIndex.value < historyStack.value.length - 1) {
      historyIndex.value++
      const path = historyStack.value[historyIndex.value]
      currentPath.value = path
    }
  }

  /**
   * 刷新当前目录
   */
  const refresh = () => {
    // 通过 emit 或回调触发父组件刷新
    navigateTo(currentPath.value, false)
  }

  /**
   * 设置排序
   */
  const setSort = (field: SortInfo['field'], order?: SortInfo['order']) => {
    const currentOrder = sortInfo.value.order
    sortInfo.value = {
      field,
      order:
        order !== undefined
          ? order
          : field === sortInfo.value.field
            ? currentOrder === 'asc'
              ? 'desc'
              : 'asc'
            : 'desc'
    }
    // 保存排序偏好
    localStorage.setItem(STORAGE_KEYS.SORT_PREFERENCE, JSON.stringify(sortInfo.value))
  }

  /**
   * 保存最近访问路径
   */
  const saveRecentPath = (path: string) => {
    try {
      const recent = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_PATHS) || '[]') as string[]
      // 移除已存在的路径
      const filtered = recent.filter((p) => p !== path)
      // 添加到开头
      filtered.unshift(path)
      // 只保留最近 10 条
      const limited = filtered.slice(0, 10)
      localStorage.setItem(STORAGE_KEYS.RECENT_PATHS, JSON.stringify(limited))
    } catch {
      // ignore
    }
  }

  /**
   * 获取最近访问路径
   */
  const getRecentPaths = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_PATHS) || '[]') as string[]
    } catch {
      return []
    }
  }

  /**
   * 初始化排序偏好
   */
  const initSortPreference = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SORT_PREFERENCE)
      if (saved) {
        sortInfo.value = JSON.parse(saved) as SortInfo
      }
    } catch {
      // ignore
    }
  }

  // 初始化时加载排序偏好
  onMounted(() => {
    initSortPreference()
  })

  return {
    currentPath,
    pathSegments,
    navigationHistory,
    sortInfo,
    navigateTo,
    navigateBack,
    goBack,
    goForward,
    refresh,
    setSort,
    getRecentPaths
  }
}
