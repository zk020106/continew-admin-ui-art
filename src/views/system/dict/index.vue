<template>
  <CaPageLayout>
    <template #left>
      <DictTree @node-click="handleSelectDict" />
    </template>

    <div class="dict-content">
      <!-- 内容区域 -->
      <div class="tab-content">
        <DictItem v-if="activeTab === '1'" :dict="dict" />
      </div>
    </div>
  </CaPageLayout>
</template>

<script setup lang="ts">
  import { DictResp } from '@/apis'
  import DictItem from './components/DictItem.vue'
  import DictTree from './tree/index.vue'

  defineOptions({ name: 'SystemDict' })

  const activeTab = ref('1')
  const dict = ref<DictResp>({
    id: '',
    name: '',
    code: '',
    isSystem: false,
    description: '',
    createUserString: '',
    createTime: '',
    updateUserString: '',
    updateTime: ''
  })

  // 根据选中字典查询
  const handleSelectDict = (data: DictResp) => {
    dict.value = data
  }
</script>

<style scoped lang="scss">
  .dict-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--el-bg-color);
    border-radius: 4px;
  }

  .dict-tabs {
    flex-shrink: 0;
    padding: 0 16px;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-lighter);

    &-container {
      :deep(.el-tabs__header) {
        margin: 0;

        .el-tabs__nav-wrap {
          padding: 0;
        }

        .el-tabs__item {
          height: 48px;
          padding: 0 20px;
          font-weight: 500;
          line-height: 48px;

          &.is-active {
            font-weight: 600;
            color: var(--el-color-primary);
          }
        }
      }

      :deep(.el-tabs__content) {
        display: none;
      }
    }
  }

  .tab-label {
    font-size: 14px;
  }

  .tab-content {
    flex: 1;
    overflow: hidden;
  }
</style>
