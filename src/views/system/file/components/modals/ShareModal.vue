<template>
  <el-dialog
    v-model="visible"
    title="分享文件"
    width="520px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="file" class="share-content">
      <!-- 文件信息 -->
      <div class="file-info">
        <div class="file-icon">
          <ArtSvgIcon
            :icon="getFileIconByType(file).icon"
            :size="40"
            :style="{ color: file.type === 0 ? undefined : getFileIconByType(file).color }"
          />
        </div>
        <div class="file-details">
          <div class="file-name">{{ file.originalName }}</div>
          <div class="file-meta">
            {{ file.type === 0 ? '文件夹' : formatSize(file.size) }}
          </div>
        </div>
      </div>

      <!-- 分享选项 -->
      <el-tabs v-model="activeTab" class="share-tabs">
        <!-- 链接分享 -->
        <el-tab-pane label="链接分享" name="link">
          <div class="share-section">
            <!-- 分享链接 -->
            <div class="share-link-box">
              <div class="link-input-wrapper">
                <el-input v-model="shareUrl" readonly placeholder="生成分享链接后显示">
                  <template #append>
                    <el-button :disabled="!shareUrl" @click="copyShareLink">
                      <ArtSvgIcon icon="ri:file-copy-line" :size="16" />
                    </el-button>
                  </template>
                </el-input>
              </div>
              <el-button
                v-if="!shareUrl"
                type="primary"
                :loading="generating"
                @click="generateShareLink"
              >
                <ArtSvgIcon icon="ri:link" :size="16" />
                生成分享链接
              </el-button>
            </div>

            <!-- 分享设置 -->
            <div v-if="shareUrl" class="share-settings">
              <div class="setting-item">
                <span class="setting-label">访问密码</span>
                <el-switch v-model="needPassword" @change="handlePasswordChange" />
              </div>

              <div v-if="needPassword" class="setting-item setting-item-indent">
                <el-input
                  v-model="password"
                  placeholder="设置访问密码"
                  maxlength="6"
                  show-word-limit
                  style="width: 200px"
                >
                  <template #append>
                    <el-button @click="randomPassword">随机</el-button>
                  </template>
                </el-input>
              </div>

              <div class="setting-item">
                <span class="setting-label">有效期</span>
                <el-select v-model="expireDays" placeholder="请选择" style="width: 150px">
                  <el-option label="永久有效" :value="0" />
                  <el-option label="1 天" :value="1" />
                  <el-option label="7 天" :value="7" />
                  <el-option label="30 天" :value="30" />
                </el-select>
              </div>

              <div v-if="expireDays > 0" class="setting-item setting-item-indent">
                <span class="setting-value"> 链接将于 {{ formatDate(expireDays) }} 后失效 </span>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 用户分享 -->
        <el-tab-pane label="发送给用户" name="user">
          <div class="share-section">
            <el-select
              v-model="selectedUsers"
              multiple
              filterable
              placeholder="选择用户"
              style="width: 100%"
            >
              <el-option
                v-for="user in users"
                :key="user.id"
                :label="user.nickname"
                :value="user.id"
              >
                <div class="user-option">
                  <el-avatar :size="24" :src="user.avatar" />
                  <span>{{ user.nickname }}</span>
                </div>
              </el-option>
            </el-select>

            <div class="share-message">
              <el-input
                v-model="message"
                type="textarea"
                placeholder="添加留言（可选）"
                :rows="3"
                maxlength="200"
                show-word-limit
              />
            </div>

            <el-button type="primary" :disabled="selectedUsers.length === 0" @click="sendToUsers">
              <ArtSvgIcon icon="ri:send-plane-fill" :size="16" />
              发送
            </el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FileItem } from '@/apis/system/file'
import { ElMessage } from 'element-plus'
import { getFileIconByType } from '../../utils/fileIcons'

interface User {
  id: string
  nickname: string
  avatar: string
}

const props = defineProps<{
  modelValue: boolean
  file: FileItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', visible: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const activeTab = ref('link')
const shareUrl = ref('')
const generating = ref(false)
const needPassword = ref(false)
const password = ref('')
const expireDays = ref(0)
const selectedUsers = ref<string[]>([])
const message = ref('')

// 模拟用户数据
const users = ref<User[]>([
  { id: '1', nickname: '张三', avatar: '' },
  { id: '2', nickname: '李四', avatar: '' },
  { id: '3', nickname: '王五', avatar: '' }
])

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes === 0 || !bytes) return '-'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

// 格式化日期
const formatDate = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 生成分享链接
const generateShareLink = async () => {
  generating.value = true
  try {
    // TODO: 调用 API 生成分享链接
    // const res = await fileApi.createShare({
    //   fileId: props.file?.id,
    //   needPassword: needPassword.value,
    //   password: password.value,
    //   expireDays: expireDays.value
    // })
    // shareUrl.value = res.shareUrl

    // 临时模拟
    await new Promise((resolve) => setTimeout(resolve, 1000))
    shareUrl.value = `https://example.com/share/${Date.now()}`
    ElMessage.success('分享链接生成成功')
  } catch (error: any) {
    ElMessage.error(error.message || '生成分享链接失败')
  } finally {
    generating.value = false
  }
}

// 复制分享链接
const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    ElMessage.success('链接已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 生成随机密码
const randomPassword = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  password.value = Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

// 密码开关变化
const handlePasswordChange = (enabled: string | number | boolean) => {
  if (!!enabled && !password.value) {
    randomPassword()
  }
}

// 发送给用户
const sendToUsers = async () => {
  try {
    // TODO: 调用 API 发送给用户
    ElMessage.success(`已发送给 ${selectedUsers.value.length} 个用户`)
  } catch (error: any) {
    ElMessage.error(error.message || '发送失败')
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  // 重置状态
  shareUrl.value = ''
  needPassword.value = false
  password.value = ''
  expireDays.value = 0
  selectedUsers.value = []
  message.value = ''
}
</script>

<style lang="scss" scoped>
  .share-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .file-info {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 16px;
    background: var(--el-fill-color-light);
    border-radius: 8px;
  }

  .file-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: var(--el-bg-color);
    border-radius: 8px;
  }

  .file-details {
    flex: 1;
    min-width: 0;
  }

  .file-name {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }

  .file-meta {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .share-tabs {
    :deep(.el-tabs__content) {
      padding-top: 16px;
    }
  }

  .share-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .share-link-box {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .link-input-wrapper {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .share-settings {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
  }

  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .setting-item-indent {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
    padding-left: 20px;
  }

  .setting-label {
    font-size: 13px;
    color: var(--el-text-color-primary);
  }

  .setting-value {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .share-message {
    :deep(.el-textarea__inner) {
      resize: none;
    }
  }

  .user-option {
    display: flex;
    gap: 8px;
    align-items: center;
  }
</style>
