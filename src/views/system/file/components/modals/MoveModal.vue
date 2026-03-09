<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 当前路径 -->
    <div class="mb-4 flex items-center gap-2 rounded-md bg-(--el-fill-color-light) p-3">
      <span class="shrink-0 text-[13px] font-medium text-(--el-text-color-secondary)">{{ t('file.modal.move.targetLocation') }}</span>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          <span
            class="inline-flex cursor-pointer items-center gap-1 text-(--el-text-color-primary) hover:text-(--el-color-primary)"
            @click="navigateTo('/')"
          >
            <ArtSvgIcon icon="ri:home-4-line" :size="14" />
            {{ t('file.sidebar.rootDirectory') }}
          </span>
        </el-breadcrumb-item>
        <el-breadcrumb-item v-for="(item, index) in pathSegments" :key="index">
          <span
            class="cursor-pointer text-(--el-text-color-primary) hover:text-(--el-color-primary)"
            @click="navigateTo(item.path)"
          >
            {{ item.name }}
          </span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 文件夹树 -->
    <div class="h-[300px] overflow-y-auto rounded-md border border-(--el-border-color-lighter) p-2">
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
          <div class="flex items-center gap-1.5">
            <ArtSvgIcon icon="ri:folder-fill" :size="16" />
            <span class="text-[13px]">{{ node.label }}</span>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 文件列表 -->
    <div v-if="currentFolder" class="mt-4">
      <div class="mb-2 text-xs text-(--el-text-color-secondary)">{{ t('file.modal.move.currentFolderContent') }}</div>
      <div class="grid max-h-[150px] grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2 overflow-y-auto rounded-md bg-(--el-fill-color-lighter) p-2">
        <div
          v-for="folder in currentFolder.children?.filter((f: any) => f.type === 0)"
          :key="folder.id"
          :class="
            selectedPath === folder.path
              ? 'flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-(--el-color-primary) bg-(--el-color-primary-light-9)'
              : 'flex cursor-pointer items-center gap-2 rounded px-2 py-2 transition-all duration-200 hover:bg-(--el-fill-color)'
          "
          @click="selectFolder(folder)"
        >
          <ArtSvgIcon icon="ri:folder-fill" :size="20" />
          <span class="overflow-hidden text-ellipsis whitespace-nowrap text-[13px]">{{ folder.originalName }}</span>
        </div>
        <div
          v-if="!currentFolder.children?.filter((f: any) => f.type === 0).length"
          class="col-[1/-1] p-5 text-center text-[13px] text-(--el-text-color-secondary)"
        >
          {{ t('file.modal.move.emptyFolder') }}
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="loading" :disabled="!selectedPath" @click="handleSubmit">
        {{ t('common.confirm') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FileItem } from '@/apis/system/file'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  modelValue: boolean
  files: FileItem[]
  mode: 'move' | 'copy'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', visible: boolean): void
  (e: 'confirm', targetPath: string): void
}>()
const { t } = useI18n()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const title = computed(() => {
  const count = props.files.length
  const action = props.mode === 'move'
    ? t('file.modal.move.action.move')
    : t('file.modal.move.action.copy')
  const target = count === 1
    ? props.files[0]?.originalName
    : t('file.modal.move.multipleFiles', { count })
  return t('file.modal.move.title', { action, target })
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
    path: `/${parts.slice(0, index + 1).join('/')}`
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
</style>
