<template>
  <CaPageLayout>
    <CaTable
      row-key="id"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 960 }"
      :pagination="pagination"
      :disabled-tools="['size']"
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
        <ElButton type="primary" @click="onReadAll">
          {{ t('pages.userMessageCenter.button.readAll') }}
        </ElButton>
      </template>

      <template #title="{ row }">
        <ElLink type="primary" @click="onView(row)">
          {{ row.title }}
        </ElLink>
      </template>

      <template #isRead="{ row }">
        <ElTag v-if="row.isRead" size="small">{{ t('pages.userMessageCenter.status.read') }}</ElTag>
        <ElTag v-else type="danger" size="small">{{ t('pages.userMessageCenter.status.unread') }}</ElTag>
      </template>

      <template #action="{ row }">
        <ElSpace>
          <ElLink type="primary" @click="onView(row)">
            {{ t('pages.userMessageCenter.action.view') }}
          </ElLink>
          <ElLink v-if="!row.isRead" type="primary" @click="onRead(row)">
            {{ t('pages.userMessageCenter.action.markRead') }}
          </ElLink>
        </ElSpace>
      </template>
    </CaTable>

    <ElDialog
      v-model="detailVisible"
      :title="currentMessage?.title || t('pages.userMessageCenter.dialog.title')"
      width="680px"
      destroy-on-close
    >
      <div v-loading="detailLoading">
        <div class="mb-3 flex gap-4 text-[13px] text-(--el-text-color-secondary)">
          <span>{{ t('pages.userMessageCenter.dialog.createTime') }}: {{ currentMessage?.createTime || '-' }}</span>
          <span>
            {{ t('pages.userMessageCenter.field.status') }}:
            {{ currentMessage?.isRead ? t('pages.userMessageCenter.status.read') : t('pages.userMessageCenter.status.unread') }}
          </span>
        </div>
        <div class="min-h-[120px] whitespace-pre-wrap leading-[1.8] text-(--el-text-color-primary)">
          {{ currentMessage?.content || '-' }}
        </div>
      </div>
    </ElDialog>
  </CaPageLayout>
</template>

<script setup lang="ts">
import type { MessagePageQuery, MessageResp } from '@/apis/system'
import type { FormColumnItem } from '@/components/base/CaForm/type'
import type { TableColumnItem } from '@/components/base/CaTable/type'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { getUserMessage, listMessage, readAllMessage, readMessage } from '@/apis/system'
import CaQueryForm from '@/components/base/CaQueryForm'
import { useDevice, useResetReactive, useTable } from '@/hooks'

defineOptions({ name: 'UserMessageCenter' })

const { t } = useI18n()
const { isMobile } = useDevice()

const [queryForm, resetForm] = useResetReactive<MessagePageQuery>({
  sort: ['createTime,desc']
})

const queryFormColumns = computed(
  () =>
    [
      {
        type: 'input',
        label: t('pages.userMessageCenter.field.title'),
        field: 'title',
        gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
        props: {
          placeholder: t('common.placeholder.inputWithLabel', {
            label: t('pages.userMessageCenter.field.title')
          }),
          clearable: true
        }
      },
      {
        type: 'select',
        label: t('pages.userMessageCenter.field.status'),
        field: 'isRead',
        gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
        props: {
          options: [
            { label: t('pages.userMessageCenter.status.unread'), value: false },
            { label: t('pages.userMessageCenter.status.read'), value: true }
          ],
          placeholder: t('common.placeholder.selectWithLabel', {
            label: t('pages.userMessageCenter.field.status')
          }),
          clearable: true
        }
      }
    ] as FormColumnItem<MessagePageQuery>[]
)

const { tableData, loading, pagination, search } = useTable<MessageResp>(
  (page) => listMessage({ ...queryForm, ...page }),
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
        label: t('pages.userMessageCenter.field.title'),
        prop: 'title',
        slotName: 'title',
        minWidth: 260,
        fixed: !isMobile.value ? 'left' : false
      },
      {
        label: t('pages.userMessageCenter.field.status'),
        prop: 'isRead',
        slotName: 'isRead',
        width: 100,
        align: 'center'
      },
      {
        label: t('pages.userMessageCenter.field.createTime'),
        prop: 'createTime',
        width: 180
      },
      {
        label: t('pages.userMessageCenter.field.action'),
        prop: 'action',
        slotName: 'action',
        width: 160,
        align: 'center',
        fixed: !isMobile.value ? 'right' : false
      }
    ] as TableColumnItem[]
)

const detailVisible = ref(false)
const detailLoading = ref(false)
const currentMessage = ref<MessageResp>()

const loadMessageDetail = async (id: string) => {
  detailLoading.value = true
  try {
    const data = await getUserMessage(id)
    currentMessage.value = data
  } finally {
    detailLoading.value = false
  }
}

const onRead = async (row: MessageResp) => {
  if (row.isRead) return
  await readMessage([String(row.id)])
  ElMessage.success(t('message.updateSuccess'))
  row.isRead = true
  if (queryForm.isRead === false) {
    search()
  }
}

const onReadAll = async () => {
  await readAllMessage()
  ElMessage.success(t('message.updateSuccess'))
  search()
}

const onView = async (row: MessageResp) => {
  detailVisible.value = true
  await loadMessageDetail(String(row.id))
  if (!row.isRead) {
    await readMessage([String(row.id)])
    row.isRead = true
    if (currentMessage.value) {
      currentMessage.value.isRead = true
    }
  }
  if (queryForm.isRead === false) {
    search()
  }
}

const reset = () => {
  resetForm()
  search()
}
</script>
