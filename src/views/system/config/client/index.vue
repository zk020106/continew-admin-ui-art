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
      <template #toolbar-left>
        <ElButton type="primary" @click="onAdd">
          <template #icon>
            <ElIcon><Plus /></ElIcon>
          </template>
          {{ t('common.button.add') }}
        </ElButton>
      </template>
      <template #index="{ $index }">
        {{ $index + 1 + (pagination.current - 1) * pagination.pageSize }}
      </template>
      <template #clientType="{ row }">
        <CaCellTag :value="row.clientType" :data="client_type" />
      </template>
      <template #authType="{ row }">
        <CaCellTags :value="row.authType" :data="auth_type_enum" />
      </template>
      <template #status="{ row }">
        <CaCellStatus :status="row.status" />
      </template>
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

<script setup lang="ts">
import type { ClientQuery, ClientResp } from '@/apis/system/type'
import type { TableColumnItem } from '@/components/base/CaTable/type'
import { Plus } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { deleteClient, listClient } from '@/apis/system/client'
import CaCellTag from '@/components/base/CaCell/CaCellTag.vue'
import CaTable from '@/components/base/CaTable/index.vue'
import { useDict } from '@/hooks'
import { useTable } from '@/hooks/core/useTable'
import AddModal from './AddModal.vue'
import DetailModal from './DetailModal.vue'

defineOptions({ name: 'ClientConfig' })

const { t } = useI18n()
const { client_type, auth_type_enum } = useDict('client_type', 'auth_type_enum')

const queryForm = reactive<ClientQuery>({
  clientType: '',
  status: '',
  sort: ['createTime,desc']
})

const { loading, tableData, pagination, search, handleDelete } = useTable(
  (page) => listClient({ ...queryForm, ...page }),
  { immediate: true }
)

const columns = computed(
  () =>
    [
      { label: t('common.index'), prop: 'index', slotName: 'index', width: 66, align: 'center' },
      { label: t('system.config.client.clientId'), prop: 'clientId', minWidth: 180 },
      {
        label: t('system.config.client.clientType'),
        prop: 'clientType',
        slotName: 'clientType',
        width: 120,
        align: 'center'
      },
      {
        label: t('system.config.client.authType'),
        prop: 'authType',
        slotName: 'authType',
        width: 150,
        align: 'center'
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
        slotName: 'status',
        width: 100,
        align: 'center'
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
    // padding: 20px;
    height: 100%;
  }
</style>
