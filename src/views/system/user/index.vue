<template>
  <CaPageLayout>
    <template #left>
      <DeptTree @node-click="handleSelectDept" />
    </template>
    <CaTable
      row-key="id"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1500 }"
      :pagination="pagination"
      :disabled-tools="[]"
      :disabled-column-keys="['nickname']"
      @refresh="search"
    >
      <template #top>
        <CaQueryForm v-model="queryForm" mode="click-search" :columns="queryFormColumns" />
      </template>
      <template #toolbar-left>
        <ElSpace>
          <CaButton type="add" @click="onAdd" />
          <CaButton type="import" @click="onImport" />
        </ElSpace>
      </template>
      <template #toolbar-right>
        <CaButton type="export" @click="onExport" />
      </template>
      <template #nickname="{ row }">
        <CaAvatar fit="cover" :src="row.avatar" :name="row.nickname" />
      </template>
      <template #gender="{ row }">
        <CaCellGender :gender="row.gender" />
      </template>
      <template #roleNames="{ row }">
        <CaCellTags :data="row.roleNames" />
      </template>
      <template #status="{ row }">
        <CaCellStatus :status="row.status" />
      </template>
      <template #isSystem="{ row }">
        <ElTag v-if="row.isSystem" type="danger" size="small">{{ t('common.true') }}</ElTag>
        <ElTag v-else type="primary" size="small">{{ t('common.false') }}</ElTag>
      </template>
      <template #action="{ row }">
        <ElSpace>
          <ElLink type="primary" @click="onDetail(row)">{{ t('common.detail') }}</ElLink>
          <ElLink type="primary" @click="onUpdate(row)">{{ t('common.button.edit') }}</ElLink>
          <ElDropdown>
            <ElButton text>
              <ElIcon><MoreFilled /></ElIcon>
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem @click="onResetPwd(row)">{{
                  t('button.resetPassword')
                }}</ElDropdownItem>
                <ElDropdownItem :disabled="row.isSystem" @click="onUpdateRole(row)">
                  {{ t('button.assignRole') }}
                </ElDropdownItem>
                <ElDropdownItem :disabled="row.isSystem" @click="onDelete(row)">
                  <ElLink type="danger" :disabled="row.isSystem">
                    {{ t('common.button.delete') }}
                  </ElLink>
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </ElSpace>
      </template>
    </CaTable>
    <AddDrawer ref="AddDrawerRef" @save-success="search" />
    <ImportDrawer ref="ImportDrawerRef" @save-success="search" />
    <DetailDrawer ref="DetailDrawerRef" />
    <PwdResetModal ref="PwdResetModalRef" />
    <RoleUpdateModal ref="RoleUpdateModalRef" @save-success="search" />
  </CaPageLayout>
</template>
<script setup lang="ts">
  import { UserQuery, UserResp } from '@/apis'
  import { deleteUser, exportUser, listUser } from '@/apis/system/user'
  import { FormColumnItem } from '@/components/base/CaForm/type'
  import CaQueryForm from '@/components/base/CaQueryForm'
  import { TableColumnItem } from '@/components/base/CaTable/type'
  import { DisEnableStatusList } from '@/constant/common'
  import { useDevice, useDownload, useResetReactive, useTable } from '@/hooks'
  import { MoreFilled } from '@element-plus/icons-vue'
  import { ElSpace } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import AddDrawer from './AddDrawer.vue'
  import DeptTree from './dept/index.vue'
  import DetailDrawer from './DetailDrawer.vue'
  import ImportDrawer from './ImportDrawer.vue'
  import PwdResetModal from './PwdResetModal.vue'
  import RoleUpdateModal from './RoleUpdateModal.vue'
  defineOptions({ name: 'SystemUser' })
  const { isMobile } = useDevice()
  const [queryForm, resetForm] = useResetReactive<UserQuery>({
    sort: ['t1.id,desc']
  })
  const { t } = useI18n()
  const queryFormColumns = computed(
    () =>
      [
        {
          type: 'input',
          label: t('user.field.username'),
          field: 'description',
          gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
          props: {
            placeholder: t('user.placeholder.username')
          }
        },
        {
          type: 'select',
          label: t('common.status'),
          field: 'status',
          gridItemProps: { span: { xs: 24, sm: 6, xxl: 8 } },
          props: {
            options: DisEnableStatusList,
            placeholder: t('common.placeholder.status')
          }
        },
        {
          type: 'date-picker',
          label: t('common.createTime'),
          field: 'createTime',
          gridItemProps: { span: { xs: 24, sm: 10, xxl: 8 } },
          props: {
            type: 'daterange'
          }
        }
      ] as FormColumnItem<UserQuery>[]
  )
  const { tableData, loading, pagination, search, handleDelete } = useTable<UserResp>(
    (page) => listUser({ ...queryForm, ...page }),
    { immediate: false }
  )
  const columns = computed(
    () =>
      [
        {
          label: t('common.index'),
          width: 66,
          align: 'center',
          render: ({ $index }) =>
            h('span', {}, $index + 1 + (pagination.current - 1) * pagination.pageSize),
          fixed: !isMobile.value ? 'left' : false
        },
        {
          label: t('user.field.nickname'),
          prop: 'nickname',
          slotName: 'nickname',
          minWidth: 140,
          showOverflowTooltip: true,
          fixed: !isMobile.value ? 'left' : false
        },
        {
          label: t('user.field.username'),
          prop: 'username',
          // slotName: 'username',
          minWidth: 140,
          showOverflowTooltip: true
        },
        { label: t('user.field.status'), prop: 'status', slotName: 'status', align: 'center' },
        { label: t('user.field.gender'), prop: 'gender', slotName: 'gender', align: 'center' },
        {
          label: t('user.field.dept'),
          prop: 'deptName',
          minWidth: 180,
          showOverflowTooltip: true
        },
        { label: t('user.field.role'), prop: 'roleNames', slotName: 'roleNames', minWidth: 165 },
        { label: t('user.field.phone'), prop: 'phone', minWidth: 170, showOverflowTooltip: true },
        { label: t('user.field.email'), prop: 'email', minWidth: 170, showOverflowTooltip: true },
        {
          label: t('user.field.isSystem'),
          prop: 'isSystem',
          slotName: 'isSystem',
          width: 100,
          align: 'center'
        },
        {
          label: t('user.field.description'),
          prop: 'description',
          minWidth: 130,
          showOverflowTooltip: true
        },
        {
          label: t('user.field.createUser'),
          prop: 'createUserString',
          width: 140,
          showOverflowTooltip: true
        },
        { label: t('user.field.createTime'), prop: 'createTime', width: 180 },
        {
          label: t('user.field.updateUser'),
          prop: 'updateUserString',
          width: 140,
          showOverflowTooltip: true,
          show: false
        },
        { label: t('user.field.updateTime'), prop: 'updateTime', width: 180, show: false },
        {
          label: t('common.action'),
          prop: 'action',
          slotName: 'action',
          width: 160,
          align: 'center',
          fixed: !isMobile.value ? 'right' : false
        }
      ] as TableColumnItem[]
  )
  // 重置
  const reset = () => {
    resetForm()
    search()
  }
  // 删除
  const onDelete = (row: { id: string; nickname: any; username: any }) => {
    return handleDelete(() => deleteUser(row.id), {
      content: t('system.user.message.deleteConfirm', {
        nickname: row.nickname,
        username: row.username
      })
    })
  }
  // 导出
  const onExport = () => {
    useDownload(() => exportUser(queryForm))
  }
  // 根据选中部门查询
  const handleSelectDept = (key: string | number) => {
    queryForm.deptId = key
    search()
  }
  const ImportDrawerRef = ref<InstanceType<typeof ImportDrawer>>()
  // 导入
  const onImport = () => {
    ImportDrawerRef.value?.onOpen()
  }
  const AddDrawerRef = ref<InstanceType<typeof AddDrawer>>()
  // 新增
  const onAdd = () => {
    AddDrawerRef.value?.onAdd()
  }
  // 修改
  const onUpdate = (record: UserResp) => {
    AddDrawerRef.value?.onUpdate(record.id)
  }
  const DetailDrawerRef = ref<InstanceType<typeof DetailDrawer>>()
  // 详情
  const onDetail = (record: UserResp) => {
    DetailDrawerRef.value?.onOpen(record.id)
  }
  const PwdResetModalRef = ref<InstanceType<typeof PwdResetModal>>()
  // 重置密码
  const onResetPwd = (record: UserResp) => {
    PwdResetModalRef.value?.onOpen(record.id)
  }
  const RoleUpdateModalRef = ref<InstanceType<typeof RoleUpdateModal>>()
  // 分配角色
  const onUpdateRole = (record: UserResp) => {
    RoleUpdateModalRef.value?.onOpen(record.id)
  }
</script>
<style scoped lang="scss"></style>
