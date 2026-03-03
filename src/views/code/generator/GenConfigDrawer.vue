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
      <ElTabPane label="生成配置" name="gen">
        <CaForm
          ref="formRef"
          v-model="form"
          :columns="formColumns"
          :grid-item-props="{ span: { xs: 24, sm: 24, md: 12 } }"
        />
      </ElTabPane>

      <ElTabPane label="字段配置" name="field">
        <div class="field-toolbar">
          <ElPopconfirm
            title="是否确定同步最新数据表结构？同步后只要不点击保存，则不影响原有配置数据。"
            @confirm="handleSync"
          >
            <template #reference>
              <ElButton
                type="success"
                :disabled="syncDisabled"
                :icon="Refresh"
              >
                同步
              </ElButton>
            </template>
          </ElPopconfirm>
        </div>

        <ElTable
          v-loading="fieldLoading"
          row-key="columnName"
          :data="fieldDataList"
          border
          height="64vh"
        >
          <ElTableColumn type="index" label="#" width="55" align="center" />

          <ElTableColumn label="名称" min-width="150">
            <template #default="{ row }">
              <ElInput v-model="row.fieldName" />
            </template>
          </ElTableColumn>

          <ElTableColumn label="类型" min-width="140">
            <template #default="{ row }">
              <ElSelect
                v-model="row.fieldType"
                placeholder="请选择字段类型"
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

          <ElTableColumn label="描述" min-width="180">
            <template #default="{ row }">
              <ElInput v-model="row.comment" />
            </template>
          </ElTableColumn>

          <ElTableColumn label="列表" width="70" align="center">
            <template #default="{ row }">
              <ElCheckbox v-model="row.showInList" />
            </template>
          </ElTableColumn>

          <ElTableColumn label="表单" width="70" align="center">
            <template #default="{ row }">
              <ElCheckbox v-model="row.showInForm" @change="handleShowInFormChange(row)" />
            </template>
          </ElTableColumn>

          <ElTableColumn label="必填" width="70" align="center">
            <template #default="{ row }">
              <ElCheckbox v-model="row.isRequired" :disabled="!row.showInForm" />
            </template>
          </ElTableColumn>

          <ElTableColumn label="查询" width="70" align="center">
            <template #default="{ row }">
              <ElCheckbox v-model="row.showInQuery" @change="handleShowInQueryChange(row)" />
            </template>
          </ElTableColumn>

          <ElTableColumn label="表单类型" min-width="160">
            <template #default="{ row }">
              <ElSelect
                v-if="row.showInForm || row.showInQuery"
                v-model="row.formType"
                placeholder="请选择表单类型"
                clearable
              >
                <ElOption
                  v-for="item in form_type_enum"
                  :key="String(item.value)"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
              <span v-else>无需设置</span>
            </template>
          </ElTableColumn>

          <ElTableColumn label="查询方式" min-width="160">
            <template #default="{ row }">
              <ElSelect
                v-if="row.showInQuery"
                v-model="row.queryType"
                placeholder="请选择查询方式"
                clearable
              >
                <ElOption
                  v-for="item in query_type_enum"
                  :key="String(item.value)"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
              <span v-else>无需设置</span>
            </template>
          </ElTableColumn>

          <ElTableColumn label="关联字典" min-width="170">
            <template #default="{ row }">
              <ElSelect
                v-model="row.dictCode"
                placeholder="请选择字典类型"
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
      </ElTabPane>
    </ElTabs>

    <template #footer>
      <ElSpace>
        <CaButton type="cancel" @click="visible = false" />
        <ElButton type="primary" :loading="saving" @click="handleSave">保存</ElButton>
      </ElSpace>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
import type { FieldConfigResp, GenConfigResp } from '@/apis/code'
import type { FormColumnItem } from '@/components/base/CaForm/type'
import type { LabelValueState } from '@/types/global'
import { Refresh } from '@element-plus/icons-vue'
import { useWindowSize } from '@vueuse/core'
import { ElMessage } from 'element-plus'
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
        label: '作者名称',
        field: 'author',
        rules: [{ required: true, message: '请输入作者名称', trigger: 'blur' }],
        props: { maxlength: 100, clearable: true }
      },
      {
        type: 'input',
        label: '业务名称',
        field: 'businessName',
        rules: [{ required: true, message: '请输入业务名称', trigger: 'blur' }],
        props: { placeholder: '自定义业务名称，例如：用户', maxlength: 50, clearable: true }
      },
      {
        type: 'input',
        label: '所属模块',
        field: 'moduleName',
        rules: [{ required: true, message: '请输入所属模块', trigger: 'blur' }],
        props: { placeholder: '项目模块名称，例如：continew-system', maxlength: 60, clearable: true }
      },
      {
        type: 'input',
        label: '模块包名',
        field: 'packageName',
        rules: [{ required: true, message: '请输入模块包名', trigger: 'blur' }],
        props: {
          placeholder: '项目模块包名，例如：top.continew.admin.system',
          maxlength: 60,
          clearable: true
        }
      },
      {
        type: 'input',
        label: '去表前缀',
        field: 'tablePrefix',
        props: { placeholder: '数据库表前缀，例如：sys_', maxlength: 20, clearable: true }
      },
      {
        type: 'switch',
        label: '是否覆盖',
        field: 'isOverride',
        props: {
          activeValue: true,
          inactiveValue: false,
          activeText: '是',
          inactiveText: '否'
        }
      }
    ] as FormColumnItem<GenConfigResp>[]
)

const drawerTitle = computed(() => {
  const comment = currentComment.value ? `（${currentComment.value}）` : ''
  return `${currentTableName.value}${comment}配置`
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

const handleSave = async () => {
  try {
    await formRef.value?.formRef?.validate()
  } catch {
    activeTab.value = 'gen'
    return
  }

  if (fieldDataList.value.some((item) => !item.fieldType)) {
    activeTab.value = 'field'
    ElMessage.warning('字段类型不能为空')
    return
  }

  try {
    saving.value = true
    await saveGenConfig(form.value.tableName, {
      genConfig: { ...form.value },
      fieldConfigs: fieldDataList.value
    })
    ElMessage.success('保存成功')
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
</style>
