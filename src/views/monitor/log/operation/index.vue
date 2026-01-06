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
      <ElTooltip v-if="row.status === 0 && row.errorMsg" :content="row.errorMsg" placement="top">
        <CaTag type="danger" :dot="true">
          {{ t('common.error') }}
        </CaTag>
      </ElTooltip>
      <CaTag v-else :type="row.status === 1 ? 'success' : 'danger'" :dot="row.status === 1">
        {{ row.status === 1 ? t('common.success') : t('common.error') }}
      </CaTag>
    </template>

    <template #timeTaken="{ row }">
      <CaTag :type="getTimeTakenType(row.timeTaken)"> {{ row.timeTaken }}ms </CaTag>
    </template>

    <template #createTime="{ row }">
      <ElLink type="primary" @click="handleDetail(row)">
        {{ row.createTime }}
      </ElLink>
    </template>

    <template #action="{ row }">
      <ElSpace>
        <ElButton v-auth="['monitor:log:detail']" type="primary" link @click="handleDetail(row)">
          {{ t('common.detail') }}
        </ElButton>
      </ElSpace>
    </template>
  </CaTable>

  <OperationLogDetailDrawer ref="OperationLogDetailDrawerRef" />
</template>

<script setup lang="ts">
  import type { LogPageQuery, LogResp } from '@/apis/monitor'
  import { listLog } from '@/apis/monitor'
  import type { FormColumnItem } from '@/components/base/CaForm/type'
  import type { TableColumnItem } from '@/components/base/CaTable/type'
  import CaTag from '@/components/base/CaTag/index.vue'
  import { useDevice, useResetReactive, useTable } from '@/hooks'
  import { ElButton, ElLink, ElSpace, ElTooltip } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import OperationLogDetailDrawer from './OperationLogDetailDrawer.vue'

  defineOptions({ name: 'MonitorSystemLogOperation' })

  const { t } = useI18n()
  const { isMobile } = useDevice()

  const OperationLogDetailDrawerRef = ref<InstanceType<typeof OperationLogDetailDrawer>>()

  const [queryForm, resetForm] = useResetReactive<LogPageQuery>({
    sort: ['createTime,desc']
  })

  const queryFormColumns = computed(
    () =>
      [
        {
          type: 'input',
          label: t('pages.systemLog.operation.field.module'),
          field: 'module',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
          props: {
            placeholder: t('pages.systemLog.search.modulePlaceholder'),
            clearable: true
          }
        },
        {
          type: 'input',
          label: t('pages.systemLog.operation.field.description'),
          field: 'description',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
          props: {
            placeholder: t('pages.systemLog.search.descriptionPlaceholder'),
            clearable: true
          }
        },
        {
          type: 'input',
          label: t('pages.systemLog.field.ip'),
          field: 'ip',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
          props: {
            placeholder: t('pages.systemLog.search.ipPlaceholder'),
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
          label: t('pages.systemLog.field.createTime'),
          prop: 'createTime',
          slotName: 'createTime',
          width: 180,
          showOverflowTooltip: true
        },
        {
          label: t('pages.systemLog.field.createUserString'),
          prop: 'createUserString',
          minWidth: 120,
          showOverflowTooltip: true
        },
        {
          label: t('pages.systemLog.operation.field.description'),
          prop: 'description',
          minWidth: 150,
          showOverflowTooltip: true
        },
        {
          label: t('pages.systemLog.operation.field.module'),
          prop: 'module',
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
          label: t('pages.systemLog.field.ip'),
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
          label: t('pages.systemLog.field.timeTaken'),
          prop: 'timeTaken',
          slotName: 'timeTaken',
          width: 100,
          align: 'center'
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
          label: t('pages.systemLog.field.action'),
          prop: 'action',
          slotName: 'action',
          width: 80,
          align: 'center',
          fixed: !isMobile.value ? 'right' : false
        }
      ] as TableColumnItem[]
  )

  const reset = () => {
    resetForm()
    search()
  }

  const handleDetail = (row: LogResp) => {
    OperationLogDetailDrawerRef.value?.onOpen(row.id)
  }

  // 获取耗时标签类型
  const getTimeTakenType = (timeTaken: number): 'success' | 'warning' | 'danger' => {
    if (timeTaken > 500) return 'danger'
    if (timeTaken > 200) return 'warning'
    return 'success'
  }
</script>
