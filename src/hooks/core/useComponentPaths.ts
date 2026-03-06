import { computed } from 'vue'

/**
 * 组件路径选项 Hook
 * 用于获取常用的组件路径列表，方便下拉选择
 */
export function useComponentPaths() {
  const componentPathPrefixes = computed(() => [
    { value: '/system/user', label: '/system/user - 用户管理' },
    { value: '/system/role', label: '/system/role - 角色管理' },
    { value: '/system/menu', label: '/system/menu - 菜单管理' },
    { value: '/system/dept', label: '/system/dept - 部门管理' },
    { value: '/system/user-center', label: '/system/user-center - 个人中心' },
    { value: '/dashboard/workplace', label: '/dashboard/workplace - 工作台' },
    { value: '/dashboard/analysis', label: '/dashboard/analysis - 数据分析' },
    { value: '/result/success', label: '/result/success - 成功页' },
    { value: '/result/fail', label: '/result/fail - 失败页' },
    { value: '/exception/403', label: '/exception/403 - 无权限' },
    { value: '/exception/404', label: '/exception/404 - 页面不存在' },
    { value: '/exception/500', label: '/exception/500 - 服务器错误' }
  ])

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
