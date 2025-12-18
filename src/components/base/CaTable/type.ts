import type { TableProps as ElTableProps, PaginationProps, TableColumnInstance } from 'element-plus'
import type { ExtractPropTypes, VNode } from 'vue'

export type DefaultRow = Record<PropertyKey, any>

/** 分页器位置配置 */
export type PaginationPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

/** 工具栏按钮类型 */
export type Tools = 'refresh' | 'size' | 'fullscreen' | 'columnSetting'

/** 滚动配置 */
export interface ScrollConfig {
  x?: string | number
  y?: string | number
  minWidth?: number
}

export interface TableColumnItem<T extends DefaultRow = any>
  extends Omit<TableColumnInstance['$props'], never> {
  slotName?: string
  children?: TableColumnItem[]
  render?: (scope: TableSlotScope<T>) => VNode | VNode[] | string
  /** 是否可拖拽排序 */
  draggable?: boolean
  /** 是否显示列 */
  visible?: boolean
}

export type TableSlotScope<T extends DefaultRow = any> = {
  $index: number
  cellIndex: number
  column: TableColumnInstance['$props']
  row: T
  expanded: boolean
}

export interface ToolbarConfig {
  /** 是否显示工具栏 */
  show?: boolean
  /** 禁用工具栏按钮的键名列表（refresh, size, fullscreen, columnSetting） */
  disabledTools?: Tools[]
  /** 列设置按钮是否禁用 */
  columnSettingDisabled?: boolean
  /** 列设置禁用列的键名列表 */
  disabledColumnKeys?: string[]
  /** 表格ID，用于区分不同表格的列设置 */
  tableId?: string
  /** 密度选项 */
  sizeOptions?: Array<{ labelKey: string; value: 'default' | 'large' | 'small' }>
}

export interface TableProps<T extends DefaultRow = any>
  extends Omit<ExtractPropTypes<ElTableProps<Record<string | number | symbol, any>>>, 'height'> {
  data?: T[]
  columns?: TableColumnItem[]
  pagination?: Partial<PaginationProps>
  /** 滚动配置 */
  scroll?: ScrollConfig
  /** 分页器位置，默认 'bottom-right' */
  paginationPosition?: PaginationPosition
  title?: string
  tableId?: string | number
  toolbar?: ToolbarConfig
}
