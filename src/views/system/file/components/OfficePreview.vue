<template>
  <div class="office-preview">
    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>{{ t('file.preview.loading') }}</span>
    </div>
    <div v-else-if="error" class="error">
      <ArtSvgIcon icon="ri:error-warning-line" :size="48" />
      <p>{{ error }}</p>
      <el-button type="primary" @click="$emit('download')">{{ t('file.preview.downloadView') }}</el-button>
    </div>
    <VueOfficeDocx
      v-else-if="type === 'word'"
      :src="fileUrl"
      @rendered="onRendered"
      @error="onError"
    />
    <VueOfficeExcel
      v-else-if="type === 'excel'"
      :src="fileUrl"
      @rendered="onRendered"
      @error="onError"
    />
    <VueOfficePdf
      v-else-if="type === 'pdf'"
      :src="fileUrl"
      @rendered="onRendered"
      @error="onError"
    />
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
import VueOfficeDocx from '@vue-office/docx'
import VueOfficeExcel from '@vue-office/excel'
import VueOfficePdf from '@vue-office/pdf'
import { useI18n } from 'vue-i18n'
import '@vue-office/docx/lib/v3/index.css'
import '@vue-office/excel/lib/v3/index.css'

const props = defineProps<{
  fileUrl: string
  type: 'word' | 'excel' | 'pdf'
}>()

defineEmits<{
  (e: 'download'): void
}>()

const loading = ref(true)
const error = ref('')
const { t } = useI18n()

const onRendered = () => {
  loading.value = false
}

const onError = (err: unknown) => {
  console.error('Office preview error:', err)
  loading.value = false
  if (err instanceof Error) {
    error.value = err.message || t('file.preview.loadFailed')
    return
  }
  error.value = t('file.preview.loadFailed')
}
</script>

<style lang="scss" scoped>
  .office-preview {
    width: 100%;
    height: 100%;
    overflow: auto;

    .loading,
    .error {
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--el-text-color-secondary);
    }

    .error {
      color: var(--el-color-danger);
    }

    :deep(.office-document) {
      min-height: calc(100% - 40px);
      padding: 40px;
      margin: 20px;
      box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
    }
  }
</style>
