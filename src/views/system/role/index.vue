<template>
  <CaPageLayout>
    <template #left>
      <RoleTree @node-click="handleSelectRole" />
    </template>

    <div class="role-content">
      <!-- 标签页 -->
      <div class="role-tabs">
        <ElTabs v-model="activeTab" class="role-tabs-container">
          <ElTabPane :label="t('role.tab.permission')" name="1">
            <template #label>
              <span class="tab-label">{{ t('role.tab.permission') }}</span>
            </template>
          </ElTabPane>
          <ElTabPane :label="t('role.tab.user')" name="2">
            <template #label>
              <span class="tab-label">{{ t('role.tab.user') }}</span>
            </template>
          </ElTabPane>
        </ElTabs>
      </div>

      <!-- 内容区域 -->
      <div class="tab-content">
        <Permission v-if="activeTab === '1'" :role="role" />
        <RoleUser v-if="activeTab === '2'" :role="role" />
      </div>
    </div>
  </CaPageLayout>
</template>

<script setup lang="ts">
  import { RoleResp } from '@/apis'
  import { ElTabPane, ElTabs } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import Permission from './components/Permission.vue'
  import RoleUser from './components/RoleUser.vue'
  import RoleTree from './tree/index.vue'

  defineOptions({ name: 'SystemRole' })

  const { t } = useI18n()
  const activeTab = ref('1')
  const role = ref<RoleResp>({
    id: '',
    name: '',
    code: '',
    sort: 0,
    description: '',
    dataScope: 0,
    isSystem: false,
    createUserString: '',
    createTime: '',
    updateUserString: '',
    updateTime: '',
    disabled: false
  })

  // 根据选中角色查询
  const handleSelectRole = (data: RoleResp) => {
    role.value = data
  }
</script>

<style scoped lang="scss">
  .role-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--el-bg-color);
    border-radius: 4px;
  }

  .role-tabs {
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
    padding: var(--page-content-padding);
    overflow: hidden;
  }
</style>
