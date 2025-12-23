/**
 * 将路由路径转换为组件名称
 * @param path 路由路径，如 /system/user
 * @returns 组件名称，如 SystemUser
 */
export function transformPathToName(path: string): string {
  if (!path) return ''

  // 移除开头的斜杠
  let result = path.startsWith('/') ? path.slice(1) : path

  // 移除结尾的斜杠
  result = result.endsWith('/') ? result.slice(0, -1) : result

  // 按斜杠分割，每段首字母大写
  return result
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      // 转换 kebab-case 或 snake_case 到 PascalCase
      return segment
        .split(/[-_]/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
    })
    .join('')
}
