<template>
  <ElDropdown ref="dropdownRef" trigger="click" @visible-change="handleVisibleChange">
    <ElButton>
      <template #icon>
        <ArtSvgIcon icon="ep:setting" />
      </template>
    </ElButton>

    <template #dropdown>
      <ElDropdownMenu>
        <!-- Header -->
        <div class="column-setting-header">
          <ElCheckbox
            :model-value="allSelected"
            :indeterminate="indeterminate"
            @change="handleSelectAll"
          >
            {{ $t('table.selectAll') }}
          </ElCheckbox>

          <ElButton text type="primary" size="small" @click="resetColumns">
            {{ $t('table.reset') }}
          </ElButton>
        </div>

        <!-- Column List -->
        <div class="column-list" @dragover.prevent @drop="handleDrop">
          <ElDropdownItem
            v-for="(column, index) in localColumns"
            :key="column.prop || index"
            class="column-item"
            :draggable="!isDisabled(column)"
            :disabled="isDisabled(column)"
            @dragstart="handleDragStart(index)"
            @dragend="handleDragEnd"
          >
            <div class="column-info">
              <ElIcon class="drag-handle">
                <MoreFilled />
              </ElIcon>

              <ElCheckbox
                :model-value="column.visible !== false"
                :disabled="isDisabled(column)"
                @change="(val) => setVisible(column, val)"
                @click.stop
              >
                {{ column.label }}
              </ElCheckbox>
            </div>

            <div class="column-actions">
              <ElIcon
                size="18"
                class="action-icon"
                :class="{ active: column.fixed === 'left' }"
                @click.stop="setFixed(column, 'left')"
              >
                <ArrowLeftBold />
              </ElIcon>

              <ElIcon
                size="18"
                class="action-icon"
                :class="{ active: column.fixed === 'right' }"
                @click.stop="setFixed(column, 'right')"
              >
                <ArrowRightBold />
              </ElIcon>

              <ElIcon
                size="18"
                class="action-icon"
                :class="{ active: !column.fixed }"
                @click.stop="setFixed(column, undefined)"
              >
                <Switch />
              </ElIcon>
            </div>
          </ElDropdownItem>
        </div>

        <!-- Footer -->
        <div class="column-setting-footer">
          <CaButton type="cancel" @click="handleCancel" />
          <CaButton type="confirm" @click="handleSave" />
        </div>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
<script setup lang="ts">
  import { ArrowLeftBold, ArrowRightBold, MoreFilled, Switch } from '@element-plus/icons-vue'
  import {
    CheckboxValueType,
    ElButton,
    ElCheckbox,
    ElDropdown,
    ElDropdownItem,
    ElDropdownMenu,
    ElIcon
  } from 'element-plus'
  import { computed, ref } from 'vue'
  import type { TableColumnItem } from '../type'

  /**
   * 列设置组件Props
   * @property columns - 表格列配置数组
   * @property disabledKeys - 禁用列的prop键名列表（这些列不允许隐藏或拖拽）
   * @property tableId - 表格唯一标识，用于本地存储键名区分
   */
  interface Props {
    columns: TableColumnItem[]
    disabledKeys?: string[]
    tableId?: string | number
  }

  const props = withDefaults(defineProps<Props>(), {
    disabledKeys: () => []
  })
  const dropdownRef = useTemplateRef('dropdownRef')
  /**
   * 事件发射器
   * @event update:columns - 列配置变更时触发，传递新的列配置数组
   */
  const emit = defineEmits<{
    (e: 'update:columns', v: TableColumnItem[]): void
  }>()

  /* ================= 响应式状态 ================= */

  // 本地列配置副本，修改操作在此数组上进行
  const localColumns = ref<TableColumnItem[]>([])
  // 下拉框打开时的列配置快照，用于取消操作时恢复
  const snapshotColumns = ref<TableColumnItem[]>([])
  // 当前拖拽的列索引
  const draggedIndex = ref<number | null>(null)

  /* ================= 工具方法 ================= */

  /**
   * 判断列是否禁用
   * @param col - 列配置项
   * @returns 是否禁用
   */
  const isDisabled = (col: TableColumnItem) => props.disabledKeys.includes(col.prop!)

  /**
   * 获取本地存储键名
   * @returns 存储键名字符串
   */
  const getStorageKey = () => {
    return `ca-table-columns-${props.tableId}`
  }

  /* ================= 本地存储管理 ================= */

  /**
   * 从本地存储加载列配置
   * 将保存的 visible 和 fixed 状态应用到当前列配置上
   */
  const loadFromStorage = () => {
    const raw = localStorage.getItem(getStorageKey())
    if (!raw) return

    const saved = JSON.parse(raw)
    localColumns.value = localColumns.value.map((col) => {
      const hit = saved.find((s: any) => s.prop === col.prop)
      return hit ? { ...col, ...hit } : col
    })
  }

  /**
   * 保存列配置到本地存储
   * 仅保存 prop、visible、fixed 三个字段
   */
  const saveToStorage = () => {
    localStorage.setItem(
      getStorageKey(),
      JSON.stringify(
        localColumns.value.map(({ prop, visible, fixed }) => ({
          prop,
          visible,
          fixed
        }))
      )
    )
  }
  // 监听外部列配置变化，同步更新本地副本
  watch(
    () => props.columns,
    (cols) => {
      localColumns.value = cols.map((c) => ({ ...c }))
      loadFromStorage()
    },
    { immediate: true, deep: true }
  )

  /* ================= 计算属性 ================= */

  /**
   * 是否全选
   * 当所有非禁用列都可见时返回 true
   */
  const allSelected = computed(() => localColumns.value.every((c) => c.visible !== false))

  /**
   * 是否处于不确定状态（部分选中）
   * 当有列可见但不是全部可见时返回 true，用于控制全选复选框的样式
   */
  const indeterminate = computed(() => {
    const visible = localColumns.value.filter((c) => c.visible !== false).length
    return visible > 0 && visible < localColumns.value.length
  })

  /* ================= 下拉框生命周期 ================= */

  /**
   * 处理下拉框显示/隐藏状态变化
   * @param open - 是否显示
   */
  const handleVisibleChange = (open: boolean) => {
    if (open) {
      // 保存当前配置快照，用于取消操作时恢复
      snapshotColumns.value = localColumns.value.map((c) => ({ ...c }))
      dropdownRef.value?.handleOpen()
    } else {
      dropdownRef.value?.handleClose()
    }
  }

  /* ================= 列操作方法 ================= */

  /**
   * 设置列的可见性
   * @param col - 目标列
   * @param v - 可见性值（复选框选中状态）
   */
  const setVisible = (col: TableColumnItem, v: CheckboxValueType) => {
    col.visible = !!v
  }

  /**
   * 设置列的固定位置
   * @param col - 目标列
   * @param fixed - 固定位置：'left' 固定到左边，'right' 固定到右边，undefined 取消固定
   * 注意：允许多列固定在同侧
   */
  const setFixed = (col: TableColumnItem, fixed?: 'left' | 'right') => {
    localColumns.value = localColumns.value.map((c) => {
      if (c.prop === col.prop) return { ...c, fixed }
      return c
    })
  }

  /**
   * 重置所有列为默认状态
   * 恢复为 props 传递的原始配置（visible 和 fixed 字段）
   */
  const resetColumns = () => {
    localColumns.value = localColumns.value.map((c) => {
      // 找到原始列配置
      const originalCol = props.columns.find((oc) => oc.prop === c.prop)
      return {
        ...c,
        visible: originalCol?.visible,
        fixed: originalCol?.fixed
      }
    })
  }

  /**
   * 处理全选/全不选
   * @param v - 全选状态（复选框选中状态）
   * 注意：禁用的列保持原状，不会被修改
   */
  const handleSelectAll = (v: CheckboxValueType) => {
    localColumns.value = localColumns.value.map((c) => (isDisabled(c) ? c : { ...c, visible: !!v }))
  }

  /* ================= 拖拽排序 ================= */

  /**
   * 开始拖拽
   * @param i - 被拖拽列的索引
   */
  const handleDragStart = (i: number) => {
    draggedIndex.value = i
  }

  /**
   * 结束拖拽
   */
  const handleDragEnd = () => {
    draggedIndex.value = null
  }

  /**
   * 处理放下操作，实现列排序
   * @param e - 拖拽事件对象
   */
  const handleDrop = (e: DragEvent) => {
    if (draggedIndex.value == null) return

    // 找到目标DropDownItem元素
    const item = (e.target as HTMLElement).closest('.el-dropdown-menu__item')
    if (!item) return

    // 找到列列表容器
    const list = item.closest('.column-list')
    if (!list) return

    // 获取所有列项并计算目标索引
    const items = Array.from(list.querySelectorAll('.el-dropdown-menu__item'))
    const targetIndex = items.indexOf(item)

    // 如果目标位置与原位置不同，则重新排序
    if (targetIndex !== draggedIndex.value) {
      const cols = [...localColumns.value]
      const [moved] = cols.splice(draggedIndex.value, 1)
      cols.splice(targetIndex, 0, moved)
      localColumns.value = cols
    }

    draggedIndex.value = null
  }

  /* ================= 保存 / 取消 ================= */

  /**
   * 保存配置
   * 触发 update:columns 事件通知父组件，保存到本地存储，关闭下拉框
   */
  const handleSave = () => {
    emit('update:columns', [...localColumns.value])
    saveToStorage()
    dropdownRef.value?.handleClose()
  }

  /**
   * 取消配置
   * 恢复为打开下拉框时的快照状态，触发 update:columns 事件，关闭下拉框
   */
  const handleCancel = () => {
    localColumns.value = snapshotColumns.value.map((c) => ({ ...c }))
    emit('update:columns', [...localColumns.value])
    dropdownRef.value?.handleClose()
  }
</script>

<style lang="scss" scoped>
  .column-setting-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .header-left {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .header-right {
      display: flex;
      align-items: center;
    }
  }

  .column-list {
    max-height: 300px;
    padding: 4px 0;
    overflow-y: auto;
  }

  .column-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 4px 0;
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

  .column-info {
    display: flex;
    flex: 1;
    gap: 8px;
    align-items: center;
    min-width: 0;

    .drag-handle {
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
    gap: 2px;
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
        background-color: var(--el-color-primary-light-6);
      }
    }
  }

  .column-setting-footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding: 8px 12px;
    border-top: 1px solid var(--el-border-color-lighter);

    :deep(.el-dropdown-menu__item) {
      &.is-primary {
        font-weight: 600;
        color: var(--el-color-primary);
      }
    }
  }
</style>
