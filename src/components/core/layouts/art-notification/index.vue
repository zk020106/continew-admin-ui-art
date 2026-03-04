<template>
  <div
    v-show="visible"
    class="art-notification-panel art-card-sm !shadow-xl"
    :style="{
      transform: show ? 'scaleY(1)' : 'scaleY(0.9)',
      opacity: show ? 1 : 0,
    }"
    @click.stop
  >
    <div class="notice-header">
      <span class="text-sm font-medium text-g-800">{{ $t('notice.title') }}</span>
    </div>

    <div v-loading="loading" class="notice-body scrollbar-thin">
      <ul v-if="msgList.length" class="notice-list">
        <li
          v-for="(item, index) in msgList"
          :key="item.id || index"
          class="notice-item"
          @click="handleOpenMessage(item)"
        >
          <div class="notice-title">{{ item.title }}</div>
          <p class="notice-time">{{ item.time }}</p>
        </li>
      </ul>

      <div v-else class="empty-wrap">
        <ElEmpty description="暂无数据" :image-size="72" />
      </div>
    </div>

    <div class="notice-footer">
      <a class="footer-link" @click.prevent="handleViewAll">
        {{ $t('notice.viewAll') }}
        <ArtSvgIcon icon="ri:arrow-right-s-line" class="text-sm ml-0.5" />
      </a>
      <a class="footer-link" @click.prevent="handleReadAll">
        {{ $t('notice.btnRead') }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MessagePageQuery, MessageResp } from '@/apis/system'
import { ElMessage } from 'element-plus'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { listMessage, readAllMessage } from '@/apis/system'

defineOptions({ name: 'ArtNotification' })

const props = defineProps<{
  value: boolean
}>()

const emit = defineEmits<{
  'update:value': [value: boolean]
}>()

interface MessageItem {
  id: string
  title: string
  time: string
  path?: string
}

const MESSAGE_CENTER_PATH = '/user/message'
const MESSAGE_LIMIT = 8

const { t } = useI18n()
const router = useRouter()

const show = ref(false)
const visible = ref(false)
const loading = ref(false)
const msgList = ref<MessageItem[]>([])

const mapMessage = (item: MessageResp): MessageItem => ({
  id: item.id,
  title: item.title || '-',
  time: item.createTime || '-',
  path: item.path || undefined
})

const fetchMessageData = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const query: MessagePageQuery = {
      page: 1,
      size: MESSAGE_LIMIT,
      isRead: false,
      sort: ['createTime,desc']
    }
    const res = await listMessage(query)
    const data = (res as any)?.list
    msgList.value = Array.isArray(data) ? data.map((item: MessageResp) => mapMessage(item)) : []
  } catch (error) {
    console.error('[ArtNotification] Failed to load messages:', error)
  } finally {
    loading.value = false
  }
}

const showNotice = (open: boolean) => {
  if (open) {
    visible.value = true
    setTimeout(() => {
      show.value = true
    }, 5)
    fetchMessageData()
  } else {
    show.value = false
    setTimeout(() => {
      visible.value = false
    }, 350)
  }
}

const closePanel = () => {
  emit('update:value', false)
}

const openMessageCenter = () => {
  router.push({ path: MESSAGE_CENTER_PATH })
  closePanel()
}

const handleOpenMessage = (item: MessageItem) => {
  if (item.path) {
    router.push(item.path)
    closePanel()
    return
  }
  openMessageCenter()
}

const handleViewAll = () => {
  openMessageCenter()
}

const handleReadAll = async () => {
  await readAllMessage()
  await fetchMessageData()
  ElMessage.success(t('message.updateSuccess'))
}

watch(
  () => props.value,
  (newValue) => {
    showNotice(newValue)
  }
)
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  .art-notification-panel {
    z-index: 4000 !important;

    width: 300px;
    height: 280px;
    border-radius: 6px;

    @apply absolute top-12.5 right-3.5 overflow-hidden transition-all duration-300 origin-top will-change-[top,left] max-[640px]:top-[65px] max-[640px]:right-0 max-[640px]:w-full;
  }

  .notice-header {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    height: 46px;
    padding: 0 14px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .notice-body {
    box-sizing: border-box;
    height: calc(100% - 92px);
    overflow-y: auto;
  }

  .notice-list {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .notice-item {
    box-sizing: border-box;
    padding: 10px 14px;
    cursor: pointer;
    border-bottom: 1px solid var(--el-border-color-lighter);
    transition: background-color 0.2s ease;
  }

  .notice-item:hover {
    background-color: rgb(0 0 0 / 3%);
  }

  .dark .notice-item:hover {
    background-color: rgb(255 255 255 / 5%);
  }

  .notice-title {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }

  .notice-time {
    margin-top: 4px;
    font-size: 12px;
    line-height: 16px;
    color: var(--el-text-color-secondary);
  }

  .notice-footer {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 46px;
    padding: 0 14px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .footer-link {
    display: inline-flex;
    align-items: center;
    font-size: 13px;
    line-height: 1;
    color: var(--el-color-primary);
    text-decoration: none;
    cursor: pointer;
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 5px !important;
  }

  .dark .scrollbar-thin::-webkit-scrollbar-track {
    background-color: var(--default-box-color);
  }

  .dark .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #222 !important;
  }

  .empty-wrap {
    @apply box-border flex items-center justify-center flex-col h-full;
  }
</style>
