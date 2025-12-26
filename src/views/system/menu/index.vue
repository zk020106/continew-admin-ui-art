<template>
  <div class="menu-container">
    <CaTable
      ref="tableRef"
      :data="menuList"
      :columns="columns"
      :pagination="{ hideOnSinglePage: true }"
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      @refresh="getMenuList"
    >
      <template #toolbar-left>
        <ElButton type="primary" @click="handleAdd">
          <template #icon>
            <ElIcon><Plus /></ElIcon>
          </template>
          {{ t('menu.button.add') }}
        </ElButton>
        <ElInput
          v-model="searchKey"
          :placeholder="t('menu.search.title')"
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
        <ElButton type="warning" @click="onClearCache">
          <template #icon>
            <ElIcon><Delete /></ElIcon>
          </template>
          {{ t('menu.button.clearCache') }}
        </ElButton>
        <ElButton @click="toggleExpand">
          <template #icon>
            <ElIcon>
              <ArrowDown v-if="isExpanded" />
              <ArrowRight v-else />
            </ElIcon>
          </template>
          {{ isExpanded ? t('menu.button.collapse') : t('menu.button.expand') }}
        </ElButton>
      </template>

      <template #title="{ row }">
        {{ formatTitle(row.title) }}
      </template>

      <template #type="{ row }">
        <ElTag v-if="row.type === 1" type="primary">{{ t('menu.type.directory') }}</ElTag>
        <ElTag v-else-if="row.type === 2" type="success">{{ t('menu.type.menu') }}</ElTag>
        <ElTag v-else-if="row.type === 3" type="warning">{{ t('menu.type.button') }}</ElTag>
      </template>

      <template #status="{ row }">
        <ElTag :type="row.status === 1 ? 'success' : 'danger'">
          {{ row.status === 1 ? t('common.statusEnabled') : t('common.statusDisabled') }}
        </ElTag>
      </template>

      <template #isExternal="{ row }">
        <ElTag v-if="row.isExternal" type="success">{{ t('common.true') }}</ElTag>
        <ElTag v-else type="warning">{{ t('common.false') }}</ElTag>
      </template>

      <template #isCache="{ row }">
        <ElTag v-if="row.isCache" type="success">{{ t('common.true') }}</ElTag>
        <ElTag v-else type="warning">{{ t('common.false') }}</ElTag>
      </template>

      <template #isHidden="{ row }">
        <ElTag v-if="row.isHidden" type="danger">{{ t('common.true') }}</ElTag>
        <ElTag v-else type="success">{{ t('common.false') }}</ElTag>
      </template>

      <template #icon="{ row }">
        <div v-if="row.icon" class="icon-cell">
          <ArtSvgIcon :icon="row.icon" />
        </div>
      </template>

      <template #action="{ row }">
        <ElButton
          v-if="[1, 2].includes(row.type)"
          type="primary"
          size="small"
          link
          :disabled="row.type === 3"
          @click="handleAddChild(row)"
        >
          {{ t('menu.button.addChild') }}
        </ElButton>
        <ElButton type="primary" size="small" link @click="handleEdit(row)">
          {{ t('common.button.edit') }}
        </ElButton>
        <ElButton type="danger" size="small" link @click="handleDelete(row)">
          {{ t('common.button.delete') }}
        </ElButton>
      </template>
    </CaTable>

    <AddDrawer ref="addDrawerRef" @save-success="getMenuList" />
  </div>
</template>

<script setup lang="ts">
  import { clearMenuCache, deleteMenu, listMenu, type MenuResp } from '@/apis/system/menu'
  import CaTable from '@/components/base/CaTable/index.vue'
  import { TableColumnItem } from '@/components/base/CaTable/type'
  import { ArrowDown, ArrowRight, Delete, Plus, Search } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import AddDrawer from './AddDrawer.vue'

  defineOptions({ name: 'SystemMenu' })

  const { t } = useI18n()
  const tableRef = ref()
  const addDrawerRef = ref()
  const menuList = ref<MenuResp[]>([])
  const allMenuList = ref<MenuResp[]>([])
  const searchKey = ref('')
  const isExpanded = ref(false)

  const columns = computed(
    () =>
      [
        {
          prop: 'title',
          label: t('menu.field.title'),
          minWidth: 200,
          showOverflowTooltip: true,
          slotName: 'title'
        },
        {
          prop: 'type',
          label: t('menu.field.type'),
          align: 'center',
          width: 100,
          slotName: 'type'
        },
        {
          prop: 'icon',
          label: t('menu.field.icon'),
          align: 'center',
          width: 80,
          slotName: 'icon'
        },
        {
          prop: 'permission',
          label: t('menu.field.permission'),
          minWidth: 150,
          showOverflowTooltip: true
        },
        {
          prop: 'path',
          label: t('menu.field.path'),
          minWidth: 180,
          showOverflowTooltip: true
        },
        {
          prop: 'component',
          label: t('menu.field.component'),
          minWidth: 180,
          showOverflowTooltip: true
        },
        {
          prop: 'sort',
          label: t('menu.field.sort'),
          align: 'center',
          width: 80
        },
        {
          prop: 'status',
          label: t('menu.field.status'),
          align: 'center',
          width: 90,
          slotName: 'status'
        },
        {
          prop: 'isExternal',
          label: t('menu.field.isExternal'),
          align: 'center',
          width: 100,
          slotName: 'isExternal'
        },
        {
          prop: 'isCache',
          label: t('menu.field.isCache'),
          align: 'center',
          width: 90,
          slotName: 'isCache'
        },
        {
          prop: 'isHidden',
          label: t('menu.field.isHidden'),
          align: 'center',
          width: 90,
          slotName: 'isHidden'
        },
        {
          prop: 'createTime',
          label: t('menu.field.createTime'),
          align: 'center',
          width: 160
        },
        {
          prop: 'action',
          label: t('common.action'),
          align: 'center',
          fixed: 'right',
          width: 220,
          slotName: 'action'
        }
      ] as TableColumnItem[]
  )

  // 格式化标题（国际化处理）
  const formatTitle = (title: string) => {
    return title.startsWith('menus.') ? t(title) : title
  }

  // 搜索数据（递归过滤树形结构）
  const searchData = (keyword: string) => {
    if (!keyword) {
      menuList.value = allMenuList.value
      return
    }

    const loop = (data: MenuResp[]): MenuResp[] => {
      const result: MenuResp[] = []
      data.forEach((item) => {
        const titleMatch = item.title?.toLowerCase().includes(keyword.toLowerCase())
        const pathMatch = item.path?.toLowerCase().includes(keyword.toLowerCase())
        const permissionMatch = item.permission?.toLowerCase().includes(keyword.toLowerCase())

        if (titleMatch || pathMatch || permissionMatch) {
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

    menuList.value = loop(allMenuList.value)
  }

  // 搜索处理
  const handleSearch = () => {
    searchData(searchKey.value)
  }

  // 重置
  const handleReset = () => {
    searchKey.value = ''
    menuList.value = allMenuList.value
  }

  // 展开/折叠
  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
    const elTable = tableRef.value?.tableRef
    if (!elTable) return

    // 递归展开/折叠所有节点
    const toggleAllRows = (data: MenuResp[]) => {
      data.forEach((row) => {
        elTable.toggleRowExpansion(row, isExpanded.value)
        if (row.children && row.children.length > 0) {
          toggleAllRows(row.children)
        }
      })
    }

    toggleAllRows(menuList.value)
  }

  // 清除缓存
  const onClearCache = async () => {
    try {
      await ElMessageBox.confirm(t('menu.message.confirmClearCache'), t('common.tips'), {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      })

      await clearMenuCache()
      ElMessage.success(t('menu.message.clearCacheSuccess'))
      await getMenuList()
    } catch {
      // 用户取消
    }
  }

  // 获取菜单列表
  const getMenuList = async () => {
    try {
      const data = await listMenu()
      allMenuList.value = data
      menuList.value = data
    } catch (error) {
      console.error('获取菜单列表失败:', error)
      ElMessage.error(t('menu.message.fetchFailed'))
    }
  }

  // 新增根菜单
  const handleAdd = () => {
    addDrawerRef.value?.onAdd()
  }

  // 新增子菜单
  const handleAddChild = (row: MenuResp) => {
    addDrawerRef.value?.onAddChild(row.id, t(row.title))
  }

  // 编辑菜单
  const handleEdit = (row: MenuResp) => {
    addDrawerRef.value?.onUpdate(row.id)
  }

  // 删除菜单
  const handleDelete = async (row: MenuResp) => {
    if (row.children && row.children.length > 0) {
      ElMessage.warning(t('menu.message.hasChildren'))
      return
    }

    try {
      await ElMessageBox.confirm(
        t('menu.message.confirmDelete', { title: row.title }),
        t('common.tips'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning'
        }
      )

      const res = await deleteMenu(row.id)
      if (res.success) {
        ElMessage.success(t('menu.message.deleteSuccess'))
        await getMenuList()
      }
    } catch {
      // 用户取消
    }
  }

  onMounted(() => {
    getMenuList()
  })
</script>

<style scoped lang="scss">
  .menu-container {
    height: 100%;
    padding: var(--page-content-padding);
  }

  .icon-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }
</style>
