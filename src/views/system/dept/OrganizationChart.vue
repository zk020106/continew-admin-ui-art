<template>
  <div class="organization-chart">
    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <Vue3TreeOrg
      v-else-if="treeData.length"
      ref="treeRef"
      :data="treeData[0]"
      :collapsable="true"
      :horizontal="false"
      :expand-all="true"
      :default-expand-level="999"
      :props="{ id: 'id', parentId: 'parentId', label: 'name', children: 'children' }"
      center
      @on-expand-all="(bool) => (nodeExpandAll = bool)"
    >
      <template #default="{ node }">
        <div class="tree-node-custom" @contextmenu.prevent="handleContextMenu($event, node)">
          <div class="node-header">
            <div class="node-name">{{ node.label }}</div>
          </div>
        </div>
      </template>
    </Vue3TreeOrg>
    <div v-else class="empty">{{ t('dept.organization.empty') }}</div>

    <!-- 自定义右键菜单 -->
    <teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="custom-context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      >
        <div class="menu-item" @click.stop="handleMenuAdd">
          <ElIcon><Plus /></ElIcon>
          <span>{{ t('dept.menu.add') }}</span>
        </div>
        <div
          class="menu-item"
          :class="{ disabled: contextMenu.node?.id === 'root' }"
          @click.stop="handleMenuEdit"
        >
          <ElIcon><Edit /></ElIcon>
          <span>{{ t('dept.menu.edit') }}</span>
        </div>
        <div
          class="menu-item danger"
          :class="{ disabled: contextMenu.node?.id === 'root' || contextMenu.node?.isSystem }"
          @click.stop="handleMenuDelete"
        >
          <ElIcon><Delete /></ElIcon>
          <span>{{ t('dept.menu.delete') }}</span>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
  import { listDept, type DeptResp } from '@/apis/system/dept'
  import { Delete, Edit, Plus } from '@element-plus/icons-vue'
  import { useI18n } from 'vue-i18n'
  import { Vue3TreeOrg } from 'vue3-tree-org'
  import 'vue3-tree-org/lib/vue3-tree-org.css'

  defineOptions({ name: 'DeptOrganizationChart' })

  const emit = defineEmits<{
    add: [parentId?: string]
    edit: [id: string]
    delete: [record: DeptResp]
  }>()

  const { t } = useI18n()
  const loading = ref(true)
  const treeData = ref<any[]>([])
  const treeRef = ref()
  const nodeExpandAll = ref<boolean>(true)

  // 右键菜单状态
  const contextMenu = reactive({
    visible: false,
    x: 0,
    y: 0,
    node: null as any
  })

  // 将部门数据转换为树形结构
  const convertToTreeData = (data: DeptResp[]) => {
    if (data.length === 1) {
      return [data[0]]
    } else if (data.length > 1) {
      return [
        {
          id: 'root',
          name: t('dept.organization.root'),
          description: '',
          status: 1,
          isSystem: false,
          children: data
        }
      ]
    }
    return []
  }

  // 处理右键菜单
  const handleContextMenu = (event: MouseEvent, node: any) => {
    event.preventDefault()
    event.stopPropagation()

    contextMenu.node = node
    contextMenu.x = event.clientX
    contextMenu.y = event.clientY
    contextMenu.visible = true

    // 点击其他地方关闭菜单
    nextTick(() => {
      document.addEventListener('click', closeContextMenu)
      document.addEventListener('contextmenu', closeContextMenu)
    })
  }

  // 关闭右键菜单
  const closeContextMenu = () => {
    contextMenu.visible = false
    document.removeEventListener('click', closeContextMenu)
    document.removeEventListener('contextmenu', closeContextMenu)
  }

  // 新增部门
  const handleMenuAdd = () => {
    if (contextMenu.node?.id !== 'root') {
      emit('add', contextMenu.node.id)
    }
    closeContextMenu()
  }

  // 编辑部门
  const handleMenuEdit = () => {
    if (contextMenu.node?.id !== 'root') {
      emit('edit', contextMenu.node.id)
    }
    closeContextMenu()
  }

  // 删除部门
  const handleMenuDelete = () => {
    if (contextMenu.node?.id !== 'root' && !contextMenu.node?.isSystem) {
      emit('delete', contextMenu.node)
    }
    closeContextMenu()
  }

  // 获取部门列表
  const getDeptList = async () => {
    loading.value = true
    try {
      const data = await listDept({})
      treeData.value = convertToTreeData(data)
    } catch (error) {
      console.error('获取部门列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 暴露刷新方法
  const refresh = () => {
    getDeptList()
  }

  onMounted(() => {
    getDeptList()
  })

  onUnmounted(() => {
    closeContextMenu()
  })

  defineExpose({
    refresh
  })
</script>

<style scoped lang="scss">
  .organization-chart {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 600px;
    overflow: hidden;
    background: var(--el-bg-color-page);

    :deep(.zm-tree-org) {
      height: calc(100vh - 265px);
      background: var(--el-bg-color);
    }

    :deep(.zm-draggable) {
      margin-top: 4px;
    }

    :deep(.zm-tree-org .zoom-container) {
      color: var(--el-text-color-primary);
      background-color: var(--el-bg-color);
    }

    :deep(.tree-org-node__content) {
      padding: 0;
      background-color: transparent;
    }

    :deep(.tree-org-node__expand) {
      background-color: var(--el-bg-color) !important;
    }
  }

  .loading,
  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 600px;
    font-size: 14px;
    color: var(--el-text-color-placeholder);
  }

  // 自定义节点样式
  .tree-node-custom {
    display: inline-block;
    min-width: 160px;
    padding: 12px 16px;
    cursor: pointer;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
      transform: translateY(-2px);
    }

    .node-header {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .node-name {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .node-desc {
      max-width: 200px;
      margin-bottom: 8px;
      overflow: hidden;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .node-status {
      display: inline-block;
      padding: 3px 10px;
      font-size: 12px;
      text-align: center;
      border-radius: 12px;

      &.enabled {
        color: var(--el-color-success);
        background: var(--el-color-success-light-9);
      }

      &.disabled {
        color: var(--el-color-danger);
        background: var(--el-color-danger-light-9);
      }
    }
  }

  // 自定义右键菜单
  .custom-context-menu {
    position: fixed;
    z-index: 9999;
    min-width: 140px;
    padding: 4px 0;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    animation: fadeIn 0.1s ease;

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }

      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .menu-item {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 8px 16px;
      font-size: 14px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(.disabled) {
        color: var(--el-color-primary);
        background-color: var(--el-fill-color-light);
      }

      &.disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      &.danger:not(.disabled):hover {
        color: var(--el-color-danger);
        background-color: var(--el-color-danger-light-9);
      }

      .el-icon {
        font-size: 16px;
      }
    }
  }
</style>
