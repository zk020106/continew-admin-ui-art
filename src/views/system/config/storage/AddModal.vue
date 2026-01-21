<template>
  <ElDialog
    v-model="visible"
    :title="title"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
    @open="handleOpen"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px">
      <ElFormItem label="名称" prop="name">
        <ElInput v-model="form.name" maxlength="100" show-word-limit />
      </ElFormItem>
      <ElFormItem label="编码" prop="code">
        <ElInput v-model="form.code" maxlength="30" :disabled="isUpdate" />
      </ElFormItem>

      <!-- 对象存储字段 -->
      <template v-if="form.type === 2">
        <ElFormItem label="Access Key" prop="accessKey">
          <ElInput v-model="form.accessKey" />
        </ElFormItem>
        <ElFormItem label="Secret Key" prop="secretKey">
          <ElInput
            v-model="form.secretKey"
            type="password"
            show-password
            :placeholder="isUpdate ? '保持 Secret Key 为空将不更改' : '请输入 Secret Key'"
          />
        </ElFormItem>
        <ElFormItem label="Endpoint" prop="endpoint">
          <ElInput v-model="form.endpoint" placeholder="如: oss-cn-hangzhou.aliyuncs.com" />
        </ElFormItem>
        <ElFormItem label="Bucket" prop="bucketName">
          <ElInput v-model="form.bucketName" />
        </ElFormItem>
        <ElFormItem label="域名" prop="domain">
          <ElInput v-model="form.domain" placeholder="可选，自定义域名" />
        </ElFormItem>
      </template>

      <!-- 本地存储字段 -->
      <template v-else>
        <ElFormItem label="存储路径" prop="bucketName">
          <ElInput v-model="form.bucketName" placeholder="如: /data/storage" />
        </ElFormItem>
        <ElFormItem label="访问路径" prop="domain">
          <ElInput v-model="form.domain" placeholder="如: http://localhost:9000" />
        </ElFormItem>
      </template>

      <ElFormItem label="排序" prop="sort">
        <ElInputNumber v-model="form.sort" :min="1" :max="9999" controls-position="right" />
      </ElFormItem>
      <ElFormItem label="描述" prop="description">
        <ElInput
          v-model="form.description"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
        />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElSwitch
          v-model="form.status"
          :active-value="1"
          :inactive-value="2"
          active-text="启用"
          inactive-text="禁用"
          inline-prompt
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :loading="saveLoading" @click="handleSave">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { addStorage, getStorage, updateStorage } from '@/apis/system/storage'
  import { useResetReactive } from '@/hooks'
  import { encryptByRsa } from '@/utils/encrypt'
  import { ElMessage } from 'element-plus'

  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()

  const dataId = ref('')
  const visible = ref(false)
  const saveLoading = ref(false)
  const formRef = ref<FormInstance>()

  const isUpdate = computed(() => !!dataId.value)
  const storageType = computed(() => (form.type === 2 ? '对象存储' : '本地存储'))
  const title = computed(() =>
    isUpdate.value ? `修改${storageType.value}` : `新增${storageType.value}`
  )

  const [form, resetForm] = useResetReactive({
    type: 2,
    code: '',
    name: '',
    accessKey: '',
    secretKey: '',
    endpoint: '',
    bucketName: '',
    domain: '',
    sort: 999,
    status: 2,
    description: ''
  })

  const rules: FormRules = {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
    accessKey: [{ required: true, message: '请输入 Access Key', trigger: 'blur' }],
    secretKey: [
      {
        validator: (_rule, value, callback) => {
          if (!isUpdate.value && !value) {
            callback(new Error('请输入 Secret Key'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ],
    endpoint: [{ required: true, message: '请输入 Endpoint', trigger: 'blur' }],
    bucketName: [{ required: true, message: '请输入 Bucket/存储路径', trigger: 'blur' }],
    domain: [{ required: true, message: '请输入访问路径', trigger: 'blur' }]
  }

  const handleClose = () => {
    formRef.value?.resetFields()
    resetForm()
  }

  const handleOpen = () => {
    if (isUpdate.value) {
      // 编辑模式下，设置表单初始值
    }
  }

  const handleSave = async () => {
    try {
      const isInvalid = await formRef.value?.validate()
      if (isInvalid) return

      saveLoading.value = true

      if (isUpdate.value) {
        await updateStorage(
          {
            ...form,
            secretKey: form.type === 2 && form.secretKey ? encryptByRsa(form.secretKey) || '' : ''
          },
          dataId.value
        )
        ElMessage.success('修改成功')
      } else {
        await addStorage({
          ...form,
          secretKey: form.type === 2 ? encryptByRsa(form.secretKey) || '' : ''
        })
        ElMessage.success('新增成功')
      }

      emit('save-success')
      visible.value = false
    } catch (error) {
      console.error('Failed to save storage:', error)
    } finally {
      saveLoading.value = false
    }
  }

  const onAdd = async (type: number) => {
    resetForm()
    dataId.value = ''
    form.type = type
    visible.value = true
  }

  const onUpdate = async (id: string) => {
    resetForm()
    dataId.value = id
    const { data } = await getStorage(id)
    Object.assign(form, data)
    visible.value = true
  }

  defineExpose({ onAdd, onUpdate })
</script>
