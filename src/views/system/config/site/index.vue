<template>
  <div v-loading="loading" class="config-page">
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="140px"
      :disabled="!isUpdate"
      class="config-form"
    >
      <!-- 站点Logo -->
      <ElFormItem class="image-item" prop="SITE_LOGO">
        <template #label>{{ siteConfig.SITE_LOGO?.name }}</template>
        <ElUpload :http-request="handleUploadLogo" :show-file-list="false" accept="image/*">
          <template #trigger>
            <ElButton v-if="!logoFile.url" type="primary" size="small">
              <ElIcon><Plus /></ElIcon>
              上传
            </ElButton>
            <div v-else class="image-preview logo">
              <ElImage :src="logoFile.url" fit="contain" />
              <div v-if="isUpdate" class="image-mask">
                <ElIcon><Edit /></ElIcon>
              </div>
            </div>
          </template>
        </ElUpload>
        <div class="form-item-extra">{{ siteConfig.SITE_LOGO?.description }}</div>
      </ElFormItem>

      <!-- 站点图标 -->
      <ElFormItem class="image-item" prop="SITE_FAVICON">
        <template #label>{{ siteConfig.SITE_FAVICON?.name }}</template>
        <ElUpload :http-request="handleUploadFavicon" :show-file-list="false" accept="image/*">
          <template #trigger>
            <ElButton v-if="!faviconFile.url" type="primary" size="small">
              <ElIcon><Plus /></ElIcon>
              上传
            </ElButton>
            <div v-else class="image-preview favicon">
              <ElImage :src="faviconFile.url" fit="contain" />
              <div v-if="isUpdate" class="image-mask">
                <ElIcon><Edit /></ElIcon>
              </div>
            </div>
          </template>
        </ElUpload>
        <div class="form-item-extra">{{ siteConfig.SITE_FAVICON?.description }}</div>
      </ElFormItem>

      <!-- 系统名称 -->
      <ElFormItem prop="SITE_TITLE">
        <template #label>{{ siteConfig.SITE_TITLE?.name }}</template>
        <ElInput v-model="form.SITE_TITLE" maxlength="18" show-word-limit />
        <div class="form-item-extra">{{ siteConfig.SITE_TITLE?.description }}</div>
      </ElFormItem>

      <!-- 系统描述 -->
      <ElFormItem prop="SITE_DESCRIPTION">
        <template #label>{{ siteConfig.SITE_DESCRIPTION?.name }}</template>
        <ElInput
          v-model="form.SITE_DESCRIPTION"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 6 }"
        />
        <div class="form-item-extra">{{ siteConfig.SITE_DESCRIPTION?.description }}</div>
      </ElFormItem>

      <!-- 版权声明 -->
      <ElFormItem prop="SITE_COPYRIGHT">
        <template #label>{{ siteConfig.SITE_COPYRIGHT?.name }}</template>
        <ElInput v-model="form.SITE_COPYRIGHT" />
        <div class="form-item-extra">{{ siteConfig.SITE_COPYRIGHT?.description }}</div>
      </ElFormItem>

      <!-- 备案号 -->
      <ElFormItem prop="SITE_BEIAN">
        <template #label>{{ siteConfig.SITE_BEIAN?.name }}</template>
        <ElInput v-model="form.SITE_BEIAN" maxlength="30" show-word-limit />
        <div class="form-item-extra">{{ siteConfig.SITE_BEIAN?.description }}</div>
      </ElFormItem>
    </ElForm>
    <div class="config-actions">
      <ElSpace>
        <ElButton v-if="!isUpdate" type="primary" @click="onUpdate">
          <ElIcon><Edit /></ElIcon>
          修改
        </ElButton>
        <ElButton v-if="!isUpdate" @click="onResetValue">
          <ElIcon><RefreshLeft /></ElIcon>
          恢复默认
        </ElButton>
        <ElButton v-if="isUpdate" type="primary" @click="handleSave">
          <ElIcon><Select /></ElIcon>
          保存
        </ElButton>
        <ElButton v-if="isUpdate" @click="reset">
          <ElIcon><Refresh /></ElIcon>
          重置
        </ElButton>
        <ElButton v-if="isUpdate" @click="handleCancel">
          <ElIcon><Close /></ElIcon>
          取消
        </ElButton>
      </ElSpace>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    listOption,
    OptionReq,
    resetOptionValue,
    updateOption,
    type OptionResp,
    type SiteConfig
  } from '@/apis/system/option'
  import { useResetReactive } from '@/hooks'
  import { fileToBase64 } from '@/utils/encrypt'
  import { Close, Edit, Plus, Refresh, RefreshLeft, Select } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules, UploadRequestOptions } from 'element-plus'
  import { ElMessage, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'SiteConfig' })

  const loading = ref<boolean>(false)
  const formRef = ref<FormInstance>()

  // 表单数据 - 只存储值
  const [form, resetForm] = useResetReactive({
    SITE_FAVICON: '',
    SITE_LOGO: '',
    SITE_TITLE: '',
    SITE_DESCRIPTION: '',
    SITE_COPYRIGHT: '',
    SITE_BEIAN: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    SITE_TITLE: [{ required: true, message: '请输入系统名称', trigger: 'blur' }]
  }

  // 配置元数据 - 存储完整的 OptionResp（包含 id, name, code, value, description）
  const siteConfig = ref<SiteConfig>({
    SITE_FAVICON: {} as OptionResp,
    SITE_LOGO: {} as OptionResp,
    SITE_TITLE: {} as OptionResp,
    SITE_DESCRIPTION: {} as OptionResp,
    SITE_COPYRIGHT: {} as OptionResp,
    SITE_BEIAN: {} as OptionResp
  })

  // 文件对象
  const logoFile = ref<{ url?: string }>({})
  const faviconFile = ref<{ url?: string }>({})

  // 编辑状态
  const isUpdate = ref(false)

  // 查询参数
  const queryForm = reactive({
    category: 'SITE'
  })

  // 重置表单
  const reset = () => {
    formRef.value?.resetFields()
    form.SITE_FAVICON = siteConfig.value.SITE_FAVICON.value || ''
    form.SITE_LOGO = siteConfig.value.SITE_LOGO.value || ''
    form.SITE_TITLE = siteConfig.value.SITE_TITLE.value || ''
    form.SITE_DESCRIPTION = siteConfig.value.SITE_DESCRIPTION.value || ''
    form.SITE_COPYRIGHT = siteConfig.value.SITE_COPYRIGHT.value || ''
    form.SITE_BEIAN = siteConfig.value.SITE_BEIAN.value || ''
    logoFile.value.url = siteConfig.value.SITE_LOGO.value
    faviconFile.value.url = siteConfig.value.SITE_FAVICON.value
  }

  // 查询配置数据
  const getDataList = async () => {
    loading.value = true
    try {
      const data = await listOption(queryForm)
      // 使用 reduce 构建对象映射
      siteConfig.value = data.reduce<SiteConfig>((obj, option) => {
        obj[option.code as keyof SiteConfig] = { ...option }
        return obj
      }, {} as SiteConfig)
      reset()
    } finally {
      loading.value = false
    }
  }

  // 修改
  const onUpdate = () => {
    isUpdate.value = true
  }

  // 取消
  const handleCancel = () => {
    reset()
    isUpdate.value = false
  }

  const handleSave = async () => {
    const isValid = await formRef.value?.validate()
    if (!isValid) return

    try {
      await updateOption(
        Object.entries(form).map(([key, value]) => {
          const configKey = key as keyof typeof siteConfig.value
          return {
            id: siteConfig.value[configKey].id,
            code: key,
            value: value as string
          } as OptionReq
        })
      )
      ElMessage.success('保存成功')
      await getDataList()
    } catch (error) {
      console.error('Failed to update site config:', error)
    }
  }

  // 恢复默认
  const handleResetValue = async () => {
    try {
      await resetOptionValue(queryForm)
      ElMessage.success('恢复成功')
      await getDataList()
    } catch (error) {
      console.error('Failed to reset site config:', error)
    }
  }

  const onResetValue = () => {
    ElMessageBox.confirm('确认恢复基础配置为默认值吗？', '警告', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })
      .then(async () => {
        await handleResetValue()
      })
      .catch(() => {})
  }

  const handleUpload = (field: 'SITE_LOGO' | 'SITE_FAVICON', fileRef: Ref<{ url?: string }>) => {
    return (options: UploadRequestOptions): Promise<unknown> => {
      const file = options.file as File
      return fileToBase64(file)
        .then((res) => {
          form[field] = res
          fileRef.value.url = res
          ElMessage.success('上传成功')
        })
        .catch((error) => {
          console.error('Upload failed:', error)
          ElMessage.error('上传失败')
          return Promise.reject(error)
        })
    }
  }

  const handleUploadLogo = handleUpload('SITE_LOGO', logoFile)
  const handleUploadFavicon = handleUpload('SITE_FAVICON', faviconFile)

  onMounted(() => {
    getDataList()
  })
</script>

<style scoped lang="scss">
  .config-page {
    padding: 20px;
  }

  .config-form {
    max-width: 600px;
  }

  .config-actions {
    padding-left: 140px;
  }

  .form-item-extra {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }

  .image-item {
    :deep(.el-form-item__content) {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }
  }

  .image-preview {
    position: relative;
    display: inline-block;
    overflow: hidden;

    .el-image {
      display: block;
    }
  }

  .logo {
    width: 50px;
    height: 50px;
  }

  .favicon {
    width: 46px;
    height: 46px;
  }

  .image-mask {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 16px;
    color: #fff;
    cursor: pointer;
    background-color: rgb(0 0 0 / 50%);
  }
</style>
