<template>
  <ElDrawer
    v-model="visible"
    :title="drawerTitle"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :size="width >= 1350 ? 1350 : '100%'"
    destroy-on-close
    @close="reset"
  >
    <ElTabs v-model="activeTab">
      <ElTabPane :label="t('pages.codeGenerator.config.tabs.gen')" name="gen">
        <CaForm
          ref="formRef"
          v-model="form"
          :columns="formColumns"
          :grid-item-props="{ span: { xs: 24, sm: 24, md: 12 } }"
        />
      </ElTabPane>

      <ElTabPane :label="t('pages.codeGenerator.config.tabs.field')" name="field">
        <div class="field-toolbar">
          <ElPopconfirm
            :title="t('pages.codeGenerator.config.syncConfirm')"
            @confirm="handleSync"
          >
            <template #reference>
              <ElButton
                type="success"
                :disabled="syncDisabled"
                :icon="Refresh"
              >
                {{ t('pages.codeGenerator.config.sync') }}
              </ElButton>
            </template>
          </ElPopconfirm>
        </div>

        <VueDraggable
          v-model="fieldDataList"
          target=".field-table .el-table__body-wrapper tbody"
          handle=".drag-handle"
          :animation="180"
          :disabled="fieldLoading"
          @end="handleFieldSortChange"
        >
          <ElTable
            v-loading="fieldLoading"
            class="field-table"
            row-key="columnName"
            :data="fieldDataList"
            border
            height="64vh"
          >
            <ElTableColumn width="46" align="center">
              <template #default>
                <ElIcon class="drag-handle">
                  <Rank />
                </ElIcon>
              </template>
            </ElTableColumn>

            <ElTableColumn type="index" label="#" width="55" align="center" />

            <ElTableColumn :label="t('pages.codeGenerator.field.name')" min-width="150">
              <template #default="{ row }">
                <ElInput v-model="row.fieldName" />
              </template>
            </ElTableColumn>

            <ElTableColumn :label="t('pages.codeGenerator.field.type')" min-width="140">
              <template #default="{ row }">
                <ElSelect
                  v-model="row.fieldType"
                  :placeholder="t('pages.codeGenerator.config.placeholder.fieldType')"
                  filterable
                  allow-create
                  default-first-option
                >
                  <ElOption
                    v-for="item in fieldTypeOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </ElSelect>
              </template>
            </ElTableColumn>

            <ElTableColumn :label="t('pages.codeGenerator.field.comment')" min-width="180">
              <template #default="{ row }">
                <ElInput v-model="row.comment" />
              </template>
            </ElTableColumn>

            <ElTableColumn :label="t('pages.codeGenerator.field.list')" width="70" align="center">
              <template #default="{ row }">
                <ElCheckbox v-model="row.showInList" />
              </template>
            </ElTableColumn>

            <ElTableColumn :label="t('pages.codeGenerator.field.form')" width="70" align="center">
              <template #default="{ row }">
                <ElCheckbox v-model="row.showInForm" @change="handleShowInFormChange(row)" />
              </template>
            </ElTableColumn>

            <ElTableColumn :label="t('pages.codeGenerator.field.required')" width="70" align="center">
              <template #default="{ row }">
                <ElCheckbox v-model="row.isRequired" :disabled="!row.showInForm" />
              </template>
            </ElTableColumn>

            <ElTableColumn :label="t('pages.codeGenerator.field.query')" width="70" align="center">
              <template #default="{ row }">
                <ElCheckbox v-model="row.showInQuery" @change="handleShowInQueryChange(row)" />
              </template>
            </ElTableColumn>

            <ElTableColumn :label="t('pages.codeGenerator.field.formType')" min-width="160">
              <template #default="{ row }">
                <ElSelect
                  v-if="row.showInForm || row.showInQuery"
                  v-model="row.formType"
                  :placeholder="t('pages.codeGenerator.config.placeholder.formType')"
                  clearable
                >
                  <ElOption
                    v-for="item in form_type_enum"
                    :key="String(item.value)"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
                <span v-else>{{ t('pages.codeGenerator.config.noNeed') }}</span>
              </template>
            </ElTableColumn>

            <ElTableColumn :label="t('pages.codeGenerator.field.queryType')" min-width="160">
              <template #default="{ row }">
                <ElSelect
                  v-if="row.showInQuery"
                  v-model="row.queryType"
                  :placeholder="t('pages.codeGenerator.config.placeholder.queryType')"
                  clearable
                >
                  <ElOption
                    v-for="item in query_type_enum"
                    :key="String(item.value)"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
                <span v-else>{{ t('pages.codeGenerator.config.noNeed') }}</span>
              </template>
            </ElTableColumn>

            <ElTableColumn :label="t('pages.codeGenerator.field.dictCode')" min-width="170">
              <template #default="{ row }">
                <ElSelect
                  v-model="row.dictCode"
                  :placeholder="t('pages.codeGenerator.config.placeholder.dictType')"
                  filterable
                  clearable
                >
                  <ElOption
                    v-for="item in dictList"
                    :key="String(item.value)"
                    :label="item.label"
                    :value="String(item.value)"
                  />
                </ElSelect>
              </template>
            </ElTableColumn>
          </ElTable>
        </VueDraggable>
      </ElTabPane>
    </ElTabs>

    <template #footer>
      <ElSpace>
        <CaButton type="cancel" @click="visible = false" />
        <ElButton type="primary" :loading="saving" @click="handleSave">{{ t('common.save') }}</ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
import type { FieldConfigResp, GenConfigResp } from '@/apis/code'
import type { FormColumnItem } from '@/components/base/CaForm/type'
import type { LabelValueState } from '@/types/global'
import { Rank, Refresh } from '@element-plus/icons-vue'
import { useWindowSize } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import { VueDraggable } from 'vue-draggable-plus'
import { useI18n } from 'vue-i18n'
import {
  getGenConfig,
  listFieldConfig,
  listFieldConfigDict,
  saveGenConfig
} from '@/apis/code/generator'
import CaButton from '@/components/base/CaButton/index.vue'
import CaForm from '@/components/base/CaForm/index.vue'
import { useDict } from '@/hooks'

defineOptions({ name: 'CodeGeneratorConfigDrawer' })

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()
const { t } = useI18n()
const { form_type_enum, query_type_enum } = useDict('form_type_enum', 'query_type_enum')

const visible = ref(false)
const saving = ref(false)
const fieldLoading = ref(false)
const activeTab = ref<'gen' | 'field'>('gen')
const formRef = ref<InstanceType<typeof CaForm>>()
const currentTableName = ref('')
const currentComment = ref('')

const dictList = ref<LabelValueState[]>([])
const fieldDataList = ref<FieldConfigResp[]>([])

const createDefaultForm = (): GenConfigResp => ({
  tableName: '',
  comment: '',
  moduleName: '',
  packageName: '',
  businessName: '',
  author: '',
  tablePrefix: '',
  isOverride: false,
  classNamePrefix: ''
})

const form = ref<GenConfigResp>(createDefaultForm())

const fieldTypeOptions = [
  'String',
  'Integer',
  'Long',
  'Float',
  'Double',
  'Boolean',
  'BigDecimal',
  'LocalDate',
  'LocalTime',
  'LocalDateTime'
]

const formColumns = computed(
  () =>
    [
      {
        type: 'input',
        label: t('pages.codeGenerator.field.author'),
        field: 'author',
        rules: [
          {
            required: true,
            message: t('common.placeholder.inputWithLabel', { label: t('pages.codeGenerator.field.author') }),
            trigger: 'blur'
          }
        ],
        props: { maxlength: 100, clearable: true }
      },
      {
        type: 'input',
        label: t('pages.codeGenerator.field.businessName'),
        field: 'businessName',
        rules: [
          {
            required: true,
            message: t('common.placeholder.inputWithLabel', { label: t('pages.codeGenerator.field.businessName') }),
            trigger: 'blur'
          }
        ],
        props: { placeholder: t('pages.codeGenerator.config.placeholder.businessName'), maxlength: 50, clearable: true }
      },
      {
        type: 'input',
        label: t('pages.codeGenerator.field.moduleName'),
        field: 'moduleName',
        rules: [
          {
            required: true,
            message: t('common.placeholder.inputWithLabel', { label: t('pages.codeGenerator.field.moduleName') }),
            trigger: 'blur'
          }
        ],
        props: { placeholder: t('pages.codeGenerator.config.placeholder.moduleName'), maxlength: 60, clearable: true }
      },
      {
        type: 'input',
        label: t('pages.codeGenerator.field.packageName'),
        field: 'packageName',
        rules: [
          {
            required: true,
            message: t('common.placeholder.inputWithLabel', { label: t('pages.codeGenerator.field.packageName') }),
            trigger: 'blur'
          }
        ],
        props: {
          placeholder: t('pages.codeGenerator.config.placeholder.packageName'),
          maxlength: 60,
          clearable: true
        }
      },
      {
        type: 'input',
        label: t('pages.codeGenerator.field.tablePrefix'),
        field: 'tablePrefix',
        props: { placeholder: t('pages.codeGenerator.config.placeholder.tablePrefix'), maxlength: 20, clearable: true }
      },
      {
        type: 'switch',
        label: t('pages.codeGenerator.field.isOverride'),
        field: 'isOverride',
        props: {
          activeValue: true,
          inactiveValue: false,
          activeText: t('common.true'),
          inactiveText: t('common.false')
        }
      }
    ] as FormColumnItem<GenConfigResp>[]
)

const drawerTitle = computed(() => {
  const comment = currentComment.value ? `（${currentComment.value}）` : ''
  return t('pages.codeGenerator.config.drawerTitle', {
    tableName: currentTableName.value,
    comment
  })
})

const syncDisabled = computed(() => {
  return fieldDataList.value.length > 0 && !fieldDataList.value[0].createTime
})

const fetchFieldList = async (tableName: string, requireSync: boolean) => {
  try {
    fieldLoading.value = true
    const data = await listFieldConfig(tableName, requireSync)
    fieldDataList.value = data || []
  } finally {
    fieldLoading.value = false
  }
}

const fetchDictList = async () => {
  const data = await listFieldConfigDict()
  dictList.value = data || []
}

const reset = () => {
  formRef.value?.formRef?.resetFields()
  form.value = createDefaultForm()
  activeTab.value = 'gen'
  currentTableName.value = ''
  currentComment.value = ''
  fieldDataList.value = []
}

const handleShowInFormChange = (row: FieldConfigResp) => {
  if (!row.showInForm) {
    row.isRequired = false
    if (!row.showInQuery) {
      row.formType = ''
    }
  }
}

const handleShowInQueryChange = (row: FieldConfigResp) => {
  if (!row.showInQuery) {
    row.queryType = ''
    if (!row.showInForm) {
      row.formType = ''
    }
  }
}

const handleSync = async () => {
  if (!currentTableName.value) return
  await fetchFieldList(currentTableName.value, true)
}

const syncFieldSort = () => {
  fieldDataList.value.forEach((item, index) => {
    item.fieldSort = index + 1
  })
}

const handleFieldSortChange = () => {
  syncFieldSort()
}

const handleSave = async () => {
  try {
    await formRef.value?.formRef?.validate()
  } catch {
    activeTab.value = 'gen'
    return
  }

  if (fieldDataList.value.some((item) => !item.fieldType)) {
    activeTab.value = 'field'
    ElMessage.warning(t('pages.codeGenerator.config.fieldTypeRequired'))
    return
  }

  try {
    saving.value = true
    syncFieldSort()
    await saveGenConfig(form.value.tableName, {
      genConfig: { ...form.value },
      fieldConfigs: fieldDataList.value
    })
    ElMessage.success(t('common.successSave'))
    visible.value = false
    emit('save-success')
  } finally {
    saving.value = false
  }
}

const onOpen = async (tableName: string, comment: string) => {
  reset()
  currentTableName.value = tableName
  currentComment.value = comment || ''
  const [config] = await Promise.all([getGenConfig(tableName), fetchFieldList(tableName, false), fetchDictList()])
  form.value = {
    ...createDefaultForm(),
    ...config,
    isOverride: config.isOverride ?? false
  }
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss">
  .field-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
  }

  .drag-handle {
    color: var(--el-text-color-secondary);
    cursor: move;
  }
</style>
