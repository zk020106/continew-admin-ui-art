<template>
  <ElDrawer v-model="visible" :title="t('pages.noticeManagement.detailTitle')" :size="width >= 560 ? 560 : '100%'">
    <div v-loading="loading">
      <ElDescriptions :column="2" border>
        <ElDescriptionsItem :label="t('pages.noticeManagement.field.id')" :span="2">{{ dataDetail?.id }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('pages.noticeManagement.field.title')">{{ dataDetail?.title }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('pages.noticeManagement.field.type')">
          <CaCellTag :value="dataDetail?.type" :data="notice_type" />
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="t('pages.noticeManagement.field.noticeScope')">
          <CaCellTag :value="dataDetail?.noticeScope" :data="notice_scope_enum" />
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="t('pages.noticeManagement.field.noticeMethods')">
          <span v-if="!dataDetail?.noticeMethods?.length">{{ t('common.empty') }}</span>
          <CaCellTags v-else :data="formatNoticeMethods(dataDetail.noticeMethods)" />
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="t('pages.noticeManagement.field.isTiming')">{{ dataDetail?.isTiming ? t('common.true') : t('common.false') }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('pages.noticeManagement.field.publishTime')">{{ dataDetail?.publishTime || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('pages.noticeManagement.field.isTop')">{{ dataDetail?.isTop ? t('common.true') : t('common.false') }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('pages.noticeManagement.field.status')">
          <CaCellTag :value="dataDetail?.status" :data="notice_status_enum" />
        </ElDescriptionsItem>
        <ElDescriptionsItem :label="t('pages.noticeManagement.field.createUser')">{{ dataDetail?.createUserString || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('pages.noticeManagement.field.createTime')">{{ dataDetail?.createTime || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('pages.noticeManagement.field.updateUser')">{{ dataDetail?.updateUserString || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem :label="t('pages.noticeManagement.field.updateTime')">{{ dataDetail?.updateTime || '-' }}</ElDescriptionsItem>
      </ElDescriptions>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
import type { NoticeDetailResp } from '@/apis/system'
import type { LabelValueState } from '@/types/global'
import { useWindowSize } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { getNotice } from '@/apis/system'
import { CaCellTag, CaCellTags } from '@/components/base/CaCell'
import { useDict } from '@/hooks'

defineOptions({ name: 'SystemNoticeDetailDrawer' })

const { width } = useWindowSize()
const { t } = useI18n()
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
