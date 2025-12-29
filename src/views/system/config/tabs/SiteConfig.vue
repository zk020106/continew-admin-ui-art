<template>
  <div class="site-config-page">
    <ElForm ref="formRef" :model="formData" :rules="rules" class="config-form" label-width="140px">
      <!-- Logo -->
      <ElFormItem prop="logo">
        <template #label>
          <div class="label-with-tip">
            <span>{{ t('config.site.logo') }}</span>
            <ElTooltip :content="t('config.site.logoTip')" placement="top">
              <ElIcon class="tip-icon"><QuestionFilled /></ElIcon>
            </ElTooltip>
          </div>
        </template>
        <ElUpload
          class="avatar-uploader logo-uploader"
          action="#"
          :show-file-list="false"
          :auto-upload="false"
          accept=".svg,.png,.jpg,.jpeg"
        >
          <img v-if="formData.logo" :src="formData.logo" class="avatar logo" />
          <div v-else class="avatar-placeholder logo-placeholder">
            <ElIcon class="avatar-icon"><Plus /></ElIcon>
          </div>
        </ElUpload>
      </ElFormItem>

      <!-- Favicon -->
      <ElFormItem prop="favicon">
        <template #label>
          <div class="label-with-tip">
            <span>{{ t('config.site.favicon') }}</span>
            <ElTooltip :content="t('config.site.faviconTip')" placement="top">
              <ElIcon class="tip-icon"><QuestionFilled /></ElIcon>
            </ElTooltip>
          </div>
        </template>
        <ElUpload
          class="avatar-uploader favicon-uploader"
          action="#"
          :show-file-list="false"
          :auto-upload="false"
          accept=".ico,.svg,.png"
        >
          <img v-if="formData.favicon" :src="formData.favicon" class="avatar favicon" />
          <div v-else class="avatar-placeholder favicon-placeholder">
            <ElIcon class="avatar-icon"><Plus /></ElIcon>
          </div>
        </ElUpload>
      </ElFormItem>

      <!-- Title -->
      <ElFormItem prop="title">
        <template #label>
          <div class="label-with-tip">
            <span>{{ t('config.site.title') }}</span>
            <ElTooltip :content="t('config.site.titleTip')" placement="top">
              <ElIcon class="tip-icon"><QuestionFilled /></ElIcon>
            </ElTooltip>
          </div>
        </template>
        <ElInput
          v-model="formData.title"
          :maxlength="18"
          :show-word-limit="true"
          :placeholder="t('config.site.titlePlaceholder')"
          class="form-input"
        />
      </ElFormItem>

      <!-- Description -->
      <ElFormItem prop="description">
        <template #label>
          <div class="label-with-tip">
            <span>{{ t('config.site.description') }}</span>
            <ElTooltip :content="t('config.site.descriptionTip')" placement="top">
              <ElIcon class="tip-icon"><QuestionFilled /></ElIcon>
            </ElTooltip>
          </div>
        </template>
        <ElInput
          v-model="formData.description"
          type="textarea"
          :rows="3"
          :maxlength="200"
          :show-word-limit="true"
          :placeholder="t('config.site.descriptionPlaceholder')"
          class="form-input"
        />
      </ElFormItem>

      <!-- Copyright -->
      <ElFormItem prop="copyright">
        <template #label>
          <div class="label-with-tip">
            <span>{{ t('config.site.copyright') }}</span>
            <ElTooltip :content="t('config.site.copyrightTip')" placement="top">
              <ElIcon class="tip-icon"><QuestionFilled /></ElIcon>
            </ElTooltip>
          </div>
        </template>
        <ElInput
          v-model="formData.copyright"
          :maxlength="100"
          :show-word-limit="true"
          :placeholder="t('config.site.copyrightPlaceholder')"
          class="form-input"
        />
      </ElFormItem>

      <!-- Beian -->
      <ElFormItem prop="beian">
        <template #label>
          <div class="label-with-tip">
            <span>{{ t('config.site.beian') }}</span>
            <ElTooltip :content="t('config.site.beianTip')" placement="top">
              <ElIcon class="tip-icon"><QuestionFilled /></ElIcon>
            </ElTooltip>
          </div>
        </template>
        <ElInput
          v-model="formData.beian"
          :maxlength="30"
          :show-word-limit="true"
          :placeholder="t('config.site.beianPlaceholder')"
          class="form-input"
        />
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import { listOption, type OptionResp, type SiteConfig } from '@/apis/system'
  import { Plus, QuestionFilled } from '@element-plus/icons-vue'
  import { onMounted, reactive, ref } from 'vue'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const formRef = ref()
  const loading = ref(false)

  const formData = reactive({
    logo: '',
    favicon: '',
    title: '',
    description: '',
    copyright: '',
    beian: ''
  })

  const siteConfig = ref<SiteConfig>({
    SITE_FAVICON: {} as OptionResp,
    SITE_LOGO: {} as OptionResp,
    SITE_TITLE: {} as OptionResp,
    SITE_DESCRIPTION: {} as OptionResp,
    SITE_COPYRIGHT: {} as OptionResp,
    SITE_BEIAN: {} as OptionResp
  })

  const rules = {
    title: [{ required: true, message: t('config.site.titleRequired'), trigger: 'blur' }],
    description: [
      { required: true, message: t('config.site.descriptionRequired'), trigger: 'blur' }
    ],
    copyright: [{ required: true, message: t('config.site.copyrightRequired'), trigger: 'blur' }]
  }

  const queryForm = reactive({
    category: 'SITE'
  })

  // 查询列表数据
  const getDataList = async () => {
    loading.value = true
    try {
      const data = await listOption(queryForm)
      siteConfig.value = data.reduce((obj: SiteConfig, option: OptionResp) => {
        obj[option.code as keyof SiteConfig] = { ...option }
        return obj
      }, {} as SiteConfig)

      // 回显数据
      formData.logo = siteConfig.value.SITE_LOGO?.value || ''
      formData.favicon = siteConfig.value.SITE_FAVICON?.value || ''
      formData.title = siteConfig.value.SITE_TITLE?.value || ''
      formData.description = siteConfig.value.SITE_DESCRIPTION?.value || ''
      formData.copyright = siteConfig.value.SITE_COPYRIGHT?.value || ''
      formData.beian = siteConfig.value.SITE_BEIAN?.value || ''
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    getDataList()
  })
</script>

<style scoped lang="scss">
  .site-config-page {
    padding: var(--page-content-padding);
  }

  .config-form {
    max-width: 600px;

    :deep(.el-form-item) {
      margin-bottom: 18px;
    }
  }

  .label-with-tip {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .tip-icon {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    cursor: help;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .form-input {
    width: 500px;
  }

  .avatar-uploader {
    :deep(.el-upload) {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: var(--el-color-primary);
      }
    }
  }

  .logo {
    width: 50px;
    height: 50px;
  }

  .logo-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
  }

  .favicon {
    width: 46px;
    height: 46px;
  }

  .favicon-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
  }

  .avatar-icon {
    font-size: 28px;
    color: var(--el-text-color-secondary);
  }

  @media (width <= 768px) {
    .form-input {
      width: 100%;
    }
  }
</style>
