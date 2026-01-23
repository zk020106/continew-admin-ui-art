<template>
  <div class="office-preview">
    <div v-if="loading" class="loading">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>文档加载中...</span>
    </div>
    <div v-else-if="error" class="error">
      <ArtSvgIcon icon="ri:error-warning-line" :size="48" />
      <p>{{ error }}</p>
      <el-button type="primary" @click="$emit('download')">下载查看</el-button>
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
import '@vue-office/docx/lib/index.css'
import '@vue-office/excel/lib/index.css'

const props = defineProps<{
  fileUrl: string
  type: 'word' | 'excel' | 'pdf'
}>()

defineEmits<{
  (e: 'download'): void
}>()

const loading = ref(true)
const error = ref('')

// const options = {
//   className: 'office-document',
//   table: {
//     row: { height: 20 },
//     col: { width: 100 }
//   }
// }
console.log('fileUrl', props.fileUrl)

const onRendered = () => {
  console.log('11111')

  loading.value = false
}

const onError = (err: any) => {
  console.error('Office preview error:', err)
  loading.value = false
  error.value = err.message || '文档加载失败'
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
