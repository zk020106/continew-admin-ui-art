import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const files = {
  breadcrumb: resolve(process.cwd(), 'src/views/system/file/components/FileBreadcrumb.vue'),
  contextMenu: resolve(process.cwd(), 'src/views/system/file/components/FileContextMenu.vue'),
  header: resolve(process.cwd(), 'src/views/system/file/components/FileHeader.vue')
}

const contents = Object.fromEntries(
  Object.entries(files).map(([key, filePath]) => [key, readFileSync(filePath, 'utf8')])
)

const failures = []

if (contents.breadcrumb.includes('.file-breadcrumb')
  || contents.breadcrumb.includes('.breadcrumb-root')
  || contents.breadcrumb.includes('.breadcrumb-link')
  || contents.breadcrumb.includes('.breadcrumb-current')) {
  failures.push('FileBreadcrumb 仍保留可迁移的样式块。')
}

if (!contents.breadcrumb.includes('inline-flex')
  || !contents.breadcrumb.includes('hover:text-(--el-color-primary)')
  || !contents.breadcrumb.includes('px-4 py-3')) {
  failures.push('FileBreadcrumb 缺少 Tailwind 化后的关键布局类。')
}

if (contents.contextMenu.includes('.context-menu-overlay')
  || contents.contextMenu.includes('.context-menu')
  || contents.contextMenu.includes('.menu-item')
  || contents.contextMenu.includes('.item-label')) {
  failures.push('FileContextMenu 仍保留可迁移的主体样式块。')
}

if (!contents.contextMenu.includes('fixed inset-0 z-[9999]')
  || !contents.contextMenu.includes('min-w-[180px]')
  || !contents.contextMenu.includes('flex items-center gap-2')) {
  failures.push('FileContextMenu 缺少 Tailwind 化后的关键布局类。')
}

if (contents.header.includes('.file-header')
  || contents.header.includes('.breadcrumb-section')
  || contents.header.includes('.toolbar-section')
  || contents.header.includes('.toolbar-left')
  || contents.header.includes('.toolbar-center')
  || contents.header.includes('.toolbar-right')
  || contents.header.includes('.filter-bar')
  || contents.header.includes('.filter-items')
  || contents.header.includes('.sort-label')) {
  failures.push('FileHeader 仍保留可迁移的布局样式块。')
}

if (!contents.header.includes('flex flex-col')
  || !contents.header.includes('border-b border-(--el-border-color-lighter)')
  || !contents.header.includes('max-w-[400px]')
  || !contents.header.includes('min-w-[60px]')) {
  failures.push('FileHeader 缺少 Tailwind 化后的关键布局类。')
}

console.log(
  failures.length > 0
    ? `Tailwind refactor batch2 verification failed:\n\n- ${failures.join('\n- ')}`
    : 'Tailwind refactor batch2 verification passed.'
)

if (failures.length > 0) {
  process.exit(1)
}
