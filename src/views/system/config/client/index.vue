<template>
  <div class="client-config-container">
    <CaTable
      ref="tableRef"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      :disabled-tools="['size']"
      @refresh="search"
    >
      <template #action="{ row }">
        <ElSpace>
          <ElLink type="primary" @click="onDetail(row)">{{ t('common.detail') }}</ElLink>
          <ElLink type="primary" @click="onUpdate(row)">{{ t('common.button.edit') }}</ElLink>
          <ElLink type="danger" @click="onDelete(row)">{{ t('common.button.delete') }}</ElLink>
        </ElSpace>
      </template>
    </CaTable>

    <AddModal ref="AddModalRef" @save-success="search" />
    <DetailModal ref="DetailModalRef" />
  </div>
</template>

<script setup lang="tsx">
  import { deleteClient, listClient } from '@/apis/system/client'
  import type { ClientQuery, ClientResp } from '@/apis/system/type'
  import CaTable from '@/components/base/CaTable/index.vue'
  import { TableColumnItem } from '@/components/base/CaTable/type'
  import { useDict } from '@/hooks'
  import { useTable } from '@/hooks/core/useTable'
  import type { DictItem } from '@/store/modules/dict'
  import { useI18n } from 'vue-i18n'
  import AddModal from './AddModal.vue'
  import DetailModal from './DetailModal.vue'

  defineOptions({ name: 'ClientConfig' })

  const { t } = useI18n()
  const { client_type, auth_type } = useDict('client_type', 'auth_type')

  const queryForm = reactive<ClientQuery>({
    clientType: '',
    status: '',
    sort: ['createTime,desc']
  })

  const { loading, tableData, pagination, search, handleDelete } = useTable(
    (page) => listClient({ ...queryForm, ...page }),
    { immediate: true }
  )

  const tableRef = ref()

  // 获取字典标签
  const getDictLabel = (dict: DictItem[], value: string) => {
    const item = dict.find((d) => d.value === value)
    return item?.label || value
  }

  const columns = computed(
    () =>
      [
        {
          label: t('common.index'),
          width: 66,
          align: 'center',
          render: ({ $index }) => $index + 1 + (pagination.current - 1) * pagination.pageSize
        },
        { label: t('system.config.client.clientId'), prop: 'clientId', minWidth: 180 },
        {
          label: t('system.config.client.clientType'),
          prop: 'clientType',
          width: 120,
          align: 'center',
          render: ({ row }) => ({
            component: 'ElTag',
            children: getDictLabel(client_type.value, row.clientType)
          })
        },
        {
          label: t('system.config.client.authType'),
          prop: 'authType',
          width: 150,
          align: 'center',
          render: ({ row }) => ({
            component: 'ElTag',
            children: getDictLabel(auth_type.value, row.authType)
          })
        },
        {
          label: t('system.config.client.activeTimeout'),
          prop: 'activeTimeout',
          width: 140,
          align: 'center',
          render: ({ row }) => `${row.activeTimeout}${t('system.config.client.activeTimeoutUnit')}`
        },
        {
          label: t('system.config.client.timeout'),
          prop: 'timeout',
          width: 120,
          align: 'center',
          render: ({ row }) => `${row.timeout}${t('system.config.client.timeoutUnit')}`
        },
        {
          label: t('common.status'),
          prop: 'status',
          width: 100,
          align: 'center',
          render: ({ row }) => ({
            component: 'ElTag',
            props: { type: row.status === 'Valid' ? 'success' : 'danger', size: 'small' },
            children:
              row.status === 'Valid' ? t('common.statusEnabled') : t('common.statusDisabled')
          })
        },
        {
          label: t('system.config.client.isConcurrent'),
          prop: 'isConcurrent',
          width: 120,
          align: 'center',
          render: ({ row }) => ({
            component: 'ElTag',
            props: { type: row.isConcurrent ? 'success' : 'info', size: 'small' },
            children: row.isConcurrent ? t('common.true') : t('common.false')
          })
        },
        { label: t('common.createTime'), prop: 'createTime', width: 180 },
        {
          label: t('common.action'),
          prop: 'action',
          slotName: 'action',
          width: 200,
          align: 'center',
          fixed: 'right'
        }
      ] as TableColumnItem[]
  )

  const onReset = () => {
    queryForm.clientType = ''
    queryForm.status = ''
    search()
  }

  const onDelete = (row: ClientResp) => {
    handleDelete(() => deleteClient(row.id), {
      content: t('system.config.client.deleteConfirm', { clientId: row.clientId })
    })
  }

  const AddModalRef = ref<InstanceType<typeof AddModal>>()
  const DetailModalRef = ref<InstanceType<typeof DetailModal>>()

  const onAdd = () => {
    AddModalRef.value?.onAdd()
  }

  const onUpdate = (record: ClientResp) => {
    AddModalRef.value?.onUpdate(record.id)
  }

  const onDetail = (record: ClientResp) => {
    DetailModalRef.value?.onDetail(record.id)
  }
</script>

<style scoped lang="scss">
  .client-config-container {
    padding: 20px;
  }
</style>
