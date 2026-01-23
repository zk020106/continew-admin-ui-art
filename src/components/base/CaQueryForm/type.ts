import type { FormColumnItem } from '@/components/base/CaForm/type'

export type QueryFormMode = 'change-search' | 'click-search'

export interface QueryFormEmits<T = any> {
  /**
   * 表单数据更新事件
   */
  'update:modelValue': [value: T]
  /**
   * 查询事件
   */
  'search': [params: T]
  /**
   * 重置事件
   */
  'reset': []
}

export type QueryFormExpose = {
  /**
   * 手动触发查询
   */
  search: () => void
  /**
   * 重置表单
   */
  reset: () => void
  /**
   * 表单引用
   */
  formRef?: any
}

// 导出 FormColumnItem 供外部使用
export type { FormColumnItem }
