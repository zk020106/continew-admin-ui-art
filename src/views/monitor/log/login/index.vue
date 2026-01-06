<template>
  <CaTable
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

    <template #status="{ row }">
      <ElTag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? t('common.statusEnabled') : t('common.statusDisabled') }}
      </ElTag>
    </template>
  </CaTable>
</template>

<script setup lang="ts">
  import type { LogPageQuery, LogResp } from '@/apis/monitor'
  import { listLog } from '@/apis/monitor'
  import type { FormColumnItem } from '@/components/base/CaForm/type'
  import type { TableColumnItem } from '@/components/base/CaTable/type'
  import { useDevice, useResetReactive, useTable } from '@/hooks'
  import { ElTag } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'MonitorSystemLogLogin' })

  const { t } = useI18n()
  const { isMobile } = useDevice()

  const [queryForm, resetForm] = useResetReactive<LogPageQuery>({
    sort: ['createTime,desc']
  })

  const queryFormColumns = computed(
    () =>
      [
        {
          type: 'input',
          label: t('pages.systemLog.login.field.ip'),
          field: 'ip',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
          props: {
            placeholder: t('pages.systemLog.search.ipPlaceholder'),
            clearable: true
          }
        },
        {
          type: 'input',
          label: t('pages.systemLog.field.createUserString'),
          field: 'createUserString',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
          props: {
            placeholder: t('pages.systemLog.search.createUserPlaceholder'),
            clearable: true
          }
        },
        {
          type: 'select',
          label: t('pages.systemLog.field.status'),
          field: 'status',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
          props: {
            options: [
              { label: t('common.statusEnabled'), value: 1 },
              { label: t('common.statusDisabled'), value: 0 }
            ],
            placeholder: t('common.placeholder.status'),
            clearable: true
          }
        },
        {
          type: 'date-picker',
          label: t('pages.systemLog.field.createTime'),
          field: 'createTime',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
          props: {
            type: 'daterange',
            clearable: true
          }
        }
      ] as FormColumnItem<LogPageQuery>[]
  )

  const { tableData, loading, pagination, search } = useTable<LogResp>(
    (page) => listLog({ ...queryForm, ...page }),
    { immediate: true }
  )

  const columns = computed(
    () =>
      [
        {
          label: t('pages.systemLog.field.index'),
          width: 66,
          align: 'center',
          render: ({ $index }) =>
            h('span', {}, $index + 1 + (pagination.current - 1) * pagination.pageSize),
          fixed: !isMobile.value ? 'left' : false
        },
        {
          label: t('pages.systemLog.login.field.ip'),
          prop: 'ip',
          minWidth: 140,
          showOverflowTooltip: true
        },
        {
          label: t('pages.systemLog.login.field.address'),
          prop: 'address',
          minWidth: 140,
          showOverflowTooltip: true
        },
        {
          label: t('pages.systemLog.field.browser'),
          prop: 'browser',
          minWidth: 120,
          showOverflowTooltip: true
        },
        {
          label: t('pages.systemLog.field.os'),
          prop: 'os',
          minWidth: 120,
          showOverflowTooltip: true
        },
        {
          label: t('pages.systemLog.field.status'),
          prop: 'status',
          slotName: 'status',
          width: 100,
          align: 'center'
        },
        {
          label: t('pages.systemLog.field.createTime'),
          prop: 'createTime',
          width: 180,
          showOverflowTooltip: true
        },
        {
          label: t('pages.systemLog.field.createUserString'),
          prop: 'createUserString',
          minWidth: 120,
          showOverflowTooltip: true
        }
      ] as TableColumnItem[]
  )

  const reset = () => {
    resetForm()
    search()
  }
</script>
