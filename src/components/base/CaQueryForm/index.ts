/**
 * CaQueryForm 组件入口
 * @description 支持两种查询模式的查询表单组件
 * @module components/base/CaQueryForm
 */

import CaQueryForm from './index.vue'
import type { FormColumnItem } from '@/components/base/CaForm/type'
import type { QueryFormEmits, QueryFormExpose, QueryFormMode } from './type'

// 导出组件
export { CaQueryForm }

// 导出类型
export type { FormColumnItem, QueryFormEmits, QueryFormExpose, QueryFormMode }

// 默认导出
export default CaQueryForm
