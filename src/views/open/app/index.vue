<template>
  <CaPageLayout>
    <CaTable
      row-key="id"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1300 }"
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
        <ElButton v-auth="['open:app:create']" type="primary" @click="onAdd">
          <ElIcon><Plus /></ElIcon>
          <span>{{ t('common.button.add') }}</span>
        </ElButton>
        <ElButton v-auth="['open:app:export']" @click="onExport">
          <ElIcon><Download /></ElIcon>
          <span>{{ t('common.button.export') }}</span>
        </ElButton>
      </template>

      <template #accessKey="{ row }">
        <CellCopy :content="row.accessKey" />
      </template>

      <template #secretKey="{ row }">
        <ElSpace v-if="row.secretKey">
          <CellCopy :content="row.secretKey" />
          <ElButton type="text" size="small" @click="onSecretHide(row)">
            <ElIcon><Hide /></ElIcon>
          </ElButton>
        </ElSpace>
        <ElSpace v-else>
          <span>********************</span>
          <ElButton v-auth="['open:app:secret']" type="text" size="small" @click="onSecret(row)">
            <ElIcon><View /></ElIcon>
          </ElButton>
        </ElSpace>
      </template>

      <template #status="{ row }">
        <CaCellStatus :status="row.status" />
      </template>

      <template #action="{ row }">
        <ElSpace>
          <ElButton v-auth="['open:app:get']" type="primary" link @click="onDetail(row)">
            {{ t('common.detail') }}
          </ElButton>
          <ElButton v-auth="['open:app:update']" type="primary" link @click="onUpdate(row)">
            {{ t('common.button.edit') }}
          </ElButton>
          <ElDropdown v-if="hasMoreActions" trigger="click">
            <span class="action-more-icon">
              <ElIcon><MoreFilled /></ElIcon>
            </span>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem v-if="hasAuth('open:app:resetSecret')" @click="onResetSecret(row)">
                  {{ t('pages.appManagement.button.resetSecret') }}
                </ElDropdownItem>
                <ElDropdownItem
                  v-if="hasAuth('open:app:delete') && !row.disabled"
                  divided
                  @click="onDelete(row)"
                >
                  <ElText type="danger">{{ t('common.button.delete') }}</ElText>
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
  </CaPageLayout>
</template>

<script setup lang="ts">
  import type { AppPageQuery, AppResp } from '@/apis/open/app'
  import { deleteApp, exportApp, getAppSecret, listApp, resetAppSecret } from '@/apis/open/app'
  import type { FormColumnItem } from '@/components/base/CaForm/type'
  import type { TableColumnItem } from '@/components/base/CaTable/type'
  import { CellCopy } from '@/components/base/CellCopy'
  import { useAuth, useDevice, useResetReactive, useTable } from '@/hooks'
  import { Download, Hide, MoreFilled, Plus, View } from '@element-plus/icons-vue'
  import {
    ElButton,
    ElDropdown,
    ElDropdownItem,
    ElDropdownMenu,
    ElIcon,
    ElMessage,
    ElMessageBox,
    ElSpace,
    ElText
  } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import AddModal from './AddModal.vue'
  import DetailDrawer from './DetailDrawer.vue'

  defineOptions({ name: 'OpenApp' })

  const { t } = useI18n()
  const { isMobile } = useDevice()
  const { hasAuth } = useAuth()

  const [queryForm, resetForm] = useResetReactive<AppPageQuery>({
    sort: ['createTime,desc']
  })

  const queryFormColumns = computed(
    () =>
      [
        {
          type: 'input',
          label: t('pages.appManagement.search.description'),
          field: 'description',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
          props: {
            placeholder: t('pages.appManagement.search.descriptionPlaceholder'),
            clearable: true
          }
        }
      ] as FormColumnItem<AppPageQuery>[]
  )

  const { tableData, loading, pagination, search, handleDelete } = useTable<AppResp>(
    (page) => listApp({ ...queryForm, ...page }),
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
          label: t('pages.appManagement.field.name'),
          prop: 'name',
          minWidth: 140,
          showOverflowTooltip: true,
          fixed: !isMobile.value ? 'left' : false
        },
        {
          label: 'Access Key',
          prop: 'accessKey',
          slotName: 'accessKey',
          width: 200
        },
        {
          label: 'Secret Key',
          prop: 'secretKey',
          slotName: 'secretKey',
          width: 220
        },
        {
          label: t('pages.appManagement.field.expireTime'),
          prop: 'expireTime',
          width: 180
        },
        {
          label: t('pages.appManagement.field.status'),
          prop: 'status',
          slotName: 'status',
          width: 80,
          align: 'center'
        },
        {
          label: t('pages.appManagement.field.description'),
          prop: 'description',
          minWidth: 160,
          showOverflowTooltip: true
        },
        {
          label: t('pages.appManagement.field.createUser'),
          prop: 'createUserString',
          width: 140,
          showOverflowTooltip: true,
          show: false
        },
        {
          label: t('pages.appManagement.field.createTime'),
          prop: 'createTime',
          width: 180
        },
        {
          label: t('pages.appManagement.field.updateUser'),
          prop: 'updateUserString',
          width: 140,
          showOverflowTooltip: true,
          show: false
        },
        {
          label: t('pages.appManagement.field.updateTime'),
          prop: 'updateTime',
          width: 180,
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

  const hasMoreActions = computed(() => true)

  const reset = () => {
    resetForm()
    search()
  }

  const onDelete = (record: AppResp) => {
    handleDelete(() => deleteApp(record.id), {
      content: t('pages.appManagement.message.confirmDelete', { name: record.name }),
      confirmType: 'error',
      successTip: t('message.deleteSuccess')
    })
  }

  const onExport = () => {
    exportApp(queryForm)
  }

  const onSecret = async (record: AppResp) => {
    const res = await getAppSecret(record.id)
    record.secretKey = res.data.secretKey
  }

  const onSecretHide = (record: AppResp) => {
    record.secretKey = ''
  }

  const onResetSecret = async (record: AppResp) => {
    try {
      await ElMessageBox.confirm(
        t('pages.appManagement.message.confirmResetSecret', { name: record.name }),
        t('common.tips'),
        {
          type: 'warning',
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel')
        }
      )
      await resetAppSecret(record.id)
      ElMessage.success(t('message.updateSuccess'))
      search()
    } catch (error) {
      console.error('重置密钥失败:', error)
    }
  }

  const AddModalRef = useTemplateRef('AddModalRef')
  const onAdd = () => {
    AddModalRef.value?.onAdd()
  }

  const onUpdate = (record: AppResp) => {
    AddModalRef.value?.onUpdate(record.id)
  }

  const DetailDrawerRef = useTemplateRef('DetailDrawerRef')
  const onDetail = (record: AppResp) => {
    DetailDrawerRef.value?.onOpen(record.id)
  }
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
