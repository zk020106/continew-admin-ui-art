/**
 * v-auth 权限指令
 *
 * 适用于后端权限控制模式，基于权限标识控制 DOM 元素的显示和隐藏。
 * 如果用户没有对应权限，元素将从 DOM 中移除。
 *
 * ## 主要功能
 *
 * - 权限验证 - 根据路由 meta 中的权限列表验证用户权限
 * - DOM 控制 - 无权限时自动移除元素，而非隐藏
 * - 响应式更新 - 权限变化时自动更新元素状态
 *
 * ## 使用示例
 *
 * ```vue
 * <!-- 单个权限 - 只有拥有 'system:role:update' 权限的用户才能看到编辑按钮 -->
 * <el-button v-auth="'system:role:update'">编辑</el-button>
 *
 * <!-- 多个权限 - 拥有其中任一权限即可看到 -->
 * <el-button v-auth="['home:btn:edit','home:btn:delete']">操作</el-button>
 * ```
 *
 * ## 注意事项
 *
 * - 该指令会直接移除 DOM 元素，而不是使用 v-if 隐藏
 * - 权限列表从当前路由的 meta.authList 中获取
 *
 * @module directives/auth
 * @author Art Design Pro Team
 */

import has from '@/utils/sys/permission'
import { App, Directive, DirectiveBinding } from 'vue'

interface AuthBinding extends DirectiveBinding {
  value: string | string[]
}
function checkAuthPermission(el: HTMLElement, binding: AuthBinding): void {
  const { value } = binding

  if (value && Array.isArray(value) && value.length) {
    // 使用工具类的 hasPermOr 方法验证权限
    const hasPermission = has.hasPermOr(value)
    if (!hasPermission) {
      removeElement(el)
    }
  } else if (value && typeof value === 'string') {
    // 单个权限验证
    const hasPermission = has.hasPerm(value)
    if (!hasPermission) {
      removeElement(el)
    }
  } else {
    throw new Error(
      `need permission! Like v-auth="'system:role:update'" or v-auth="['home:btn:edit','home:btn:delete']"`
    )
  }
}

function removeElement(el: HTMLElement): void {
  if (el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

const authDirective: Directive = {
  mounted: checkAuthPermission,
  updated: checkAuthPermission
}

export function setupAuthDirective(app: App): void {
  app.directive('auth', authDirective)
}
