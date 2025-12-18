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
        <div class="column-list" @dragover="handleDragOver" @drop="handleDrop">
          <ElDropdownItem
            v-for="(column, index) in localColumns"
            :key="column.prop || index"
            :command="`toggle-${column.prop}`"
            draggable="true"
            @dragstart="handleDragStart(index)"
            @dragend="handleDragEnd"
          >
            <div class="column-item">
              <div class="column-info">
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
                    <PushLeft />
                  </ElIcon>
                </ElTooltip>
                <ElTooltip content="固定到右侧" placement="top">
                  <ElIcon
                    class="action-icon"
                    :class="{ active: column.fixed === 'right' }"
                    @click.stop="setFixed(column, 'right')"
                  >
                    <PushRight />
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
  import { MoreFilled, PushLeft, PushRight, Switch } from '@element-plus/icons-vue'
  import type { TableColumnItem } from '../type'

  interface Props {
    columns: TableColumnItem[]
    disabledKeys?: string[]
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
  const draggedIndex = ref<number | null>(null)

  // 监听父组件传入的列变化
  watch(
    () => props.columns,
    (newColumns) => {
      localColumns.value = [...newColumns]
    },
    { deep: true }
  )

  // 设置列固定
  const setFixed = (column: TableColumnItem, fixed?: boolean | 'left' | 'right') => {
    const index = localColumns.value.findIndex((col) => col.prop === column.prop)
    if (index > -1) {
      localColumns.value[index] = { ...localColumns.value[index], fixed }
      emit('update:columns', [...localColumns.value])
    }
  }

  // 重置列设置
  const resetColumns = () => {
    localColumns.value = [...props.columns].map((col) => ({
      ...col,
      fixed: undefined
    }))
    emit('update:columns', [...localColumns.value])
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
    }

    draggedIndex.value = null
  }

  // 处理下拉菜单命令
  const handleCommand = (command: string) => {
    // 这里可以处理其他命令
    console.log('Command:', command)
  }
</script>

<style lang="scss" scoped>
  .ca-table-column-setting {
    min-width: 300px;
    max-height: 400px;
    overflow-y: auto;
  }

  .column-setting-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    font-weight: 600;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .column-list {
    max-height: 300px;
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
      margin-right: 4px;
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
