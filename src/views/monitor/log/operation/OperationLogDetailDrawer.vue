<template>
  <ElDrawer
    v-model="visible"
    :title="t('pages.systemLog.operation.detailTitle')"
    :size="width >= 720 ? 720 : '100%'"
  >
    <!-- 基本信息 -->
    <ElDescriptions :column="2" size="large" border :label-width="100">
      <ElDescriptionsItem :label="t('pages.systemLog.operation.field.id')">
        <ElText copyable>{{ dataDetail?.id }}</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.systemLog.operation.field.traceId')">
        <ElText copyable>{{ dataDetail?.traceId || '-' }}</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.systemLog.field.createUserString')">
        {{ dataDetail?.createUserString }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.systemLog.field.createTime')">
        {{ dataDetail?.createTime }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.systemLog.operation.field.description')" :span="2">
        {{ dataDetail?.description }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.systemLog.operation.field.module')">
        {{ dataDetail?.module }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.systemLog.field.status')">
        <CaTag
          :type="dataDetail?.status === 1 ? 'success' : 'danger'"
          :dot="dataDetail?.status === 1"
        >
          {{ dataDetail?.status === 1 ? t('common.success') : t('common.error') }}
        </CaTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.systemLog.field.ip')">
        <ElText copyable>{{ dataDetail?.ip }}</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.systemLog.login.field.address')">
        {{ dataDetail?.address }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.systemLog.field.browser')">
        {{ dataDetail?.browser }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.systemLog.field.os')">
        {{ dataDetail?.os }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.systemLog.field.timeTaken')">
        <CaTag :type="getTimeTakenType(dataDetail?.timeTaken)">
          {{ dataDetail?.timeTaken }}ms
        </CaTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.systemLog.operation.field.requestUri')" :span="2">
        <ElText copyable>{{ dataDetail?.requestUrl }}</ElText>
      </ElDescriptionsItem>
    </ElDescriptions>

    <!-- 请求信息 -->
    <div class="detail-section">
      <ElText size="large" tag="h4">{{ t('pages.systemLog.operation.requestInfo') }}</ElText>
      <ElTabs type="card" class="detail-tabs">
        <ElTabPane :label="t('pages.systemLog.operation.requestHeaders')">
          <JsonViewer v-if="dataDetail?.requestHeaders" :json="dataDetail.requestHeaders" />
          <ElText v-else type="info">-</ElText>
        </ElTabPane>
        <ElTabPane :label="t('pages.systemLog.operation.requestBody')">
          <JsonViewer v-if="dataDetail?.requestBody" :json="dataDetail.requestBody" />
          <ElText v-else type="info">-</ElText>
        </ElTabPane>
      </ElTabs>
    </div>

    <!-- 响应信息 -->
    <div class="detail-section">
      <ElText size="large" tag="h4">{{ t('pages.systemLog.operation.responseInfo') }}</ElText>
      <ElTabs type="card" class="detail-tabs">
        <ElTabPane :label="t('pages.systemLog.operation.responseHeaders')">
          <JsonViewer v-if="dataDetail?.responseHeaders" :json="dataDetail.responseHeaders" />
          <ElText v-else type="info">-</ElText>
        </ElTabPane>
        <ElTabPane :label="t('pages.systemLog.operation.responseBody')">
          <JsonViewer v-if="dataDetail?.responseBody" :json="dataDetail.responseBody" />
          <ElText v-else type="info">-</ElText>
        </ElTabPane>
      </ElTabs>
    </div>
  </ElDrawer>
</template>

<script setup lang="ts">
  import type { LogDetailResp } from '@/apis/monitor'
  import { getLog as getDetail } from '@/apis/monitor'
  import CaTag from '@/components/base/CaTag/index.vue'
  import JsonViewer from '@/components/base/JsonViewer/index.vue'
  import { useWindowSize } from '@vueuse/core'
  import {
    ElDescriptions,
    ElDescriptionsItem,
    ElDrawer,
    ElTabPane,
    ElTabs,
    ElText
  } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'OperationLogDetailDrawer' })

  const { t } = useI18n()
  const { width } = useWindowSize()

  const dataId = ref('')
  const dataDetail = ref<LogDetailResp>()
  const visible = ref(false)

  // 获取耗时标签类型
  const getTimeTakenType = (timeTaken?: number): 'success' | 'warning' | 'danger' => {
    if (!timeTaken) return 'success'
    if (timeTaken > 500) return 'danger'
    if (timeTaken > 200) return 'warning'
    return 'success'
  }

  // 查询详情
  const getDataDetail = async () => {
    const data = await getDetail(dataId.value)
    dataDetail.value = data
  }

  // 打开
  const onOpen = async (id: string) => {
    dataId.value = id
    await getDataDetail()
    visible.value = true
  }

  defineExpose({ onOpen })
</script>

<style lang="scss" scoped>
  .detail-section {
    margin-top: 20px;

    h4 {
      margin-bottom: 12px;
      font-size: 15px;
      font-weight: 600;
    }
  }

  .detail-tabs {
    margin-top: 8px;
  }
</style>
