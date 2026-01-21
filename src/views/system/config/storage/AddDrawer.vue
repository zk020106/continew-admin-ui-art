<template>
  <ElDrawer
    v-model="visible"
    :title="drawerTitle"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :size="width >= 600 ? 600 : '100%'"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <ElFormItem :label="t('system.config.storage.name')" prop="name">
        <ElInput
          v-model="formData.name"
          :placeholder="t('common.placeholder.status', { label: t('system.config.storage.name') })"
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.storage.code')" prop="code">
        <ElInput
          v-model="formData.code"
          :placeholder="t('common.placeholder.status', { label: t('system.config.storage.code') })"
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.storage.type')" prop="type">
        <ElSelect
          v-model="formData.type"
          :placeholder="t('common.placeholder.select', { label: t('system.config.storage.type') })"
          style="width: 100%"
          :disabled="isEdit"
        >
          <ElOption :label="t('system.config.storage.localStorage')" :value="1" />
          <ElOption :label="t('system.config.storage.objectStorage')" :value="2" />
        </ElSelect>
      </ElFormItem>

      <!-- 本地存储特有字段 -->
      <template v-if="formData.type === 1">
        <ElFormItem :label="t('system.config.storage.bucketName')" prop="bucketName">
          <ElInput
            v-model="formData.bucketName"
            :placeholder="
              t('common.placeholder.status', { label: t('system.config.storage.bucketName') })
            "
          />
        </ElFormItem>
        <ElFormItem :label="t('system.config.storage.domain')" prop="domain">
          <ElInput
            v-model="formData.domain"
            :placeholder="
              t('common.placeholder.status', { label: t('system.config.storage.domain') })
            "
          />
        </ElFormItem>
      </template>

      <!-- 对象存储特有字段 -->
      <template v-else>
        <ElFormItem :label="t('system.config.storage.accessKey')" prop="accessKey">
          <ElInput
            v-model="formData.accessKey"
            :placeholder="
              t('common.placeholder.status', { label: t('system.config.storage.accessKey') })
            "
          />
        </ElFormItem>
        <ElFormItem :label="t('system.config.storage.secretKey')" prop="secretKey">
          <ElInput
            v-model="formData.secretKey"
            type="password"
            show-password
            :placeholder="
              t('common.placeholder.status', { label: t('system.config.storage.secretKey') })
            "
          />
        </ElFormItem>
        <ElFormItem :label="t('system.config.storage.endpoint')" prop="endpoint">
          <ElInput
            v-model="formData.endpoint"
            :placeholder="
              t('common.placeholder.status', { label: t('system.config.storage.endpoint') })
            "
          />
        </ElFormItem>
        <ElFormItem :label="t('system.config.storage.bucketName')" prop="bucketName">
          <ElInput
            v-model="formData.bucketName"
            :placeholder="
              t('common.placeholder.status', { label: t('system.config.storage.bucketName') })
            "
          />
        </ElFormItem>
        <ElFormItem :label="t('system.config.storage.domain')" prop="domain">
          <ElInput
            v-model="formData.domain"
            :placeholder="
              t('common.placeholder.status', { label: t('system.config.storage.domain') })
            "
          />
        </ElFormItem>
      </template>

      <ElFormItem :label="t('common.status')" prop="status">
        <ElSwitch
          v-model="formData.status"
          :active-value="1"
          :inactive-value="2"
          :active-text="t('common.statusEnabled')"
          :inactive-text="t('common.statusDisabled')"
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleClose">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" @click="handleConfirm">{{ t('common.confirm') }}</ElButton>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { addStorage, getStorage, updateStorage } from '@/apis/system/storage'
  import type { StorageReq } from '@/apis/system/type'
  import { ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'StorageAddDrawer' })

  const emit = defineEmits<{
    'save-success': []
  }>()

  const { t } = useI18n()
  const width = ref(document.documentElement.clientWidth)
  const visible = ref(false)
  const formRef = ref()
  const isEdit = ref(false)
  const currentId = ref('')

  const drawerTitle = computed(() => {
    if (isEdit.value) {
      return formData.value.type === 1
        ? t('system.config.storage.editLocalTitle')
        : t('system.config.storage.editOssTitle')
    }
    return formData.value.type === 1
      ? t('system.config.storage.addLocalTitle')
      : t('system.config.storage.addOssTitle')
  })

  const formData = ref<StorageReq>({
    name: '',
    code: '',
    type: 1,
    accessKey: '',
    secretKey: '',
    endpoint: '',
    bucketName: '',
    domain: '',
    description: '',
    isDefault: false,
    sort: 0,
    status: 1
  })

  const formRules = computed(() => ({
    name: [
      {
        required: true,
        message: t('common.placeholder.status', { label: t('system.config.storage.name') }),
        trigger: 'blur'
      }
    ],
    code: [
      {
        required: true,
        message: t('common.placeholder.status', { label: t('system.config.storage.code') }),
        trigger: 'blur'
      }
    ],
    type: [
      {
        required: true,
        message: t('common.placeholder.select', { label: t('system.config.storage.type') }),
        trigger: 'change'
      }
    ],
    bucketName: [
      {
        required: true,
        message: t('common.placeholder.status', { label: t('system.config.storage.bucketName') }),
        trigger: 'blur'
      }
    ]
  }))

  const onAdd = (type: number) => {
    isEdit.value = false
    currentId.value = ''
    resetForm()
    formData.value.type = type
    visible.value = true
  }

  const onUpdate = async (id: string) => {
    isEdit.value = true
    currentId.value = id
    try {
      const res = await getStorage(id)
      formData.value = { ...res }
      visible.value = true
    } catch (error) {
      console.error('Failed to fetch storage detail:', error)
    }
  }

  const resetForm = () => {
    formData.value = {
      name: '',
      code: '',
      type: 1,
      accessKey: '',
      secretKey: '',
      endpoint: '',
      bucketName: '',
      domain: '',
      description: '',
      isDefault: false,
      sort: 0,
      status: 1
    }
    formRef.value?.clearValidate()
  }

  const handleConfirm = async () => {
    try {
      await formRef.value?.validate()
      if (isEdit.value) {
        await updateStorage(formData.value, currentId.value)
      } else {
        await addStorage(formData.value)
      }
      ElMessage.success(t('common.success'))
      visible.value = false
      emit('save-success')
    } catch (error) {
      if (error === false) return // 表单验证失败
      console.error('Failed to save storage:', error)
    }
  }

  const handleClose = () => {
    visible.value = false
  }

  defineExpose({
    onAdd,
    onUpdate
  })
</script>
