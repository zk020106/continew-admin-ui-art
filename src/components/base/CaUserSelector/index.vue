<template>
  <div class="ca-user-selector">
    <ElSelect
      v-model="modelValue"
      multiple
      filterable
      clearable
      :collapse-tags="collapseTags"
      :collapse-tags-tooltip="collapseTagsTooltip"
      :placeholder="placeholder"
      :disabled="disabled"
      class="selector-input"
      @change="handleQuickSelectChange"
    >
      <ElOption
        v-for="item in userOptions"
        :key="String(item.value)"
        :label="item.label"
        :value="String(item.value)"
      />
    </ElSelect>

    <ElTooltip :content="dialogTitle">
      <ElButton :icon="Plus" :disabled="disabled" @click="openDialog" />
    </ElTooltip>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :width="dialogWidth"
      append-to-body
      destroy-on-close
      @closed="handleDialogClosed"
    >
      <ElRow :gutter="12" class="selector-content">
        <ElCol :xs="24" :md="16">
          <div class="selector-toolbar">
            <ElInput
              v-model.trim="keyword"
              clearable
              :placeholder="searchPlaceholder"
              @keyup.enter="onSearch"
            >
              <template #prefix>
                <ElIcon><Search /></ElIcon>
              </template>
            </ElInput>
            <ElButton type="primary" @click="onSearch">搜索</ElButton>
            <ElButton @click="onResetSearch">重置</ElButton>
          </div>

          <ElTable
            ref="tableRef"
            v-loading="tableLoading"
            :data="tableData"
            row-key="id"
            height="460"
            @selection-change="handleSelectionChange"
          >
            <ElTableColumn type="selection" width="55" :reserve-selection="true" />
            <ElTableColumn prop="nickname" label="昵称" min-width="140" show-overflow-tooltip />
            <ElTableColumn prop="username" label="用户名" min-width="140" show-overflow-tooltip />
            <ElTableColumn prop="deptName" label="所属部门" min-width="140" show-overflow-tooltip />
            <ElTableColumn prop="phone" label="手机号" min-width="140" />
            <ElTableColumn prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <ElTag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </ElTag>
              </template>
            </ElTableColumn>
          </ElTable>

          <div class="selector-pagination">
            <span class="selector-selected">已选 {{ draftSelectedMap.size }} 人（可跨页）</span>
            <ElPagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.size"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="loadTableData"
              @size-change="onPageSizeChange"
            />
          </div>
        </ElCol>

        <ElCol :xs="24" :md="8">
          <ElCard shadow="never" class="selected-card">
            <template #header>
              <div class="selected-card-header">
                <span>已选择 {{ draftSelectedMap.size }} 人</span>
                <ElLink v-if="draftSelectedMap.size > 0" type="danger" @click="clearDraftSelection">
                  清空
                </ElLink>
              </div>
            </template>
            <ElScrollbar height="506px">
              <div v-if="draftSelectedList.length === 0" class="selected-empty">
                暂无已选用户
              </div>
              <div v-for="item in draftSelectedList" :key="item.id" class="selected-item">
                <div class="selected-item-main">
                  <div class="selected-item-name">
                    {{ item.nickname || '-' }}
                    <span class="selected-item-username">({{ item.username || '-' }})</span>
                  </div>
                  <div class="selected-item-meta">{{ item.deptName || '-' }}</div>
                </div>
                <ElButton link type="danger" @click="removeDraftUser(item.id)">移除</ElButton>
              </div>
            </ElScrollbar>
          </ElCard>
        </ElCol>
      </ElRow>

      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="onConfirm">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import type { ElTable } from 'element-plus'
import type { UserPageQuery, UserResp } from '@/apis/system'
import type { LabelValueState } from '@/types/global'
import { Plus, Search } from '@element-plus/icons-vue'
import { useWindowSize } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { listAllUser, listUser, listUserDict } from '@/apis/system'

defineOptions({ name: 'CaUserSelector' })

interface SelectedUser {
  id: string
  label: string
  username: string
  nickname: string
  deptName: string
  phone: string
  status: number
}

type UserRow = UserResp & { id: string }

interface PaginationState {
  current: number
  size: number
  total: number
}

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    placeholder?: string
    dialogTitle?: string
    searchPlaceholder?: string
    userStatus?: number
    collapseTags?: boolean
    collapseTagsTooltip?: boolean
  }>(),
  {
    disabled: false,
    placeholder: '请选择用户',
    dialogTitle: '用户选择',
    searchPlaceholder: '搜索用户名/昵称/手机号',
    collapseTags: false,
    collapseTagsTooltip: true
  }
)

const emit = defineEmits<{
  (e: 'change', value: string[]): void
}>()

const modelValue = defineModel<string[]>({ default: () => [] })

const { width } = useWindowSize()
const dialogWidth = computed(() => (width.value >= 1100 ? 1100 : '95%'))

const tableRef = ref<InstanceType<typeof ElTable>>()
const dialogVisible = ref(false)
const tableLoading = ref(false)
const isRestoringSelection = ref(false)
const keyword = ref('')
const tableData = ref<UserRow[]>([])
const userOptions = ref<LabelValueState[]>([])
const optionsLoaded = ref(false)
const optionsLoadingPromise = ref<Promise<void> | null>(null)

const selectedMap = ref<Map<string, SelectedUser>>(new Map())
const draftSelectedMap = ref<Map<string, SelectedUser>>(new Map())
const draftSelectedList = computed(() => Array.from(draftSelectedMap.value.values()))

const pagination = reactive<PaginationState>({
  current: 1,
  size: 10,
  total: 0
})

const normalizeIds = (ids?: Array<string | number | null | undefined>): string[] => {
  if (!ids) return []
  return Array.from(
    new Set(
      ids
        .filter((item) => item !== null && item !== undefined && item !== '')
        .map((item) => String(item))
    )
  )
}

const isSameArray = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false
  return a.every((item, index) => item === b[index])
}

const getUserLabel = (user: Partial<UserResp>) => {
  if (user.nickname && user.username) return `${user.nickname}(${user.username})`
  return user.nickname || user.username || '-'
}

const toSelectedUser = (user: Partial<UserResp>, id?: string): SelectedUser => {
  const userId = id || String(user.id || '')
  return {
    id: userId,
    label: getUserLabel(user),
    username: user.username || '',
    nickname: user.nickname || '',
    deptName: user.deptName || '',
    phone: user.phone || '',
    status: Number(user.status || 2)
  }
}

const optionLabelMap = computed(() => {
  return new Map(userOptions.value.map((item) => [String(item.value), String(item.label)]))
})

const hasStatusFilter = computed(() => typeof props.userStatus === 'number')

const cloneSelectedMap = (source: Map<string, SelectedUser>) => {
  return new Map<string, SelectedUser>(source)
}

const setMap = (
  sourceRef: Ref<Map<string, SelectedUser>>,
  nextMap: Map<string, SelectedUser>
) => {
  sourceRef.value = cloneSelectedMap(nextMap)
}

const mergeOptionByUser = (user: SelectedUser) => {
  const exists = userOptions.value.some((item) => String(item.value) === user.id)
  if (!exists) {
    userOptions.value.push({
      value: user.id,
      label: user.label
    })
  }
}

const ensureOptionsIncludeIds = (
  ids: string[],
  sourceMap: Map<string, SelectedUser>
) => {
  ids.forEach((id) => {
    const exists = userOptions.value.some((item) => String(item.value) === id)
    if (exists) return
    const cached = sourceMap.get(id)
    userOptions.value.push({
      value: id,
      label: cached?.label || id
    })
  })
}

const ensureUserOptions = async () => {
  if (optionsLoaded.value) return
  if (optionsLoadingPromise.value) {
    await optionsLoadingPromise.value
    return
  }
  optionsLoadingPromise.value = (async () => {
    const data = hasStatusFilter.value
      ? await listUserDict({ status: props.userStatus as number })
      : await listUserDict()
    userOptions.value = data.map((item) => ({
      ...item,
      value: String(item.value)
    }))
    optionsLoaded.value = true
  })()

  try {
    await optionsLoadingPromise.value
  } finally {
    optionsLoadingPromise.value = null
  }
}

const buildMapByIds = (
  ids: string[],
  sourceMap: Map<string, SelectedUser>
) => {
  const nextMap = new Map<string, SelectedUser>()
  ids.forEach((id) => {
    const cached = sourceMap.get(id)
    if (cached) {
      nextMap.set(id, cached)
      return
    }
    const optionLabel = optionLabelMap.value.get(id) || id
    nextMap.set(
      id,
      toSelectedUser(
        {
          id,
          nickname: optionLabel,
          username: ''
        },
        id
      )
    )
  })
  return nextMap
}

const ensureSelectedUsers = async (mapRef: Ref<Map<string, SelectedUser>>) => {
  const ids = Array.from(mapRef.value.keys())
  if (!ids.length) return

  const missingIds: string[] = []
  ids.forEach((id) => {
    const current = mapRef.value.get(id)
    if (!current || !current.username) {
      missingIds.push(id)
    }
  })

  if (!missingIds.length) return
  const users = await listAllUser({ userIds: missingIds })
  const nextMap = cloneSelectedMap(mapRef.value)
  users.forEach((item) => {
    const selectedUser = toSelectedUser({ ...item, id: String(item.id) })
    nextMap.set(selectedUser.id, selectedUser)
    mergeOptionByUser(selectedUser)
  })
  setMap(mapRef, nextMap)
}

const syncModelByMap = (nextMap: Map<string, SelectedUser>, triggerChange: boolean) => {
  setMap(selectedMap, nextMap)
  selectedMap.value.forEach((item) => mergeOptionByUser(item))
  const nextIds = Array.from(nextMap.keys())
  modelValue.value = nextIds
  if (triggerChange) {
    emit('change', nextIds)
  }
}

const restoreTableSelection = async () => {
  isRestoringSelection.value = true
  await nextTick()
  try {
    tableRef.value?.clearSelection()
    tableData.value.forEach((row) => {
      if (draftSelectedMap.value.has(row.id)) {
        tableRef.value?.toggleRowSelection(row, true)
      }
    })
  } finally {
    isRestoringSelection.value = false
  }
}

const loadTableData = async () => {
  tableLoading.value = true
  try {
    const query: UserPageQuery = {
      description: keyword.value || undefined,
      sort: ['createTime,desc'],
      page: pagination.current,
      size: pagination.size
    }
    if (hasStatusFilter.value) {
      query.status = props.userStatus as number
    }
    const data = await listUser(query)
    tableData.value = (data.list || []).map((item) => ({
      ...item,
      id: String(item.id)
    }))
    pagination.total = data.total || 0
    await restoreTableSelection()
  } finally {
    tableLoading.value = false
  }
}

const handleSelectionChange = (selection: UserRow[]) => {
  if (isRestoringSelection.value) return
  const selectedIdSet = new Set(selection.map((item) => String(item.id)))
  const nextDraftMap = cloneSelectedMap(draftSelectedMap.value)
  tableData.value.forEach((row) => {
    const rowId = String(row.id)
    if (selectedIdSet.has(rowId)) {
      nextDraftMap.set(rowId, toSelectedUser(row, rowId))
    } else {
      nextDraftMap.delete(rowId)
    }
  })
  setMap(draftSelectedMap, nextDraftMap)
}

const handleQuickSelectChange = async (value: string[]) => {
  try {
    const ids = normalizeIds(value)
    if (!isSameArray(ids, modelValue.value)) {
      modelValue.value = ids
    }
    const nextMap = buildMapByIds(ids, selectedMap.value)
    setMap(selectedMap, nextMap)
    ensureOptionsIncludeIds(ids, selectedMap.value)
    await ensureSelectedUsers(selectedMap)
    emit('change', ids)
  } catch (error) {
    console.error(error)
    ElMessage.error('加载用户数据失败')
  }
}

const onSearch = () => {
  pagination.current = 1
  loadTableData()
}

const onResetSearch = () => {
  keyword.value = ''
  pagination.current = 1
  loadTableData()
}

const onPageSizeChange = () => {
  pagination.current = 1
  loadTableData()
}

const openDialog = async () => {
  if (props.disabled) return
  try {
    await ensureUserOptions()
    const normalizedIds = normalizeIds(modelValue.value)
    const nextMap = buildMapByIds(normalizedIds, selectedMap.value)
    setMap(selectedMap, nextMap)
    ensureOptionsIncludeIds(normalizedIds, selectedMap.value)
    await ensureSelectedUsers(selectedMap)
    setMap(draftSelectedMap, selectedMap.value)
    keyword.value = ''
    pagination.current = 1
    dialogVisible.value = true
    await loadTableData()
  } catch (error) {
    console.error(error)
    ElMessage.error('加载用户列表失败')
  }
}

const onConfirm = () => {
  syncModelByMap(draftSelectedMap.value, true)
  dialogVisible.value = false
}

const removeDraftUser = (id: string) => {
  if (!draftSelectedMap.value.has(id)) return
  const nextDraftMap = cloneSelectedMap(draftSelectedMap.value)
  nextDraftMap.delete(id)
  setMap(draftSelectedMap, nextDraftMap)
  const row = tableData.value.find((item) => item.id === id)
  if (row) {
    tableRef.value?.toggleRowSelection(row, false)
  }
}

const clearDraftSelection = () => {
  setMap(draftSelectedMap, new Map())
  tableRef.value?.clearSelection()
}

const handleDialogClosed = () => {
  setMap(draftSelectedMap, new Map())
}

let syncVersion = 0
watch(
  () => modelValue.value,
  async (value) => {
    const currentVersion = ++syncVersion
    try {
      const ids = normalizeIds(value)
      if (!isSameArray(ids, value || [])) {
        modelValue.value = ids
        return
      }
      await ensureUserOptions()
      if (currentVersion !== syncVersion) return
      const nextMap = buildMapByIds(ids, selectedMap.value)
      setMap(selectedMap, nextMap)
      ensureOptionsIncludeIds(ids, selectedMap.value)
      await ensureSelectedUsers(selectedMap)
    } catch (error) {
      console.error(error)
    }
  },
  { immediate: true, deep: true }
)

onMounted(async () => {
  try {
    await ensureUserOptions()
    const ids = normalizeIds(modelValue.value)
    const nextMap = buildMapByIds(ids, selectedMap.value)
    setMap(selectedMap, nextMap)
    ensureOptionsIncludeIds(ids, selectedMap.value)
    await ensureSelectedUsers(selectedMap)
  } catch (error) {
    console.error(error)
    ElMessage.error('加载用户数据失败')
  }
})
</script>

<style scoped lang="scss">
  .ca-user-selector {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
  }

  .selector-input {
    flex: 1;
    min-width: 0;
  }

  .selector-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 8px;
    margin-bottom: 12px;
  }

  .selector-content {
    min-height: 560px;
  }

  .selector-pagination {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
  }

  .selector-selected {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .selected-card {
    height: 100%;
  }

  .selected-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .selected-empty {
    padding: 18px 0;
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  .selected-item {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .selected-item-main {
    flex: 1;
    min-width: 0;
  }

  .selected-item-name {
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }

  .selected-item-username {
    color: var(--el-text-color-secondary);
  }

  .selected-item-meta {
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  @media (width <= 768px) {
    .selector-toolbar {
      grid-template-columns: 1fr;
    }

    .selector-pagination {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
