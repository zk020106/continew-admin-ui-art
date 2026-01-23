<template>
  <CaPageLayout>
    <CaTable
      row-key="id"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1200 }"
      :pagination="pagination"
      :disabled-tools="['size']"
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

      <template #toolbar-right>
        <CaButton v-auth="['system:smsLog:export']" type="export" @click="onExport" />
      </template>

      <template #status="{ row }">
        <CaCellStatus
          v-if="row.status === 1"
          :status="1"
          :text="t('pages.smsLog.field.statusSuccess')"
        />
        <CaCellStatus v-else :status="2" :text="t('pages.smsLog.field.statusFailure')" />
      </template>

      <template #action="{ row }">
        <ElSpace>
          <ElPopconfirm
            :title="t('pages.smsLog.message.confirmDelete')"
            :confirm-button-props="{ type: 'danger' }"
            @confirm="onDelete(row)"
          >
            <template #reference>
              <ElButton
                v-auth="['system:smsLog:delete']"
                type="danger"
                link
                :disabled="row.disabled"
              >
                {{ t('common.button.delete') }}
              </ElButton>
            </template>
          </ElPopconfirm>
        </ElSpace>
      </template>
    </CaTable>
  </CaPageLayout>
</template>

<script setup lang="ts">
import type { SmsLogQuery, SmsLogResp } from '@/apis'
import type { FormColumnItem } from '@/components/base/CaForm/type'
import type { TableColumnItem } from '@/components/base/CaTable/type'
import { ElButton, ElMessage, ElPopconfirm, ElSpace } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { deleteSmsLog, exportSmsLog, listSmsLog } from '@/apis/system/smsLog'
import { useDevice, useDownload, useResetReactive, useTable } from '@/hooks'

defineOptions({ name: 'MonitorSmsLog' })

const { t } = useI18n()
const { isMobile } = useDevice()
const route = useRoute()

const [queryForm, resetForm] = useResetReactive<SmsLogQuery>({
  sort: ['id,desc']
})

const queryFormColumns = computed(
  () =>
    [
      {
        type: 'input',
        label: t('pages.smsLog.search.configId'),
        field: 'configId',
        gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
        props: {
          placeholder: t('pages.smsLog.search.configIdPlaceholder'),
          clearable: true
        }
      },
      {
        type: 'input',
        label: t('pages.smsLog.search.phone'),
        field: 'phone',
        gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
        props: {
          placeholder: t('pages.smsLog.search.phonePlaceholder'),
          clearable: true
        }
      },
      {
        type: 'select',
        label: t('pages.smsLog.search.status'),
        field: 'status',
        gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
        props: {
          options: [
            { label: t('pages.smsLog.field.statusSuccess'), value: 1 },
            { label: t('pages.smsLog.field.statusFailure'), value: 2 }
          ],
          placeholder: t('pages.smsLog.search.statusPlaceholder'),
          clearable: true
        }
      }
    ] as FormColumnItem<SmsLogQuery>[]
)

const { tableData, loading, pagination, search } = useTable<SmsLogResp>(
  (page) => listSmsLog({ ...queryForm, ...page }),
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
          h('span', {}, $index + 1 + (pagination.current - 1) * pagination.pageSize),
        fixed: !isMobile.value ? 'left' : false
      },
      {
        label: t('pages.smsLog.field.configId'),
        prop: 'configId',
        minWidth: 120,
        showOverflowTooltip: true
      },
      {
        label: t('pages.smsLog.field.phone'),
        prop: 'phone',
        minWidth: 140,
        showOverflowTooltip: true
      },
      {
        label: t('pages.smsLog.field.params'),
        prop: 'params',
        minWidth: 200,
        showOverflowTooltip: true
      },
      {
        label: t('pages.smsLog.field.status'),
        prop: 'status',
        slotName: 'status',
        width: 100,
        align: 'center'
      },
      {
        label: t('pages.smsLog.field.resMsg'),
        prop: 'resMsg',
        minWidth: 260,
        showOverflowTooltip: true
      },
      {
        label: t('pages.smsLog.field.createUser'),
        prop: 'createUserString',
        width: 140,
        showOverflowTooltip: true
      },
      {
        label: t('pages.smsLog.field.createTime'),
        prop: 'createTime',
        width: 180,
        showOverflowTooltip: true
      },
      {
        label: t('common.action'),
        prop: 'action',
        slotName: 'action',
        width: 100,
        align: 'center',
        fixed: !isMobile.value ? 'right' : false
      }
    ] as TableColumnItem[]
)

// 重置
const reset = () => {
  resetForm()
  search()
}

// 删除
const onDelete = async (row: SmsLogResp) => {
  try {
    await deleteSmsLog(row.id)
    ElMessage.success(t('message.deleteSuccess'))
    search()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 导出
const onExport = () => {
  useDownload(() => exportSmsLog(queryForm))
}

onMounted(() => {
  if (route.query?.configId) {
    queryForm.configId = route.query.configId as string
  }
  search()
})
</script>

<style scoped lang="scss"></style>
