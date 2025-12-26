<template>
  <div class="container">
    <div class="search">
      <ElInput
        v-model="searchKey"
        :placeholder="t('dict.list.searchPlaceholder')"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <ElIcon><Search /></ElIcon>
        </template>
      </ElInput>
      <ElButton @click="handleAdd" :icon="Plus" type="primary" />
    </div>

    <div class="dict-list-wrapper">
      <div class="dict-list">
        <div
          v-for="item in filteredDictList"
          :key="item.id"
          class="dict-item"
          :class="{ active: selectedDict?.id === item.id }"
          @click="selectDict(item)"
        >
          <div class="dict-info">
            <div class="dict-name" :title="item.name">
              {{ item.name }}
            </div>
            <div class="dict-desc" :title="item.code"> ({{ item.code }}) </div>
          </div>
          <div v-auth="['system:dict:update', 'system:dict:delete']">
            <ElDropdown trigger="click" @command="(command) => onMenuItemClick(command, item)">
              <ElButton size="small" text :icon="MoreFilled" @click.stop> </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="update">
                    <span v-auth="['system:dict:update']">{{ t('common.button.edit') }}</span>
                  </ElDropdownItem>
                  <ElDropdownItem command="delete" :disabled="item.isSystem">
                    <span v-auth="['system:dict:delete']" class="danger">{{
                      t('common.button.delete')
                    }}</span>
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </div>
        </div>
        <div v-if="filteredDictList.length === 0" class="empty">
          <ElEmpty :description="t('common.empty')" />
        </div>
      </div>
    </div>

    <AddDrawer ref="AddDrawerRef" @save-success="getDictList" />
  </div>
</template>

<script setup lang="ts">
  import { type DictResp, clearDictCache, deleteDict, listDict } from '@/apis/system/dict'
  import { MoreFilled, Plus, Search } from '@element-plus/icons-vue'
  import { ElEmpty, ElMessage, ElMessageBox } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import AddDrawer from '../AddDrawer.vue'

  const emit = defineEmits<{
    (e: 'node-click', keys: DictResp): void
  }>()

  const { t } = useI18n()
  const selectedDict = ref<DictResp | null>(null)
  const dictList = ref<DictResp[]>([])
  const loading = ref(false)

  // 选中字典
  const selectDict = (dictItem: DictResp) => {
    if (selectedDict.value?.id === dictItem.id) {
      return
    }
    selectedDict.value = dictItem
    emit('node-click', dictItem)
  }

  // 查询字典列表
  const getDictList = async () => {
    try {
      loading.value = true
      const data = await listDict({ sort: ['createTime,desc'] })
      dictList.value = data

      // 默认选中第一个字典
      await nextTick(() => {
        if (dictList.value.length > 0 && !selectedDict.value) {
          selectDict(dictList.value[0])
        }
      })
    } catch (error) {
      console.error('获取字典列表失败:', error)
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

  // 过滤后的字典列表
  const filteredDictList = computed(() => {
    if (!searchKey.value) return dictList.value
    const keyword = searchKey.value.toLowerCase()
    return dictList.value.filter(
      (item) =>
        item.name?.toLowerCase().includes(keyword) ||
        item.code?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword)
    )
  })

  const AddDrawerRef = useTemplateRef('AddDrawerRef')

  // 新增字典
  const handleAdd = () => {
    AddDrawerRef.value?.onAdd()
  }

  // 点击菜单项
  const onMenuItemClick = async (command: string, dictItem: DictResp) => {
    if (command === 'update') {
      AddDrawerRef.value?.onUpdate(dictItem.id)
    } else if (command === 'delete') {
      try {
        await ElMessageBox.confirm(
          `${t('message.selected')} ${dictItem.name}，${t('message.confirmDelete')}`,
          t('common.tips'),
          {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'warning'
          }
        )

        const res = await deleteDict(dictItem.id)
        if (res.success) {
          ElMessage.success(t('dict.message.deleteSuccess'))
          await getDictList()
        }
      } catch {
        // 用户取消或其他错误
      }
    } else if (command === 'clearCache') {
      try {
        await ElMessageBox.confirm(
          t('dict.message.confirmClearCache', { code: dictItem.code }),
          t('common.tips'),
          {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'warning'
          }
        )

        const res = await clearDictCache(dictItem.code)
        if (res.success) {
          ElMessage.success(t('dict.message.clearCacheSuccess'))
        }
      } catch {
        // 用户取消或其他错误
      }
    }
  }

  onMounted(() => {
    getDictList()
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
    padding: var(--page-content-padding);
    overflow: hidden;

    .search {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 10px;
    }
  }

  .dict-list-wrapper {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;
    background-color: var(--el-bg-color);

    .dict-list {
      position: absolute;
      inset: 0;
      overflow-y: auto;
    }
  }

  .dict-item {
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

    .dict-info {
      flex: 1;
      min-width: 0;

      .dict-name {
        margin-bottom: 4px;
        overflow: hidden;
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .dict-desc {
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
