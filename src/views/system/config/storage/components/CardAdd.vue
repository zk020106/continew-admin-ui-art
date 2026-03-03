<template>
  <ElCard
    class="storage-card add-card"
    shadow="never"
    role="button"
    tabindex="0"
    @click="onAdd"
    @keydown.enter="onAdd"
    @keydown.space.prevent="onAdd"
  >
    <div class="add-content">
      <div class="add-icon-wrap">
        <ElIcon :size="20" class="add-icon"><Plus /></ElIcon>
      </div>
      <div class="add-text">
        {{
          t('system.config.storage.createHint', {
            type:
              type === 1
                ? t('system.config.storage.localStorage')
                : t('system.config.storage.objectStorage'),
          })
        }}
      </div>
    </div>
  </ElCard>

  <AddModal ref="AddModalRef" @save-success="onSaveSuccess" />
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import AddModal from '../AddModal.vue'

interface Props {
  type: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { t } = useI18n()
const AddModalRef = ref<InstanceType<typeof AddModal>>()

const onAdd = () => {
  AddModalRef.value?.onAdd(props.type)
}

const onSaveSuccess = () => {
  emit('save-success')
}
</script>

<style scoped lang="scss">
  .storage-card {
    min-height: 138px;
    margin-bottom: 16px;
    cursor: pointer;
    border: 1px dashed var(--el-border-color);
    border-radius: 10px;
    background:
      radial-gradient(circle at 10% 0%, rgb(64 158 255 / 7%), transparent 35%),
      var(--el-bg-color);
    transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: 0 8px 20px rgb(0 0 0 / 7%);
      transform: translateY(-1px);

      .add-text {
        color: var(--el-color-primary);
      }

      .add-icon-wrap {
        border-color: var(--el-color-primary-light-7);
        background: var(--el-color-primary-light-9);
      }
    }

    :deep(.el-card__body) {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 14px;
    }
  }

  .add-content {
    text-align: center;
  }

  .add-icon-wrap {
    width: 36px;
    height: 36px;
    margin: 0 auto;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .add-icon {
    color: var(--el-text-color-secondary);
  }

  .add-text {
    margin-top: 10px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    transition: color 0.3s;
  }
</style>
