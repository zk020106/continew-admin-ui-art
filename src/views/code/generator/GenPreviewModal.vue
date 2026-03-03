<template>
  <ElDialog
    v-model="visible"
    :width="width >= 1200 ? '90%' : '100%'"
    top="4vh"
    destroy-on-close
  >
    <template #header>
      <div class="preview-header">
        <span>{{ dialogTitle }}</span>
        <ElSpace>
          <ElLink v-auth="['code:generator:generate']" type="primary" :underline="false" @click="onDownload">
            下载源码
          </ElLink>
          <ElLink v-auth="['code:generator:generate']" type="primary" :underline="false" @click="onGenerate">
            生成源码
          </ElLink>
        </ElSpace>
      </div>
    </template>

    <div class="preview-content" :style="previewContentStyle">
      <div class="preview-tree">
        <ElTree
          ref="treeRef"
          :data="treeData"
          node-key="key"
          highlight-current
          default-expand-all
          :current-node-key="selectedKey"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <ArtSvgIcon
                :icon="getNodeIcon(data, node.expanded)"
                :size="16"
              />
              <span class="tree-node-label">{{ data.label }}</span>
            </div>
          </template>
        </ElTree>
      </div>

      <div
        v-if="!isMobile"
        class="preview-divider"
        @mousedown="startResize"
      />

      <div class="preview-code">
        <div class="code-title">
          <span class="code-path">{{ currentFilePath }}</span>
          <ElLink
            type="primary"
            :underline="false"
            :disabled="!currentPreview"
            @click="onCopy"
          >
            复制
          </ElLink>
        </div>

        <ElScrollbar height="65vh">
          <pre class="code-block"><code class="hljs" v-html="highlightedCode"></code></pre>
        </ElScrollbar>
      </div>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
import type { ElTree } from 'element-plus'
import type { GeneratePreviewResp } from '@/apis/code'
import { useClipboard, useWindowSize } from '@vueuse/core'
import { ElMessage } from 'element-plus'
import hljs from 'highlight.js'
import { genPreview } from '@/apis/code/generator'
import 'highlight.js/styles/github-dark.css'

defineOptions({ name: 'CodeGeneratorPreviewModal' })

interface PreviewTreeNode {
  key: string
  label: string
  isLeaf: boolean
  children?: PreviewTreeNode[]
}

const emit = defineEmits<{
  (e: 'download', tableNames: string[]): void
  (e: 'generate', tableNames: string[]): void
}>()

const { width } = useWindowSize()
const { copy } = useClipboard()
const treeRef = ref<InstanceType<typeof ElTree>>()

const visible = ref(false)
const isResizing = ref(false)
const previewTableNames = ref<string[]>([])
const previewList = ref<GeneratePreviewResp[]>([])
const previewMap = ref<Record<string, GeneratePreviewResp>>({})
const treeData = ref<PreviewTreeNode[]>([])
const selectedKey = ref('')
const currentPreview = ref<GeneratePreviewResp>()
const leftPaneWidth = ref(320)
const minLeftPaneWidth = 240

const isMobile = computed(() => width.value <= 960)
const previewContentStyle = computed(() => {
  if (isMobile.value) return undefined
  return { '--left-pane-width': `${leftPaneWidth.value}px` }
})

const dialogTitle = computed(() => {
  if (previewTableNames.value.length === 1) {
    return `生成 ${previewTableNames.value[0]} 表预览`
  }
  return '批量生成预览'
})

const getPathSeparator = (path: string) => (path.includes('/') ? '/' : '\\')

const currentFilePath = computed(() => {
  if (!currentPreview.value) return '暂无文件'
  return `${currentPreview.value.path}${getPathSeparator(currentPreview.value.path)}${currentPreview.value.fileName}`
})

const getCodeLanguage = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    vue: 'xml',
    ts: 'typescript',
    js: 'javascript',
    java: 'java',
    json: 'json',
    sql: 'sql',
    xml: 'xml',
    yml: 'yaml',
    yaml: 'yaml',
    md: 'markdown'
  }
  return extension ? languageMap[extension] || 'plaintext' : 'plaintext'
}

const highlightedCode = computed(() => {
  const content = currentPreview.value?.content || ''
  if (!content) return ''
  const language = getCodeLanguage(currentPreview.value?.fileName || '')
  if (language !== 'plaintext' && hljs.getLanguage(language)) {
    return hljs.highlight(content, { language, ignoreIllegals: true }).value
  }
  return hljs.highlightAuto(content).value
})

const getFileIcon = (fileName: string) => {
  const lowerName = fileName.toLowerCase()
  if (lowerName.endsWith('.java')) return 'file-java'
  if (lowerName.endsWith('.vue')) return 'file-vue'
  if (lowerName.endsWith('.ts')) return 'file-typescript'
  if (lowerName.endsWith('.js')) return 'file-js'
  if (lowerName.endsWith('.json')) return 'file-json'
  if (lowerName.endsWith('pom.xml')) return 'file-maven'
  if (lowerName.endsWith('.xml')) return 'file-xml'
  if (lowerName.endsWith('.sql')) return 'file-sql'
  return 'file-close'
}

const getNodeIcon = (node: PreviewTreeNode, expanded: boolean) => {
  if (!node.isLeaf) {
    return expanded ? 'directory-open' : 'directory'
  }
  return getFileIcon(node.label)
}

const buildTreeData = (list: GeneratePreviewResp[]) => {
  const roots: PreviewTreeNode[] = []
  const folderMap = new Map<string, PreviewTreeNode>()
  const fileMap: Record<string, GeneratePreviewResp> = {}
  const fileKeySet = new Set<string>()

  list.forEach((item) => {
    const segments = item.path.split(/[\\/]/).filter(Boolean)
    let children = roots
    let currentPath = ''

    segments.forEach((segment) => {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment
      const folderKey = `dir:${currentPath}`
      let folderNode = folderMap.get(folderKey)
      if (!folderNode) {
        folderNode = {
          key: folderKey,
          label: segment,
          isLeaf: false,
          children: []
        }
        folderMap.set(folderKey, folderNode)
        children.push(folderNode)
      }
      children = folderNode.children || []
    })

    const fileKey = `file:${item.path}/${item.fileName}`
    fileMap[fileKey] = item
    if (!fileKeySet.has(fileKey)) {
      children.push({
        key: fileKey,
        label: item.fileName,
        isLeaf: true
      })
      fileKeySet.add(fileKey)
    }
  })

  previewMap.value = fileMap
  treeData.value = roots
}

const setCurrentPreview = (key: string) => {
  selectedKey.value = key
  currentPreview.value = previewMap.value[key]
}

const handleNodeClick = (node: PreviewTreeNode) => {
  if (!node.isLeaf) return
  setCurrentPreview(node.key)
}

const onCopy = async () => {
  if (!currentPreview.value?.content) return
  await copy(currentPreview.value.content)
  ElMessage.success('复制成功')
}

const onDownload = () => {
  emit('download', previewTableNames.value)
}

const onGenerate = () => {
  emit('generate', previewTableNames.value)
}

const stopResize = () => {
  if (!isResizing.value) return
  isResizing.value = false
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', stopResize)
}

const getMaxLeftPaneWidth = () => {
  return Math.max(minLeftPaneWidth, width.value - 420)
}

const clampLeftPaneWidth = (value: number) => {
  return Math.min(getMaxLeftPaneWidth(), Math.max(minLeftPaneWidth, value))
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isResizing.value) return
  leftPaneWidth.value = clampLeftPaneWidth(event.clientX)
}

const startResize = (event: MouseEvent) => {
  if (isMobile.value) return
  event.preventDefault()
  isResizing.value = true
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', stopResize)
}

const onOpen = async (tableNames: string[]) => {
  previewTableNames.value = tableNames
  const data = await genPreview(tableNames)
  previewList.value = data || []
  if (!previewList.value.length) {
    ElMessage.warning('暂无可预览内容')
    return
  }

  buildTreeData(previewList.value)
  const firstFileKey = Object.keys(previewMap.value)[0]
  setCurrentPreview(firstFileKey)
  visible.value = true

  await nextTick()
  treeRef.value?.setCurrentKey(firstFileKey)
}

watch(
  () => width.value,
  () => {
    leftPaneWidth.value = clampLeftPaneWidth(leftPaneWidth.value)
    if (isMobile.value) {
      stopResize()
    }
  }
)

watch(
  () => visible.value,
  (val) => {
    if (!val) stopResize()
  }
)

onBeforeUnmount(() => {
  stopResize()
})

defineExpose({ onOpen })
</script>

<style scoped lang="scss">
  .preview-header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-right: 8px;
  }

  .preview-content {
    display: grid;
    grid-template-columns: var(--left-pane-width, 320px) 10px minmax(0, 1fr);
    gap: 12px;
  }

  .preview-tree {
    height: 70vh;
    padding: 10px;
    overflow: auto;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
  }

  .tree-node {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    min-width: 0;
  }

  .tree-node-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .preview-code {
    min-width: 0;
    padding: 10px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
  }

  .code-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 28px;
    margin-bottom: 8px;
  }

  .code-path {
    overflow: hidden;
    font-size: 13px;
    color: var(--el-text-color-regular);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .code-block {
    min-height: 100%;
    margin: 0;
    font-size: 13px;
    border-radius: 6px;
  }

  .code-block :deep(.hljs) {
    padding: 14px 16px;
    overflow-x: auto;
    line-height: 1.55;
  }

  .preview-divider {
    position: relative;
    cursor: col-resize;

    &::before {
      position: absolute;
      top: 0;
      left: 50%;
      width: 1px;
      height: 100%;
      content: '';
      background: var(--el-border-color);
      transform: translateX(-50%);
    }
  }

  @media (width <= 960px) {
    .preview-content {
      grid-template-columns: 1fr;
    }

    .preview-tree {
      height: 260px;
    }
  }
</style>
