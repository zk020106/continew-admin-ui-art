<template>
  <ElDialog v-model="visible" :title="t('system.config.client.detailTitle')" width="600px">
    <ElDescriptions :column="1" border>
      <ElDescriptionsItem :label="t('system.config.client.detail.id')">
        {{ detailData.id }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.clientId')">
        {{ detailData.clientId }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.clientType')">
        {{ detailData.clientType }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.authType')">
        {{ detailData.authType }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.activeTimeout')">
        {{ detailData.activeTimeout }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.timeout')">
        {{ detailData.timeout }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.status')">
        <ElTag :type="detailData.status === 'Valid' ? 'success' : 'danger'" size="small">
          {{ detailData.status }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.isConcurrent')">
        {{ detailData.isConcurrent === 1 ? t('common.true') : t('common.false') }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.replacedRange')">
        {{ detailData.replacedRange }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.maxLoginCount')">
        {{ detailData.maxLoginCount }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.overflowLogoutMode')">
        {{ detailData.overflowLogoutMode }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.createUser')">
        {{ detailData.createUserString }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.createTime')">
        {{ detailData.createTime }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.updateUser')">
        {{ detailData.updateUserString }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.updateTime')">
        {{ detailData.updateTime }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { ClientDetailResp } from '@/apis/system/type'
  import { getClient } from '@/apis/system/client'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'ClientDetailModal' })

  const { t } = useI18n()
  const visible = ref(false)
  const detailData = ref<Partial<ClientDetailResp>>({})

  const onDetail = async (id: string) => {
    try {
      const res = await getClient(id)
      detailData.value = res
      visible.value = true
    } catch (error) {
      console.error('Failed to fetch client detail:', error)
    }
  }

  defineExpose({
    onDetail
  })
</script>
