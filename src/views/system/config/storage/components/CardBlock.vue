<template>
  <ElCard class="storage-card" :class="{ 'is-default': data.isDefault }">
    <template #header>
      <div class="card-header">
        <div class="card-title">
          <span class="title-text">{{ data.name }} ({{ data.code }})</span>
          <ElTag v-if="data.isDefault" type="primary" size="small" class="default-tag">
            <ElIcon><Check /></ElIcon>
            <span>{{ t('system.config.storage.default') }}</span>
          </ElTag>
        </div>
        <div v-if="showActions" class="card-actions">
          <ElDropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, data)">
            <ElButton text circle size="small">
              <ElIcon><MoreFilled /></ElIcon>
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem
                  v-if="hasAuth('system:storage:setDefault')"
                  :disabled="data.isDefault || data.status === 2"
                  command="setDefault"
                >
                  {{ t('system.config.storage.setDefault') }}
                </ElDropdownItem>
                <ElDropdownItem
                  v-if="hasAuth('system:storage:update')"
                  command="edit"
                >
                  {{ t('common.edit') }}
                </ElDropdownItem>
                <ElDropdownItem
                  v-if="hasAuth('system:storage:delete')"
                  :disabled="data.isDefault"
                  command="delete"
                  divided
                >
                  {{ t('common.delete') }}
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </div>
      </div>
      <div class="card-subtitle">{{ data.createTime }}</div>
    </template>

    <ElSkeleton v-if="loading" :rows="4" animated />
    <template v-else>
      <div class="card-content" :class="{ 'content-large': data.type === 2 }">
        <template v-if="data.type === 1">
          <div class="info-row">
            <span class="label">{{ t('system.config.storage.path') }}：</span>
            <ElTooltip :content="data.bucketName" placement="top">
              <span class="value ellipsis">{{ data.bucketName }}</span>
            </ElTooltip>
          </div>
          <div class="info-row">
            <span class="label">{{ t('system.config.storage.accessPath') }}：</span>
            <ElTooltip :content="data.domain" placement="top">
              <span class="value ellipsis">{{ data.domain }}</span>
            </ElTooltip>
          </div>
        </template>

        <template v-else>
          <div class="info-row access-key-row">
            <span class="label">{{ t('system.config.storage.accessKey') }}：</span>
            <span class="value value-copy">
              <CellCopy :content="data.accessKey" />
            </span>
          </div>
          <div class="info-row">
            <span class="label">{{ t('system.config.storage.endpoint') }}：</span>
            <ElTooltip :content="data.endpoint" placement="top">
              <span class="value ellipsis">{{ data.endpoint }}</span>
            </ElTooltip>
          </div>
          <div class="info-row">
            <span class="label">{{ t('system.config.storage.bucketName') }}：</span>
            <ElTooltip :content="data.bucketName" placement="top">
              <span class="value ellipsis">{{ data.bucketName }}</span>
            </ElTooltip>
          </div>
          <div class="info-row">
            <span class="label">{{ t('system.config.storage.customDomain') }}：</span>
            <ElTooltip :content="data.domain" placement="top">
              <span class="value ellipsis">{{ data.domain || '-' }}</span>
            </ElTooltip>
          </div>
        </template>

        <div class="info-row">
          <span class="label">{{ t('system.config.storage.recycleBinEnabled') }}：</span>
          <span class="value">
            {{ data.recycleBinEnabled ? t('common.statusEnabled') : t('common.statusDisabled') }}
          </span>
        </div>
        <div class="info-row">
          <span class="label">{{ t('system.config.storage.recycleBinPath') }}：</span>
          <span class="value ellipsis">{{ data.recycleBinPath || '-' }}</span>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="card-footer">
        <ElSwitch
          :model-value="data.status === 1"
          :disabled="data.isDefault || !hasAuth('system:storage:updateStatus')"
          :loading="switchLoading"
          :active-text="t('common.statusEnabled')"
          :inactive-text="t('common.statusDisabled')"
          inline-prompt
          @change="(val) => handleStatusChange(data, !!val)"
        />
      </div>
    </template>
  </ElCard>

  <AddModal ref="AddModalRef" @save-success="emit('save-success')" />
</template>

<script setup lang="ts">
import type { StorageResp } from '@/apis/system/type'
import { Check, MoreFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { deleteStorage, setDefaultStorage, updateStorageStatus } from '@/apis/system/storage'
import { CellCopy } from '@/components/base/CellCopy'
import { useAuth } from '@/hooks'
import AddModal from '../AddModal.vue'

interface Props {
  loading: boolean
  data: StorageResp
}

withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { t } = useI18n()
const { hasAuth } = useAuth()
const switchLoading = ref(false)
const AddModalRef = ref<InstanceType<typeof AddModal>>()
const showActions = computed(
  () =>
    hasAuth('system:storage:setDefault')
    || hasAuth('system:storage:update')
    || hasAuth('system:storage:delete')
)

const getStorageTypeText = (item: StorageResp) => {
  return item.type === 1
    ? t('system.config.storage.localStorage')
    : t('system.config.storage.objectStorage')
}

const handleStatusChange = async (item: StorageResp, enable: boolean) => {
  const actionText = enable ? t('common.statusEnabled') : t('common.statusDisabled')
  try {
    await ElMessageBox.confirm(
      t('system.config.storage.statusConfirm', {
        action: actionText,
        type: getStorageTypeText(item),
        name: item.name,
        code: item.code
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

const handleSetDefault = async (item: StorageResp) => {
  try {
    await ElMessageBox.confirm(
      t('system.config.storage.setDefaultConfirm', {
        type: getStorageTypeText(item),
        name: item.name,
        code: item.code
      }),
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

const handleDelete = async (item: StorageResp) => {
  try {
    await ElMessageBox.confirm(
      t('system.config.storage.deleteConfirm', { name: `${item.name}(${item.code})` }),
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
</script>

<style scoped lang="scss">
  .storage-card {
    min-height: 138px;
    margin-bottom: 16px;
    border-radius: 10px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary-light-7);
      box-shadow: 0 8px 20px rgb(0 0 0 / 7%);
      transform: translateY(-1px);
    }

    &.is-default {
      background: linear-gradient(180deg, rgb(64 158 255 / 5%), transparent 35%);
      border-color: var(--el-color-primary-light-5);
    }

    :deep(.el-card__header) {
      padding: 10px 14px 8px;
      border-bottom: none;
    }

    :deep(.el-card__body) {
      padding: 8px 14px 10px;
    }

    :deep(.el-card__footer) {
      padding: 8px 14px 10px;
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }

  .card-header {
    display: flex;
    gap: 8px;
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

  .default-tag {
    flex-shrink: 0;
    white-space: nowrap;

    :deep(.el-tag__content) {
      display: inline-flex;
      gap: 4px;
      align-items: center;
    }
  }

  .title-text {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
  }

  .card-subtitle {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .card-content {
    min-height: 94px;
  }

  .info-row {
    display: flex;
    gap: 6px;
    align-items: flex-start;
    margin-bottom: 6px;
    font-size: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .label {
    flex-shrink: 0;
    width: 76px;
    color: var(--el-text-color-secondary);
  }

  .value {
    flex: 1;
    color: var(--el-text-color-primary);
  }

  .access-key-row {
    align-items: center;
  }

  .value-copy {
    :deep(.cell-copy-wrapper) {
      display: inline-flex;
      align-items: center;
      max-width: 100%;
    }

    :deep(.cell-copy-content) {
      max-width: 170px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-footer {
    display: flex;
    justify-content: flex-end;
  }

  @media (width <= 768px) {
    .card-content {
      min-height: auto;
    }

    .label {
      width: 70px;
    }
  }
</style>
