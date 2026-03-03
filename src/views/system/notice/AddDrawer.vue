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
            <ElFormItem label="标题" prop="title">
              <ElInput v-model="form.title" clearable maxlength="150" show-word-limit />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="分类" prop="type">
              <ElSelect v-model="form.type" placeholder="请选择分类" clearable>
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
            <ElFormItem label="通知范围" prop="noticeScope">
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
            <ElFormItem label="指定用户" prop="noticeUsers">
              <ElSelect
                v-model="form.noticeUsers"
                multiple
                filterable
                clearable
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择指定用户"
              >
                <ElOption
                  v-for="item in userOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="String(item.value)"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="通知方式" prop="noticeMethods">
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
            <ElFormItem label="置顶" prop="isTop">
              <ElSwitch
                v-model="form.isTop"
                :active-value="true"
                :inactive-value="false"
                active-text="是"
                inactive-text="否"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="定时发布" prop="isTiming">
              <ElSwitch
                v-model="form.isTiming"
                :disabled="isPublished"
                :active-value="true"
                :inactive-value="false"
                active-text="是"
                inactive-text="否"
              />
            </ElFormItem>
          </ElCol>
          <ElCol v-if="form.isTiming" :span="12">
            <ElFormItem label="发布时间" prop="publishTime">
              <ElDatePicker
                v-model="form.publishTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择发布时间"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElFormItem label="内容" prop="content">
          <ArtWangEditor v-model="form.content" height="320px" placeholder="请输入公告内容..." />
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
          草稿
        </ElButton>
        <ElButton type="primary" :loading="saving" @click="save(false)">
          {{ isUpdate && isPublished ? '保存' : '发布' }}
        </ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import type { NoticeReq } from '@/apis/system'
import type { LabelValueState } from '@/types/global'
import { useWindowSize } from '@vueuse/core'
import { addNotice, getNotice, listUserDict, updateNotice } from '@/apis/system'
import CaButton from '@/components/base/CaButton/index.vue'
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
const { notice_type, notice_scope_enum, notice_method_enum } = useDict(
  'notice_type',
  'notice_scope_enum',
  'notice_method_enum'
)

const dataId = ref('')
const visible = ref(false)
const loading = ref(false)
const saving = ref(false)
const userOptions = ref<LabelValueState[]>([])
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
const title = computed(() => (isUpdate.value ? '修改公告' : '新增公告'))

const rules = reactive<FormRules<NoticeFormModel>>({
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择分类', trigger: 'change' }],
  noticeScope: [{ required: true, message: '请选择通知范围', trigger: 'change' }],
  noticeUsers: [
    {
      trigger: 'change',
      validator: (_rule, value, callback) => {
        if (form.noticeScope !== 1 && (!value || value.length === 0)) {
          callback(new Error('请选择指定用户'))
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
          callback(new Error('请选择通知方式'))
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
          callback(new Error('请选择发布时间'))
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
          callback(new Error('请输入公告内容'))
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

const fetchUserOptions = async () => {
  if (userOptions.value.length) return
  const data = await listUserDict()
  userOptions.value = data.map((item) => ({ ...item, value: String(item.value) }))
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
      ElMessage.success('修改成功')
    } else {
      await addNotice(payload)
      ElMessage.success('新增成功')
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
  await fetchUserOptions()
  visible.value = true
}

const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  loading.value = true
  try {
    await fetchUserOptions()
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

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss">
  .notice-editor {
    padding-right: 8px;
  }
</style>
