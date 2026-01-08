<template>
  <ElDrawer v-model="visible" :title="title" size="600px" destroy-on-close>
    <ElDescriptions v-if="detail" :column="1" size="large" border :label-width="120">
      <ElDescriptionsItem :label="t('pages.tenantManagement.field.code')">
        <ElText copyable>{{ detail.code }}</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.tenantManagement.field.name')">
        {{ detail.name }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.tenantManagement.field.package')">
        {{ detail.packageName }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.tenantManagement.field.domain')">
        <a v-if="detail.domain" :href="detail.domain" target="_blank">{{ detail.domain }}</a>
        <span v-else>{{ t('pages.tenantManagement.field.notSet') }}</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.tenantManagement.field.expireTime')">
        {{ detail.expireTime || t('pages.tenantManagement.field.neverExpire') }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.tenantManagement.field.adminUsername')">
        {{ detail.adminUsername }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.tenantManagement.field.status')">
        <CaTag :type="detail.status === 1 ? 'success' : 'warning'" :dot="detail.status === 1">
          {{ detail.status === 1 ? t('common.enable') : t('common.disable') }}
        </CaTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.tenantManagement.field.description')">
        {{ detail.description }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.tenantManagement.field.createUser')">
        {{ detail.createUserString }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.tenantManagement.field.createTime')">
        {{ detail.createTime }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.tenantManagement.field.updateUser')">
        {{ detail.updateUserString }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.tenantManagement.field.updateTime')">
        {{ detail.updateTime }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDrawer>
</template>

<script setup lang="ts">
  import type { TenantResp } from '@/apis'
  import { getTenant } from '@/apis/tenant/management'
  import CaTag from '@/components/base/CaTag/index.vue'
  import { ElDescriptions, ElDescriptionsItem, ElDrawer, ElText } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'TenantManagementDetailDrawer' })

  const { t } = useI18n()

  const visible = ref(false)
  const detail = ref<TenantResp>()

  const title = computed(() => t('common.detail'))

  const onOpen = async (id: string) => {
    try {
      const data = await getTenant(id)
      detail.value = data
      visible.value = true
    } catch (error) {
      console.error('获取租户详情失败:', error)
    }
  }

  defineExpose({
    onOpen
  })
</script>

<style scoped lang="scss"></style>
