<template>
  <el-dialog
    v-model="visible"
    :title="t('file.modal.newFolder.title')"
    width="420px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="0">
      <el-form-item prop="name">
        <el-input
          v-model="form.name"
          :placeholder="t('file.modal.newFolder.placeholder')"
          clearable
          maxlength="100"
          show-word-limit
          @keyup.enter="handleSubmit"
        >
          <template #prefix>
            <ArtSvgIcon icon="ri:folder-fill" :size="18" />
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">{{ t('file.modal.newFolder.cancel') }}</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ t('file.modal.newFolder.confirm') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import type { FormInstance, FormRules } from 'element-plus'

  const { t } = useI18n()

  const props = defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', visible: boolean): void
    (e: 'confirm', name: string): void
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

  const rules: FormRules = {
    name: [
      { required: true, message: t('file.modal.newFolder.validate.required'), trigger: 'blur' },
      {
        pattern: /^[^/\\:*?"<>|]+$/,
        message: t('file.modal.newFolder.validate.invalidChars'),
        trigger: 'blur'
      },
      {
        min: 1,
        max: 100,
        message: t('file.modal.newFolder.validate.lengthRange'),
        trigger: 'blur'
      }
    ]
  }

  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        form.value.name = ''
        nextTick(() => formRef.value?.clearValidate())
      }
    }
  )

  const handleClose = () => {
    visible.value = false
  }

  const handleSubmit = async () => {
    try {
      await formRef.value?.validate()
      loading.value = true
      emit('confirm', form.value.name)
      handleClose()
    } catch {
      // validation failed
    } finally {
      loading.value = false
    }
  }
</script>
