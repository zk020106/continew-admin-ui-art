<template>
  <div ref="tableContainer" class="ca-table" :class="{ 'ca-table--fullscreen': isFullscreen }">
    <ElRow v-if="props.title" justify="space-between" align="middle" class="ca-table-header">
      <ElSpace :wrap="true">
        <slot name="title">
          <div class="ca-table__header-title">{{ props.title }}</div>
        </slot>
      </ElSpace>
    </ElRow>
    <ElRow>
      <slot name="top"></slot>
    </ElRow>
    <ElRow justify="space-between" align="middle" class="ca-table__toolbar">
      <ElSpace :wrap="true" :size="[8, 8]">
        <slot name="toolbar-left"></slot>
      </ElSpace>
      <ElSpace wrap class="ca-table__toolbar-right" :size="[8, 8]">
        <slot name="toolbar-right"></slot>
        <ElTooltip placement="top" :content="t('table.refresh')">
          <ElButton v-if="showRefreshBtn" @click="handleRefresh">
            <template #icon>
              <ArtSvgIcon icon="ep:refresh" />
            </template>
          </ElButton>
        </ElTooltip>

        <ElTooltip placement="top" v-if="showSizeBtn" :content="t('table.size')">
          <ElDropdown trigger="click" @command="handleSizeChange">
            <ElButton>
              <template #icon>
                <ArtSvgIcon icon="ep:grid" />
              </template>
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem
                  v-for="item in sizeOptions"
                  :key="item.value"
                  :command="item.value"
                  :class="{ 'is-active': tableSize === item.value }"
                >
                  {{ t(item.labelKey) }}
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </ElTooltip>

        <ElTooltip
          placement="top"
          :content="isFullscreen ? t('table.exitFullscreen') : t('table.fullscreen')"
        >
          <ElButton v-if="showFullscreenBtn" @click="toggleFullscreen">
            <ArtSvgIcon :icon="isFullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-fill'" />
          </ElButton>
        </ElTooltip>

        <ColumnSetting
          v-if="showSettingColumnBtn"
          :columns="localColumns"
          :disabled-keys="props.disabledColumnKeys"
          :table-id="autoTableId"
          @update:columns="handleColumnsUpdate"
        />
      </ElSpace>
    </ElRow>

    <ElTable
      v-bind="tableProps"
      ref="tableRef"
      :data="props.data as any[]"
      :size="tableSize"
      :height="isFullscreen ? fullscreenHeight : undefined"
    >
      <TableColumn v-for="item in visibleColumns" :key="item.prop || item.label" :column="item">
        <!-- 将所有插槽传递给子组件 -->
        <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="scope">
          <slot :name="slotName" v-bind="scope" />
        </template>
      </TableColumn>
    </ElTable>

    <ElRow justify="end" class="ca-table-pagination">
      <ElPagination
        v-bind="paginationProps"
        v-model:current-page="paginationProps.currentPage"
        v-model:page-size="paginationProps.pageSize"
      />
    </ElRow>
  </div>
</template>

<script lang="ts" setup generic="T extends DefaultRow">
  import {
    ElButton,
    ElDropdown,
    ElDropdownItem,
    ElDropdownMenu,
    ElPagination,
    ElRow,
    ElSpace,
    ElTable,
    ElTooltip
  } from 'element-plus'
  import { computed, ref, useTemplateRef, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import TableColumn from './TableColumn.vue'
  import ColumnSetting from './components/ColumnSetting.vue'
  import { DefaultRow, TableColumnItem, TableProps, TableSlotScope } from './type'

  const props = withDefaults(defineProps<TableProps<T>>(), {
    fit: true,
    showHeader: true,
    selectOnIndeterminate: true,
    data: () => [],
    columns: () => [],
    pagination: () => ({}),
    toolbar: () => ({})
  })
  const { t } = useI18n()

  const attrs = useAttrs()
  const tableRef = useTemplateRef('tableRef')
  const tableContainer = useTemplateRef('tableContainer')

  // 全屏状态
  const isFullscreen = ref(false)
  const fullscreenHeight = ref(0)

  const calculateFullscreenHeight = () => {
    if (!isFullscreen.value || !tableContainer.value) {
      return
    }

    const container = tableContainer.value as HTMLElement
    const header = container.querySelector('.ca-table-header') as HTMLElement
    const toolbar = container.querySelector('.ca-table__toolbar') as HTMLElement
    const pagination = container.querySelector('.ca-table-pagination') as HTMLElement

    let offset = 40

    if (header) {
      offset += header.offsetHeight
    }
    if (toolbar) {
      offset += toolbar.offsetHeight
    }
    if (pagination) {
      offset += pagination.offsetHeight
    }
    fullscreenHeight.value = window.innerHeight - offset
  }

  // 表格尺寸
  const tableSize = ref<'default' | 'large' | 'small'>('small')
  defineSlots<{
    append: () => void
    empty: () => void
    title: () => void
    top: () => void
    'toolbar-left': () => void
    'toolbar-right': () => void
    [propsName: string]: (props: TableSlotScope<T>) => void
  }>()

  // 本地列状态
  const localColumns = ref<TableColumnItem[]>([...props.columns])

  // 过滤可见的列
  const visibleColumns = computed(() => {
    return localColumns.value.filter((col) => col.visible !== false)
  })

  // 监听父组件传入的列变化
  watch(
    () => props.columns,
    (newColumns) => {
      localColumns.value = [...newColumns]
    },
    { deep: true }
  )

  // 密度选项
  const sizeOptions = computed(() => {
    return [
      { labelKey: 'table.sizeOptions.default', value: 'default' },
      { labelKey: 'table.sizeOptions.small', value: 'small' },
      { labelKey: 'table.sizeOptions.large', value: 'large' }
    ]
  })

  // 定义事件
  const emit = defineEmits<{
    refresh: []
    'update:columns': [columns: TableColumnItem[]]
  }>()

  const showRefreshBtn = computed(() => !props.disabledTools?.includes('refresh'))
  const showSizeBtn = computed(() => !props.disabledTools?.includes('size'))
  const showFullscreenBtn = computed(() => !props.disabledTools?.includes('fullscreen'))
  /** 列设置相关逻辑 */
  const showSettingColumnBtn = computed(() => {
    return !props.disabledTools?.includes('columnSetting') && Boolean(localColumns.value.length)
  })

  // 自动生成 tableId（基于当前路径）
  const autoTableId = computed(() => {
    if (props.tableId) return props.tableId
    // 没有传入 tableId 时，自动基于当前路径生成
    const path = window.location.pathname.replace(/^\//, '').replace(/\//g, ':')
    return path
  })
  const tableProps = computed(() => {
    return {
      ...attrs,
      ...props,
      columns: undefined,
      pagination: undefined,
      toolbar: undefined,
      actions: undefined
    }
  })

  const paginationProps = computed(() => {
    return {
      background: true,
      layout: 'prev, pager, next, sizes, total',
      pageSizes: [10, 20, 50, 100],
      ...props.pagination
    }
  })

  // 刷新处理
  const handleRefresh = async () => {
    emit('refresh')
  }

  // 列更新处理
  const handleColumnsUpdate = (columns: TableColumnItem[]) => {
    localColumns.value = columns
    emit('update:columns', columns)
  }

  // 尺寸变更处理
  const handleSizeChange = (size: 'default' | 'large' | 'small') => {
    tableSize.value = size
  }

  // 全屏切换
  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value
    if (isFullscreen.value) {
      nextTick(() => {
        calculateFullscreenHeight()
      })
    }
  }

  // 监听全屏状态变化
  watch(isFullscreen, (newVal) => {
    if (newVal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  })

  defineExpose({
    tableRef,
    tableContainer,
    isFullscreen,
    toggleFullscreen
  })
</script>

<style lang="scss" scoped>
  :deep(.el-pagination__rightwrapper) {
    flex: auto;
  }

  .ca-table {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    border-radius: 4px;

    &.ca-table--fullscreen {
      position: fixed;
      inset: 0;
      z-index: 99;
      padding: 20px;
      background-color: var(--el-bg-color);
    }

    :deep(.el-table) {
      flex: 1;
    }

    &__toolbar {
      z-index: 100;
      flex-shrink: 0;
      padding: 10px 0;

      &-right {
        .el-dropdown {
          .el-button.is-circle {
            cursor: pointer;
          }
        }
      }
    }

    &__header-title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .ca-table-header {
    flex-shrink: 0;
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .ca-table-pagination {
    flex-shrink: 0;
    margin-top: 10px;
  }

  :deep(.el-dropdown-menu__item.is-active) {
    color: var(--el-color-primary);
  }
</style>
