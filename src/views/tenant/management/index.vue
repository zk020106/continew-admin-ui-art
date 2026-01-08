<template>
  <CaPageLayout>
    <CaTable
      row-key="id"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1500 }"
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

      <template #toolbar-left>
        <ElButton v-auth="['tenant:management:create']" type="primary" @click="onAdd">
          <ElIcon><Plus /></ElIcon>
          <span>{{ t('common.button.add') }}</span>
        </ElButton>
      </template>

      <template #code="{ row }">
        <CellCopy :content="row.code" />
      </template>

      <template #status="{ row }">
        <CaCellStatus :status="row.status" />
      </template>

      <template #expireTime="{ row }">
        <span v-if="!row.expireTime">{{ t('pages.tenantManagement.field.neverExpire') }}</span>
        <span v-else>{{ row.expireTime }}</span>
      </template>

      <template #domain="{ row }">
        <a v-if="row.domain" :href="row.domain" target="_blank">{{ row.domain }}</a>
        <span v-else class="text-red-4">{{ t('pages.tenantManagement.field.notSet') }}</span>
      </template>

      <template #action="{ row }">
        <ElSpace>
          <ElButton v-auth="['tenant:management:get']" type="primary" link @click="onDetail(row)">
            {{ t('common.detail') }}
          </ElButton>
          <ElButton
            v-auth="['tenant:management:update']"
            type="primary"
            link
            @click="onUpdate(row)"
          >
            {{ t('common.button.edit') }}
          </ElButton>
          <ElDropdown v-if="hasMoreActions" trigger="click">
            <span class="action-more-icon">
              <ElIcon><MoreFilled /></ElIcon>
            </span>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem
                  v-if="hasAuth('tenant:management:updateAdminUserPwd')"
                  @click="onUpdateAdminUserPwd(row)"
                >
                  {{ t('pages.tenantManagement.button.updateAdminPwd') }}
                </ElDropdownItem>
                <ElDropdownItem
                  v-if="hasAuth('tenant:management:delete') && !row.disabled"
                  @click="onDelete(row)"
                >
                  {{ t('common.button.delete') }}
                </ElDropdownItem>
                <ElDropdownItem v-if="!hasMoreActions" disabled>
                  {{ t('message.noMoreActions') }}
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </ElSpace>
      </template>
    </CaTable>

    <AddModal ref="AddModalRef" @save-success="search" />
    <DetailDrawer ref="DetailDrawerRef" />
    <AdminUserPwdUpdateModal ref="AdminUserPwdUpdateModalRef" @save-success="search" />
  </CaPageLayout>
</template>

<script setup lang="ts">
  import type { TenantQuery, TenantResp } from '@/apis'
  import { listTenantPackageDict } from '@/apis/tenant'
  import { deleteTenant, listTenant } from '@/apis/tenant/management'
  import type { FormColumnItem } from '@/components/base/CaForm/type'
  import type { TableColumnItem } from '@/components/base/CaTable/type'
  import { CellCopy } from '@/components/base/CellCopy'
  import { useAuth, useDevice, useResetReactive, useTable } from '@/hooks'
  import type { LabelValueState } from '@/types/global'
  import { MoreFilled, Plus } from '@element-plus/icons-vue'
  import {
    ElButton,
    ElDropdown,
    ElDropdownItem,
    ElDropdownMenu,
    ElIcon,
    ElMessage,
    ElSpace
  } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import AddModal from './AddModal.vue'
  import AdminUserPwdUpdateModal from './AdminUserPwdUpdateModal.vue'
  import DetailDrawer from './DetailDrawer.vue'

  defineOptions({ name: 'TenantManagement' })

  const { t } = useI18n()
  const { isMobile } = useDevice()
  const { hasAuth } = useAuth()

  const [queryForm, resetForm] = useResetReactive<TenantQuery>({
    sort: ['createTime,desc']
  })

  const packageList = ref<LabelValueState[]>([])

  const queryFormColumns = computed(
    () =>
      [
        {
          type: 'input',
          label: t('pages.tenantManagement.search.description'),
          field: 'description',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
          props: {
            placeholder: t('pages.tenantManagement.search.descriptionPlaceholder'),
            clearable: true
          }
        },
        {
          type: 'select',
          label: t('pages.tenantManagement.search.package'),
          field: 'packageId',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
          props: {
            options: packageList.value,
            placeholder: t('pages.tenantManagement.search.packagePlaceholder'),
            clearable: true
          }
        }
      ] as FormColumnItem<TenantQuery>[]
  )

  const { tableData, loading, pagination, search } = useTable<TenantResp>(
    (page) => listTenant({ ...queryForm, ...page }),
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
          label: t('pages.tenantManagement.field.code'),
          prop: 'code',
          slotName: 'code',
          width: 150,
          showOverflowTooltip: true
        },
        {
          label: t('pages.tenantManagement.field.name'),
          prop: 'name',
          minWidth: 140,
          showOverflowTooltip: true
        },
        {
          label: t('pages.tenantManagement.field.package'),
          prop: 'packageName',
          minWidth: 120,
          showOverflowTooltip: true
        },
        {
          label: t('pages.tenantManagement.field.domain'),
          prop: 'domain',
          slotName: 'domain',
          minWidth: 180,
          showOverflowTooltip: true
        },
        {
          label: t('pages.tenantManagement.field.expireTime'),
          prop: 'expireTime',
          slotName: 'expireTime',
          width: 180
        },
        {
          label: t('pages.tenantManagement.field.adminUsername'),
          prop: 'adminUsername',
          minWidth: 140,
          showOverflowTooltip: true
        },
        {
          label: t('pages.tenantManagement.field.status'),
          prop: 'status',
          slotName: 'status',
          width: 100,
          align: 'center'
        },
        {
          label: t('pages.tenantManagement.field.description'),
          prop: 'description',
          minWidth: 160,
          showOverflowTooltip: true
        },
        {
          label: t('pages.tenantManagement.field.createUser'),
          prop: 'createUserString',
          width: 140,
          showOverflowTooltip: true,
          show: false
        },
        {
          label: t('pages.tenantManagement.field.createTime'),
          prop: 'createTime',
          width: 180,
          showOverflowTooltip: true
        },
        {
          label: t('pages.tenantManagement.field.updateUser'),
          prop: 'updateUserString',
          width: 140,
          showOverflowTooltip: true,
          show: false
        },
        {
          label: t('pages.tenantManagement.field.updateTime'),
          prop: 'updateTime',
          width: 180,
          showOverflowTooltip: true,
          show: false
        },
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

  // 检查是否有更多操作
  const hasMoreActions = computed(() => true)

  // 重置
  const reset = () => {
    resetForm()
    search()
  }

  // 删除
  const onDelete = async (row: TenantResp) => {
    try {
      await deleteTenant(row.id)
      ElMessage.success(t('message.deleteSuccess'))
      search()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const AddModalRef = useTemplateRef('AddModalRef')
  // 新增
  const onAdd = () => {
    AddModalRef.value?.onAdd()
  }

  // 修改
  const onUpdate = (record: TenantResp) => {
    AddModalRef.value?.onUpdate(record.id)
  }

  const DetailDrawerRef = useTemplateRef('DetailDrawerRef')
  // 详情
  const onDetail = (record: TenantResp) => {
    DetailDrawerRef.value?.onOpen(record.id)
  }

  const AdminUserPwdUpdateModalRef = useTemplateRef('AdminUserPwdUpdateModalRef')
  // 修改管理员密码
  const onUpdateAdminUserPwd = (record: TenantResp) => {
    AdminUserPwdUpdateModalRef.value?.open(record.id)
  }

  // 查询套餐列表
  const getPackageList = async () => {
    packageList.value = await listTenantPackageDict()
  }

  onMounted(() => {
    getPackageList()
  })
</script>

<style scoped lang="scss">
  .action-more-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }
</style>
