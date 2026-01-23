<template>
  <ElDrawer
    v-model="visible"
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :size="500"
    destroy-on-close
    draggable
    @close="reset"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="80" size="large">
      <ElFormItem :label="t('pages.tenantPackage.field.name')" prop="name">
        <ElInput v-model="form.name" />
      </ElFormItem>
      <ElFormItem :label="t('pages.tenantPackage.field.sort')" prop="sort">
        <ElInputNumber v-model="form.sort" :min="1" controls-position="right" />
      </ElFormItem>
      <ElFormItem :label="t('pages.tenantPackage.field.description')" prop="description">
        <ElInput
          v-model="form.description"
          type="textarea"
          show-word-limit
          :maxlength="200"
          :rows="3"
        />
      </ElFormItem>
      <ElFormItem :label="t('common.status')" prop="status">
        <ElSwitch v-model="form.status" active-value="1" inactive-value="2" />
      </ElFormItem>
      <ElFormItem :label="t('role.deptPermission')">
        <div class="menu-permission-wrapper">
          <div class="menu-permission-header">
            <ElCheckbox v-model="form.menuCheckStrictly">
{{
              t('role.parentChildLinkage')
            }}
</ElCheckbox>
          </div>
          <div class="menu-tree-wrapper">
            <ElTree
              ref="menuTreeRef"
              :data="menuList"
              class="menu-tree"
              :props="{ children: 'children', label: 'title' }"
              :check-strictly="!form.menuCheckStrictly"
              show-checkbox
              node-key="id"
            />
          </div>
        </div>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="visible = false">{{ t('common.cancel') }}</ElButton>
      <ElButton type="primary" :loading="saving" @click="handleSave">
        {{ t('common.confirm') }}
      </ElButton>
    </template>
  </ElDrawer>
</template>

<script setup lang="ts">
import type { TenantPackageMenuResp, TenantPackageReq } from '@/apis/tenant/type'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  addTenantPackage,
  getTenantPackage,
  listTenantPackageMenu,
  updateTenantPackage
} from '@/apis/tenant/package'

defineOptions({ name: 'TenantPackageAddDrawer' })

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { t } = useI18n()

const dataId = ref('')
const visible = ref(false)
const saving = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? t('common.button.edit') : t('common.button.add')))
const formRef = ref()
const menuList = ref<TenantPackageMenuResp[]>([])
const menuTreeRef = ref<any>()

const rules = {
  name: [
    {
      required: true,
      message: t('components.form.validate.required', {
        label: t('pages.tenantPackage.field.name')
      }),
      trigger: 'blur'
    }
  ],
  status: [
    {
      required: true,
      message: t('components.form.validate.required', { label: t('common.status') }),
      trigger: 'change'
    }
  ]
}

const form = reactive<TenantPackageReq>({
  name: '',
  sort: 999,
  status: '1',
  menuCheckStrictly: true,
  description: '',
  menuIds: []
})

const getTenantPackageMenuList = async () => {
  const data = await listTenantPackageMenu()
  menuList.value = data.map((item) => {
    item.title = t(item.title)
    return item
  })
}

const reset = () => {
  menuTreeRef.value?.setCheckedKeys([])
  formRef.value?.resetFields()
  Object.assign(form, {
    name: '',
    sort: 999,
    status: '1',
    menuCheckStrictly: true,
    description: '',
    menuIds: []
  })
}

const getMenuAllCheckedKeys = () => {
  const checkedNodes = menuTreeRef.value?.getCheckedNodes() || []
  const checkedKeys = checkedNodes.map((item: any) => item.id)
  const halfCheckedNodes = menuTreeRef.value?.getHalfCheckedNodes() || []
  const halfCheckedKeys = halfCheckedNodes.map((item: any) => item.id)
  checkedKeys.push(...halfCheckedKeys)
  return checkedKeys
}

const handleSave = async () => {
  try {
    await formRef.value?.validate()
    form.menuIds = getMenuAllCheckedKeys()
    saving.value = true

    if (isUpdate.value) {
      await updateTenantPackage(form, dataId.value)
      ElMessage.success(t('message.updateSuccess'))
    } else {
      await addTenantPackage(form)
      ElMessage.success(t('message.addSuccess'))
    }

    emit('save-success')
    visible.value = false
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

const onAdd = async () => {
  reset()
  await getTenantPackageMenuList()
  dataId.value = ''
  visible.value = true
}

const onUpdate = async (id: string) => {
  reset()
  await getTenantPackageMenuList()
  dataId.value = id
  const data = await getTenantPackage(id)

  Object.assign(form, data)
  if (data.menuIds?.length) menuTreeRef.value?.setCheckedKeys(data.menuIds.map(String))
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss">
  .menu-permission-wrapper {
    width: 100%;
  }

  .menu-permission-header {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 8px;
  }

  .menu-tree-wrapper {
    height: 280px;
    padding: 8px 0;
    overflow-y: auto;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
  }

  .menu-tree {
    :deep(.el-tree-node) {
      .el-tree-node__content {
        height: 32px;
      }
    }
  }
</style>
