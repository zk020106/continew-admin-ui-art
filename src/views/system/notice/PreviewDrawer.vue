<template>
  <ElDrawer v-model="visible" :title="t('pages.noticeManagement.title.preview')" :size="width >= 960 ? 960 : '100%'">
    <div v-loading="loading" class="notice-preview">
      <h1 class="title">{{ dataDetail?.title }}</h1>
      <div class="meta">
        <ElSpace>
          <span>{{ t('pages.noticeManagement.preview.publisher') }}{{ dataDetail?.createUserString || '-' }}</span>
          <ElDivider direction="vertical" />
          <span>{{ t('pages.noticeManagement.preview.publishTime') }}{{ dataDetail?.publishTime || '-' }}</span>
          <ElDivider v-if="dataDetail?.updateTime" direction="vertical" />
          <span v-if="dataDetail?.updateTime">{{ t('pages.noticeManagement.preview.updateTime') }}{{ dataDetail.updateTime }}</span>
        </ElSpace>
      </div>
      <ElDivider />
      <div class="content" v-html="dataDetail?.content || ''"></div>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
import type { NoticeDetailResp } from '@/apis/system'
import { useWindowSize } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { getNotice } from '@/apis/system'

defineOptions({ name: 'SystemNoticePreviewDrawer' })

const { width } = useWindowSize()
const { t } = useI18n()

const visible = ref(false)
const loading = ref(false)
const dataDetail = ref<NoticeDetailResp>()

const onOpen = async (id: string) => {
  loading.value = true
  try {
    dataDetail.value = await getNotice(id)
    visible.value = true
  } finally {
    loading.value = false
  }
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss">
  .notice-preview {
    .title {
      margin: 0 0 14px;
      font-size: 22px;
      font-weight: 600;
      line-height: 1.4;
      text-align: center;
    }

    .meta {
      margin-bottom: 12px;
      color: var(--el-text-color-secondary);
      text-align: center;
    }

    .content {
      min-height: 200px;
      line-height: 1.75;
      color: var(--el-text-color-primary);
      word-break: word-break;
    }
  }
</style>
