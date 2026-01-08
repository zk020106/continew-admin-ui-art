<template>
  <ElDialog
    v-model="visible"
    :title="title"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :width="600"
    destroy-on-close
    @close="handleClose"
  >
    <CaForm v-model="form" :columns="formColumns" :grid-row="1" :grid-span="24" />
    <template #footer>
      <CaButton type="cancel" @click="handleClose" />
      <CaButton type="confirm" :loading="saving" @click="handleConfirm" />
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { TenantReq } from '@/apis'
  import { listTenantPackageDict } from '@/apis/tenant'
  import { addTenant, getTenant, updateTenant } from '@/apis/tenant/management'
  import type { LabelValueState } from '@/types/global'
  import { encryptByRsa } from '@/utils/encrypt'
  import { ElDialog, ElMessage } from 'element-plus'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'TenantManagementAddModal' })

  const emit = defineEmits<{
    'save-success': []
  }>()

  const { t } = useI18n()

  const visible = ref(false)
  const isEdit = ref(false)
  const editId = ref<string>()
  const saving = ref(false)
  const packageList = ref<LabelValueState[]>([])

  const form = ref<TenantReq>({
    name: '',
    domain: '',
    expireTime: '',
    description: '',
    packageId: '',
    adminUsername: '',
    adminPassword: '',
    status: '1'
  })

  const formColumns = computed(() => [])

  const title = computed(() => (isEdit.value ? t('common.button.edit') : t('common.button.add')))

  // 获取套餐列表
  const getPackageList = async () => {
    packageList.value = await listTenantPackageDict()
  }

  // 重置表单
  const resetForm = () => {
    form.value = {
      name: '',
      domain: '',
      expireTime: '',
      description: '',
      packageId: '',
      adminUsername: '',
      adminPassword: '',
      status: '1'
    }
  }

  // 关闭
  const handleClose = () => {
    resetForm()
    visible.value = false
  }

  // 新增
  const onAdd = async () => {
    await getPackageList()
    isEdit.value = false
    editId.value = undefined
    resetForm()
    visible.value = true
  }

  // 修改
  const onUpdate = async (id: string) => {
    await getPackageList()
    isEdit.value = true
    editId.value = id
    const data = await getTenant(id)
    Object.assign(form.value, {
      name: data.name,
      domain: data.domain,
      expireTime: data.expireTime,
      description: data.description,
      packageId: data.packageId,
      adminUsername: '',
      adminPassword: '',
      status: data.status
    })
    visible.value = true
  }

  // 确认
  const handleConfirm = async () => {
    try {
      saving.value = true

      if (isEdit.value && editId.value) {
        await updateTenant(form.value, editId.value)
        ElMessage.success(t('message.updateSuccess'))
      } else {
        await addTenant({
          ...form.value,
          adminPassword: encryptByRsa(form.value.adminPassword || '')
        })
        ElMessage.success(t('message.addSuccess'))
      }

      emit('save-success')
      handleClose()
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      saving.value = false
    }
  }

  defineExpose({
    onAdd,
    onUpdate
  })
</script>

<style scoped lang="scss"></style>
