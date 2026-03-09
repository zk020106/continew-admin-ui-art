import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const files = {
  userMessage: resolve(process.cwd(), 'src/views/user/message/index.vue'),
  notification: resolve(process.cwd(), 'src/components/core/layouts/art-notification/index.vue'),
  accountLogin: resolve(process.cwd(), 'src/views/auth/login/components/AccountLoginForm.vue'),
  phoneLogin: resolve(process.cwd(), 'src/views/auth/login/components/PhoneLoginForm.vue'),
  emailLogin: resolve(process.cwd(), 'src/views/auth/login/components/EmailLoginForm.vue')
}

const contents = Object.fromEntries(
  Object.entries(files).map(([key, filePath]) => [key, readFileSync(filePath, 'utf8')])
)

const failures = []

if (contents.userMessage.includes('.message-detail') || contents.userMessage.includes('.message-meta')) {
  failures.push('user/message 详情区样式仍保留在 style 块中，尚未转为 Tailwind。')
}

if (!contents.userMessage.includes('flex gap-4')
  || !contents.userMessage.includes('text-[13px]')
  || !contents.userMessage.includes('text-(--el-text-color-secondary)')) {
  failures.push('user/message 详情区缺少 Tailwind 化后的 meta 布局。')
}

for (const [name, content] of Object.entries({
  accountLogin: contents.accountLogin,
  phoneLogin: contents.phoneLogin,
  emailLogin: contents.emailLogin
})) {
  if (content.includes('style="margin-top: 24px"')) {
    failures.push(`${name} 仍保留可替换的内联 margin-top 样式。`)
  }
}

if (contents.notification.includes('.notice-header')
  || contents.notification.includes('.notice-body')
  || contents.notification.includes('.notice-item')
  || contents.notification.includes('.notice-footer')
  || contents.notification.includes('.footer-link')) {
  failures.push('art-notification 主体布局样式仍保留在 style 块中，尚未迁移到 Tailwind。')
}

if (!contents.notification.includes('class="box-border flex h-[46px]')) {
  failures.push('art-notification 缺少 Tailwind 化后的头部布局。')
}

if (failures.length > 0) {
  console.error('Tailwind refactor batch1 verification failed:\n')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('Tailwind refactor batch1 verification passed.')
