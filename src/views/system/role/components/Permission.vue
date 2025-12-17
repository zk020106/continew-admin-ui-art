<template>
  <div class="permission-container">
    <div class="permission-header">
      <ElButton type="primary" :loading="loading" @click="handleSave"> 保存权限 </ElButton>
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
    updateRolePermission
  } from '@/apis/system/role'
  import { ElMessage, ElTree } from 'element-plus'
  import { onMounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  const props = defineProps<{
    roleId: string
  }>()

  const treeRef = ref<InstanceType<typeof ElTree>>()
  const loading = ref(false)
  const isCascade = ref(true)
  const treeData = ref<any[]>([])
  const processedTreeData = ref<any[]>([])
  const checkedKeys = ref<string[]>([])

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

  // 处理树数据，标记需要横向排列的节点
  const processTreeData = (data: RolePermissionResp[], level = 1): any[] => {
    return data.map((item) => {
      const newItem = { ...item }
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
    if (!props.roleId) {
      checkedKeys.value = []
      return
    }

    try {
      const roleDetail = await getRole(props.roleId)
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
    if (!props.roleId) {
      ElMessage.warning('请先选择角色')
      return
    }

    const checkedKeys = treeRef.value?.getCheckedKeys() || []
    const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || []

    const allKeys = Array.from(new Set([...checkedKeys, ...halfCheckedKeys]))

    await updateRolePermission(props.roleId, {
      menuIds: allKeys.map(Number),
      menuCheckStrictly: isCascade.value
    })

    ElMessage.success('保存成功')
  }

  // 监听角色ID变化
  watch(
    () => props.roleId,
    () => {
      if (props.roleId && processedTreeData.value.length > 0) {
        fetchRolePermissions()
      }
    }
  )

  onMounted(async () => {
    await fetchTree()
    // 权限树加载完成后，如果已有roleId，则加载角色权限
    if (props.roleId) {
      await fetchRolePermissions()
    }
  })
</script>

<style lang="scss">
  .permission-container {
    padding: 16px;
  }

  .permission-header {
    margin-bottom: 12px;
  }

  .tree-label {
    font-size: 14px;
  }

  // 横向排列样式 - 使用更强优先级的选择器
  .permission-tree {
    // 第三级节点容器横向排列
    .el-tree-node .el-tree-node__children .el-tree-node .el-tree-node__children {
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
  }
</style>
