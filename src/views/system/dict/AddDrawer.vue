<template>
  <ElDrawer
    v-model="visible"
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :size="width >= 500 ? 500 : '100%'"
    @close="reset"
  >
    <CaForm
      ref="formRef"
      v-model="form"
      :columns="columns"
      :fc="fc"
      :grid-item-props="{ span: 100 }"
    />

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

<script setup lang="tsx">
  import { addDict, DictReq, getDict, updateDict } from '@/apis/system/dict'
  import CaForm from '@/components/base/CaForm/index.vue'
  import { FormColumnItem } from '@/components/base/CaForm/type'
  import { useResetReactive } from '@/hooks'
  import { useWindowSize } from '@vueuse/core'
  import { ElButton, ElDrawer, ElMessage, ElTooltip } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()

  const { t } = useI18n()
  const { width } = useWindowSize()

  const dataId = ref('')
  const visible = ref(false)
  const saving = ref(false)
  const isUpdate = computed(() => !!dataId.value)
  const title = computed(() => (isUpdate.value ? t('dict.page.edit') : t('dict.page.add')))
  const formRef = useTemplateRef('formRef')

  // 表单控制
  const fc = computed(() => ({
    code: { disabled: isUpdate.value }
  }))

  // 表单字段配置
  const columns = computed(
    () =>
      [
        {
          type: 'input',
          label: t('dict.field.name'),
          field: 'name',
          props: {
            placeholder: t('dict.placeholder.name'),
            maxlength: 30,
            showWordLimit: true
          },
          rules: [{ required: true, message: t('dict.validate.nameRequired'), trigger: 'blur' }]
        },
        {
          type: 'input',
          labelRender: () => (
            <ElTooltip content={t('dict.form.codeTip')} placement="top">
              {t('dict.field.code')}
            </ElTooltip>
          ),
          field: 'code',
          props: {
            placeholder: t('dict.placeholder.code'),
            maxlength: 30,
            showWordLimit: true
          },
          rules: [
            { required: true, message: t('dict.validate.codeRequired'), trigger: 'blur' },
            {
              pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
              message: t('dict.validate.codeFormat'),
              trigger: 'blur'
            }
          ]
        },
        {
          type: 'textarea',
          label: t('dict.field.description'),
          field: 'description',
          props: {
            placeholder: t('dict.placeholder.description'),
            maxlength: 500,
            showWordLimit: true,
            rows: 3,
            resize: 'none'
          }
        }
      ] as FormColumnItem[]
  )

  // 表单数据
  const [form, resetForm] = useResetReactive<DictReq>({
    name: '',
    code: '',
    description: ''
  })

  // 重置表单
  const reset = () => {
    saving.value = false
    resetForm()
  }

  // 保存
  const handleSave = async () => {
    if (saving.value) return

    try {
      const valid = await formRef.value?.formRef?.validate()
      if (!valid) return

      saving.value = true

      if (isUpdate.value) {
        await updateDict(form, dataId.value)
        ElMessage.success(t('dict.message.updateSuccess'))
      } else {
        await addDict(form)
        ElMessage.success(t('dict.message.addSuccess'))
      }

      visible.value = false
      emit('save-success')
    } catch (error) {
      console.error('保存字典失败:', error)
      // ElMessage.error(t('dict.message.fetchFailed'))
    } finally {
      saving.value = false
    }
  }

  // 新增
  const onAdd = async () => {
    reset()
    dataId.value = ''
    visible.value = true
  }

  // 修改
  const onUpdate = async (id: string) => {
    reset()
    dataId.value = id
    try {
      const data = await getDict(id)
      Object.assign(form, data)
    } catch (error) {
      console.error('获取字典详情失败:', error)
      ElMessage.error(t('dict.message.fetchFailed'))
    }

    visible.value = true
  }

  defineExpose({
    onAdd,
    onUpdate
  })
</script>

<style scoped lang="scss">
  .drawer-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 16px 0 0;
    border-top: 1px solid var(--el-border-color-lighter);
  }
</style>
