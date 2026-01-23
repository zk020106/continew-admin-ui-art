<template>
  <CaTable
    row-key="id"
    :data="tableData"
    :columns="columns"
    :loading="loading"
    :pagination="pagination"
    @refresh="search"
  >
    <template #top>
      <CaQueryForm v-model="queryForm" mode="click-search" :columns="queryFormColumns" />
    </template>
    <template #toolbar-left>
      <ElButton type="primary" @click="onAdd">
        <template #icon>
          <ElIcon><Plus /></ElIcon>
        </template>
        {{ t('common.button.add') }}
      </ElButton>
    </template>
    <template #supplier="{ row }">
      <ElTag v-if="row.supplier" size="small">{{ row.supplier }}</ElTag>
      <span v-else>{{ t('common.empty') }}</span>
    </template>
    <template #isDefault="{ row }">
      <ElTag v-if="row.isDefault" type="success" size="small">{{ t('common.true') }}</ElTag>
      <ElTag v-else type="info" size="small">{{ t('common.false') }}</ElTag>
    </template>
    <template #status="{ row }">
      <ElTag :type="row.status === 1 ? 'success' : 'danger'" size="small">
        {{ row.status === 1 ? t('common.statusEnabled') : t('common.statusDisabled') }}
      </ElTag>
    </template>
    <template #action="{ row }">
      <ElSpace>
        <ElLink type="primary" @click="onUpdate(row)">{{ t('common.button.edit') }}</ElLink>
        <ElDropdown>
          <ElButton text>
            <ElIcon><MoreFilled /></ElIcon>
          </ElButton>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem @click="onSetDefault(row)">
                {{ t('system.config.sms.isDefault') }}
              </ElDropdownItem>
              <ElDropdownItem @click="onDelete(row)">
                <ElLink type="danger">{{ t('common.button.delete') }}</ElLink>
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </ElSpace>
    </template>
  </CaTable>
  <AddDrawer ref="AddDrawerRef" @save-success="search" />
</template>

<script setup lang="ts">
import type { SmsConfigQuery, SmsConfigResp } from '@/apis/system/type'
import type { FormColumnItem } from '@/components/base/CaQueryForm/type'
import type { TableColumnItem } from '@/components/base/CaTable/type'
import { MoreFilled, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { h } from 'vue'
import { useI18n } from 'vue-i18n'
import { deleteSmsConfig, listSmsConfig, setDefaultSmsConfig } from '@/apis/system/smsConfig'
import CaQueryForm from '@/components/base/CaQueryForm'
import CaTable from '@/components/base/CaTable/index.vue'
import AddDrawer from './AddDrawer.vue'

defineOptions({ name: 'SmsConfig' })

const { t } = useI18n()

const queryForm = reactive<SmsConfigQuery>({
  name: undefined,
  supplier: undefined,
  accessKey: undefined,
  sort: ['createTime,desc']
})

const queryFormColumns = computed(
  () =>
    [
      {
        type: 'input',
        label: t('system.config.sms.name'),
        field: 'name',
        gridItemProps: { span: { xs: 24, sm: 8 } },
        props: { placeholder: t('system.config.sms.namePlaceholder') }
      },
      {
        type: 'input',
        label: t('system.config.sms.accessKey'),
        field: 'accessKey',
        gridItemProps: { span: { xs: 24, sm: 8 } },
        props: { placeholder: t('system.config.sms.accessKeyPlaceholder') }
      },
      {
        type: 'select',
        label: t('system.config.sms.supplier'),
        field: 'supplier',
        gridItemProps: { span: { xs: 24, sm: 8 } },
        props: {
          placeholder: t('system.config.sms.supplierPlaceholder'),
          options: [
            { label: 'AliYun', value: 'AliYun' },
            { label: 'Tencent', value: 'Tencent' },
            { label: 'Huawei', value: 'Huawei' }
          ]
        }
      }
    ] as FormColumnItem<SmsConfigQuery>[]
)

const tableData = ref<SmsConfigResp[]>([])
const loading = ref(false)
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const search = async () => {
  loading.value = true
  try {
    const res = await listSmsConfig({
      ...queryForm,
      page: pagination.current,
      size: pagination.pageSize
    })
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('Failed to fetch SMS config list:', error)
  } finally {
    loading.value = false
  }
}

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
        label: t('system.config.sms.name'),
        prop: 'name',
        minWidth: 120,
        showOverflowTooltip: true
      },
      {
        label: t('system.config.sms.supplier'),
        prop: 'supplier',
        slotName: 'supplier',
        align: 'center',
        width: 120
      },
      {
        label: t('system.config.sms.isDefault'),
        prop: 'isDefault',
        slotName: 'isDefault',
        align: 'center',
        width: 100
      },
      {
        label: t('system.config.sms.accessKey'),
        prop: 'accessKey',
        minWidth: 150,
        showOverflowTooltip: true
      },
      { label: t('system.config.sms.signature'), prop: 'signature', minWidth: 120 },
      {
        label: t('system.config.sms.templateId'),
        prop: 'templateId',
        minWidth: 120
      },
      {
        label: t('common.status'),
        prop: 'status',
        slotName: 'status',
        align: 'center',
        width: 80
      },
      { label: t('common.createTime'), prop: 'createTime', width: 180 },
      {
        label: t('common.action'),
        prop: 'action',
        slotName: 'action',
        width: 120,
        align: 'center',
        fixed: 'right'
      }
    ] as TableColumnItem[]
)

const reset = () => {
  queryForm.name = undefined
  queryForm.supplier = undefined
  queryForm.accessKey = undefined
  search()
}

const onDelete = (row: SmsConfigResp) => {
  ElMessageBox.confirm(
    t('system.config.sms.deleteConfirm', { name: row.name }),
    t('common.tips'),
    {
      type: 'warning',
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel')
    }
  )
    .then(async () => {
      await deleteSmsConfig(row.id)
      ElMessage.success(t('common.success'))
      search()
    })
    .catch(() => {})
}

const onSetDefault = async (row: SmsConfigResp) => {
  ElMessageBox.confirm(
    t('system.config.sms.setDefaultConfirm', { name: row.name }),
    t('common.tips'),
    {
      type: 'warning',
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel')
    }
  )
    .then(async () => {
      await setDefaultSmsConfig(row.id)
      ElMessage.success(t('common.success'))
      search()
    })
    .catch(() => {})
}

const AddDrawerRef = ref()
const onAdd = () => {
  AddDrawerRef.value?.onAdd()
}
const onUpdate = (record: SmsConfigResp) => {
  AddDrawerRef.value?.onUpdate(record.id)
}

onMounted(() => {
  search()
})
</script>
