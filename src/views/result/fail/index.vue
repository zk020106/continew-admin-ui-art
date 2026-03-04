<template>
  <ArtResultPage
    type="fail"
    :title="t('resultPage.fail.title')"
    :message="t('resultPage.fail.message')"
    icon-code="ri:close-fill"
  >
    <template #content>
      <p>{{ t('resultPage.fail.errorTitle') }}</p>
      <p>
        <ArtSvgIcon icon="ri:close-circle-line" class="text-red-500 mr-1" />
        <span>{{ t('resultPage.fail.errorAccountFrozen') }}</span>
      </p>
      <p>
        <ArtSvgIcon icon="ri:close-circle-line" class="text-red-500 mr-1" />
        <span>{{ t('resultPage.fail.errorQualification') }}</span>
      </p>
    </template>
    <template #buttons>
      <ElButton v-ripple type="primary">{{ t('resultPage.fail.backEdit') }}</ElButton>
      <ElButton v-ripple>{{ t('resultPage.fail.view') }}</ElButton>
    </template>
  </ArtResultPage>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'ResultFail' })

const { t } = useI18n()
</script>
