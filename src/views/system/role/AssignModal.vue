<template>
  <ElDialog
    v-model="visible"
    :title="t('role.assignUser')"
    :width="width >= 1100 ? 1100 : '90%'"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    draggable
    @close="reset"
  >
    <!-- 用户选择组件 -->
    <div v-if="visible" class="user-select-container">
      <div class="user-select-header">
        <CaForm
          v-model="searchForm"
          :columns="searchColumns"
          @search="handleSearch"
          @reset="handleReset"
        />
      </div>

      <div class="user-select-content">
        <CaTable
          ref="tableRef"
          v-model:selectedIds="selectedIds"
          :data="tableData"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
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
            <span>{{
              row.gender === 1
                ? t('common.genderMale')
                : row.gender === 2
                  ? t('common.genderFemale')
                  : t('common.genderUnknown')
            }}</span>
          </template>

          <template #deptName="{ row }">
            <span>{{ row.deptName || '-' }}</span>
          </template>
        </CaTable>
      </div>
    </div>

    <template #footer>
      <ElButton @click="visible = false">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" :disabled="selectedIds.length === 0" @click="handleSave">
        {{ t('common.confirm') }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { assignToUsers } from '@/apis/system/role'
  import { listUser } from '@/apis/system/user'
  import CaForm from '@/components/base/CaForm/index.vue'
  import { FormColumnItem } from '@/components/base/CaForm/type'
  import CaTable from '@/components/base/CaTable/index.vue'
  import { useResetReactive } from '@/hooks'
  import { useWindowSize } from '@vueuse/core'
  import { ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()

  const { t } = useI18n()
  const { width } = useWindowSize()

  const dataId = ref('')
  const visible = ref(false)
  const selectedIds = ref<string[]>([])
  const tableRef = ref()
  const tableData = ref([])
  const loading = ref(false)

  // 搜索表单
  const [searchForm, resetSearchForm] = useResetReactive({
    username: '',
    nickname: '',
    phone: ''
  })

  // 搜索列配置
  const searchColumns = computed(
    () =>
      [
        {
          label: t('role.page.user.table.username'),
          field: 'username',
          type: 'input',
          span: 6,
          props: {
            placeholder: t('role.placeholder.username'),
            clearable: true
          }
        },
        {
          label: t('role.page.user.table.nickname'),
          field: 'nickname',
          type: 'input',
          span: 6,
          props: {
            placeholder: t('role.placeholder.nickname'),
            clearable: true
          }
        },
        {
          label: t('role.page.user.table.phone'),
          field: 'phone',
          type: 'input',
          span: 6,
          props: {
            placeholder: t('role.placeholder.phone'),
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
          width: 55,
          align: 'center'
        },
        {
          prop: 'username',
          label: t('role.page.user.table.username'),
          width: 120,
          showOverflowTooltip: true
        },
        {
          prop: 'nickname',
          label: t('role.page.user.table.nickname'),
          width: 120,
          showOverflowTooltip: true
        },
        {
          prop: 'phone',
          label: t('role.page.user.table.phone'),
          width: 130
        },
        {
          prop: 'email',
          label: t('role.page.user.table.email'),
          width: 200,
          showOverflowTooltip: true
        },
        {
          prop: 'gender',
          label: t('role.page.user.table.gender'),
          width: 80,
          align: 'center',
          slotName: 'gender'
        },
        {
          prop: 'status',
          label: t('role.page.user.table.status'),
          width: 100,
          align: 'center',
          slotName: 'status'
        },
        {
          prop: 'deptName',
          label: t('role.page.user.table.deptName'),
          width: 140,
          showOverflowTooltip: true,
          slotName: 'deptName'
        }
      ] as any[]
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

  // 获取用户列表
  const getUserList = async () => {
    loading.value = true
    try {
      // 获取所有用户（前端过滤已分配的用户）
      const query = {
        ...searchForm,
        sort: ['createTime,desc'],
        current: pagination.current,
        size: pagination.pageSize
      }
      const data = await listUser(query)

      // TODO: 这里可能需要后端接口支持排除已分配用户的查询
      // 暂时使用所有用户数据
      tableData.value = data.records
      pagination.total = data.total
    } catch (error) {
      console.error('获取用户列表失败:', error)
      ElMessage.error(t('role.message.getUserListFailed'))
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    pagination.current = 1
    getUserList()
  }

  // 重置搜索
  const handleReset = () => {
    resetSearchForm()
    pagination.current = 1
    getUserList()
  }

  // 选择变化
  const handleSelectionChange = (selection: any[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  // 分页大小变化
  const handleSizeChange = (size: number) => {
    pagination.pageSize = size
    pagination.current = 1
    getUserList()
  }

  // 当前页变化
  const handleCurrentChange = (current: number) => {
    pagination.current = current
    getUserList()
  }

  // 刷新
  const handleRefresh = () => {
    getUserList()
  }

  // 保存
  const handleSave = async () => {
    if (selectedIds.value.length === 0) {
      ElMessage.warning(t('role.message.pleaseSelectUser'))
      return
    }

    try {
      await assignToUsers(dataId.value, selectedIds.value)

      ElMessage.success(t('role.message.assignSuccess'))
      visible.value = false
      emit('save-success')
    } catch (error) {
      console.error('分配用户失败:', error)
      ElMessage.error(t('role.message.assignFailed'))
    }
  }

  // 重置
  const reset = () => {
    dataId.value = ''
    selectedIds.value = []
    pagination.current = 1
    resetSearchForm()
  }

  // 打开
  const onOpen = async (id: string) => {
    dataId.value = id
    reset()
    visible.value = true
    // 延迟加载数据，等待弹窗打开动画完成
    setTimeout(() => {
      getUserList()
    }, 100)
  }

  defineExpose({ onOpen })
</script>

<style scoped lang="scss">
  .user-select-container {
    display: flex;
    flex-direction: column;
    height: 60vh;

    &-header {
      margin-bottom: 16px;
    }

    &-content {
      flex: 1;
      overflow: hidden;
    }
  }
</style>
