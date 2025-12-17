import type { TableProps as ElTableProps, PaginationProps, TableColumnInstance } from 'element-plus'
import type { ExtractPropTypes, VNode } from 'vue'

export type DefaultRow = Record<PropertyKey, any>

export interface TableColumnItem<T extends DefaultRow = any>
  extends Omit<TableColumnInstance['$props'], never> {
  slotName?: string
  children?: TableColumnItem[]
  render?: (scope: TableSlotScope<T>) => VNode | VNode[] | string
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
  /** 是否显示刷新按钮 */
  showRefresh?: boolean
  /** 是否显示密度调整按钮 */
  showSize?: boolean
  /** 是否显示全屏按钮 */
  showFullscreen?: boolean
  /** 是否显示列设置按钮 */
  showColumnSetting?: boolean
  /** 列设置按钮是否禁用 */
  columnSettingDisabled?: boolean
  /** 列设置禁用列的键名列表 */
  disabledColumnKeys?: string[]
  /** 表格ID，用于区分不同表格的列设置 */
  tableId?: string
  /** 刷新回调函数 */
  onRefresh?: () => void | Promise<void>
  /** 密度选项 */
  sizeOptions?: Array<{ labelKey: string; value: 'default' | 'large' | 'small' }>
}

export interface TableProps<T extends DefaultRow = any>
  extends ExtractPropTypes<ElTableProps<Record<string | number | symbol, any>>> {
  data?: T[]
  columns?: TableColumnItem[]
  pagination?: Partial<PaginationProps>
  title?: string
  tableId?: string | number
  toolbar?: ToolbarConfig
  /** 操作列配置 */
  actions?: {
    label?: string
    width?: string | number
    fixed?: boolean | 'left' | 'right'
    buttons?: Array<{
      label: string
      type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
      icon?: string
      size?: 'default' | 'large' | 'small'
      show?: (scope: { row: any; $index: number }) => boolean
      disabled?: (scope: { row: any; $index: number }) => boolean
      onClick?: (scope: { row: any; $index: number }) => void
    }>
  }
}
