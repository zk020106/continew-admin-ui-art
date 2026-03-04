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
          全部已读
        </ElButton>
      </template>

      <template #title="{ row }">
        <ElLink type="primary" @click="onView(row)">
          {{ row.title }}
        </ElLink>
      </template>

      <template #isRead="{ row }">
        <ElTag v-if="row.isRead" size="small">已读</ElTag>
        <ElTag v-else type="danger" size="small">未读</ElTag>
      </template>

      <template #action="{ row }">
        <ElSpace>
          <ElLink type="primary" @click="onView(row)">
            查看
          </ElLink>
          <ElLink v-if="!row.isRead" type="primary" @click="onRead(row)">
            标记已读
          </ElLink>
        </ElSpace>
      </template>
    </CaTable>

    <ElDialog
      v-model="detailVisible"
      :title="currentMessage?.title || '消息详情'"
      width="680px"
      destroy-on-close
    >
      <div v-loading="detailLoading" class="message-detail">
        <div class="message-meta">
          <span>发送时间：{{ currentMessage?.createTime || '-' }}</span>
          <span>状态：{{ currentMessage?.isRead ? '已读' : '未读' }}</span>
        </div>
        <div class="message-content">
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
import { getUserMessage, listMessage, readAllMessage, readMessage } from '@/apis/system'
import CaQueryForm from '@/components/base/CaQueryForm'
import { useDevice, useResetReactive, useTable } from '@/hooks'

defineOptions({ name: 'UserMessageCenter' })

const { isMobile } = useDevice()

const [queryForm, resetForm] = useResetReactive<MessagePageQuery>({
  sort: ['createTime,desc']
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
          placeholder: '请输入标题关键字',
          clearable: true
        }
      },
      {
        type: 'select',
        label: '状态',
        field: 'isRead',
        gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
        props: {
          options: [
            { label: '未读', value: false },
            { label: '已读', value: true }
          ],
          placeholder: '请选择状态',
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
        label: '序号',
        width: 66,
        align: 'center',
        render: ({ $index }) =>
          h('span', {}, $index + 1 + (pagination.current - 1) * pagination.pageSize),
        fixed: !isMobile.value ? 'left' : false
      },
      {
        label: '标题',
        prop: 'title',
        slotName: 'title',
        minWidth: 260,
        fixed: !isMobile.value ? 'left' : false
      },
      {
        label: '状态',
        prop: 'isRead',
        slotName: 'isRead',
        width: 100,
        align: 'center'
      },
      {
        label: '发送时间',
        prop: 'createTime',
        width: 180
      },
      {
        label: '操作',
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
  ElMessage.success('操作成功')
  row.isRead = true
  if (queryForm.isRead === false) {
    search()
  }
}

const onReadAll = async () => {
  await readAllMessage()
  ElMessage.success('操作成功')
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

<style scoped lang="scss">
  .message-detail {
    .message-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    .message-content {
      min-height: 120px;
      line-height: 1.8;
      color: var(--el-text-color-primary);
      white-space: pre-wrap;
    }
  }
</style>
