<template>
  <CaPageLayout>
    <CaTable
      row-key="id"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
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
        <CaButton v-auth="['tenant:package:create']" type="add" @click="onAdd" />
      </template>
      <template #status="{ row }">
        <CaCellStatus :status="row.status" />
      </template>
      <template #action="{ row }">
        <ElSpace>
          <ElButton v-auth="['tenant:package:get']" type="primary" link @click="onDetail(row)">
            {{ t('common.detail') }}
          </ElButton>
          <ElButton v-auth="['tenant:package:update']" type="primary" link @click="onUpdate(row)">
            {{ t('common.button.edit') }}
          </ElButton>
          <ElButton
            v-auth="['tenant:package:delete']"
            :disabled="row.disabled"
            type="danger"
            link
            @click="onDelete(row)"
          >
            {{ t('common.button.delete') }}
          </ElButton>
        </ElSpace>
      </template>
    </CaTable>

    <AddDrawer ref="AddDrawerRef" @save-success="search" />
    <DetailDrawer ref="DetailDrawerRef" />
  </CaPageLayout>
</template>

<script setup lang="ts">
  import { deleteTenantPackage, listTenantPackage } from '@/apis/tenant/package'
  import type { TenantPackageQuery, TenantPackageResp } from '@/apis/tenant/type'
  import type { FormColumnItem } from '@/components/base/CaForm/type'
  import type { TableColumnItem } from '@/components/base/CaTable/type'
  import { DisEnableStatusList } from '@/constant/common'
  import { useResetReactive, useTable } from '@/hooks'
  import { useDevice } from '@/hooks/core/useDevice'
  import { ElSpace } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import AddDrawer from './AddDrawer.vue'
  import DetailDrawer from './DetailDrawer.vue'

  defineOptions({ name: 'TenantPackage' })

  const { isMobile } = useDevice()
  const { t } = useI18n()

  const [queryForm, resetForm] = useResetReactive<TenantPackageQuery>({
    sort: ['createTime,desc']
  })

  const queryFormColumns = computed(
    () =>
      [
        {
          type: 'input',
          label: t('pages.tenantPackage.field.description'),
          field: 'description',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
          props: {
            placeholder: t('pages.tenantPackage.search.descriptionPlaceholder')
          }
        },
        {
          type: 'select',
          label: t('common.status'),
          field: 'status',
          gridItemProps: { span: { xs: 24, sm: 6, xxl: 8 } },
          props: {
            options: DisEnableStatusList,
            placeholder: t('common.placeholder.status'),
            clearable: true
          }
        }
      ] as FormColumnItem[]
  )

  const { tableData, loading, pagination, search, handleDelete } = useTable<TenantPackageResp>(
    (page) => listTenantPackage({ ...queryForm, ...page }),
    { immediate: true }
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
          label: t('pages.tenantPackage.field.name'),
          prop: 'name',
          minWidth: 140,
          showOverflowTooltip: true,
          fixed: !isMobile.value ? 'left' : false
        },
        {
          label: t('common.status'),
          prop: 'status',
          slotName: 'status',
          align: 'center'
        },
        { label: t('pages.tenantPackage.field.sort'), prop: 'sort', align: 'center', width: 100 },
        {
          label: t('pages.tenantPackage.field.description'),
          prop: 'description',
          minWidth: 150,
          showOverflowTooltip: true
        },
        {
          label: t('pages.tenantPackage.field.createUser'),
          prop: 'createUserString',
          minWidth: 120,
          showOverflowTooltip: true,
          show: false
        },
        { label: t('common.createTime'), prop: 'createTime', width: 180 },
        {
          label: t('pages.tenantPackage.field.updateUser'),
          prop: 'updateUserString',
          minWidth: 120,
          showOverflowTooltip: true,
          show: false
        },
        { label: t('common.updateTime'), prop: 'updateTime', width: 180, show: false },
        {
          label: t('common.action'),
          prop: 'action',
          slotName: 'action',
          width: 180,
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
  const onDelete = (record: TenantPackageResp) => {
    return handleDelete(() => deleteTenantPackage(record.id), {
      content: t('pages.tenantPackage.message.confirmDelete', { name: record.name })
    })
  }

  const AddDrawerRef = useTemplateRef('AddDrawerRef')
  // 新增
  const onAdd = () => {
    AddDrawerRef.value?.onAdd()
  }

  // 修改
  const onUpdate = (record: TenantPackageResp) => {
    AddDrawerRef.value?.onUpdate(record.id)
  }

  const DetailDrawerRef = useTemplateRef('DetailDrawerRef')
  // 详情
  const onDetail = (record: TenantPackageResp) => {
    DetailDrawerRef.value?.onOpen(record.id)
  }
</script>

<style scoped lang="scss"></style>
