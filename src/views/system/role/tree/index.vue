<template>
  <div class="container">
    <div class="search">
      <ElInput
        v-model="searchKey"
        :placeholder="t('role.tree.placeholder')"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <ElIcon><Search /></ElIcon>
        </template>
      </ElInput>
    </div>

    <div class="role-list-wrapper">
      <div class="role-list">
        <div
          v-for="item in filteredRoleList"
          :key="item.id"
          class="role-item"
          :class="{ active: selectedRole?.id === item.id }"
          @click="selectRole(item)"
        >
          <div class="role-info">
            <div class="role-name" :title="`${item.name} (${item.code})`">
              {{ item.name }} ({{ item.code }})
            </div>
            <div class="role-desc" :title="item.description">
              {{ item.description || t('role.tree.noDescription') }}
            </div>
          </div>
          <div v-auth="['system:role:update', 'system:role:delete']">
            <ElDropdown trigger="click" @command="(command) => onMenuItemClick(command, item)">
              <ElIcon @click.stop><MoreFilled /></ElIcon>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="update">
                    <span v-auth="['system:role:update']">{{ t('common.button.edit') }}</span>
                  </ElDropdownItem>
                  <ElDropdownItem command="delete" :disabled="item.isSystem">
                    <span v-auth="['system:role:delete']" class="danger">{{
                      t('common.button.delete')
                    }}</span>
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </div>
        </div>
        <div v-if="filteredRoleList.length === 0" class="empty">
          <ElEmpty :description="t('common.empty')" />
        </div>
      </div>
    </div>

    <AddDrawer ref="AddDrawerRef" @save-success="getRoleList" />
  </div>
</template>

<script setup lang="ts">
  import { type RoleResp, deleteRole, listRole } from '@/apis/system/role'
  import { MoreFilled, Search } from '@element-plus/icons-vue'
  import { ElEmpty, ElMessage, ElMessageBox } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import AddDrawer from '../AddDrawer.vue'

  const emit = defineEmits<{
    (e: 'node-click', keys: RoleResp): void
  }>()

  const { t } = useI18n()
  const selectedRole = ref<RoleResp | null>(null)
  const roleList = ref<RoleResp[]>([])
  const loading = ref(false)

  // 选中角色
  const selectRole = (role: RoleResp) => {
    console.log(selectedRole.value)

    if (selectedRole.value?.id === role.id) {
      return
    }
    selectedRole.value = role
    emit('node-click', role)
  }

  // 查询角色列表
  const getRoleList = async () => {
    try {
      loading.value = true
      const data = await listRole({ sort: ['sort,asc'] })
      roleList.value = data

      // 默认选中第一个角色
      await nextTick(() => {
        if (roleList.value.length > 0 && !selectedRole.value) {
          selectRole(roleList.value[0])
        }
      })
    } catch (error) {
      console.error('获取角色列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 搜索关键词
  const searchKey = ref('')

  // 搜索处理
  const handleSearch = (value: string) => {
    searchKey.value = value
  }

  // 过滤后的角色列表
  const filteredRoleList = computed(() => {
    if (!searchKey.value) return roleList.value
    const keyword = searchKey.value.toLowerCase()
    return roleList.value.filter(
      (item) =>
        item.name?.toLowerCase().includes(keyword) || item.code?.toLowerCase().includes(keyword)
    )
  })

  const AddDrawerRef = useTemplateRef('AddDrawerRef')

  // 点击菜单项
  const onMenuItemClick = async (command: string, role: RoleResp) => {
    if (command === 'update') {
      AddDrawerRef.value?.onUpdate(role.id)
    } else if (command === 'delete') {
      try {
        await ElMessageBox.confirm(
          `${t('message.selected')} ${role.name}，${t('message.confirmDelete')}`,
          t('common.tips'),
          {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'warning'
          }
        )

        const res = await deleteRole(role.id)
        if (res.success) {
          ElMessage.success(t('role.message.deleteSuccess'))
          await getRoleList()
        }
      } catch {
        // 用户取消或其他错误
      }
    }
  }

  onMounted(() => {
    getRoleList()
  })
</script>

<style scoped lang="scss">
  .container {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    .search {
      display: flex;
      justify-content: start;
      margin-bottom: 10px;
    }
  }

  .role-list-wrapper {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;
    background-color: var(--el-bg-color);

    .role-list {
      position: absolute;
      inset: 0;
      padding: 8px;
      overflow-y: auto;
    }
  }

  .role-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: var(--el-border-radius-base);
    transition: all 0.25s;

    &:hover {
      background-color: var(--el-fill-color-light);
      border-color: var(--el-color-primary);
    }

    &.active {
      font-weight: 500;
      background-color: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary);
    }

    .role-info {
      flex: 1;
      min-width: 0;

      .role-name {
        margin-bottom: 4px;
        overflow: hidden;
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .role-desc {
        overflow: hidden;
        font-size: 12px;
        color: var(--el-text-color-secondary);
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
  }

  .danger {
    color: var(--el-color-danger);
  }
</style>
