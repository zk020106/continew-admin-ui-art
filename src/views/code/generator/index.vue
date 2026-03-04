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
              {{ t('pages.codeGenerator.selectedMessage', { count: selectedTableNames.length }) }}
            </span>
            <span v-else>{{ t('pages.codeGenerator.noSelection') }}</span>
          </template>
          <template v-if="selectedTableNames.length > 0" #default>
            <ElLink type="primary" @click="clearSelected">{{ t('pages.codeGenerator.clear') }}</ElLink>
          </template>
        </ElAlert>
      </template>

      <template #toolbar-right>
        <ElButton
          v-auth="['code:generator:preview']"
          type="primary"
          :disabled="selectedTableNames.length === 0"
          :title="selectedTableNames.length === 0 ? t('common.placeholder.select') : ''"
          @click="onPreview(selectedTableNames)"
        >
          <ElIcon><Cpu /></ElIcon>
          <span>{{ t('pages.codeGenerator.batchGenerate') }}</span>
        </ElButton>
      </template>

      <template #action="{ row }">
        <ElSpace>
          <ElLink
            v-auth="['code:generator:config']"
            type="primary"
            @click="onConfig(row.tableName, row.comment)"
          >
            {{ t('pages.codeGenerator.action.config') }}
          </ElLink>
          <ElLink
            v-auth="['code:generator:preview']"
            type="primary"
            :disabled="!row.createTime"
            :title="row.createTime ? t('pages.codeGenerator.action.generate') : t('pages.codeGenerator.generateHint')"
            @click="onPreview([row.tableName])"
          >
            {{ t('pages.codeGenerator.action.generate') }}
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
import { useI18n } from 'vue-i18n'
import { downloadCode, generateCode, listGenConfig } from '@/apis/code/generator'
import CaQueryForm from '@/components/base/CaQueryForm'
import { useDevice, useDownload, useTable } from '@/hooks'
import GenConfigDrawer from './GenConfigDrawer.vue'
import GenPreviewModal from './GenPreviewModal.vue'

defineOptions({ name: 'CodeGenerator' })

const { t } = useI18n()
const { isMobile } = useDevice()
const tableRef = useTemplateRef('tableRef')
const queryForm = ref<GenConfigPageQuery>({ tableName: undefined })

const queryFormColumns = computed(
  () =>
    [
      {
        type: 'input',
        label: t('pages.codeGenerator.field.tableName'),
        field: 'tableName',
        gridItemProps: { span: { xs: 24, sm: 24, md: 12, lg: 8 } },
        props: {
          clearable: true,
          placeholder: t('common.placeholder.inputWithLabel', { label: t('pages.codeGenerator.field.tableName') })
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
        label: t('common.index'),
        width: 66,
        align: 'center',
        render: ({ $index }) =>
          h('span', {}, $index + 1 + (pagination.current - 1) * pagination.pageSize),
        fixed: !isMobile.value ? 'left' : false
      },
      {
        label: t('pages.codeGenerator.field.tableName'),
        prop: 'tableName',
        minWidth: 180,
        showOverflowTooltip: true,
        fixed: !isMobile.value ? 'left' : false
      },
      { label: t('pages.codeGenerator.field.comment'), prop: 'comment', minWidth: 160, showOverflowTooltip: true },
      { label: t('pages.codeGenerator.field.classNamePrefix'), prop: 'classNamePrefix', minWidth: 150, showOverflowTooltip: true },
      { label: t('pages.codeGenerator.field.author'), prop: 'author', minWidth: 120, showOverflowTooltip: true },
      { label: t('pages.codeGenerator.field.moduleName'), prop: 'moduleName', minWidth: 150, showOverflowTooltip: true },
      { label: t('pages.codeGenerator.field.packageName'), prop: 'packageName', minWidth: 220, showOverflowTooltip: true },
      { label: t('pages.codeGenerator.field.createTime'), prop: 'createTime', width: 180 },
      { label: t('pages.codeGenerator.field.updateTime'), prop: 'updateTime', width: 180 },
      {
        label: t('common.action'),
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
    ElMessage.warning(t('pages.codeGenerator.selectDataFirst'))
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
    ElMessage.success(t('pages.codeGenerator.generateSuccess'))
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
