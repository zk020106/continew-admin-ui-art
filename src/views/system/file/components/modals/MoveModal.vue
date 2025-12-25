<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 当前路径 -->
    <div class="current-path">
      <span class="path-label">目标位置:</span>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <span class="breadcrumb-link" @click="navigateTo('/')">
            <ArtSvgIcon icon="ri:home-4-line" :size="14" />
            根目录
          </span>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-for="(item, index) in pathSegments" :key="index">
          <span class="breadcrumb-link" @click="navigateTo(item.path)">
            {{ item.name }}
          </span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 文件夹树 -->
    <div class="folder-tree-container">
      <el-tree
        ref="treeRef"
        v-loading="loading"
        :data="folderTree"
        :props="treeProps"
        :highlight-current="true"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
      >
        <template #default="{ node }">
          <div class="tree-node">
            <ArtSvgIcon icon="ri:folder-fill" :size="16" />
            <span class="node-label">{{ node.label }}</span>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 文件列表 -->
    <div v-if="currentFolder" class="file-list">
      <div class="file-list-header">当前文件夹内容:</div>
      <div class="file-list-content">
        <div
          v-for="folder in currentFolder.children?.filter((f: any) => f.type === 0)"
          :key="folder.id"
          :class="['file-item', { 'is-selected': selectedPath === folder.path }]"
          @click="selectFolder(folder)"
        >
          <ArtSvgIcon icon="ri:folder-fill" :size="20" />
          <span class="file-name">{{ folder.originalName }}</span>
        </div>
        <div
          v-if="!currentFolder.children?.filter((f: any) => f.type === 0).length"
          class="empty-tip"
        >
          此文件夹为空
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" :disabled="!selectedPath" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import type { FileItem } from '@/apis/system/file'

  const props = defineProps<{
    modelValue: boolean
    files: FileItem[]
    mode: 'move' | 'copy'
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', visible: boolean): void
    (e: 'confirm', targetPath: string): void
  }>()

  const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  const title = computed(() => {
    const count = props.files.length
    const action = props.mode === 'move' ? '移动' : '复制'
    const target = count === 1 ? props.files[0]?.originalName : `${count} 个文件`
    return `${action} ${target} 到...`
  })

  const loading = ref(false)
  const treeRef = ref()
  const folderTree = ref<any[]>([])
  const currentPath = ref('/')
  const selectedPath = ref('')
  const currentFolder = ref<any>(null)

  const treeProps = {
    children: 'children',
    label: 'originalName'
  }

  // 路径分段（用于面包屑）
  const pathSegments = computed(() => {
    if (currentPath.value === '/') return []
    const parts = currentPath.value.split('/').filter(Boolean)
    return parts.map((part, index) => ({
      name: part,
      path: '/' + parts.slice(0, index + 1).join('/')
    }))
  })

  // 加载文件夹树
  const loadFolderTree = async () => {
    loading.value = true
    try {
      // TODO: 调用 API 获取文件夹树
      // const res = await fileApi.listFile({ parentPath: '/' })
      // folderTree.value = buildTree(res.data)
      folderTree.value = [] // 临时空数据
    } finally {
      loading.value = false
    }
  }

  // 导航到指定路径
  const navigateTo = (path: string) => {
    currentPath.value = path
    selectedPath.value = path
    // TODO: 加载该路径下的文件
  }

  // 树节点点击
  const handleNodeClick = (data: any) => {
    navigateTo(data.path)
  }

  // 选择文件夹
  const selectFolder = (folder: any) => {
    selectedPath.value = folder.path
  }

  // 提交
  const handleSubmit = () => {
    if (!selectedPath.value) return
    emit('confirm', selectedPath.value)
  }

  // 关闭
  const handleClose = () => {
    visible.value = false
  }

  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        currentPath.value = '/'
        selectedPath.value = ''
        loadFolderTree()
      }
    }
  )
</script>

<style lang="scss" scoped>
  .current-path {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px;
    margin-bottom: 16px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
  }

  .path-label {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
  }

  .breadcrumb-link {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    color: var(--el-text-color-primary);
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .folder-tree-container {
    height: 300px;
    padding: 8px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;

    :deep(.el-tree) {
      background: transparent;
    }

    :deep(.el-tree-node__content) {
      height: 32px;

      &:hover {
        background: var(--el-fill-color-light);
      }
    }

    :deep(.is-current > .el-tree-node__content) {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    .tree-node {
      display: flex;
      gap: 6px;
      align-items: center;

      .node-label {
        font-size: 13px;
      }
    }
  }

  .file-list {
    margin-top: 16px;
  }

  .file-list-header {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .file-list-content {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
    max-height: 150px;
    padding: 8px;
    overflow-y: auto;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
  }

  .file-item {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: var(--el-fill-color);
    }

    &.is-selected {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    .file-name {
      overflow: hidden;
      font-size: 13px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .empty-tip {
    grid-column: 1 / -1;
    padding: 20px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }
</style>
