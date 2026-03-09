<template>
  <div
    v-show="visible"
    class="art-notification-panel art-card-sm !shadow-xl absolute top-12.5 right-3.5 z-[4000] h-[280px] w-[300px] origin-top overflow-hidden rounded-[6px] transition-all duration-300 will-change-[top,left] max-[640px]:top-[65px] max-[640px]:right-0 max-[640px]:w-full"
    :style="{
      transform: show ? 'scaleY(1)' : 'scaleY(0.9)',
      opacity: show ? 1 : 0,
    }"
    @click.stop
  >
    <div class="box-border flex h-[46px] items-center border-b border-(--el-border-color-lighter) px-[14px]">
      <span class="text-sm font-medium text-g-800">{{ $t('notice.title') }}</span>
    </div>

    <div
      v-loading="loading"
      class="scrollbar-thin box-border h-[calc(100%-92px)] overflow-y-auto"
    >
      <ul v-if="msgList.length" class="m-0 list-none p-0">
        <li
          v-for="(item, index) in msgList"
          :key="item.id || index"
          class="box-border cursor-pointer border-b border-(--el-border-color-lighter) px-[14px] py-[10px] transition-colors duration-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
          @click="handleOpenMessage(item)"
        >
          <div class="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium leading-5 text-(--el-text-color-primary)">{{ item.title }}</div>
          <p class="mt-1 text-xs leading-4 text-(--el-text-color-secondary)">{{ item.time }}</p>
        </li>
      </ul>

      <div v-else class="box-border flex h-full flex-col items-center justify-center">
        <ElEmpty :description="t('common.noData')" :image-size="72" />
      </div>
    </div>

    <div class="box-border flex h-[46px] items-center justify-between border-t border-(--el-border-color-lighter) px-[14px]">
      <a
        class="inline-flex cursor-pointer items-center text-[13px] leading-none text-(--el-color-primary) no-underline"
        @click.prevent="handleViewAll"
      >
        {{ $t('notice.viewAll') }}
        <ArtSvgIcon icon="ri:arrow-right-s-line" class="text-sm ml-0.5" />
      </a>
      <a
        class="inline-flex cursor-pointer items-center text-[13px] leading-none text-(--el-color-primary) no-underline"
        @click.prevent="handleReadAll"
      >
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

  .scrollbar-thin::-webkit-scrollbar {
    width: 5px !important;
  }

  .dark .scrollbar-thin::-webkit-scrollbar-track {
    background-color: var(--default-box-color);
  }

  .dark .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #222 !important;
  }
</style>
