<template>
  <ElCard class="storage-card" :class="{ 'is-default': data.isDefault }">
    <template #header>
      <div class="card-header">
        <div class="card-title">
          <span class="title-text">{{ data.name }} ({{ data.code }})</span>
          <ElTag v-if="data.isDefault" type="primary" size="small">
            <ElIcon><Check /></ElIcon>
            {{ t('storage.default') }}
          </ElTag>
        </div>
        <div class="card-actions">
          <ElDropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, data)">
            <ElButton text circle size="small">
              <ElIcon><MoreFilled /></ElIcon>
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem
                  :disabled="data.isDefault || data.status === 2"
                  command="setDefault"
                >
                  {{ t('storage.setDefault') }}
                </ElDropdownItem>
                <ElDropdownItem command="edit">{{ t('common.edit') }}</ElDropdownItem>
                <ElDropdownItem :disabled="data.isDefault" command="delete" divided>
                  {{ t('common.delete') }}
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </div>
      </div>
      <div class="card-subtitle">{{ data.createTime }}</div>
    </template>

    <ElSkeleton v-if="loading" :rows="3" animated />
    <template v-else>
      <div class="card-content" :class="{ 'content-large': data.type === 2 }">
        <!-- 本地存储 -->
        <template v-if="data.type === 1">
          <div class="info-row">
            <span class="label">{{ t('storage.path') }}：</span>
            <ElTooltip :content="data.bucketName" placement="top">
              <span class="value ellipsis">{{ data.bucketName }}</span>
            </ElTooltip>
          </div>
          <div class="info-row">
            <span class="label">{{ t('storage.accessPath') }}：</span>
            <ElTooltip :content="data.domain" placement="top">
              <span class="value ellipsis">{{ data.domain }}</span>
            </ElTooltip>
          </div>
        </template>

        <!-- 对象存储 -->
        <template v-else>
          <div class="info-row">
            <span class="label">Endpoint：</span>
            <ElTooltip :content="data.endpoint" placement="top">
              <span class="value ellipsis">{{ data.endpoint }}</span>
            </ElTooltip>
          </div>
          <div class="info-row">
            <span class="label">Bucket：</span>
            <ElTooltip :content="data.bucketName" placement="top">
              <span class="value ellipsis">{{ data.bucketName }}</span>
            </ElTooltip>
          </div>
          <div v-if="data.domain" class="info-row">
            <span class="label">{{ t('storage.customDomain') }}：</span>
            <ElTooltip :content="data.domain" placement="top">
              <span class="value ellipsis">{{ data.domain }}</span>
            </ElTooltip>
          </div>
        </template>

        <div class="info-row">
          <span class="label">{{ t('common.status') }}：</span>
          <ElTag :type="data.status === 1 ? 'success' : 'danger'" size="small">
            {{ data.status === 1 ? t('common.statusEnabled') : t('common.statusDisabled') }}
          </ElTag>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="card-footer">
        <ElSwitch
          :model-value="data.status === 1"
          :disabled="data.isDefault"
          :loading="switchLoading"
          :active-text="t('common.statusEnabled')"
          :inactive-text="t('common.statusDisabled')"
          inline-prompt
          @change="(val) => handleStatusChange(data, !!val)"
        />
      </div>
    </template>
  </ElCard>

  <AddModal ref="AddModalRef" @save-success="onSaveSuccess" />
</template>

<script setup lang="ts">
import type { StorageResp } from '@/apis/system/type'
import { Check, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { deleteStorage, setDefaultStorage, updateStorageStatus } from '@/apis/system/storage'
import AddModal from '../AddModal.vue'

interface Props {
  loading: boolean
  data: StorageResp
}

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { t } = useI18n()
const switchLoading = ref(false)
const AddModalRef = ref<InstanceType<typeof AddModal>>()

const status = ref(props.data.status)

// 更新状态
const handleStatusChange = async (item: StorageResp, enable: boolean) => {
  const typeText = item.type === 1 ? t('storage.local') : t('storage.object')
  const actionText = enable ? t('common.statusEnabled') : t('common.statusDisabled')

  try {
    await ElMessageBox.confirm(
      t('storage.statusConfirm', {
        action: actionText,
        type: typeText,
        name: `${item.name}(${item.code})`
      }),
      t('common.tips'),
      { type: 'warning' }
    )

    switchLoading.value = true
    await updateStorageStatus({ status: enable ? 1 : 2 }, item.id)
    ElMessage.success(t('common.success'))
    emit('save-success')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to update storage status:', error)
    }
  } finally {
    switchLoading.value = false
  }
}

// 设为默认
const handleSetDefault = async (item: StorageResp) => {
  const typeText = item.type === 1 ? t('storage.local') : t('storage.object')

  try {
    await ElMessageBox.confirm(
      t('storage.setDefaultConfirm', { type: typeText, name: `${item.name}(${item.code})` }),
      t('common.tips'),
      { type: 'warning' }
    )
    await setDefaultStorage(item.id)
    ElMessage.success(t('common.success'))
    emit('save-success')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to set default storage:', error)
    }
  }
}

// 删除
const handleDelete = async (item: StorageResp) => {
  try {
    await ElMessageBox.confirm(
      t('storage.deleteConfirm', { name: `${item.name}(${item.code})` }),
      t('common.tips'),
      {
        type: 'warning',
        confirmButtonText: t('common.delete'),
        confirmButtonType: 'danger'
      }
    )
    await deleteStorage(item.id)
    ElMessage.success(t('common.success'))
    emit('save-success')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete storage:', error)
    }
  }
}

const handleCommand = (command: string, item: StorageResp) => {
  switch (command) {
    case 'setDefault':
      handleSetDefault(item)
      break
    case 'edit':
      AddModalRef.value?.onUpdate(item.id)
      break
    case 'delete':
      handleDelete(item)
      break
  }
}

const onSaveSuccess = () => {
  emit('save-success')
}
</script>

<style scoped lang="scss">
  .storage-card {
    min-height: 162px;
    margin-bottom: 16px;

    &.is-default {
      border-color: var(--el-color-success-light-5);
    }

    :deep(.el-card__header) {
      padding: 12px 16px;
      border-bottom: none;
    }

    :deep(.el-card__body) {
      padding: 12px 16px;
    }

    :deep(.el-card__footer) {
      padding: 12px 16px;
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .card-title {
    display: flex;
    flex: 1;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .title-text {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
  }

  .card-subtitle {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .card-actions {
    flex-shrink: 0;
  }

  .card-content {
    min-height: 80px;
  }

  .content-large {
    min-height: 110px;
  }

  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      flex-shrink: 0;
      margin-right: 4px;
      color: var(--el-text-color-secondary);
    }

    .value {
      flex: 1;
      color: var(--el-text-color-primary);
    }

    .ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .card-footer {
    display: flex;
    justify-content: flex-end;
  }
</style>
