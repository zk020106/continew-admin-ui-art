<template>
  <ElDrawer
    v-model="visible"
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :size="width >= 500 ? 500 : '100%'"
    @close="reset"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" size="default">
      <!-- 基础信息 -->
      <ElCard class="form-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>{{ t('dict.item.form.basicInfo') }}</span>
          </div>
        </template>

        <ElFormItem :label="t('dict.item.field.label')" prop="label">
          <ElInput
            v-model="form.label"
            :placeholder="t('dict.item.placeholder.label')"
            maxlength="50"
            show-word-limit
          />
        </ElFormItem>

        <ElFormItem :label="t('dict.item.field.value')" prop="value">
          <ElInput
            v-model="form.value"
            :placeholder="t('dict.item.placeholder.value')"
            maxlength="100"
            show-word-limit
          />
        </ElFormItem>

        <ElRow :gutter="16">
          <ElCol :span="24">
            <ElFormItem :label="t('dict.item.field.sort')" prop="sort">
              <ElInputNumber
                v-model="form.sort"
                :placeholder="t('dict.item.placeholder.sort')"
                :min="0"
                :max="999"
                :precision="0"
                controls-position="right"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem :label="t('dict.item.field.status')" prop="status">
              <ElRadioGroup v-model="form.status">
                <ElRadio :label="1">{{ t('common.statusEnabled') }}</ElRadio>
                <ElRadio :label="2">{{ t('common.statusDisabled') }}</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElFormItem :label="t('dict.item.field.color')" prop="color">
          <div class="color-picker-wrapper">
            <ElColorPicker v-model="form.color" show-alpha />
            <ElInput
              v-model="form.color"
              :placeholder="t('dict.item.placeholder.color')"
              style="width: 200px; margin-left: 12px"
            />
          </div>
        </ElFormItem>

        <ElFormItem :label="t('dict.item.field.description')" prop="description">
          <ElInput
            v-model="form.description"
            type="textarea"
            :placeholder="t('dict.item.placeholder.description')"
            maxlength="500"
            show-word-limit
            :rows="3"
            resize="none"
          />
        </ElFormItem>
      </ElCard>
    </ElForm>

    <template #footer>
      <div class="drawer-footer">
        <ElButton @click="visible = false">{{ t('common.cancel') }}</ElButton>
        <ElButton type="primary" :loading="saving" @click="handleSave">
          {{ t('common.confirm') }}
        </ElButton>
      </div>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
import type { DictItemReq } from '@/apis/system/dict'
import { useWindowSize } from '@vueuse/core'
import { ElCol, ElForm, ElMessage, ElRow } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { addDictItem, getDictItem, updateDictItem } from '@/apis/system/dict'
import { useResetReactive } from '@/hooks'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { t } = useI18n()
const { width } = useWindowSize()

const itemId = ref('')
const dictId = ref()
const visible = ref(false)
const saving = ref(false)
const isUpdate = computed(() => !!itemId.value)
const title = computed(() =>
  isUpdate.value ? t('dict.item.page.edit') : t('dict.item.page.add')
)
const formRef = useTemplateRef('formRef')

// 表单验证规则
const rules = computed(() => ({
  label: [{ required: true, message: t('dict.item.validate.labelRequired'), trigger: 'blur' }],
  value: [{ required: true, message: t('dict.item.validate.valueRequired'), trigger: 'blur' }],
  sort: [{ required: true, message: t('dict.item.validate.sortRequired'), trigger: 'blur' }]
}))

// 表单数据
const [form, resetForm] = useResetReactive<DictItemReq>({
  label: '',
  value: '',
  sort: 0,
  status: 1,
  color: '',
  description: '',
  dictId: ''
})

// 重置表单
const reset = () => {
  saving.value = false
  resetForm()
  nextTick(() => {
    formRef.value?.resetFields()
  })
}

// 保存
const handleSave = async () => {
  if (saving.value) return

  try {
    const valid = await formRef.value?.validate()
    if (!valid) return

    saving.value = true

    const params = { ...form, dictId: dictId.value }
    if (isUpdate.value) {
      await updateDictItem(params, itemId.value)
      ElMessage.success(t('dict.item.message.updateSuccess'))
    } else {
      await addDictItem(params)
      ElMessage.success(t('dict.item.message.addSuccess'))
    }

    visible.value = false
    emit('save-success')
  } catch (error) {
    console.error('保存字典项失败:', error)
    // ElMessage.error(t('dict.item.message.fetchFailed'))
  } finally {
    saving.value = false
  }
}

// 新增
const onAdd = async (id: string) => {
  reset()
  dictId.value = id
  visible.value = true
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  itemId.value = id
  try {
    const data = await getDictItem(id)
    Object.assign(form, data)
    dictId.value = data.dictId
  } catch (error) {
    console.error('获取字典项详情失败:', error)
    ElMessage.error(t('dict.item.message.fetchFailed'))
  }

  visible.value = true
}

defineExpose({
  onAdd,
  onUpdate
})
</script>

<style scoped lang="scss">
  .form-card {
    margin-bottom: 16px;

    :deep(.el-card__header) {
      padding: 12px 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .card-header {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .drawer-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 16px 0 0;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .color-picker-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
  }
</style>
