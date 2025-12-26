<template>
  <div class="dict-item-container">
    <div v-if="!dict.id" class="empty-state">
      <ElEmpty :description="t('dict.item.selectDict')" />
    </div>
    <CaTable
      v-else
      row-key="id"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1200 }"
      :pagination="pagination"
      @refresh="search"
    >
      <template #top>
        <CaForm
          v-model="queryForm"
          search
          :columns="queryFormColumns"
          @search="search"
          @reset="reset"
        />
      </template>
      <template #toolbar-left>
        <ElSpace>
          <CaButton type="add" @click="onAdd" />
        </ElSpace>
      </template>
      <template #color="{ row }">
        <div v-if="row.color" class="color-badge" :style="{ backgroundColor: row.color }"></div>
        <span v-else>{{ t('dict.item.form.noColor') }}</span>
      </template>
      <template #status="{ row }">
        <CaCellStatus :status="row.status" />
      </template>
      <template #action="{ row }">
        <ElSpace>
          <ElLink type="primary" @click="onUpdate(row)">{{ t('common.button.edit') }}</ElLink>
          <ElLink type="danger" :disabled="dict.isSystem" :underline="false" @click="onDelete(row)">
            {{ t('common.button.delete') }}
          </ElLink>
        </ElSpace>
      </template>
    </CaTable>

    <ItemDrawer ref="ItemDrawerRef" @save-success="search" />
  </div>
</template>

<script setup lang="ts">
  import { DictItemQuery, DictItemResp, DictResp } from '@/apis'
  import { deleteDictItem, listDictItem } from '@/apis/system/dict'
  import { FormColumnItem } from '@/components/base/CaForm/type'
  import { TableColumnItem } from '@/components/base/CaTable/type'
  import { DisEnableStatusList } from '@/constant/common'
  import { useResetReactive, useTable } from '@/hooks'
  import { ElEmpty, ElMessage, ElSpace } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import ItemDrawer from './ItemDrawer.vue'

  const props = defineProps<{
    dict: DictResp
  }>()

  const { t } = useI18n()

  const [queryForm, resetForm] = useResetReactive<DictItemQuery>({
    dictId: props.dict.id,
    sort: ['sort,asc']
  })

  const queryFormColumns = computed(
    () =>
      [
        {
          type: 'input',
          label: t('dict.item.field.label'),
          field: 'description',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
          props: {
            placeholder: t('dict.item.searchPlaceholder')
          }
        },
        {
          type: 'select',
          label: t('dict.item.field.status'),
          field: 'status',
          gridItemProps: { span: { xs: 24, sm: 6, xxl: 8 } },
          props: {
            options: DisEnableStatusList,
            placeholder: t('common.placeholder.status')
          }
        }
      ] as FormColumnItem<DictItemQuery>[]
  )

  const { tableData, loading, pagination, search, handleDelete } = useTable<DictItemResp>(
    (page) => listDictItem({ ...queryForm, ...page }),
    { immediate: false }
  )

  const columns = computed(
    () =>
      [
        {
          label: t('common.index'),
          width: 66,
          align: 'center',
          render: ({ $index }) =>
            h('span', {}, $index + 1 + (pagination.current - 1) * pagination.pageSize)
        },
        {
          label: t('dict.item.field.label'),
          prop: 'label',
          minWidth: 120,
          showOverflowTooltip: true
        },
        {
          label: t('dict.item.field.value'),
          prop: 'value',
          minWidth: 120,
          showOverflowTooltip: true
        },
        {
          label: t('dict.item.field.color'),
          prop: 'color',
          slotName: 'color',
          align: 'center',
          width: 120
        },
        { label: t('dict.item.field.sort'), prop: 'sort', align: 'center', width: 100 },
        { label: t('dict.item.field.status'), prop: 'status', slotName: 'status', align: 'center' },
        {
          label: t('dict.item.field.description'),
          prop: 'description',
          minWidth: 150,
          showOverflowTooltip: true
        },
        { label: t('dict.item.field.createTime'), prop: 'createTime', width: 180 },
        {
          label: t('common.action'),
          prop: 'action',
          slotName: 'action',
          width: 140,
          align: 'center',
          fixed: 'right'
        }
      ] as TableColumnItem[]
  )

  // 重置
  const reset = () => {
    resetForm()
    search()
  }

  // 删除
  const onDelete = (row: { id: string; label: any }) => {
    if (props.dict.isSystem) {
      ElMessage.warning(t('dict.message.systemCannotDelete'))
      return
    }
    return handleDelete(() => deleteDictItem(row.id), {
      content: t('dict.item.message.confirmDelete', { label: row.label })
    })
  }

  const ItemDrawerRef = ref<InstanceType<typeof ItemDrawer>>()
  // 新增
  const onAdd = () => {
    if (!props.dict.id) {
      ElMessage.warning(t('dict.item.message.selectDictFirst'))
      return
    }
    ItemDrawerRef.value?.onAdd(props.dict.id)
  }

  // 修改
  const onUpdate = (record: DictItemResp) => {
    ItemDrawerRef.value?.onUpdate(record.id)
  }

  // 监听字典变化
  watch(
    () => props.dict.id,
    (newId) => {
      queryForm.dictId = newId
      if (newId) {
        search()
      }
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  .dict-item-container {
    height: 100%;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .color-badge {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
  }
</style>
