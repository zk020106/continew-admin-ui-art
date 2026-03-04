<template>
  <ArtResultPage
    type="success"
    :title="t('resultPage.success.title')"
    :message="t('resultPage.success.message')"
    icon-code="ri:check-fill"
  >
    <template #content>
      <p>{{ t('resultPage.success.description') }}</p>
    </template>
    <template #buttons>
      <ElButton v-ripple type="primary">{{ t('resultPage.success.backEdit') }}</ElButton>
      <ElButton v-ripple>{{ t('resultPage.success.view') }}</ElButton>
      <ElButton v-ripple>{{ t('resultPage.success.print') }}</ElButton>
    </template>
  </ArtResultPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'ResultSuccess' })

const { t } = useI18n()
</script>
