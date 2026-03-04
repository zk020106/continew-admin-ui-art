<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="110px">
      <ElFormItem :label="t('system.config.storage.name')" prop="name">
        <ElInput v-model="form.name" maxlength="100" show-word-limit />
      </ElFormItem>
      <ElFormItem :label="t('system.config.storage.code')" prop="code">
        <ElInput v-model="form.code" maxlength="30" :disabled="isUpdate" />
      </ElFormItem>

      <template v-if="form.type === 2">
        <ElFormItem :label="t('system.config.storage.accessKey')" prop="accessKey">
          <ElInput v-model="form.accessKey" />
        </ElFormItem>
        <ElFormItem :label="t('system.config.storage.secretKey')" prop="secretKey">
          <ElInput
            v-model="form.secretKey"
            type="password"
            show-password
            :placeholder="
              isUpdate
                ? t('system.config.storage.secretKeyPlaceholderKeep')
                : t('system.config.storage.secretKeyPlaceholderInput')
            "
          />
        </ElFormItem>
        <ElFormItem :label="t('system.config.storage.endpoint')" prop="endpoint">
          <ElInput v-model="form.endpoint" :placeholder="t('system.config.storage.endpointPlaceholder')" />
        </ElFormItem>
        <ElFormItem :label="t('system.config.storage.bucketName')" prop="bucketName">
          <ElInput v-model="form.bucketName" />
        </ElFormItem>
        <ElFormItem :label="t('system.config.storage.domain')" prop="domain">
          <ElInput v-model="form.domain" :placeholder="t('system.config.storage.domainOptionalPlaceholder')" />
        </ElFormItem>
      </template>

      <template v-else>
        <ElFormItem :label="t('system.config.storage.path')" prop="bucketName">
          <ElInput v-model="form.bucketName" :placeholder="t('system.config.storage.pathPlaceholder')" />
        </ElFormItem>
        <ElFormItem :label="t('system.config.storage.accessPath')" prop="domain">
          <ElInput v-model="form.domain" :placeholder="t('system.config.storage.accessPathPlaceholder')" />
        </ElFormItem>
      </template>

      <ElFormItem :label="t('system.config.storage.recycleBinEnabled')" prop="recycleBinEnabled">
        <ElSwitch
          v-model="form.recycleBinEnabled"
          :active-value="true"
          :inactive-value="false"
          :active-text="t('common.statusEnabled')"
          :inactive-text="t('common.statusDisabled')"
          :disabled="isUpdate"
          inline-prompt
        />
      </ElFormItem>
      <ElFormItem
        v-if="form.recycleBinEnabled"
        :label="t('system.config.storage.recycleBinPath')"
        prop="recycleBinPath"
      >
        <ElInput
          v-model="form.recycleBinPath"
          :disabled="isUpdate"
          :placeholder="t('system.config.storage.recycleBinPathPlaceholder')"
        />
      </ElFormItem>

      <ElFormItem :label="t('system.config.storage.sort')" prop="sort">
        <ElInputNumber v-model="form.sort" :min="1" :max="9999" controls-position="right" />
      </ElFormItem>
      <ElFormItem :label="t('system.config.storage.description')" prop="description">
        <ElInput
          v-model="form.description"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
        />
      </ElFormItem>
      <ElFormItem :label="t('common.status')" prop="status">
        <ElSwitch
          v-model="form.status"
          :active-value="1"
          :inactive-value="2"
          :active-text="t('common.statusEnabled')"
          :inactive-text="t('common.statusDisabled')"
          inline-prompt
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="visible = false">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" :loading="saveLoading" @click="handleSave">{{ t('common.confirm') }}</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import type { StorageReq } from '@/apis/system/type'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { addStorage, getStorage, updateStorage } from '@/apis/system/storage'
import { useResetReactive } from '@/hooks'
import { encryptByRsa } from '@/utils/encrypt'

interface StorageFormModel {
  type: number
  code: string
  name: string
  accessKey: string
  secretKey: string
  endpoint: string
  bucketName: string
  domain: string
  recycleBinEnabled: boolean
  recycleBinPath: string
  sort: number
  status: number
  description: string
  isDefault: boolean
}

const emit = defineEmits<{
  (e: 'save-success'): void
}>()
const { t } = useI18n()

const dataId = ref('')
const visible = ref(false)
const saveLoading = ref(false)
const formRef = ref<FormInstance>()

const isUpdate = computed(() => !!dataId.value)
const title = computed(() => {
  if (form.type === 2) {
    return isUpdate.value
      ? t('system.config.storage.editOssTitle')
      : t('system.config.storage.addOssTitle')
  }
  return isUpdate.value
    ? t('system.config.storage.editLocalTitle')
    : t('system.config.storage.addLocalTitle')
})

const [form, resetForm] = useResetReactive<StorageFormModel>({
  type: 2,
  code: '',
  name: '',
  accessKey: '',
  secretKey: '',
  endpoint: '',
  bucketName: '',
  domain: '',
  recycleBinEnabled: true,
  recycleBinPath: '.RECYCLE.BIN/',
  sort: 999,
  status: 2,
  description: '',
  isDefault: false
})

const rules: FormRules<StorageFormModel> = {
  name: [
    {
      required: true,
      message: t('common.placeholder.inputWithLabel', { label: t('system.config.storage.name') }),
      trigger: 'blur'
    }
  ],
  code: [
    {
      required: true,
      message: t('common.placeholder.inputWithLabel', { label: t('system.config.storage.code') }),
      trigger: 'blur'
    }
  ],
  accessKey: [
    {
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (form.type === 2 && !value) {
          callback(
            new Error(
              t('common.placeholder.inputWithLabel', { label: t('system.config.storage.accessKey') })
            )
          )
          return
        }
        callback()
      }
    }
  ],
  secretKey: [
    {
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (form.type === 2 && !isUpdate.value && !value) {
          callback(
            new Error(
              t('common.placeholder.inputWithLabel', { label: t('system.config.storage.secretKey') })
            )
          )
          return
        }
        callback()
      }
    }
  ],
  endpoint: [
    {
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (form.type === 2 && !value) {
          callback(
            new Error(
              t('common.placeholder.inputWithLabel', { label: t('system.config.storage.endpoint') })
            )
          )
          return
        }
        callback()
      }
    }
  ],
  bucketName: [
    {
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(
            new Error(
              t('common.placeholder.inputWithLabel', {
                label: form.type === 2
                  ? t('system.config.storage.bucketName')
                  : t('system.config.storage.path')
              })
            )
          )
          return
        }
        callback()
      }
    }
  ],
  domain: [
    {
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (form.type === 1 && !value) {
          callback(
            new Error(
              t('common.placeholder.inputWithLabel', { label: t('system.config.storage.accessPath') })
            )
          )
          return
        }
        callback()
      }
    }
  ],
  recycleBinPath: [
    {
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        if (form.recycleBinEnabled && !value) {
          callback(
            new Error(
              t('common.placeholder.inputWithLabel', { label: t('system.config.storage.recycleBinPath') })
            )
          )
          return
        }
        callback()
      }
    }
  ]
}

const handleClose = () => {
  formRef.value?.resetFields()
  resetForm()
  dataId.value = ''
}

const buildPayload = (): StorageReq => {
  const payload: StorageReq = {
    ...form
  }

  if (payload.type === 2) {
    if (payload.secretKey) {
      payload.secretKey = encryptByRsa(payload.secretKey)
    } else {
      delete payload.secretKey
    }
  } else {
    delete payload.accessKey
    delete payload.secretKey
    delete payload.endpoint
  }

  return payload
}

const handleSave = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) return

  saveLoading.value = true
  try {
    const payload = buildPayload()
    if (isUpdate.value) {
      await updateStorage(payload, dataId.value)
      ElMessage.success(t('message.updateSuccess'))
    } else {
      await addStorage(payload)
      ElMessage.success(t('message.addSuccess'))
    }
    emit('save-success')
    visible.value = false
  } catch (error) {
    console.error('Failed to save storage:', error)
  } finally {
    saveLoading.value = false
  }
}

const onAdd = (type: number) => {
  resetForm()
  dataId.value = ''
  form.type = type
  visible.value = true
}

const onUpdate = async (id: string) => {
  resetForm()
  dataId.value = id
  const data = await getStorage(id)
  Object.assign(form, data, { secretKey: '' })
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>
