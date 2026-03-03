<template>
  <ElDrawer v-model="visible" title="公告详情" :size="width >= 560 ? 560 : '100%'">
    <div v-loading="loading">
      <ElDescriptions :column="2" border>
        <ElDescriptionsItem label="ID" :span="2">{{ dataDetail?.id }}</ElDescriptionsItem>
        <ElDescriptionsItem label="标题">{{ dataDetail?.title }}</ElDescriptionsItem>
        <ElDescriptionsItem label="分类">
          <CaCellTag :value="dataDetail?.type" :data="notice_type" />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="通知范围">
          <CaCellTag :value="dataDetail?.noticeScope" :data="notice_scope_enum" />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="通知方式">
          <span v-if="!dataDetail?.noticeMethods?.length">无</span>
          <CaCellTags v-else :data="formatNoticeMethods(dataDetail.noticeMethods)" />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="是否定时">{{ dataDetail?.isTiming ? '是' : '否' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="发布时间">{{ dataDetail?.publishTime || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="是否置顶">{{ dataDetail?.isTop ? '是' : '否' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="状态">
          <CaCellTag :value="dataDetail?.status" :data="notice_status_enum" />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="创建人">{{ dataDetail?.createUserString || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="创建时间">{{ dataDetail?.createTime || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="修改人">{{ dataDetail?.updateUserString || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="修改时间">{{ dataDetail?.updateTime || '-' }}</ElDescriptionsItem>
      </ElDescriptions>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
import type { NoticeDetailResp } from '@/apis/system'
import type { LabelValueState } from '@/types/global'
import { useWindowSize } from '@vueuse/core'
import { getNotice } from '@/apis/system'
import { CaCellTag, CaCellTags } from '@/components/base/CaCell'
import { useDict } from '@/hooks'

defineOptions({ name: 'SystemNoticeDetailDrawer' })

const { width } = useWindowSize()
const { notice_type, notice_scope_enum, notice_method_enum, notice_status_enum } = useDict(
  'notice_type',
  'notice_scope_enum',
  'notice_method_enum',
  'notice_status_enum'
)

const visible = ref(false)
const loading = ref(false)
const dataDetail = ref<NoticeDetailResp>()

const formatNoticeMethods = (methods: Array<number | string>) => {
  return methods
    .map((method) =>
      notice_method_enum.value.find((item) => String(item.value) === String(method))
    )
    .filter(Boolean) as LabelValueState[]
}

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

<style scoped lang="scss"></style>
