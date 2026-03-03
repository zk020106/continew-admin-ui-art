<template>
  <ElDrawer v-model="visible" title="查看公告" :size="width >= 960 ? 960 : '100%'">
    <div v-loading="loading" class="notice-preview">
      <h1 class="title">{{ dataDetail?.title }}</h1>
      <div class="meta">
        <ElSpace>
          <span>发布人：{{ dataDetail?.createUserString || '-' }}</span>
          <ElDivider direction="vertical" />
          <span>发布时间：{{ dataDetail?.publishTime || '-' }}</span>
          <ElDivider v-if="dataDetail?.updateTime" direction="vertical" />
          <span v-if="dataDetail?.updateTime">更新时间：{{ dataDetail.updateTime }}</span>
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
import { getNotice } from '@/apis/system'

defineOptions({ name: 'SystemNoticePreviewDrawer' })

const { width } = useWindowSize()

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
      font-size: 22px;
      font-weight: 600;
      line-height: 1.4;
      text-align: center;
      margin: 0 0 14px;
    }

    .meta {
      text-align: center;
      color: var(--el-text-color-secondary);
      margin-bottom: 12px;
    }

    .content {
      min-height: 200px;
      line-height: 1.75;
      color: var(--el-text-color-primary);
      word-break: break-word;
    }
  }
</style>
