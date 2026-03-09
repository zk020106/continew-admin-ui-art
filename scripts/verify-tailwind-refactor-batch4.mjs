import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const files = {
  detailPanel: resolve(process.cwd(), 'src/views/system/file/components/FileDetailPanel.vue'),
  shareModal: resolve(process.cwd(), 'src/views/system/file/components/modals/ShareModal.vue')
}

const contents = Object.fromEntries(
  Object.entries(files).map(([key, filePath]) => [key, readFileSync(filePath, 'utf8')])
)

const failures = []
const hasAllClasses = (content, classNames) => classNames.every((className) => content.includes(className))

if (contents.detailPanel.includes('.file-detail-panel')
  || contents.detailPanel.includes('.panel-close')
  || contents.detailPanel.includes('.panel-content')
  || contents.detailPanel.includes('.preview-section')
  || contents.detailPanel.includes('.preview-icon')
  || contents.detailPanel.includes('.preview-name')
  || contents.detailPanel.includes('.preview-type')
  || contents.detailPanel.includes('.info-list')
  || contents.detailPanel.includes('.info-item')
  || contents.detailPanel.includes('.info-label')
  || contents.detailPanel.includes('.info-value')
  || contents.detailPanel.includes('.action-section')
  || contents.detailPanel.includes('.panel-empty')) {
  failures.push('FileDetailPanel 仍保留可迁移的主体布局样式块。')
}

if (!hasAllClasses(contents.detailPanel, [
  'flex h-full flex-col border-l',
  'absolute right-2 top-2',
  'flex h-full flex-col gap-5 overflow-y-auto p-4',
  'mb-3 flex size-20',
  'flex flex-col gap-2 border-t border-(--el-border-color-lighter) pt-4'
])) {
  failures.push('FileDetailPanel 缺少 Tailwind 化后的关键布局类。')
}

if (contents.shareModal.includes('.share-content')
  || contents.shareModal.includes('.file-info')
  || contents.shareModal.includes('.file-icon')
  || contents.shareModal.includes('.file-details')
  || contents.shareModal.includes('.file-name')
  || contents.shareModal.includes('.file-meta')
  || contents.shareModal.includes('.share-section')
  || contents.shareModal.includes('.share-link-box')
  || contents.shareModal.includes('.link-input-wrapper')
  || contents.shareModal.includes('.share-settings')
  || contents.shareModal.includes('.setting-item')
  || contents.shareModal.includes('.setting-item-indent')
  || contents.shareModal.includes('.setting-label')
  || contents.shareModal.includes('.setting-value')
  || contents.shareModal.includes('.user-option')) {
  failures.push('ShareModal 仍保留可迁移的主体布局样式块。')
}

if (!hasAllClasses(contents.shareModal, [
  'flex flex-col gap-5',
  'flex items-center gap-3 rounded-lg',
  'flex flex-col gap-4',
  'rounded-md bg-(--el-fill-color-lighter) p-4',
  'flex items-center gap-2'
])) {
  failures.push('ShareModal 缺少 Tailwind 化后的关键布局类。')
}

console.log(
  failures.length > 0
    ? `Tailwind refactor batch4 verification failed:\n\n- ${failures.join('\n- ')}`
    : 'Tailwind refactor batch4 verification passed.'
)

if (failures.length > 0) {
  process.exit(1)
}
