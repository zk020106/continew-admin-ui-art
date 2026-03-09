import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const files = {
  sidebar: resolve(process.cwd(), 'src/views/system/file/components/FileSidebar.vue'),
  moveModal: resolve(process.cwd(), 'src/views/system/file/components/modals/MoveModal.vue')
}

const contents = Object.fromEntries(
  Object.entries(files).map(([key, filePath]) => [key, readFileSync(filePath, 'utf8')])
)

const failures = []

if (contents.sidebar.includes('.file-sidebar')
  || contents.sidebar.includes('.storage-card')
  || contents.sidebar.includes('.storage-loading')
  || contents.sidebar.includes('.sidebar-section')
  || contents.sidebar.includes('.section-title')
  || contents.sidebar.includes('.quick-access-list')
  || contents.sidebar.includes('.recent-list')
  || contents.sidebar.includes('.quick-access-item')
  || contents.sidebar.includes('.recent-item')) {
  failures.push('FileSidebar 仍保留可迁移的主体布局样式块。')
}

if (!contents.sidebar.includes('flex h-full flex-col overflow-y-auto')
  || !contents.sidebar.includes('border-b border-(--el-border-color-lighter)')
  || !contents.sidebar.includes('flex cursor-pointer items-center gap-2')
  || !contents.sidebar.includes('bg-(--el-color-primary-light-9)')) {
  failures.push('FileSidebar 缺少 Tailwind 化后的关键布局类。')
}

if (contents.moveModal.includes('.current-path')
  || contents.moveModal.includes('.path-label')
  || contents.moveModal.includes('.breadcrumb-link')
  || contents.moveModal.includes('.folder-tree-container')
  || contents.moveModal.includes('.file-list')
  || contents.moveModal.includes('.file-list-header')
  || contents.moveModal.includes('.file-list-content')
  || contents.moveModal.includes('.file-item')
  || contents.moveModal.includes('.empty-tip')) {
  failures.push('MoveModal 仍保留可迁移的主体布局样式块。')
}

if (!contents.moveModal.includes('mb-4 flex items-center gap-2 rounded-md')
  || !contents.moveModal.includes('h-[300px] overflow-y-auto rounded-md border')
  || !contents.moveModal.includes('grid max-h-[150px]')
  || !contents.moveModal.includes('bg-(--el-color-primary-light-9)')) {
  failures.push('MoveModal 缺少 Tailwind 化后的关键布局类。')
}

console.log(
  failures.length > 0
    ? `Tailwind refactor batch3 verification failed:\n\n- ${failures.join('\n- ')}`
    : 'Tailwind refactor batch3 verification passed.'
)

if (failures.length > 0) {
  process.exit(1)
}
