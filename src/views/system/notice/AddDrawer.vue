<template>
  <ElDrawer
    v-model="visible"
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :size="width >= 960 ? 960 : '100%'"
    @close="reset"
  >
    <div v-loading="loading" class="notice-editor">
      <ElForm ref="formRef" :model="form" :rules="rules" label-width="88px">
        <ElRow :gutter="16">
          <ElCol :span="24">
            <ElFormItem :label="t('pages.noticeManagement.field.title')" prop="title">
              <ElInput v-model="form.title" clearable maxlength="150" show-word-limit />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem :label="t('pages.noticeManagement.field.type')" prop="type">
              <ElSelect v-model="form.type" :placeholder="t('pages.noticeManagement.placeholder.type')" clearable>
                <ElOption
                  v-for="item in notice_type"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem :label="t('pages.noticeManagement.field.noticeScope')" prop="noticeScope">
              <ElRadioGroup v-model="form.noticeScope" :disabled="isPublished">
                <ElRadio
                  v-for="item in notice_scope_enum"
                  :key="item.value"
                  :value="Number(item.value)"
                >
                  {{ item.label }}
                </ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol v-if="form.noticeScope !== 1" :span="24">
            <ElFormItem :label="t('pages.noticeManagement.field.noticeUsers')" prop="noticeUsers">
              <CaUserSelector
                v-model="form.noticeUsers"
                :disabled="isPublished"
                :placeholder="t('pages.noticeManagement.placeholder.noticeUsers')"
                @change="handleNoticeUsersChange"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem :label="t('pages.noticeManagement.field.noticeMethods')" prop="noticeMethods">
              <ElCheckboxGroup v-model="form.noticeMethods" :disabled="isPublished">
                <ElCheckbox
                  v-for="item in notice_method_enum"
                  :key="item.value"
                  :value="Number(item.value)"
                >
                  {{ item.label }}
                </ElCheckbox>
              </ElCheckboxGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem :label="t('pages.noticeManagement.field.isTop')" prop="isTop">
              <ElSwitch
                v-model="form.isTop"
                :active-value="true"
                :inactive-value="false"
                :active-text="t('common.true')"
                :inactive-text="t('common.false')"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem :label="t('pages.noticeManagement.field.isTiming')" prop="isTiming">
              <ElSwitch
                v-model="form.isTiming"
                :disabled="isPublished"
                :active-value="true"
                :inactive-value="false"
                :active-text="t('common.true')"
                :inactive-text="t('common.false')"
              />
            </ElFormItem>
          </ElCol>
          <ElCol v-if="form.isTiming" :span="12">
            <ElFormItem :label="t('pages.noticeManagement.field.publishTime')" prop="publishTime">
              <ElDatePicker
                v-model="form.publishTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                format="YYYY-MM-DD HH:mm:ss"
                :placeholder="t('pages.noticeManagement.placeholder.publishTime')"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElFormItem :label="t('pages.noticeManagement.field.content')" prop="content">
          <ArtWangEditor
            v-model="form.content"
            height="320px"
            :placeholder="t('pages.noticeManagement.placeholder.content')"
          />
        </ElFormItem>
      </ElForm>
    </div>
    <template #footer>
      <ElSpace>
        <CaButton type="cancel" @click="visible = false" />
        <ElButton
          v-if="!isUpdate || !isPublished"
          type="warning"
          :loading="saving"
          @click="save(true)"
        >
          {{ t('pages.noticeManagement.button.draft') }}
        </ElButton>
        <ElButton type="primary" :loading="saving" @click="save(false)">
          {{ isUpdate && isPublished ? t('common.save') : t('pages.noticeManagement.button.publish') }}
        </ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import type { NoticeReq } from '@/apis/system'
import { useWindowSize } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { addNotice, getNotice, updateNotice } from '@/apis/system'
import CaButton from '@/components/base/CaButton/index.vue'
import CaUserSelector from '@/components/base/CaUserSelector/index.vue'
import ArtWangEditor from '@/components/core/forms/art-wang-editor/index.vue'
import { useDict, useResetReactive } from '@/hooks'

defineOptions({ name: 'SystemNoticeAddDrawer' })

interface NoticeFormModel {
  title: string
  type: string
  content: string
  noticeScope: number
  noticeUsers: string[]
  noticeMethods: number[]
  isTiming: boolean
  publishTime: string
  isTop: boolean
  status: number
}

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()
const { t } = useI18n()
const { notice_type, notice_scope_enum, notice_method_enum } = useDict(
  'notice_type',
  'notice_scope_enum',
  'notice_method_enum'
)

const dataId = ref('')
const visible = ref(false)
const loading = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()

const [form, resetForm] = useResetReactive<NoticeFormModel>({
  title: '',
  type: '',
  content: '',
  noticeScope: 1,
  noticeUsers: [],
  noticeMethods: [1],
  isTiming: false,
  publishTime: '',
  isTop: false,
  status: 1
})

const isUpdate = computed(() => !!dataId.value)
const isPublished = computed(() => Number(form.status) === 3)
const title = computed(() =>
  isUpdate.value ? t('pages.noticeManagement.title.edit') : t('pages.noticeManagement.title.add')
)

const rules = reactive<FormRules<NoticeFormModel>>({
  title: [
    {
      required: true,
      message: t('common.placeholder.inputWithLabel', { label: t('pages.noticeManagement.field.title') }),
      trigger: 'blur'
    }
  ],
  type: [
    {
      required: true,
      message: t('common.placeholder.selectWithLabel', { label: t('pages.noticeManagement.field.type') }),
      trigger: 'change'
    }
  ],
  noticeScope: [
    {
      required: true,
      message: t('common.placeholder.selectWithLabel', { label: t('pages.noticeManagement.field.noticeScope') }),
      trigger: 'change'
    }
  ],
  noticeUsers: [
    {
      trigger: 'change',
      validator: (_rule, value, callback) => {
        if (form.noticeScope !== 1 && (!value || value.length === 0)) {
          callback(
            new Error(
              t('common.placeholder.selectWithLabel', { label: t('pages.noticeManagement.field.noticeUsers') })
            )
          )
          return
        }
        callback()
      }
    }
  ],
  noticeMethods: [
    {
      trigger: 'change',
      validator: (_rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(
            new Error(
              t('common.placeholder.selectWithLabel', { label: t('pages.noticeManagement.field.noticeMethods') })
            )
          )
          return
        }
        callback()
      }
    }
  ],
  publishTime: [
    {
      trigger: 'change',
      validator: (_rule, value, callback) => {
        if (form.isTiming && !value) {
          callback(new Error(t('pages.noticeManagement.message.publishTimeRequired')))
          return
        }
        callback()
      }
    }
  ],
  content: [
    {
      trigger: 'blur',
      validator: (_rule, value, callback) => {
        const text = String(value || '')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, '')
          .trim()
        if (!text) {
          callback(
            new Error(
              t('common.placeholder.inputWithLabel', { label: t('pages.noticeManagement.field.content') })
            )
          )
          return
        }
        callback()
      }
    }
  ]
})

const reset = () => {
  formRef.value?.resetFields()
  resetForm()
  dataId.value = ''
}

const handleNoticeUsersChange = () => {
  formRef.value?.validateField('noticeUsers')
}

const buildPayload = (isDraft: boolean): NoticeReq => {
  return {
    title: form.title,
    type: form.type,
    content: form.content,
    noticeScope: Number(form.noticeScope),
    noticeUsers: form.noticeScope === 1 ? null : form.noticeUsers,
    noticeMethods: form.noticeMethods.map(Number),
    isTiming: form.isTiming,
    publishTime: form.isTiming ? form.publishTime : undefined,
    isTop: form.isTop,
    status: isDraft ? 1 : 3
  }
}

const save = async (isDraft: boolean) => {
  if (!formRef.value) return false
  try {
    saving.value = true
    await formRef.value.validate()
    const payload = buildPayload(isDraft)
    if (isUpdate.value) {
      await updateNotice(payload, dataId.value)
      ElMessage.success(t('message.updateSuccess'))
    } else {
      await addNotice(payload)
      ElMessage.success(t('message.addSuccess'))
    }
    visible.value = false
    emit('save-success')
    return true
  } catch (error) {
    console.error(error)
    return false
  } finally {
    saving.value = false
  }
}

const onAdd = async () => {
  reset()
  visible.value = true
}

const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  loading.value = true
  try {
    const data = await getNotice(id)
    Object.assign(form, {
      ...data,
      noticeUsers: (data.noticeUsers || []).map((item) => String(item)),
      noticeMethods: (data.noticeMethods || []).map((item) => Number(item)),
      isTiming: Boolean(data.isTiming),
      isTop: Boolean(data.isTop),
      status: data.status ?? 1,
      publishTime: data.publishTime || '',
      content: data.content || ''
    })
    visible.value = true
  } finally {
    loading.value = false
  }
}

watch(
  () => form.noticeScope,
  (value) => {
    if (value === 1) {
      formRef.value?.clearValidate('noticeUsers')
    }
  }
)

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss">
  .notice-editor {
    padding-right: 8px;
  }
</style>
