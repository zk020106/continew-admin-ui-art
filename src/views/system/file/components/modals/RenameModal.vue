<template>
  <el-dialog
    v-model="visible"
    :title="isFolder ? t('file.modal.rename.folderTitle') : t('file.modal.rename.fileTitle')"
    width="420px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="0">
      <el-form-item prop="name">
        <el-input
          v-model="form.name"
          :placeholder="t('file.modal.rename.placeholder')"
          clearable
          maxlength="255"
          show-word-limit
          @keyup.enter="handleSubmit"
        >
          <template #prefix>
            <ArtSvgIcon :icon="isFolder ? 'ri:folder-fill' : 'ri:file-fill'" :size="18" />
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">{{ t('file.modal.rename.cancel') }}</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ t('file.modal.rename.confirm') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import type { FileItem } from '@/apis/system/file'
  import type { FormInstance, FormRules } from 'element-plus'

  const { t } = useI18n()

  const props = defineProps<{
    modelValue: boolean
    file: FileItem | null
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', visible: boolean): void
    (e: 'confirm', file: FileItem, newName: string): void
  }>()

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const form = ref({
    name: ''
  })

  // 判断是否是文件夹
  const isFolder = computed(() => props.file?.type === 0)

  const rules: FormRules = {
    name: [
      { required: true, message: t('file.modal.rename.validate.required'), trigger: 'blur' },
      {
        pattern: /^[^/\\:*?"<>|]+$/,
        message: t('file.modal.rename.validate.invalidChars'),
        trigger: 'blur'
      },
      {
        validator: (rule, value, callback) => {
          if (!value) {
            callback()
            return
          }
          // 文件需要保留扩展名
          if (!isFolder.value && props.file?.extension) {
            const hasExtension = value
              .toLowerCase()
              .endsWith('.' + props.file.extension.toLowerCase())
            if (!hasExtension) {
              callback(
                new Error(
                  t('file.modal.rename.validate.keepExtension', { extension: props.file.extension })
                )
              )
              return
            }
          }
          callback()
        },
        trigger: 'blur'
      }
    ]
  }

  watch(
    () => props.modelValue,
    (val) => {
      if (val && props.file) {
        form.value.name = props.file.originalName
        nextTick(() => formRef.value?.clearValidate())
      }
    }
  )

  const handleClose = () => {
    visible.value = false
  }

  const handleSubmit = async () => {
    if (!props.file) return

    try {
      await formRef.value?.validate()
      loading.value = true
      emit('confirm', props.file, form.value.name)
      handleClose()
    } catch {
      // validation failed
    } finally {
      loading.value = false
    }
  }
</script>
