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
type Tools = 'refresh' | 'size' | 'fullscreen' | 'columnSetting'
export interface TableProps<T extends DefaultRow = any>
  extends ExtractPropTypes<ElTableProps<Record<string | number | symbol, any>>> {
  data?: T[]
  columns?: TableColumnItem[]
  pagination?: Partial<PaginationProps>
  title?: string
  tableId?: string | number
  /** 列设置禁用列的键名列表 */
  disabledColumnKeys?: string[]
  disabledTools: Tools[]
}
