<template>
  <div class="role-user-container">
    <!-- 搜索区域 -->
    <div class="role-user-header">
      <CaForm
        v-model="searchForm"
        :columns="searchColumns"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #action>
          <ElButton type="primary" @click="handleAssign">
            <template #icon>
              <ElIcon><Plus /></ElIcon>
            </template>
            {{ t('role.assignUser') }}
          </ElButton>
          <ElButton type="danger" :disabled="selectedIds.length === 0" @click="handleBatchUnassign">
            <template #icon>
              <ElIcon><Delete /></ElIcon>
            </template>
            {{ t('role.batchUnassign') }}
          </ElButton>
        </template>
      </CaForm>
    </div>

    <!-- 表格区域 -->
    <div class="role-user-content">
      <CaTable
        ref="tableRef"
        v-model:selected-ids="selectedIds"
        :data="tableData"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        size="default"
        @selection-change="handleSelectionChange"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @refresh="handleRefresh"
      >
        <template #status="{ row }">
          <ElTag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? t('common.statusEnabled') : t('common.statusDisabled') }}
          </ElTag>
        </template>

        <template #gender="{ row }">
          <CaCellGender :gender="row.gender" />
        </template>
        <template #roleNames="{ row }">
          <CaCellTags :data="row.roleNames" />
        </template>

        <template #action="{ row }">
          <ElButton
            type="danger"
            size="small"
            link
            :disabled="row.disabled"
            :title="row.disabled ? t('role.message.systemUserCannotUnassign') : ''"
            @click="handleUnassign(row)"
          >
            {{ t('button.unassign') }}
          </ElButton>
        </template>
      </CaTable>
    </div>

    <!-- 分配用户弹窗 -->
    <AssignModal ref="assignModalRef" @save-success="handleAssignSuccess" />
  </div>
</template>

<script setup lang="ts">
import type { RoleResp, RoleUserResp } from '@/apis/system/role'
import type { FormColumnItem } from '@/components/base/CaForm/type'
import type { TableColumnItem } from '@/components/base/CaTable/type'
import { Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { listRoleUser, unassignFromUsers } from '@/apis/system/role'
import CaForm from '@/components/base/CaForm/index.vue'
import CaTable from '@/components/base/CaTable/index.vue'
import { useResetReactive } from '@/hooks'
import AssignModal from '../AssignModal.vue'

defineOptions({ name: 'RoleUser' })

const props = defineProps<{
  role: RoleResp
}>()

const { t } = useI18n()
const tableRef = ref()
const assignModalRef = ref()
const tableData = ref<RoleUserResp[]>([])
const selectedIds = ref<string[]>([])
const loading = ref(false)

// 搜索表单
const [searchForm, resetSearchForm] = useResetReactive({
  nickname: '',
  username: '',
  description: ''
})

// 搜索列配置
const searchColumns = computed(
  () =>
    [
      {
        label: t('role.page.user.search.nickname'),
        field: 'nickname',
        type: 'input',
        span: 6,
        props: {
          placeholder: t('components.form.placeholder.input', {
            label: t('role.page.user.search.nickname')
          }),
          clearable: true
        }
      },
      {
        label: t('role.page.user.search.username'),
        field: 'username',
        type: 'input',
        span: 6,
        props: {
          placeholder: t('components.form.placeholder.input', {
            label: t('role.page.user.search.username')
          }),
          clearable: true
        }
      },
      {
        label: t('role.page.user.search.description'),
        field: 'description',
        type: 'input',
        span: 6,
        props: {
          placeholder: t('components.form.placeholder.input', {
            label: t('role.page.user.search.description')
          }),
          clearable: true
        }
      }
    ] as FormColumnItem[]
)

// 表格列配置
const columns = computed(
  () =>
    [
      {
        type: 'selection',
        align: 'center'
      },
      {
        prop: 'nickname',
        label: t('role.page.user.table.nickname'),
        showOverflowTooltip: true,
        fixed: 'left'
      },
      {
        prop: 'username',
        label: t('role.page.user.table.username'),
        showOverflowTooltip: true
      },
      {
        prop: 'status',
        label: t('role.page.user.table.status'),
        align: 'center',
        slotName: 'status'
      },
      {
        prop: 'gender',
        label: t('role.page.user.table.gender'),
        align: 'center',
        slotName: 'gender'
      },
      {
        prop: 'deptName',
        label: t('role.page.user.table.deptName'),
        showOverflowTooltip: true
      },
      {
        prop: 'roleNames',
        label: t('role.page.user.table.roleNames'),
        slotName: 'roleNames'
      },
      {
        prop: 'description',
        label: t('role.page.user.table.description'),
        showOverflowTooltip: true
      },
      {
        prop: 'action',
        label: t('role.page.user.table.action'),
        align: 'center',
        fixed: 'right',
        slotName: 'action'
      }
    ] as TableColumnItem[]
)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizes: [10, 20, 50, 100]
})

// 获取角色用户列表
const getRoleUserList = async () => {
  if (!props.role.id) {
    tableData.value = []
    pagination.total = 0
    return
  }

  loading.value = true
  try {
    const query = {
      ...searchForm,
      sort: ['t1.id,desc'],
      current: pagination.current,
      size: pagination.pageSize
    }
    listRoleUser(props.role.id, query).then(({ list, total }) => {
      tableData.value = list
      pagination.total = total
    })
  } catch (error) {
    console.error('获取角色用户列表失败:', error)
    ElMessage.error(t('role.message.unassignFailed'))
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  getRoleUserList()
}

// 重置搜索
const handleReset = () => {
  resetSearchForm()
  pagination.current = 1
  getRoleUserList()
}

// 分配用户
const handleAssign = () => {
  if (!props.role.id) {
    ElMessage.warning(t('role.message.pleaseSelectRole'))
    return
  }
  assignModalRef.value?.onOpen(props.role.id)
}

// 批量移除用户
const handleBatchUnassign = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning(t('role.message.pleaseSelectUsers'))
    return
  }

  try {
    await ElMessageBox.confirm(
      t('role.message.confirmBatchUnassign', { count: selectedIds.value.length }),
      t('common.tips'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    await unassignFromUsers(selectedIds.value)

    ElMessage.success(t('role.message.unassignSuccess'))
    selectedIds.value = []
    getRoleUserList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量移除用户失败:', error)
      ElMessage.error(t('role.message.unassignFailed'))
    }
  }
}

// 移除单个用户
const handleUnassign = async (row: RoleUserResp) => {
  if (row.disabled) {
    return
  }

  try {
    await ElMessageBox.confirm(
      t('role.message.confirmUnassign', { nickname: row.nickname, username: row.username }),
      t('common.tips'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    await unassignFromUsers([row.id])

    ElMessage.success(t('role.message.unassignSuccess'))
    getRoleUserList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除用户失败:', error)
      ElMessage.error(t('role.message.unassignFailed'))
    }
  }
}

// 选择变化
const handleSelectionChange = (selection: RoleUserResp[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.current = 1
  getRoleUserList()
}

// 当前页变化
const handleCurrentChange = (current: number) => {
  pagination.current = current
  getRoleUserList()
}

// 刷新
const handleRefresh = () => {
  getRoleUserList()
}

// 分配成功回调
const handleAssignSuccess = () => {
  getRoleUserList()
}

// 监听角色ID变化
watch(
  () => props.role.id,
  () => {
    pagination.current = 1
    selectedIds.value = []
    getRoleUserList()
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
  .role-user-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    border-radius: 4px;

    &-header {
      margin-bottom: 16px;
    }

    &-content {
      display: flex;
      flex: 1;
      flex-direction: column;
    }
  }
</style>
