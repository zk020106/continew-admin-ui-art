<template>
  <ElDrawer v-model="visible" :title="title" size="600px" destroy-on-close>
    <ElDescriptions v-if="detail" :column="2" size="large" border :label-width="100">
      <ElDescriptionsItem :label="t('pages.appManagement.field.id')">
        <ElText copyable>{{ detail.id }}</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.appManagement.field.name')">
        <ElText copyable>{{ detail.name }}</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="Access Key" :span="2">
        <CellCopy :content="detail.accessKey" />
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.appManagement.field.status')">
        <CaTag :type="detail.status === 1 ? 'success' : 'danger'" :dot="detail.status === 1">
          {{ detail.status === 1 ? t('common.statusEnabled') : t('common.statusDisabled') }}
        </CaTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.appManagement.field.expireTime')">
        {{ detail.expireTime || '-' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.appManagement.field.createUser')">
        {{ detail.createUserString }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.appManagement.field.createTime')">
        {{ detail.createTime }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.appManagement.field.updateUser')">
        {{ detail.updateUserString }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.appManagement.field.updateTime')">
        {{ detail.updateTime }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('pages.appManagement.field.description')" :span="2">
        {{ detail.description || '-' }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDrawer>
</template>

<script setup lang="ts">
  import type { AppResp } from '@/apis/open/app'
  import { getApp } from '@/apis/open/app'
  import CaTag from '@/components/base/CaTag/index.vue'
  import { CellCopy } from '@/components/base/CellCopy'
  import { ElDescriptions, ElDescriptionsItem, ElDrawer, ElText } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'OpenAppDetailDrawer' })

  const { t } = useI18n()

  const visible = ref(false)
  const detail = ref<AppResp>()

  const title = computed(() => t('common.detail'))

  const onOpen = async (id: string) => {
    try {
      const data = await getApp(id)
      detail.value = data
      visible.value = true
    } catch (error) {
      console.error('获取应用详情失败:', error)
    }
  }

  defineExpose({
    onOpen
  })
</script>

<style scoped lang="scss"></style>
