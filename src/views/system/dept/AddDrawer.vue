<template>
  <ElDrawer v-model="visible" :title="drawerTitle" :size="500" @close="handleClose">
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="dept-form"
      @submit.prevent="handleSubmit"
    >
      <!-- 基础信息 -->
      <ElDivider content-position="left">{{ t('dept.form.basicInfo') }}</ElDivider>

      <ElFormItem :label="t('dept.field.parentId')" prop="parentId">
        <ElTreeSelect
          ref="treeSelectRef"
          v-model="form.parentId"
          :data="deptTreeSelectData"
          :props="{ label: 'name', value: 'id', children: 'children' }"
          :placeholder="t('dept.placeholder.parentId')"
          clearable
          check-strictly
          filterable
          :filter-node-method="filterDeptNode"
        />
      </ElFormItem>

      <ElFormItem :label="t('dept.field.name')" prop="name">
        <ElInput
          v-model="form.name"
          :placeholder="t('dept.placeholder.name')"
          clearable
          :maxlength="30"
          show-word-limit
        />
      </ElFormItem>

      <ElFormItem :label="t('dept.field.sort')" prop="sort">
        <ElInputNumber v-model="form.sort" :min="0" :max="9999" controls-position="right" />
      </ElFormItem>

      <ElFormItem :label="t('dept.field.status')" prop="status">
        <ElRadioGroup size="small" v-model="form.status">
          <ElRadioButton :label="1">{{ t('common.statusEnabled') }}</ElRadioButton>
          <ElRadioButton :label="2">{{ t('common.statusDisabled') }}</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem :label="t('dept.field.description')" prop="description">
        <ElInput
          v-model="form.description"
          type="textarea"
          :placeholder="t('dept.placeholder.description')"
          :rows="3"
          :maxlength="200"
          show-word-limit
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="handleClose">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">
        {{ t('common.confirm') }}
      </ElButton>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { addDept, getDept, listDept, updateDept, type DeptResp } from '@/apis/system/dept'
  import { ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'DeptAddDrawer' })

  const emit = defineEmits<{
    'save-success': []
  }>()

  const { t } = useI18n()
  const formRef = ref()
  const treeSelectRef = ref()
  const visible = ref(false)
  const submitLoading = ref(false)
  const mode = ref<'add' | 'edit' | 'addChild'>('add')
  const deptId = ref('')
  const parentDeptName = ref('')

  // 部门树数据（用于选择父部门）
  const deptTreeData = ref<DeptResp[]>([])

  const form = reactive({
    parentId: '',
    name: '',
    sort: 0,
    status: 1 as 1 | 2,
    description: ''
  })

  // 过滤后的部门树（排除当前编辑的部门及其子部门）
  const deptTreeSelectData = computed(() => {
    if (mode.value === 'edit' && deptId.value) {
      // 编辑模式下，排除当前部门及其子部门
      const excludeIds = new Set<string>()
      const collectIds = (data: DeptResp[], targetId: string): boolean => {
        for (const item of data) {
          if (item.id === targetId) {
            excludeIds.add(item.id)
            if (item.children) {
              item.children.forEach((child) => excludeIds.add(child.id))
            }
            return true
          }
          if (item.children && collectIds(item.children, targetId)) {
            return true
          }
        }
        return false
      }
      collectIds(deptTreeData.value, deptId.value)

      const filterTree = (data: DeptResp[]): DeptResp[] => {
        return data
          .filter((item) => !excludeIds.has(item.id))
          .map((item) => ({
            ...item,
            children: item.children ? filterTree(item.children) : []
          }))
      }
      return filterTree(deptTreeData.value)
    }
    return deptTreeData.value
  })

  // 树节点过滤方法
  const filterDeptNode = (value: string, data: DeptResp) => {
    if (!value) return true
    const name = data.name || ''
    return name.toLowerCase().includes(value.toLowerCase())
  }

  // 验证规则
  const rules = computed(() => ({
    name: [{ required: true, message: t('dept.validate.nameRequired'), trigger: 'blur' }],
    sort: [{ required: true, message: t('dept.validate.sortRequired'), trigger: 'blur' }]
  }))

  const drawerTitle = computed(() => {
    if (mode.value === 'addChild') {
      return `${t('dept.button.addChild')} - ${parentDeptName.value}`
    }
    return mode.value === 'add' ? t('dept.page.add') : t('dept.page.edit')
  })

  // 获取部门树
  const getDeptTree = async () => {
    try {
      const data = await listDept({})
      deptTreeData.value = data
    } catch (error) {
      console.error('获取部门树失败:', error)
    }
  }

  // 重置表单
  const resetForm = () => {
    Object.assign(form, {
      parentId: '',
      name: '',
      sort: 0,
      status: 1,
      description: ''
    })
    formRef.value?.clearValidate()
  }

  // 打开抽屉（新增）
  const onAdd = async () => {
    mode.value = 'add'
    await getDeptTree()
    resetForm()
    visible.value = true
  }

  // 打开抽屉（新增子部门）
  const onAddChild = async (parentId: string, parentName: string) => {
    mode.value = 'addChild'
    parentDeptName.value = parentName
    await getDeptTree()
    resetForm()
    form.parentId = parentId
    visible.value = true
  }

  // 打开抽屉（编辑）
  const onUpdate = async (id: string) => {
    mode.value = 'edit'
    deptId.value = id
    await getDeptTree()

    try {
      const data = await getDept(id)
      Object.assign(form, {
        parentId: data.parentId || '',
        name: data.name,
        sort: data.sort,
        status: data.status,
        description: data.description || ''
      })
      // 清除验证状态
      nextTick(() => {
        formRef.value?.clearValidate()
      })
      visible.value = true
    } catch (error) {
      console.error('获取部门详情失败:', error)
      ElMessage.error(t('dept.message.fetchFailed'))
    }
  }

  // 关闭抽屉
  const handleClose = () => {
    visible.value = false
    resetForm()
  }

  // 提交表单
  const handleSubmit = async () => {
    await formRef.value?.validate()

    submitLoading.value = true
    try {
      const data = { ...form }
      if (mode.value === 'edit') {
        await updateDept(data, deptId.value)
        ElMessage.success(t('dept.message.updateSuccess'))
      } else {
        await addDept(data)
        ElMessage.success(t('dept.message.addSuccess'))
      }
      emit('save-success')
      handleClose()
    } catch (error: any) {
      console.error('保存部门失败:', error)
      if (error.msg) {
        ElMessage.error(error.msg)
      }
    } finally {
      submitLoading.value = false
    }
  }

  defineExpose({
    onAdd,
    onAddChild,
    onUpdate
  })
</script>

<style scoped lang="scss">
  :deep(.el-divider__text) {
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  :deep(.el-input-number) {
    width: 100%;
  }

  .dept-form {
    :deep(.el-form-item) {
      margin-bottom: 18px;
    }
  }
</style>
