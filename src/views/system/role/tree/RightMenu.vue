<template>
  <a-menu class="right-menu">
    <a-menu-item
      v-permission="['system:role:update']"
      :title="t('common.button.edit')"
      @click="onClick('update')"
    >
      <span>{{ t('common.button.edit') }}</span>
    </a-menu-item>
    <a-menu-item
      v-permission="['system:role:delete']"
      class="danger"
      :disabled="data.isSystem"
      :title="data.isSystem ? t('role.message.systemRoleCannotEdit') : t('common.button.delete')"
      @click="onClick('delete')"
    >
      <span>{{ t('common.button.delete') }}</span>
    </a-menu-item>
  </a-menu>
</template>

<script setup lang="ts">
  import type { RoleResp } from '@/apis/system/role'
  import { useI18n } from 'vue-i18n'

  interface Props {
    data: RoleResp
  }

  const props = withDefaults(defineProps<Props>(), {})

  const emit = defineEmits<{
    (e: 'on-menu-item-click', mode: string, data: RoleResp): void
  }>()

  const { t } = useI18n()

  // 点击菜单项
  const onClick = (mode: string) => {
    emit('on-menu-item-click', mode, props.data)
  }
</script>

<style scoped lang="scss">
  :deep(.arco-menu-inner) {
    padding: 4px;

    .arco-menu-item {
      height: 34px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .danger {
      color: rgb(var(--danger-6));
    }

    .danger.arco-menu-disabled {
      color: var(--color-danger-light-3);
    }
  }

  .right-menu {
    box-sizing: border-box;
    width: 120px;
    border: 1px solid var(--color-border-2);
    border-radius: 4px;
    box-shadow: 0 0 10px rgb(0 0 0 / 10%);

    .arrow-icon {
      margin-right: 0;
    }
  }
</style>
