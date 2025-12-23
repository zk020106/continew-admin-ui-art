import { computed } from 'vue'

/**
 * 组件路径选项 Hook
 * 用于获取常用的组件路径列表，方便下拉选择
 */
export function useComponentPaths() {
  // 常用组件路径前缀（基于项目 views 目录结构）
  const componentPathPrefixes = computed(() => [
    // 系统管理
    { value: '/system/user', label: '/system/user - 用户管理' },
    { value: '/system/role', label: '/system/role - 角色管理' },
    { value: '/system/menu', label: '/system/menu - 菜单管理' },
    { value: '/system/dept', label: '/system/dept - 部门管理' },
    { value: '/system/user-center', label: '/system/user-center - 个人中心' },
    // 仪表盘
    { value: '/dashboard/console', label: '/dashboard/console - 控制台' },
    // 结果页
    { value: '/result/success', label: '/result/success - 成功页' },
    { value: '/result/fail', label: '/result/fail - 失败页' },
    // 异常页
    { value: '/exception/403', label: '/exception/403 - 无权限' },
    { value: '/exception/404', label: '/exception/404 - 页面不存在' },
    { value: '/exception/500', label: '/exception/500 - 服务器错误' }
  ])

  // 用于 ElSelect 的 options 格式
  const componentOptions = computed(() =>
    componentPathPrefixes.value.map((item) => ({
      value: item.value,
      label: item.value
    }))
  )

  return {
    componentPathPrefixes,
    componentOptions
  }
}
