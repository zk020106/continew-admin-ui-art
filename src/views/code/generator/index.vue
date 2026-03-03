<template>
  <CaPageLayout>
    <CaTable
      ref="tableRef"
      row-key="tableName"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1100 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['tableName']"
      @refresh="handleSearch"
      @select="handleSelect"
      @select-all="handleSelectAll"
    >
      <template #top>
        <CaQueryForm
          v-model="queryForm"
          mode="click-search"
          :immediate="false"
          :columns="queryFormColumns"
          @search="handleSearch"
          @reset="handleReset"
        />
        <ElAlert type="info" :closable="false" class="selected-alert">
          <template #title>
            <span v-if="selectedTableNames.length > 0">
              已选中 {{ selectedTableNames.length }} 条记录(可跨页)
            </span>
            <span v-else>未选中任何记录</span>
          </template>
          <template v-if="selectedTableNames.length > 0" #default>
            <ElLink type="primary" :underline="false" @click="clearSelected">清空</ElLink>
          </template>
        </ElAlert>
      </template>

      <template #toolbar-right>
        <ElButton
          v-auth="['code:generator:preview']"
          type="primary"
          :disabled="selectedTableNames.length === 0"
          :title="selectedTableNames.length === 0 ? '请选择' : ''"
          @click="onPreview(selectedTableNames)"
        >
          <ElIcon><Cpu /></ElIcon>
          <span>批量生成</span>
        </ElButton>
      </template>

      <template #action="{ row }">
        <ElSpace>
          <ElLink
            v-auth="['code:generator:config']"
            type="primary"
            :underline="false"
            @click="onConfig(row.tableName, row.comment)"
          >
            配置
          </ElLink>
          <ElLink
            v-auth="['code:generator:preview']"
            type="primary"
            :underline="false"
            :disabled="!row.createTime"
            :title="row.createTime ? '生成' : '请先进行生成配置'"
            @click="onPreview([row.tableName])"
          >
            生成
          </ElLink>
        </ElSpace>
      </template>
    </CaTable>

    <GenConfigDrawer ref="genConfigDrawerRef" @save-success="handleSearch" />
    <GenPreviewModal ref="genPreviewModalRef" @download="onDownload" @generate="onGenerate" />
  </CaPageLayout>
</template>

<script setup lang="ts">
import type { GenConfigPageQuery, GenConfigResp } from '@/apis/code'
import type { FormColumnItem } from '@/components/base/CaForm/type'
import type { TableColumnItem } from '@/components/base/CaTable/type'
import { Cpu } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { downloadCode, generateCode, listGenConfig } from '@/apis/code/generator'
import CaQueryForm from '@/components/base/CaQueryForm'
import { useDevice, useDownload, useTable } from '@/hooks'
import GenConfigDrawer from './GenConfigDrawer.vue'
import GenPreviewModal from './GenPreviewModal.vue'

defineOptions({ name: 'CodeGenerator' })

const { isMobile } = useDevice()
const tableRef = useTemplateRef('tableRef')
const queryForm = ref<GenConfigPageQuery>({ tableName: undefined })

const queryFormColumns = computed(
  () =>
    [
      {
        type: 'input',
        label: '表名称',
        field: 'tableName',
        gridItemProps: { span: { xs: 24, sm: 24, md: 12, lg: 8 } },
        props: {
          clearable: true,
          placeholder: '请输入表名称'
        }
      }
    ] as FormColumnItem<GenConfigPageQuery>[]
)

const { tableData, loading, pagination, selectedKeys, search } = useTable<GenConfigResp>(
  (page) => listGenConfig({ ...queryForm.value, ...page }),
  { immediate: true, rowKey: 'tableName' }
)

const selectedTableNameSet = ref<Set<string>>(new Set())
const selectedTableNames = computed(() => Array.from(selectedTableNameSet.value))

const columns = computed(
  () =>
    [
      {
        type: 'selection',
        width: 50,
        align: 'center',
        reserveSelection: true,
        selectable: (row: GenConfigResp) => Boolean(row.createTime)
      },
      {
        label: '序号',
        width: 66,
        align: 'center',
        render: ({ $index }) =>
          h('span', {}, $index + 1 + (pagination.current - 1) * pagination.pageSize),
        fixed: !isMobile.value ? 'left' : false
      },
      {
        label: '表名称',
        prop: 'tableName',
        minWidth: 180,
        showOverflowTooltip: true,
        fixed: !isMobile.value ? 'left' : false
      },
      { label: '描述', prop: 'comment', minWidth: 160, showOverflowTooltip: true },
      { label: '类名前缀', prop: 'classNamePrefix', minWidth: 150, showOverflowTooltip: true },
      { label: '作者名称', prop: 'author', minWidth: 120, showOverflowTooltip: true },
      { label: '所属模块', prop: 'moduleName', minWidth: 150, showOverflowTooltip: true },
      { label: '模块包名', prop: 'packageName', minWidth: 220, showOverflowTooltip: true },
      { label: '配置时间', prop: 'createTime', width: 180 },
      { label: '修改时间', prop: 'updateTime', width: 180 },
      {
        label: '操作',
        prop: 'action',
        slotName: 'action',
        width: 140,
        align: 'center',
        fixed: !isMobile.value ? 'right' : false
      }
    ] as TableColumnItem[]
)

const syncSelectedKeys = () => {
  selectedKeys.value = selectedTableNames.value
}

const clearTableSelection = () => {
  tableRef.value?.tableRef?.clearSelection?.()
}

const clearSelected = () => {
  selectedTableNameSet.value.clear()
  syncSelectedKeys()
  clearTableSelection()
}

const handleSearch = () => {
  clearSelected()
  search()
}

const handleReset = () => {
  queryForm.value = { tableName: undefined }
  clearSelected()
}

const handleSelect = (selection: GenConfigResp[], row: GenConfigResp) => {
  const selected = selection.some((item) => item.tableName === row.tableName)
  if (selected) {
    selectedTableNameSet.value.add(row.tableName)
  } else {
    selectedTableNameSet.value.delete(row.tableName)
  }
  syncSelectedKeys()
}

const handleSelectAll = (selection: GenConfigResp[]) => {
  const currentPageKeys = tableData.value.map((item) => item.tableName)
  currentPageKeys.forEach((key) => selectedTableNameSet.value.delete(key))
  selection.forEach((item) => selectedTableNameSet.value.add(item.tableName))
  syncSelectedKeys()
}

const genConfigDrawerRef = useTemplateRef('genConfigDrawerRef')
const onConfig = (tableName: string, comment: string) => {
  genConfigDrawerRef.value?.onOpen(tableName, comment)
}

const genPreviewModalRef = useTemplateRef('genPreviewModalRef')
const onPreview = (tableNames: string[]) => {
  if (!tableNames.length) {
    ElMessage.warning('请先选择数据')
    return
  }
  genPreviewModalRef.value?.onOpen(tableNames)
}

const onDownload = async (tableNames: string[]) => {
  await useDownload(() => downloadCode(tableNames), '', '.zip')
}

const onGenerate = async (tableNames: string[]) => {
  const res = await generateCode(tableNames)
  if (res.data?.code === '0') {
    ElMessage.success('代码生成成功')
  }
}
</script>

<style scoped lang="scss">
  .selected-alert {
    margin-top: 8px;

    :deep(.el-alert__content) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
  }
</style>
