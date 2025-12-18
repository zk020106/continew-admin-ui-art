<template>
  <div class="permission-container">
    <div class="permission-header">
      <div class="header-left">
        <ElButton type="primary" :loading="loading" @click="handleSave"> 保存权限 </ElButton>
      </div>
      <div class="header-right">
        <ElRadioGroup v-model="isCascade">
          <ElRadioButton :label="true">节点关联</ElRadioButton>
          <ElRadioButton :label="false">节点独立</ElRadioButton>
        </ElRadioGroup>
      </div>
    </div>

    <ElScrollbar height="calc(100vh - 220px)">
      <ElTree
        ref="treeRef"
        :data="processedTreeData"
        :props="treeProps"
        node-key="id"
        show-checkbox
        :check-strictly="!isCascade"
        default-expand-all
        class="permission-tree"
        :node-class="getNodeClass"
      >
        <template #default="{ node }">
          <span class="tree-label">{{ node.label }}</span>
        </template>
      </ElTree>
    </ElScrollbar>
  </div>
</template>

<script setup lang="ts">
  import {
    getRole,
    listRolePermissionTree,
    RolePermissionResp,
    RoleResp,
    updateRolePermission
  } from '@/apis/system/role'
  import has from '@/utils/sys/permission'
  import { ElMessage, ElRadioButton, ElRadioGroup, ElTree } from 'element-plus'
  import { onMounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  const props = defineProps<{
    role: RoleResp
  }>()
  interface ExtendRolePermissionResp extends RolePermissionResp {
    horizontalChildren?: boolean
    disabled?: boolean
  }
  const treeRef = ref<InstanceType<typeof ElTree>>()
  const loading = ref(false)
  const isCascade = ref(true)
  const treeData = ref<any[]>([])
  const processedTreeData = ref<any[]>([])
  const checkedKeys = ref<string[]>([])
  const disabled = ref(false)

  const treeProps = {
    label: 'title',
    children: 'children',
    isLeaf: (data: any) => data.type === 3
  }
  const { t } = useI18n()
  const getNodeClass = (data: any) => {
    if (data.type === 2) return 'type-2-node'
    if (data.type === 3) return 'type-3-node'
    if (data.horizontalChildren) return 'horizontal-children'
    return ''
  }

  // 设置权限树的禁用状态
  const setDisabledStatus = async () => {
    disabled.value = !has.hasPermOr(['system:role:updatePermission'])
    // 如果有操作权限，再检查是否为系统角色
    if (!disabled.value && props.role?.isSystem) {
      disabled.value = true
    }

    // 重新处理树数据以应用新的禁用状态
    if (treeData.value.length > 0) {
      processedTreeData.value = processTreeData(treeData.value)
    }
  }

  // 处理树数据，标记需要横向排列的节点
  const processTreeData = (data: ExtendRolePermissionResp[], level = 1): any[] => {
    return data.map((item) => {
      const newItem = { ...item, disabled: disabled.value ? true : item.disabled }
      if (item.title.startsWith('menus')) {
        newItem.title = t(item.title)
      }
      if (item.children && item.children.length > 0) {
        newItem.children = processTreeData(item.children, level + 1)

        // 检查子节点是否需要横向排列
        const hasLevel3Leaf = newItem.children.some((child: any) => {
          return (
            (level === 2 && child.type === 3 && (!child.children || child.children.length === 0)) ||
            (level === 3 && child.children && child.children.length > 0)
          )
        })

        if (hasLevel3Leaf) {
          newItem.horizontalChildren = true
        }
      }
      return newItem
    })
  }

  // 获取权限树
  const fetchTree = async () => {
    try {
      loading.value = true
      const data = await listRolePermissionTree()
      treeData.value = data
      processedTreeData.value = processTreeData(data)

      // 权限树加载完成后，如果已有checkedKeys，则设置勾选状态
      if (checkedKeys.value.length > 0) {
        setCheckedKeys()
      }
    } catch (e: any) {
      console.error('加载权限树失败:', e)
      ElMessage.error('加载权限树失败')
    } finally {
      loading.value = false
    }
  }

  // 获取角色权限ID列表
  const fetchRolePermissions = async () => {
    if (!props.role.id) {
      checkedKeys.value = []
      return
    }

    try {
      const roleDetail = await getRole(props.role.id)
      checkedKeys.value = roleDetail.menuIds.map(String)
      setCheckedKeys()
    } catch (e) {
      console.error('加载角色权限失败:', e)
    }
  }

  // 设置树组件的勾选状态
  const setCheckedKeys = () => {
    if (!treeRef.value) return
    treeRef.value.setCheckedKeys(checkedKeys.value)
  }

  const handleSave = async () => {
    if (!props.role.id) {
      ElMessage.warning('请先选择角色')
      return
    }

    const checkedKeys = treeRef.value?.getCheckedKeys() || []
    const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || []

    const allKeys = Array.from(new Set([...checkedKeys, ...halfCheckedKeys]))

    await updateRolePermission(props.role.id, {
      menuIds: allKeys.map(Number),
      menuCheckStrictly: isCascade.value
    })

    ElMessage.success('保存成功')
  }

  // 监听角色变化
  watch(
    () => props.role,
    async (newRole) => {
      if (newRole) {
        await setDisabledStatus()
        if (newRole.id && processedTreeData.value.length > 0) {
          await fetchRolePermissions()
        }
      }
    },
    { immediate: true, deep: true }
  )

  onMounted(async () => {
    await fetchTree()
    // 权限树加载完成后，如果已有角色，则设置禁用状态并加载角色权限
    if (props.role) {
      await setDisabledStatus()
      if (props.role.id) {
        await fetchRolePermissions()
      }
    }
  })
</script>

<style lang="scss">
  .permission-container {
    padding: 16px;
  }

  .permission-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .tree-label {
    font-size: 14px;
  }

  // 横向排列样式 - 修复折叠问题
  .permission-tree {
    // 第三级节点容器横向排列，但只在父节点展开时应用
    .el-tree-node .el-tree-node__children .el-tree-node {
      // 父节点展开时的子节点容器
      &.is-expanded > .el-tree-node__children {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 8px !important;
        padding-top: 4px !important;
        padding-left: 60px !important;

        .el-tree-node {
          display: inline-block !important;
          flex: 0 0 auto !important;
          min-width: 100px !important;
          margin-bottom: 4px !important;

          .el-tree-node__content {
            display: inline-flex !important;
            align-items: center !important;
            width: auto !important;
            height: auto !important;
            padding: 4px 12px !important;
            margin: 0 !important;
            line-height: 1.4 !important;
            white-space: nowrap !important;
            border-radius: 4px !important;
            transition: all 0.3s !important;

            .el-checkbox {
              margin-right: 6px !important;
            }

            .el-tree-node__label {
              font-size: 13px !important;
              color: #333 !important;
            }
          }

          .el-tree-node__expand-icon {
            display: none !important;
          }
        }
      }

      // 确保折叠时隐藏子节点
      &:not(.is-expanded) > .el-tree-node__children {
        display: none !important;
      }
    }
  }
</style>
