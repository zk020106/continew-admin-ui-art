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
            <span>{{ t('role.form.basicInfo') }}</span>
          </div>
        </template>

        <ElRow :gutter="16">
          <ElCol :span="24">
            <ElFormItem :label="t('role.form.name')" prop="name">
              <ElInput
                v-model="form.name"
                :placeholder="t('role.placeholder.name')"
                maxlength="30"
                show-word-limit
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem :label="t('role.form.code')" prop="code">
              <ElInput
                v-model="form.code"
                :placeholder="t('role.placeholder.code')"
                maxlength="30"
                show-word-limit
                :disabled="isUpdate"
              />
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="16">
          <ElCol :span="24">
            <ElFormItem :label="t('role.form.sort')" prop="sort">
              <ElInputNumber
                v-model="form.sort"
                :placeholder="t('role.placeholder.sort')"
                :min="0"
                :max="999"
                :precision="0"
                controls-position="right"
                style="width: 100%"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem :label="t('role.form.status')" prop="status">
              <ElRadioGroup v-model="form.status">
                <ElRadio :label="1">{{ t('common.statusEnabled') }}</ElRadio>
                <ElRadio :label="0">{{ t('common.statusDisabled') }}</ElRadio>
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElFormItem :label="t('role.form.remark')" prop="remark">
          <ElInput
            v-model="form.remark"
            type="textarea"
            :placeholder="t('role.placeholder.remark')"
            maxlength="500"
            show-word-limit
            :rows="3"
            resize="none"
          />
        </ElFormItem>
      </ElCard>

      <!-- 数据权限 -->
      <ElCard class="form-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>{{ t('role.form.dataPermission') }}</span>
          </div>
        </template>

        <ElFormItem :label="t('role.dataScope')" prop="dataScope">
          <ElSelect
            v-model="form.dataScope"
            :placeholder="t('role.placeholder.dataScope')"
            :disabled="form.isSystem"
            style="width: 100%"
          >
            <ElOption :label="t('role.dataScopeOption.all')" :value="1" />
            <ElOption :label="t('role.dataScopeOption.custom')" :value="2" />
            <ElOption :label="t('role.dataScopeOption.dept')" :value="3" />
            <ElOption :label="t('role.dataScopeOption.deptAndBelow')" :value="4" />
            <ElOption :label="t('role.dataScopeOption.onlySelf')" :value="5" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem v-if="form.dataScope === 2" :label="t('role.deptPermission')">
          <div class="dept-tree-container">
            <div class="dept-tree-actions">
              <ElButton-group>
                <ElButton
                  :type="isDeptExpanded ? 'primary' : 'default'"
                  size="small"
                  @click="handleDeptExpand(true)"
                >
                  {{ t('role.expandCollapse') }}
                </ElButton>
                <ElButton
                  :type="form.deptCheckStrictly ? 'primary' : 'default'"
                  size="small"
                  @click="form.deptCheckStrictly = !form.deptCheckStrictly"
                >
                  {{ t('role.deptCheckStrictly') }}
                </ElButton>
              </ElButton-group>
            </div>

            <ElTree
              ref="deptTreeRef"
              :data="deptList"
              node-key="key"
              :check-strictly="!form.deptCheckStrictly"
              :tree-props="{
                label: 'title',
                children: 'children'
              }"
              :default-expand-all="isDeptExpanded"
              highlight-current
              show-checkbox
            >
              <template #default="{ data }">
                <span>{{ data.title }}</span>
              </template>
            </ElTree>
          </div>
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
  import { addRole, getRole, updateRole } from '@/apis/system/role'
  import { useResetReactive } from '@/hooks'
  import { useDept } from '@/hooks/business'
  import { useWindowSize } from '@vueuse/core'
  import { ElForm, ElMessage } from 'element-plus'
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
  const title = computed(() =>
    isUpdate.value ? t('role.page.title.edit') : t('role.page.title.add')
  )
  const formRef = useTemplateRef('formRef')
  const { deptList, getDeptList } = useDept()

  // 表单验证规则
  const rules = computed(() => ({
    name: [{ required: true, message: t('role.validate.nameRequired'), trigger: 'blur' }],
    code: [
      { required: true, message: t('role.validate.codeRequired'), trigger: 'blur' },
      {
        pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
        message: '角色编码必须以字母开头，只能包含字母、数字和下划线',
        trigger: 'blur'
      }
    ],
    dataScope: [
      { required: true, message: t('role.validate.dataScopeRequired'), trigger: 'change' }
    ]
  }))

  // 表单数据
  const [form, resetForm] = useResetReactive({
    name: '',
    code: '',
    sort: 0,
    status: 1,
    remark: '',
    dataScope: 4,
    deptCheckStrictly: true,
    isSystem: false
  })

  const deptTreeRef = ref()
  const isDeptExpanded = ref(true)

  // 重置表单
  const reset = () => {
    saving.value = false
    resetForm()
    nextTick(() => {
      formRef.value?.resetFields()
      deptTreeRef.value?.setCheckedKeys([])
      // 重置后展开树
      handleDeptExpand(true)
    })
  }

  // 展开/折叠部门树
  const handleDeptExpand = (expanded: boolean) => {
    isDeptExpanded.value = expanded
    const allKeys = getAllDeptKeys(deptList.value)
    if (expanded) {
      allKeys.forEach((key) => {
        deptTreeRef.value?.store.nodesMap[key]?.expand()
      })
    } else {
      allKeys.forEach((key) => {
        deptTreeRef.value?.store.nodesMap[key]?.collapse()
      })
    }
  }

  // 获取所有部门ID
  const getAllDeptKeys = (depts: any[]): string[] => {
    const keys: string[] = []
    depts.forEach((dept) => {
      keys.push(dept.key)
      if (dept.children && dept.children.length > 0) {
        keys.push(...getAllDeptKeys(dept.children))
      }
    })
    return keys
  }

  // 获取选中的部门
  const getCheckedDeptKeys = (): string[] => {
    if (!deptTreeRef.value) return []

    const checkedKeys = deptTreeRef.value.getCheckedKeys() as string[]
    const halfCheckedKeys = deptTreeRef.value.getHalfCheckedKeys() as string[]
    return [...checkedKeys, ...halfCheckedKeys]
  }

  // 保存
  const handleSave = async () => {
    if (saving.value) return

    try {
      const valid = await formRef.value?.validate()
      if (!valid) return

      saving.value = true

      const params = { ...form }
      if (form.dataScope === 2) {
        params.deptIds = getCheckedDeptKeys()
      }

      if (isUpdate.value) {
        await updateRole(params, dataId.value)
        ElMessage.success(t('role.message.updateSuccess'))
      } else {
        await addRole(params)
        ElMessage.success(t('role.message.addSuccess'))
      }

      visible.value = false
      emit('save-success')
    } catch (error) {
      console.error('保存角色失败:', error)
      ElMessage.error(t('role.message.saveFailed'))
    } finally {
      saving.value = false
    }
  }

  // 新增
  const onAdd = async () => {
    reset()
    if (deptList.value.length === 0) {
      await getDeptList()
    }
    dataId.value = ''
    visible.value = true
  }

  // 修改
  const onUpdate = async (id: string) => {
    reset()
    if (deptList.value.length === 0) {
      await getDeptList()
    }

    dataId.value = id
    console.log('dataId', dataId.value)
    try {
      const data = await getRole(id)
      Object.assign(form, data)

      // 如果有部门权限，设置选中的部门
      if (data.deptIds && data.deptIds.length > 0) {
        nextTick(() => {
          deptTreeRef.value?.setCheckedKeys(data.deptIds)
        })
      }
    } catch (error) {
      console.error('获取角色详情失败:', error)
      ElMessage.error(t('role.message.fetchRoleFailed'))
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

  .dept-tree-container {
    width: 100%;
    padding: 12px;
    background-color: var(--el-fill-color-extra-light);
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);

    &-actions {
      padding-bottom: 12px;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
  }
</style>
