<template>
  <ElDrawer
    v-model="visible"
    :title="t('system.user.import.title')"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :size="width >= 600 ? 600 : '100%'"
    @close="reset"
  >
    <ElForm ref="formRef" :model="form" size="large" label-width="auto">
      <ElAlert v-if="!form.disabled" type="info" :closable="false" style="margin-bottom: 15px">
        <template #title> {{ t('system.user.import.alert') }} </template>
        <template #default>
          <ElLink type="primary" @click="downloadTemplate">
            <ElIcon><Document /></ElIcon>
            {{ t('system.user.import.downloadTemplate') }}
          </ElLink>
        </template>
      </ElAlert>

      <fieldset>
        <legend>{{ t('system.user.import.step1.title') }}</legend>
        <div class="file-box">
          <ElUpload
            drag
            :http-request="handleUpload"
            :limit="1"
            :show-file-list="true"
            :file-list="uploadFile"
            accept=".xls, .xlsx, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          >
            <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
            <div class="el-upload__text" v-html="t('system.user.import.step1.uploadText')" />
            <template #tip>
              <div class="el-upload__tip">{{ t('system.user.import.step1.uploadTip') }}</div>
            </template>
          </ElUpload>
        </div>
        <div v-if="dataResult.importKey">
          <div class="file-box">
            <ElSpace :size="20">
              <ElStatistic
                :title="t('system.user.import.step1.totalRows')"
                :value="dataResult.totalRows"
              />
              <ElStatistic
                :title="t('system.user.import.step1.validRows')"
                :value="dataResult.validRows"
              />
            </ElSpace>
          </div>
          <div class="file-box">
            <ElSpace :size="20">
              <ElStatistic
                :title="t('system.user.import.step1.duplicateUserRows')"
                :value="dataResult.duplicateUserRows"
              />
              <ElStatistic
                :title="t('system.user.import.step1.duplicateEmailRows')"
                :value="dataResult.duplicateEmailRows"
              />
              <ElStatistic
                :title="t('system.user.import.step1.duplicatePhoneRows')"
                :value="dataResult.duplicatePhoneRows"
              />
            </ElSpace>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>{{ t('system.user.import.step2.title') }}</legend>
        <ElFormItem :label="t('system.user.import.step2.duplicateUser')">
          <ElRadioGroup v-model="form.duplicateUser">
            <ElRadioButton :value="1">{{ t('system.user.import.step2.skip') }}</ElRadioButton>
            <ElRadioButton :value="3">{{ t('system.user.import.step2.stop') }}</ElRadioButton>
            <ElRadioButton :value="2">{{ t('system.user.import.step2.update') }}</ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem :label="t('system.user.import.step2.duplicateEmail')">
          <ElRadioGroup v-model="form.duplicateEmail">
            <ElRadioButton :value="1">{{ t('system.user.import.step2.skip') }}</ElRadioButton>
            <ElRadioButton :value="3">{{ t('system.user.import.step2.stop') }}</ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem :label="t('system.user.import.step2.duplicatePhone')">
          <ElRadioGroup v-model="form.duplicatePhone">
            <ElRadioButton :value="1">{{ t('system.user.import.step2.skip') }}</ElRadioButton>
            <ElRadioButton :value="3">{{ t('system.user.import.step2.stop') }}</ElRadioButton>
          </ElRadioGroup>
        </ElFormItem>
        <ElFormItem :label="t('system.user.import.step2.defaultStatus')">
          <ElSwitch
            v-model="form.defaultStatus"
            :active-value="1"
            :inactive-value="2"
            :active-text="t('common.statusEnabled')"
            :inactive-text="t('common.statusDisabled')"
          />
        </ElFormItem>
      </fieldset>
    </ElForm>

    <template #footer>
      <CaButton type="cancel" @click="visible = false">{{
        t('system.user.import.button.cancel')
      }}</CaButton>
      <CaButton type="confirm" @click="save">{{ t('system.user.import.button.confirm') }}</CaButton>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { UserImportResp } from '@/apis'
  import { downloadUserImportTemplate, importUser, parseImportUser } from '@/apis/system/user'
  import CaButton from '@/components/base/CaButton/index.vue'
  import { useDownload, useResetReactive } from '@/hooks'
  import { Document, UploadFilled } from '@element-plus/icons-vue'
  import { useWindowSize } from '@vueuse/core'
  import type { FormInstance, UploadRequestOptions } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()

  const { width } = useWindowSize()
  const { t } = useI18n()

  const visible = ref(false)
  const formRef = ref<FormInstance>()
  const uploadFile = ref([])

  const [form, resetForm] = useResetReactive({
    duplicateUser: 1,
    duplicateEmail: 1,
    duplicatePhone: 1,
    defaultStatus: 1
  })

  const dataResult = ref<UserImportResp>({
    importKey: '',
    totalRows: 0,
    validRows: 0,
    duplicateUserRows: 0,
    duplicateEmailRows: 0,
    duplicatePhoneRows: 0
  })

  // 重置
  const reset = () => {
    formRef.value?.resetFields()
    dataResult.value.importKey = ''
    uploadFile.value = []
    resetForm()
  }

  // 下载模板
  const downloadTemplate = () => {
    useDownload(() => downloadUserImportTemplate())
  }

  // 上传解析导入数据
  const handleUpload = (options: UploadRequestOptions) => {
    const { onError, onSuccess, file } = options
    const formData = new FormData()
    formData.append('file', file)

    return parseImportUser(formData)
      .then((res) => {
        dataResult.value = res.data
        ElMessage.success(t('system.user.import.message.uploadSuccess'))
        onSuccess(res)
      })
      .catch((error) => {
        onError(error)
      })
  }

  // 执行导入
  const save = async () => {
    try {
      if (!dataResult.value.importKey) {
        ElMessage.warning(t('system.user.import.message.pleaseUploadFirst'))
        return false
      }
      form.importKey = dataResult.value.importKey
      const res = await importUser(form)
      ElMessage.success(
        t('system.user.import.message.importSuccess', {
          insertRows: res.data.insertRows,
          updateRows: res.data.updateRows
        })
      )
      emit('save-success')
      visible.value = false
      return true
    } catch (err) {
      console.error(err)
      return false
    }
  }

  // 打开
  const onOpen = () => {
    reset()
    visible.value = true
  }

  defineExpose({ onOpen })
</script>

<style scoped lang="scss">
  fieldset {
    padding: 15px 15px 0;
    margin-bottom: 15px;
    border: 1px solid var(--el-border-color);
    border-radius: 3px;
  }

  fieldset legend {
    padding: 2px 5px;
    color: var(--el-text-color-primary);
    border: 1px solid var(--el-border-color);
    border-radius: 3px;
  }

  .file-box {
    margin-bottom: 20px;
    margin-left: 10px;
  }
</style>
