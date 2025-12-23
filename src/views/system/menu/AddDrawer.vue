<template>
  <ElDrawer v-model="visible" :title="drawerTitle" :size="700" @close="handleClose">
    <ElForm
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="menu-form"
      @submit.prevent="handleSubmit"
    >
      <!-- 基础信息 -->
      <ElDivider content-position="left">{{ t('menu.form.basicInfo') }}</ElDivider>

      <ElFormItem :label="t('menu.field.type')" prop="type">
        <ElRadioGroup v-model="form.type" @change="handleTypeChange">
          <ElRadioButton :label="1">{{ t('menu.type.directory') }}</ElRadioButton>
          <ElRadioButton :label="2">{{ t('menu.type.menu') }}</ElRadioButton>
          <ElRadioButton :label="3">{{ t('menu.type.button') }}</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>

      <ElFormItem :label="t('menu.field.parentId')" prop="parentId">
        <ElTreeSelect
          ref="treeSelectRef"
          v-model="form.parentId"
          :data="menuTreeSelectData"
          :props="{ label: 'title', value: 'id', children: 'children' }"
          :placeholder="t('menu.placeholder.parentId')"
          clearable
          check-strictly
          filterable
          :filter-node-method="filterMenuNode"
        />
      </ElFormItem>

      <ElRow :gutter="16">
        <ElCol :span="form.type === 3 ? 12 : 24">
          <ElFormItem :label="t('menu.field.title')" prop="title">
            <ElInput
              v-model="form.title"
              :placeholder="t('menu.placeholder.title')"
              clearable
              :maxlength="30"
              show-word-limit
            />
          </ElFormItem>
        </ElCol>
        <ElCol v-if="form.type === 3" :span="12">
          <ElFormItem :label="t('menu.field.permission')" prop="permission">
            <ElInput
              v-model="form.permission"
              :placeholder="t('menu.placeholder.permission')"
              clearable
              :maxlength="100"
              show-word-limit
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow v-if="[1, 2].includes(form.type)" :gutter="16">
        <ElCol :span="12">
          <ElFormItem :label="t('menu.field.icon')" prop="icon">
            <ElInput v-model="form.icon" :placeholder="t('menu.placeholder.icon')" clearable>
              <template #prefix>
                <ArtSvgIcon v-if="form.icon" :icon="form.icon" />
              </template>
            </ElInput>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem :label="t('menu.field.sort')" prop="sort">
            <ElInputNumber v-model="form.sort" :min="0" :max="9999" controls-position="right" />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem v-if="form.type !== 3" :label="t('menu.field.path')" prop="path">
        <ElInput
          v-model="form.path"
          :placeholder="t('menu.placeholder.path')"
          clearable
          @input="handlePathInput"
        >
        </ElInput>
      </ElFormItem>

      <ElFormItem
        v-if="form.type === 2 && !form.isExternal"
        :label="t('menu.field.component')"
        prop="component"
      >
        <div class="component-input-wrapper">
          <span class="input-prefix">/</span>
          <ElAutocomplete
            v-model="form.component"
            :fetch-suggestions="fetchComponentSuggestions"
            :placeholder="t('menu.placeholder.component')"
            clearable
            style="width: 100%"
            @select="handleComponentSelect"
          >
            <template #default="{ item }">
              <div class="component-suggestion">
                <span class="value">{{ item.value }}</span>
                <span class="label">{{ item.label }}</span>
              </div>
            </template>
          </ElAutocomplete>
        </div>
      </ElFormItem>

      <ElFormItem
        v-if="form.type === 2 && form.isExternal"
        :label="t('menu.field.component')"
        prop="component"
      >
        <ElInput v-model="form.component" :placeholder="t('menu.placeholder.component')" clearable>
          <template #prepend>iframe</template>
        </ElInput>
      </ElFormItem>

      <ElRow v-if="[1, 2].includes(form.type)" :gutter="16">
        <ElCol :span="12">
          <ElFormItem :label="t('menu.field.componentName')" prop="name">
            <ElInput
              v-model="form.name"
              :placeholder="t('menu.placeholder.componentName')"
              clearable
              :maxlength="50"
              show-word-limit
            />
            <div v-if="suggestedComponentName" class="name-suggestion">
              <span class="suggestion-label">{{ t('menu.suggestion.componentName') }}:</span>
              <ElTag
                type="primary"
                class="suggestion-tag"
                @click="applySuggestedName"
                style="cursor: pointer"
              >
                {{ suggestedComponentName }}
              </ElTag>
            </div>
          </ElFormItem>
        </ElCol>
        <ElCol v-if="form.type === 2" :span="12">
          <ElFormItem :label="t('menu.field.permission')" prop="permission">
            <ElInput
              v-model="form.permission"
              :placeholder="t('menu.placeholder.permission')"
              clearable
              :maxlength="100"
              show-word-limit
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem
        v-if="[1, 2].includes(form.type) && !form.isExternal"
        :label="t('menu.field.redirect')"
        prop="redirect"
      >
        <ElInput v-model="form.redirect" :placeholder="t('menu.placeholder.redirect')" clearable>
        </ElInput>
      </ElFormItem>

      <ElFormItem v-if="[1, 2].includes(form.type)" :label="t('menu.field.status')" prop="status">
        <ElRadioGroup size="small" v-model="form.status">
          <ElRadioButton :label="1">{{ t('common.statusEnabled') }}</ElRadioButton>
          <ElRadioButton :label="2">{{ t('common.statusDisabled') }}</ElRadioButton>
        </ElRadioGroup>
      </ElFormItem>

      <!-- 路由配置 -->
      <ElDivider v-if="[1, 2].includes(form.type)" content-position="left">
        {{ t('menu.form.routeConfig') }}
      </ElDivider>

      <ElRow v-if="[1, 2].includes(form.type)" :gutter="16">
        <ElCol :span="8">
          <ElFormItem :label="t('menu.field.isExternal')" prop="isExternal">
            <ElRadioGroup size="small" v-model="form.isExternal">
              <ElRadioButton :label="true">{{ t('common.true') }}</ElRadioButton>
              <ElRadioButton :label="false">{{ t('common.false') }}</ElRadioButton>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem :label="t('menu.field.isCache')" prop="isCache">
            <ElRadioGroup size="small" v-model="form.isCache">
              <ElRadioButton :label="true">{{ t('common.true') }}</ElRadioButton>
              <ElRadioButton :label="false">{{ t('common.false') }}</ElRadioButton>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
        <ElCol :span="8">
          <ElFormItem :label="t('menu.field.isHidden')" prop="isHidden">
            <ElRadioGroup size="small" v-model="form.isHidden">
              <ElRadioButton :label="true">{{ t('common.true') }}</ElRadioButton>
              <ElRadioButton :label="false">{{ t('common.false') }}</ElRadioButton>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
      </ElRow>
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
  import { addMenu, getMenu, listMenu, type MenuResp, updateMenu } from '@/apis/system/menu'
  import { useComponentPaths } from '@/hooks/core/useComponentPaths'
  import { transformPathToName } from '@/utils/route/string'
  import type { AutocompleteFetchSuggestionsCallback } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'MenuAddDrawer' })

  const emit = defineEmits<{
    'save-success': []
  }>()

  const { t } = useI18n()
  const { componentPathPrefixes } = useComponentPaths()
  const formRef = ref()
  const treeSelectRef = ref()
  const visible = ref(false)
  const submitLoading = ref(false)
  const mode = ref<'add' | 'edit' | 'addChild'>('add')
  const menuId = ref('')
  const parentMenuTitle = ref('')

  // 菜单树数据（用于选择父菜单）
  const menuTreeData = ref<MenuResp[]>([])

  const form = reactive({
    type: 2 as 1 | 2 | 3,
    parentId: '',
    title: '',
    permission: '',
    path: '',
    component: '',
    icon: '',
    sort: 0,
    status: 1 as 1 | 2,
    name: '',
    redirect: '',
    isExternal: false,
    isCache: true,
    isHidden: false
  })

  // 建议的组件名称
  const suggestedComponentName = computed(() => {
    if (!form.path || form.type === 3) return ''
    return transformPathToName(form.path)
  })

  // 过滤后的菜单树（只显示目录和菜单，排除按钮）
  const menuTreeSelectData = computed(() => {
    return filterMenuTree(menuTreeData.value)
  })

  // 过滤菜单树，只保留目录和菜单类型
  const filterMenuTree = (data: MenuResp[]): MenuResp[] => {
    return data
      .filter((item) => [1, 2].includes(item.type))
      .map((item) => ({
        ...item,
        children: item.children ? filterMenuTree(item.children) : []
      }))
  }

  // 树节点过滤方法
  const filterMenuNode = (value: string, data: MenuResp) => {
    if (!value) return true
    const title = data.title || ''
    return title.toLowerCase().includes(value.toLowerCase())
  }

  // 动态验证规则
  const rules = computed(() => {
    const baseRules = {
      type: [{ required: true, message: t('menu.validate.typeRequired'), trigger: 'change' }],
      title: [{ required: true, message: t('menu.validate.titleRequired'), trigger: 'blur' }]
    }

    if (form.type === 3) {
      return {
        ...baseRules,
        parentId: [
          { required: true, message: t('menu.validate.parentIdRequired'), trigger: 'change' }
        ],
        permission: [
          { required: true, message: t('menu.validate.permissionRequired'), trigger: 'blur' }
        ]
      }
    }

    if (form.type === 2) {
      return {
        ...baseRules,
        path: [{ required: true, message: t('menu.validate.pathRequired'), trigger: 'blur' }],
        component: [
          {
            required: !form.isExternal,
            message: t('menu.validate.componentRequired'),
            trigger: 'blur'
          }
        ],
        permission: [
          { required: true, message: t('menu.validate.permissionRequired'), trigger: 'blur' }
        ],
        name: [{ required: true, message: t('menu.validate.nameRequired'), trigger: 'blur' }]
      }
    }

    // type === 1
    return {
      ...baseRules,
      path: [{ required: true, message: t('menu.validate.pathRequired'), trigger: 'blur' }],
      name: [{ required: true, message: t('menu.validate.nameRequired'), trigger: 'blur' }]
    }
  })

  const drawerTitle = computed(() => {
    if (mode.value === 'addChild') {
      return `${t('menu.button.addChild')} - ${parentMenuTitle.value}`
    }
    return mode.value === 'add' ? t('menu.page.add') : t('menu.page.edit')
  })

  // 获取菜单树
  const getMenuTree = async () => {
    try {
      const data = await listMenu()
      menuTreeData.value = data
    } catch (error) {
      console.error('获取菜单树失败:', error)
    }
  }

  // 组件路径自动完成建议
  const fetchComponentSuggestions = (
    queryString: string,
    cb: AutocompleteFetchSuggestionsCallback
  ) => {
    const suggestions = componentPathPrefixes.value
    const results = queryString
      ? suggestions.filter((item) => item.value.toLowerCase().includes(queryString.toLowerCase()))
      : suggestions
    cb(results)
  }

  // 组件路径选择
  const handleComponentSelect = (item: Record<string, any>) => {
    form.component = item.value
  }

  // 路径输入处理
  const handlePathInput = () => {
    // 当路径变化时，自动更新建议的组件名
    if (suggestedComponentName.value && !form.name) {
      // 可选：自动填充组件名
      // form.name = suggestedComponentName.value
    }
  }

  // 应用建议的组件名
  const applySuggestedName = () => {
    form.name = suggestedComponentName.value
  }

  // 菜单类型切换处理
  const handleTypeChange = () => {
    // 清除相关字段的验证
    formRef.value?.clearValidate(['permission', 'path', 'component', 'name'])
  }

  // 重置表单
  const resetForm = () => {
    Object.assign(form, {
      type: 2,
      parentId: '',
      title: '',
      permission: '',
      path: '',
      component: '',
      icon: '',
      sort: 0,
      status: 1,
      name: '',
      redirect: '',
      isExternal: false,
      isCache: true,
      isHidden: false
    })
    formRef.value?.clearValidate()
  }

  // 打开抽屉（新增）
  const onAdd = async () => {
    mode.value = 'add'
    await getMenuTree()
    resetForm()
    visible.value = true
  }

  // 打开抽屉（新增子菜单）
  const onAddChild = async (parentId: string, parentTitle: string) => {
    mode.value = 'addChild'
    parentMenuTitle.value = parentTitle
    await getMenuTree()
    resetForm()
    form.parentId = parentId
    visible.value = true
  }

  // 打开抽屉（编辑）
  const onUpdate = async (id: string) => {
    mode.value = 'edit'
    menuId.value = id
    await getMenuTree()

    try {
      const data = await getMenu(id)
      Object.assign(form, {
        type: data.type,
        parentId: data.parentId || '',
        title: data.title,
        permission: data.permission || '',
        path: data.path || '',
        component: data.component || '',
        icon: data.icon || '',
        sort: data.sort,
        status: data.status,
        name: data.name || '',
        redirect: data.redirect || '',
        isExternal: data.isExternal || false,
        isCache: data.isCache !== false,
        isHidden: data.isHidden || false
      })
      visible.value = true
    } catch (error) {
      console.error('获取菜单详情失败:', error)
      ElMessage.error(t('menu.message.fetchFailed'))
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
      if (mode.value === 'add') {
        await addMenu(data)
        ElMessage.success(t('menu.message.addSuccess'))
      } else if (mode.value === 'addChild') {
        await addMenu(data)
        ElMessage.success(t('menu.message.addSuccess'))
      } else {
        await updateMenu(data, menuId.value)
        ElMessage.success(t('menu.message.updateSuccess'))
      }
      emit('save-success')
      handleClose()
    } catch (error: any) {
      console.error('保存菜单失败:', error)
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

  :deep(.el-input-group__prepend) {
    color: var(--el-text-color-regular);
    background-color: var(--el-fill-color-light);
  }

  .component-input-wrapper {
    display: flex;
    align-items: center;
    width: 100%;

    .input-prefix {
      box-sizing: border-box;
      flex-shrink: 0;
      height: 32px;
      padding: 0 12px;
      font-size: 14px;
      line-height: 32px;
      color: var(--el-text-color-regular);
      background-color: var(--el-fill-color-light);
      border: 1px solid var(--el-border-color);
      border-right: none;
      border-radius: 4px 0 0 4px;
    }

    :deep(.el-autocomplete) {
      flex: 1;

      .el-input__wrapper {
        border-radius: 0 4px 4px 0;
      }
    }
  }

  .component-suggestion {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .value {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .name-suggestion {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: 4px;
    font-size: 12px;

    .suggestion-label {
      color: var(--el-text-color-secondary);
    }

    .suggestion-tag {
      transition: all 0.2s;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  :deep(.el-input-number) {
    width: 100%;
  }

  .menu-form {
    :deep(.el-form-item) {
      margin-bottom: 18px;
    }
  }
</style>
