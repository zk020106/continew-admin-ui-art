<template>
  <ElDialog
    v-model="visible"
    :title="currentNotice?.title || '系统公告'"
    :width="760"
    destroy-on-close
    align-center
    @close="onClose"
  >
    <div class="notice-popup">
      <h2 class="notice-title">{{ currentNotice?.title || '-' }}</h2>

      <div class="notice-meta">
        <ElSpace>
          <span>发布人：{{ currentNotice?.createUserString || '-' }}</span>
          <ElDivider direction="vertical" />
          <span>发布时间：{{ currentNotice?.publishTime || '-' }}</span>
          <template v-if="currentNotice?.updateTime">
            <ElDivider direction="vertical" />
            <span>更新时间：{{ currentNotice.updateTime }}</span>
          </template>
        </ElSpace>
      </div>

      <div v-loading="contentLoading" class="notice-content" v-html="currentNotice?.content || ''"></div>
    </div>

    <template #footer>
      <div class="notice-footer">
        <span class="pagination-info">{{ currentIndex + 1 }} / {{ unreadNoticeIds.length }}</span>
        <ElSpace>
          <ElButton :disabled="currentIndex <= 0" @click="previousNotice">上一篇</ElButton>
          <ElButton :disabled="currentIndex >= unreadNoticeIds.length - 1" @click="nextNotice">
            下一篇
          </ElButton>
        </ElSpace>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import type { NoticeResp } from '@/apis/system'
import { getUnreadNoticeIds, getUserNotice } from '@/apis/system'

defineOptions({ name: 'ArtNoticePopup' })

interface Props {
  method?: string
}

const props = withDefaults(defineProps<Props>(), {
  method: 'POPUP'
})

const visible = ref(false)
const contentLoading = ref(false)
const unreadNoticeIds = ref<number[]>([])
const currentIndex = ref(0)
const noticeCache = ref<Map<number, NoticeResp>>(new Map())

const currentNotice = computed(() => {
  const noticeId = unreadNoticeIds.value[currentIndex.value]
  if (!noticeId) return undefined
  return noticeCache.value.get(noticeId)
})

const fetchNoticeDetail = async (index: number) => {
  const noticeId = unreadNoticeIds.value[index]
  if (!noticeId) return

  if (noticeCache.value.has(noticeId)) {
    currentIndex.value = index
    return
  }

  try {
    contentLoading.value = true
    const data = await getUserNotice(noticeId)
    noticeCache.value.set(noticeId, data)
    currentIndex.value = index
  } finally {
    contentLoading.value = false
  }
}

const fetchUnreadNotices = async () => {
  const ids = await getUnreadNoticeIds(props.method)
  if (!ids?.length) return

  unreadNoticeIds.value = ids
  visible.value = true
  await fetchNoticeDetail(0)
  currentIndex.value = 0
}

const previousNotice = async () => {
  if (currentIndex.value <= 0) return
  await fetchNoticeDetail(currentIndex.value - 1)
}

const nextNotice = async () => {
  if (currentIndex.value >= unreadNoticeIds.value.length - 1) return
  await fetchNoticeDetail(currentIndex.value + 1)
}

const onClose = () => {
  visible.value = false
  currentIndex.value = 0
  unreadNoticeIds.value = []
  noticeCache.value.clear()
}

const open = async () => {
  await fetchUnreadNotices()
}

defineExpose({ open })
</script>

<style scoped lang="scss">
  .notice-popup {
    .notice-title {
      margin: 0 0 12px;
      font-size: 22px;
      font-weight: 600;
      line-height: 1.4;
      text-align: center;
    }

    .notice-meta {
      margin-bottom: 12px;
      color: var(--el-text-color-secondary);
      text-align: center;
    }

    .notice-content {
      min-height: 200px;
      max-height: 52vh;
      padding: 6px 2px;
      overflow-y: auto;
      line-height: 1.75;
      color: var(--el-text-color-primary);
      word-break: word-break;
    }
  }

  .notice-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .pagination-info {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
</style>
