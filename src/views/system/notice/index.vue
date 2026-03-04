<template>
  <CaPageLayout>
    <CaTable
      row-key="id"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1100 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['title']"
      @refresh="search"
    >
      <template #top>
        <CaQueryForm
          v-model="queryForm"
          mode="click-search"
          :columns="queryFormColumns"
          @search="search"
          @reset="reset"
        />
      </template>
      <template #toolbar-left>
        <ElButton v-auth="['system:notice:create']" type="primary" @click="onAdd">
          <ElIcon><Plus /></ElIcon>
          <span>{{ t('common.button.add') }}</span>
        </ElButton>
      </template>
      <template #noticeScope="{ row }">
        <CaCellTag :value="row.noticeScope" :data="notice_scope_enum" />
      </template>
      <template #noticeMethods="{ row }">
        <span v-if="!row.noticeMethods?.length">无</span>
        <CaCellTags v-else :data="formatNoticeMethods(row.noticeMethods)" />
      </template>
      <template #type="{ row }">
        <CaCellTag :value="row.type" :data="notice_type" />
      </template>
      <template #status="{ row }">
        <CaCellTag :value="row.status" :data="notice_status_enum" />
      </template>
      <template #isTiming="{ row }">
        <ElTag v-if="row.isTiming" type="primary" size="small">是</ElTag>
        <ElTag v-else type="danger" size="small">否</ElTag>
      </template>
      <template #action="{ row }">
        <ElSpace>
          <ElLink v-auth="['system:notice:get']" type="primary" @click="onDetail(row)">
            {{ t('common.detail') }}
          </ElLink>
          <ElLink v-auth="['system:notice:view']" type="primary" @click="onPreview(row)">
            查看
          </ElLink>
          <ElDropdown v-if="hasMoreActions" trigger="click">
            <span class="action-more-icon">
              <ElIcon><MoreFilled /></ElIcon>
            </span>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem v-if="hasAuth('system:notice:update')" @click="onUpdate(row)">
                  {{ t('common.button.edit') }}
                </ElDropdownItem>
                <ElDropdownItem
                  v-if="hasAuth('system:notice:delete')"
                  divided
                  @click="onDelete(row)"
                >
                  <ElText type="danger">{{ t('common.button.delete') }}</ElText>
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </ElSpace>
      </template>
    </CaTable>

    <AddDrawer ref="AddDrawerRef" @save-success="search" />
    <DetailDrawer ref="DetailDrawerRef" />
    <PreviewDrawer ref="PreviewDrawerRef" />
  </CaPageLayout>
</template>

<script setup lang="ts">
import type { NoticePageQuery, NoticeResp } from '@/apis/system'
import type { FormColumnItem } from '@/components/base/CaForm/type'
import type { TableColumnItem } from '@/components/base/CaTable/type'
import type { LabelValueState } from '@/types/global'
import { MoreFilled, Plus } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { deleteNotice, listNotice } from '@/apis/system'
import { CaCellTag, CaCellTags } from '@/components/base/CaCell'
import CaQueryForm from '@/components/base/CaQueryForm'
import { useAuth, useDevice, useDict, useResetReactive, useTable } from '@/hooks'
import AddDrawer from './AddDrawer.vue'
import DetailDrawer from './DetailDrawer.vue'
import PreviewDrawer from './PreviewDrawer.vue'

defineOptions({ name: 'SystemNotice' })

const { t } = useI18n()
const { isMobile } = useDevice()
const { hasAuth } = useAuth()
const { notice_type, notice_scope_enum, notice_method_enum, notice_status_enum } = useDict(
  'notice_type',
  'notice_scope_enum',
  'notice_method_enum',
  'notice_status_enum'
)

const [queryForm, resetForm] = useResetReactive<NoticePageQuery>({
  sort: ['id,desc']
})

const queryFormColumns = computed(
  () =>
    [
      {
        type: 'input',
        label: '标题',
        field: 'title',
        gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
        props: {
          placeholder: '搜索标题',
          clearable: true
        }
      },
      {
        type: 'select',
        label: '分类',
        field: 'type',
        gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
        props: {
          options: notice_type.value,
          placeholder: '请选择分类',
          clearable: true
        }
      }
    ] as FormColumnItem<NoticePageQuery>[]
)

const { tableData, loading, pagination, search, handleDelete } = useTable<NoticeResp>(
  (page) => listNotice({ ...queryForm, ...page }),
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
        label: '公告标题',
        prop: 'title',
        minWidth: 180,
        showOverflowTooltip: true,
        fixed: !isMobile.value ? 'left' : false
      },
      {
        label: '发布人',
        prop: 'createUserString',
        minWidth: 120,
        showOverflowTooltip: true
      },
      {
        label: '通知范围',
        prop: 'noticeScope',
        slotName: 'noticeScope',
        width: 110,
        align: 'center'
      },
      {
        label: '通知方式',
        prop: 'noticeMethods',
        slotName: 'noticeMethods',
        minWidth: 180,
        showOverflowTooltip: true
      },
      { label: '分类', prop: 'type', slotName: 'type', width: 110, align: 'center' },
      { label: t('common.status'), prop: 'status', slotName: 'status', width: 100, align: 'center' },
      { label: '是否定时', prop: 'isTiming', slotName: 'isTiming', width: 100, align: 'center' },
      { label: '发布时间', prop: 'publishTime', width: 180 },
      {
        label: t('common.action'),
        prop: 'action',
        slotName: 'action',
        width: 170,
        align: 'center',
        fixed: !isMobile.value ? 'right' : false
      }
    ] as TableColumnItem[]
)

const hasMoreActions = computed(
  () => hasAuth('system:notice:update') || hasAuth('system:notice:delete')
)

const formatNoticeMethods = (methods: Array<number | string>) => {
  return methods
    .map((method) =>
      notice_method_enum.value.find((item) => String(item.value) === String(method))
    )
    .filter(Boolean) as LabelValueState[]
}

const reset = () => {
  resetForm()
  search()
}

const onDelete = (row: NoticeResp) => {
  return handleDelete(() => deleteNotice(String(row.id)), {
    content: `是否确定删除公告「${row.title}」？`,
    confirmType: 'error'
  })
}

const AddDrawerRef = ref<InstanceType<typeof AddDrawer>>()
const onAdd = () => {
  AddDrawerRef.value?.onAdd()
}

const onUpdate = (row: NoticeResp) => {
  AddDrawerRef.value?.onUpdate(String(row.id))
}

const DetailDrawerRef = ref<InstanceType<typeof DetailDrawer>>()
const onDetail = (row: NoticeResp) => {
  DetailDrawerRef.value?.onOpen(String(row.id))
}

const PreviewDrawerRef = ref<InstanceType<typeof PreviewDrawer>>()
const onPreview = (row: NoticeResp) => {
  PreviewDrawerRef.value?.onOpen(String(row.id))
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
