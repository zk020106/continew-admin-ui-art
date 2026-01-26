<template>
  <div class="dept-container">
    <ElTabs v-model="activeTab" class="dept-tabs">
      <ElTabPane name="list" :label="t('dept.tab.list')">
        <CaTable
          ref="tableRef"
          :data="deptList"
          :columns="columns"
          :hide-pagination="true"
          :disabled-tools="['columnSetting']"
          row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          @refresh="getDeptList"
        >
          <template #toolbar-left>
            <ElButton type="primary" @click="handleAdd">
              <template #icon>
                <ElIcon><Plus /></ElIcon>
              </template>
              {{ t('dept.button.add') }}
            </ElButton>
            <ElInput
              v-model="searchKey"
              :placeholder="t('dept.search.title')"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <ElIcon><Search /></ElIcon>
              </template>
            </ElInput>
            <ElButton @click="handleReset">
              {{ t('common.button.reset') }}
            </ElButton>
          </template>

          <template #toolbar-right>
            <ElButton @click="toggleExpand">
              <template #icon>
                <ElIcon>
                  <ArrowDown v-if="isExpanded" />
                  <ArrowRight v-else />
                </ElIcon>
              </template>
              {{ isExpanded ? t('dept.button.collapse') : t('dept.button.expand') }}
            </ElButton>
          </template>

          <template #status="{ row }">
            <ElTag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? t('common.statusEnabled') : t('common.statusDisabled') }}
            </ElTag>
          </template>

          <template #action="{ row }">
            <ElButton type="primary" size="small" link @click="handleAddChild(row)">
              {{ t('dept.button.addChild') }}
            </ElButton>
            <ElButton type="primary" size="small" link @click="handleEdit(row)">
              {{ t('common.button.edit') }}
            </ElButton>
            <ElButton type="danger" size="small" link @click="handleDelete(row)">
              {{ t('common.button.delete') }}
            </ElButton>
          </template>
        </CaTable>
      </ElTabPane>

      <ElTabPane name="chart" :label="t('dept.tab.chart')">
        <OrganizationChart
          v-if="activeTab === 'chart'"
          ref="orgChartRef"
          @add="handleAddFromChart"
          @edit="handleEditFromChart"
          @delete="handleDeleteFromChart"
        />
      </ElTabPane>
    </ElTabs>

    <AddDrawer ref="addDrawerRef" @save-success="handleSaveSuccess" />
  </div>
</template>

<script setup lang="ts">
import type { DeptResp } from '@/apis/system/dept'
import type { TableColumnItem } from '@/components/base/CaTable/type'
import { ArrowDown, ArrowRight, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { deleteDept, listDept } from '@/apis/system/dept'
import CaTable from '@/components/base/CaTable/index.vue'
import AddDrawer from './AddDrawer.vue'
import OrganizationChart from './OrganizationChart.vue'

defineOptions({ name: 'SystemDept' })

const { t } = useI18n()
const tableRef = ref()
const addDrawerRef = ref()
const orgChartRef = ref()
const deptList = ref<DeptResp[]>([])
const allDeptList = ref<DeptResp[]>([])
const searchKey = ref('')
const isExpanded = ref(true)
const activeTab = ref('list')

const columns = computed(
  () =>
    [
      {
        prop: 'name',
        label: t('dept.field.name'),
        minWidth: 200,
        showOverflowTooltip: true
      },
      {
        prop: 'status',
        label: t('dept.field.status'),
        align: 'center',
        width: 90,
        slotName: 'status'
      },
      {
        prop: 'description',
        label: t('dept.field.description'),
        minWidth: 200,
        showOverflowTooltip: true
      },
      {
        prop: 'createTime',
        label: t('dept.field.createTime'),
        align: 'center',
        width: 160
      },
      {
        prop: 'action',
        label: t('common.action'),
        align: 'center',
        fixed: 'right',
        width: 200,
        slotName: 'action'
      }
    ] as TableColumnItem[]
)

// 搜索数据（递归过滤树形结构）
const searchData = (keyword: string) => {
  if (!keyword) {
    deptList.value = allDeptList.value
    return
  }

  const loop = (data: DeptResp[]): DeptResp[] => {
    const result: DeptResp[] = []
    data.forEach((item) => {
      const nameMatch = item.name?.toLowerCase().includes(keyword.toLowerCase())
      const descMatch = item.description?.toLowerCase().includes(keyword.toLowerCase())

      if (nameMatch || descMatch) {
        result.push({ ...item })
      } else if (item.children && item.children.length > 0) {
        const filteredChildren = loop(item.children)
        if (filteredChildren.length > 0) {
          result.push({
            ...item,
            children: filteredChildren
          })
        }
      }
    })
    return result
  }

  deptList.value = loop(allDeptList.value)
}

// 搜索处理
const handleSearch = () => {
  searchData(searchKey.value)
}

// 重置
const handleReset = () => {
  searchKey.value = ''
  deptList.value = allDeptList.value
}

// 展开/折叠
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
  const elTable = tableRef.value?.tableRef
  if (!elTable) return

  // 递归展开/折叠所有节点
  const toggleAllRows = (data: DeptResp[]) => {
    data.forEach((row) => {
      elTable.toggleRowExpansion(row, isExpanded.value)
      if (row.children && row.children.length > 0) {
        toggleAllRows(row.children)
      }
    })
  }

  toggleAllRows(deptList.value)
}

// 获取部门列表
const getDeptList = async () => {
  try {
    const data = await listDept({})
    allDeptList.value = data
    deptList.value = data
    // 默认展开所有节点
    nextTick(() => {
      expandAllRows(data)
    })
  } catch (error) {
    console.error('获取部门列表失败:', error)
    ElMessage.error(t('dept.message.fetchFailed'))
  }
}

// 展开所有行
const expandAllRows = (data: DeptResp[]) => {
  const elTable = tableRef.value?.tableRef
  if (!elTable) return

  const expandRows = (list: DeptResp[]) => {
    list.forEach((row) => {
      elTable.toggleRowExpansion(row, true)
      if (row.children && row.children.length > 0) {
        expandRows(row.children)
      }
    })
  }

  expandRows(data)
}

// 新增根部门
const handleAdd = () => {
  addDrawerRef.value?.onAdd()
}

// 新增子部门
const handleAddChild = (row: DeptResp) => {
  addDrawerRef.value?.onAddChild(row.id, row.name)
}

// 编辑部门
const handleEdit = (row: DeptResp) => {
  addDrawerRef.value?.onUpdate(row.id)
}

// 删除部门
const handleDelete = async (row: DeptResp) => {
  if (row.isSystem) {
    ElMessage.warning(t('dept.message.systemCannotDelete'))
    return
  }

  if (row.children && row.children.length > 0) {
    ElMessage.warning(t('dept.message.hasChildren'))
    return
  }

  try {
    await ElMessageBox.confirm(
      t('dept.message.confirmDelete', { name: row.name }),
      t('common.tips'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    await deleteDept(row.id)
    ElMessage.success(t('dept.message.deleteSuccess'))
    await getDeptList()
    // 刷新组织架构图
    orgChartRef.value?.refresh()
  } catch {
    // 用户取消
  }
}

// 组织架构图新增部门
const handleAddFromChart = (parentId?: string) => {
  if (parentId) {
    addDrawerRef.value?.onAddChild(parentId, '')
  } else {
    addDrawerRef.value?.onAdd()
  }
}

// 组织架构图编辑部门
const handleEditFromChart = (id: string) => {
  addDrawerRef.value?.onUpdate(id)
}

// 组织架构图删除部门
const handleDeleteFromChart = async (row: DeptResp) => {
  await handleDelete(row)
  // 刷新组织架构图
  orgChartRef.value?.refresh()
}

// 保存成功后刷新
const handleSaveSuccess = () => {
  getDeptList()
  orgChartRef.value?.refresh()
}

onMounted(() => {
  getDeptList()
})
</script>

<style scoped lang="scss">
  .dept-container {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: var(--page-content-padding);

    .dept-tabs {
      display: flex;
      flex-direction: column;
      height: 100%;

      :deep(.el-tabs__content) {
        flex: 1;
        overflow: hidden;
      }

      :deep(.el-tab-pane) {
        height: 100%;
      }
    }
  }
</style>
