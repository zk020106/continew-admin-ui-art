<template>
  <ElDropdown trigger="click" @command="handleCommand">
    <ElButton>
      <template #icon>
        <ArtSvgIcon icon="ep:setting" />
      </template>
    </ElButton>
    <template #dropdown>
      <ElDropdownMenu class="ca-table-column-setting">
        <div class="column-setting-header">
          <span>列设置</span>
          <ElButton text type="primary" size="small" @click="resetColumns"> 重置 </ElButton>
        </div>
        <div class="column-actions-bar">
          <ElButton text size="small" @click="showAllColumns"> 全选 </ElButton>
          <ElButton text size="small" @click="hideAllColumns"> 全不选 </ElButton>
        </div>
        <div class="column-list" @dragover="handleDragOver" @drop="handleDrop">
          <ElDropdownItem
            v-for="(column, index) in localColumns"
            v-show="column.visible !== false"
            :key="column.prop || index"
            :command="`toggle-${column.prop}`"
            draggable="true"
            @dragstart="handleDragStart(index)"
            @dragend="handleDragEnd"
          >
            <div class="column-item">
              <div class="column-info">
                <ElCheckbox
                  :model-value="column.visible !== false"
                  @change="(val) => setVisible(column, val)"
                />
                <ElIcon class="drag-handle">
                  <MoreFilled />
                </ElIcon>
                <span class="column-label">{{ column.label }}</span>
                <ElTag v-if="column.fixed === 'left'" size="small" type="info">左</ElTag>
                <ElTag v-if="column.fixed === 'right'" size="small" type="info">右</ElTag>
              </div>
              <div class="column-actions">
                <ElTooltip content="固定到左侧" placement="top">
                  <ElIcon
                    class="action-icon"
                    :class="{ active: column.fixed === 'left' }"
                    @click.stop="setFixed(column, 'left')"
                  >
                    <ArrowLeftBold />
                  </ElIcon>
                </ElTooltip>
                <ElTooltip content="固定到右侧" placement="top">
                  <ElIcon
                    class="action-icon"
                    :class="{ active: column.fixed === 'right' }"
                    @click.stop="setFixed(column, 'right')"
                  >
                    <ArrowRightBold />
                  </ElIcon>
                </ElTooltip>
                <ElTooltip content="取消固定" placement="top">
                  <ElIcon
                    class="action-icon"
                    :class="{ active: !column.fixed }"
                    @click.stop="setFixed(column, undefined)"
                  >
                    <Switch />
                  </ElIcon>
                </ElTooltip>
              </div>
            </div>
          </ElDropdownItem>
        </div>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>

<script setup lang="ts">
  import { MoreFilled, ArrowLeftBold, ArrowRightBold, Switch } from '@element-plus/icons-vue'
  import { ElCheckbox } from 'element-plus'
  import { onMounted } from 'vue'
  import type { TableColumnItem } from '../type'

  interface Props {
    columns: TableColumnItem[]
    disabledKeys?: string[]
    tableId?: string | number
  }

  interface Emits {
    (e: 'update:columns', columns: TableColumnItem[]): void
  }

  const props = withDefaults(defineProps<Props>(), {
    disabledKeys: () => []
  })

  const emit = defineEmits<Emits>()

  // 本地列状态
  const localColumns = ref<TableColumnItem[]>([...props.columns])
  const originalColumns = ref<TableColumnItem[]>([...props.columns])
  const draggedIndex = ref<number | null>(null)

  // 监听父组件传入的列变化
  watch(
    () => props.columns,
    (newColumns) => {
      originalColumns.value = [...newColumns]
      // 尝试从 localStorage 加载配置
      loadColumnsFromStorage()
    },
    { deep: true }
  )

  // 生成存储 key
  const getStorageKey = () => {
    if (props.tableId) {
      return `ca-table-columns-${props.tableId}`
    }
    // 如果没有传入 tableId，从当前路径生成
    const path = window.location.pathname.replace(/^\//, '').replace(/\//g, ':')
    return `ca-table-columns-${path}`
  }

  // 从 localStorage 加载列配置
  const loadColumnsFromStorage = () => {
    try {
      const key = getStorageKey()
      const saved = localStorage.getItem(key)
      if (saved) {
        const savedColumns = JSON.parse(saved)
        // 合并保存的配置和当前列
        const mergedColumns = props.columns.map((col) => {
          const savedCol = savedColumns.find((sc: TableColumnItem) => sc.prop === col.prop)
          return savedCol ? { ...col, ...savedCol } : col
        })
        localColumns.value = mergedColumns
        emit('update:columns', mergedColumns)
      }
    } catch (error) {
      console.error('Failed to load column config:', error)
    }
  }

  // 保存列配置到 localStorage
  const saveColumnsToStorage = (columns: TableColumnItem[]) => {
    try {
      const key = getStorageKey()
      const config = columns.map((col) => ({
        prop: col.prop,
        label: col.label,
        visible: col.visible,
        fixed: col.fixed
      }))
      localStorage.setItem(key, JSON.stringify(config))
    } catch (error) {
      console.error('Failed to save column config:', error)
    }
  }

  // 设置列显示/隐藏
  const setVisible = (column: TableColumnItem, visible: boolean) => {
    const index = localColumns.value.findIndex((col) => col.prop === column.prop)
    if (index > -1) {
      localColumns.value[index] = { ...localColumns.value[index], visible }
      emit('update:columns', [...localColumns.value])
      saveColumnsToStorage(localColumns.value)
    }
  }

  // 设置列固定
  const setFixed = (column: TableColumnItem, fixed?: boolean | 'left' | 'right') => {
    const index = localColumns.value.findIndex((col) => col.prop === column.prop)
    if (index > -1) {
      localColumns.value[index] = { ...localColumns.value[index], fixed }
      emit('update:columns', [...localColumns.value])
      saveColumnsToStorage(localColumns.value)
    }
  }

  // 重置列设置
  const resetColumns = () => {
    localColumns.value = [...originalColumns.value].map((col) => ({
      ...col,
      visible: true,
      fixed: undefined
    }))
    emit('update:columns', [...localColumns.value])
    // 删除 localStorage 中的配置
    try {
      const key = getStorageKey()
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove column config:', error)
    }
  }

  // 全选
  const showAllColumns = () => {
    localColumns.value = localColumns.value.map((col) => ({
      ...col,
      visible: true
    }))
    emit('update:columns', [...localColumns.value])
    saveColumnsToStorage(localColumns.value)
  }

  // 全不选
  const hideAllColumns = () => {
    localColumns.value = localColumns.value.map((col) => ({
      ...col,
      visible: false
    }))
    emit('update:columns', [...localColumns.value])
    saveColumnsToStorage(localColumns.value)
  }

  // 拖拽开始
  const handleDragStart = (index: number) => {
    draggedIndex.value = index
  }

  // 拖拽结束
  const handleDragEnd = () => {
    draggedIndex.value = null
  }

  // 拖拽悬停
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
  }

  // 拖拽放下
  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    if (draggedIndex.value === null) return

    const target = e.target as HTMLElement
    const dropdownItem = target.closest('.el-dropdown-menu .el-dropdown-menu__item')
    if (!dropdownItem) return

    const items = Array.from(dropdownItem.parentElement?.children || [])
    const targetIndex = items.indexOf(dropdownItem)

    if (targetIndex !== -1 && draggedIndex.value !== targetIndex) {
      const newColumns = [...localColumns.value]
      const [draggedColumn] = newColumns.splice(draggedIndex.value, 1)
      newColumns.splice(targetIndex, 0, draggedColumn)

      localColumns.value = newColumns
      emit('update:columns', newColumns)
      saveColumnsToStorage(newColumns)
    }

    draggedIndex.value = null
  }

  // 处理下拉菜单命令
  const handleCommand = (command: string) => {
    console.log('Command:', command)
  }

  // 组件挂载时加载配置
  onMounted(() => {
    loadColumnsFromStorage()
  })
</script>

<style lang="scss" scoped>
  .ca-table-column-setting {
    min-width: 320px;
    max-height: 500px;
  }

  .column-setting-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    font-weight: 600;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .column-actions-bar {
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .column-list {
    max-height: 350px;
    overflow-y: auto;
  }

  .column-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 4px 0;
  }

  .column-info {
    display: flex;
    flex: 1;
    gap: 6px;
    align-items: center;
    min-width: 0;

    .drag-handle {
      margin: 0 4px;
      color: var(--el-text-color-secondary);
      cursor: move;
      transition: color 0.2s;

      &:hover {
        color: var(--el-color-primary);
      }
    }

    .column-label {
      overflow: hidden;
      font-size: 12px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .column-actions {
    display: flex;
    gap: 4px;
    margin-left: 8px;

    .action-icon {
      padding: 4px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &.active {
        color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }
    }
  }

  // 拖拽时的样式
  :deep(.el-dropdown-menu__item[draggable='true']) {
    cursor: move;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &.dragging {
      background-color: var(--el-color-primary-light-9);
      opacity: 0.5;
    }
  }
</style>
