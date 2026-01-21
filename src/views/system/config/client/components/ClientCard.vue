<template>
  <ElCard class="client-card">
    <template #header>
      <div class="card-header">
        <div class="card-title">
          <span class="title-text">{{ data.clientId }}</span>
          <ElTag :type="data.status === 'Valid' ? 'success' : 'danger'" size="small">
            {{ data.status === 'Valid' ? t('common.statusEnabled') : t('common.statusDisabled') }}
          </ElTag>
        </div>
        <div class="card-actions">
          <ElDropdown trigger="click" @command="(cmd: string) => handleCommand(cmd, data)">
            <ElButton text circle size="small">
              <ElIcon><MoreFilled /></ElIcon>
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem command="detail">
                  {{ t('common.detail') }}
                </ElDropdownItem>
                <ElDropdownItem command="edit">
                  {{ t('common.button.edit') }}
                </ElDropdownItem>
                <ElDropdownItem command="delete" divided>
                  {{ t('common.button.delete') }}
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </div>
      </div>
      <div class="card-subtitle">{{ data.createTime }}</div>
    </template>

    <div class="card-content">
      <div class="info-row">
        <span class="label">{{ t('system.config.client.clientType') }}:</span>
        <ElTag size="small">{{ getDictLabel(client_type, data.clientType) }}</ElTag>
      </div>
      <div class="info-row">
        <span class="label">{{ t('system.config.client.authType') }}:</span>
        <ElTag size="small">{{ getDictLabel(auth_type, data.authType) }}</ElTag>
      </div>
      <div class="info-row">
        <span class="label">{{ t('system.config.client.isConcurrent') }}:</span>
        <ElTag :type="data.isConcurrent ? 'success' : 'info'" size="small">
          {{ data.isConcurrent ? t('common.true') : t('common.false') }}
        </ElTag>
      </div>
      <div class="info-row">
        <span class="label">{{ t('system.config.client.timeout') }}:</span>
        <span class="value">{{ data.timeout }}{{ t('system.config.client.timeoutUnit') }}</span>
      </div>
    </div>
  </ElCard>

  <AddModal ref="AddModalRef" @save-success="onSaveSuccess" />
  <DetailModal ref="DetailModalRef" />
</template>

<script setup lang="ts">
  import type { ClientResp } from '@/apis/system/type'
  import type { DictItem } from '@/store/modules/dict'
  import { deleteClient } from '@/apis/system/client'
  import AddModal from '../AddModal.vue'
  import DetailModal from '../DetailModal.vue'
  import { MoreFilled } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import { useDict } from '@/hooks'

  interface Props {
    data: ClientResp
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()

  const { t } = useI18n()
  const { client_type, auth_type } = useDict('client_type', 'auth_type')
  const AddModalRef = ref<InstanceType<typeof AddModal>>()
  const DetailModalRef = ref<InstanceType<typeof DetailModal>>()

  // 获取字典标签
  const getDictLabel = (dict: DictItem[], value: string) => {
    const item = dict.find((d) => d.value === value)
    return item?.label || value
  }

  // 删除
  const handleDelete = async (item: ClientResp) => {
    try {
      await ElMessageBox.confirm(
        t('system.config.client.deleteConfirm', { clientId: item.clientId }),
        t('common.tips'),
        { type: 'warning' }
      )
      await deleteClient(item.id)
      ElMessage.success(t('common.success'))
      emit('save-success')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Failed to delete client:', error)
      }
    }
  }

  const handleCommand = (command: string, item: ClientResp) => {
    switch (command) {
      case 'detail':
        DetailModalRef.value?.onDetail(item.id)
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
  .client-card {
    margin-bottom: 16px;

    :deep(.el-card__header) {
      padding: 12px 16px;
      border-bottom: none;
    }

    :deep(.el-card__body) {
      padding: 12px 16px;
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
    font-size: 14px;
    font-weight: 500;
    text-overflow: ellipsis;
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
    min-height: 100px;
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
      color: var(--el-text-color-primary);
    }
  }
</style>
