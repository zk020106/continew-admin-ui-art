<template>
  <ElCard
    class="storage-card add-card"
    shadow="hover"
    role="button"
    tabindex="0"
    @click="onAdd"
    @keydown.enter="onAdd"
    @keydown.space.prevent="onAdd"
  >
    <div class="add-content">
      <ElIcon :size="24" class="add-icon"><Plus /></ElIcon>
      <div class="add-text">
{{
        t('storage.createHint', { type: type === 1 ? t('storage.local') : t('storage.object') })
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
    min-height: 162px;
    margin-bottom: 16px;
    cursor: pointer;

    &:hover {
      border-color: var(--el-color-primary);

      .add-text {
        color: var(--el-color-primary);
      }
    }

    :deep(.el-card__body) {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 20px;
    }
  }

  .add-content {
    text-align: center;
  }

  .add-icon {
    color: var(--el-text-color-secondary);
  }

  .add-text {
    margin-top: 12px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
    transition: color 0.3s;
  }
</style>
