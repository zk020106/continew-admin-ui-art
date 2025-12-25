<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="visible" class="context-menu-overlay" @click="handleClickOutside">
        <div
          class="context-menu"
          :style="{ left: position.x + 'px', top: position.y + 'px' }"
          @click.stop
        >
          <div
            v-for="item in menuItems"
            :key="item.action"
            :class="[
              'menu-item',
              {
                'is-divider': item.divider,
                'is-disabled': item.disabled,
                'is-danger': item.danger
              }
            ]"
            @click="handleItemClick(item)"
          >
            <template v-if="!item.divider">
              <ArtSvgIcon :icon="item.icon" :size="16" />
              <span class="item-label">{{ item.label }}</span>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
  import type { ContextMenuAction, ContextMenuItem } from '../types'

  defineProps<{
    visible: boolean
    position: { x: number; y: number }
    menuItems: ContextMenuItem[]
  }>()

  const emit = defineEmits<{
    (e: 'update:visible', visible: boolean): void
    (e: 'action', action: ContextMenuAction): void
  }>()

  const handleClickOutside = () => {
    emit('update:visible', false)
  }

  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled || item.divider) return
    emit('action', item.action)
    emit('update:visible', false)
  }
</script>

<style lang="scss" scoped>
  .context-menu-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
  }

  .context-menu {
    position: absolute;
    z-index: 10000;
    min-width: 180px;
    max-width: 240px;
    padding: 4px 0;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    box-shadow: 0 2px 12px rgb(0 0 0 / 10%);
  }

  .menu-item {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 16px;
    font-size: 13px;
    color: var(--el-text-color-primary);
    cursor: pointer;
    transition: all 0.2s;

    &:not(.is-divider, .is-disabled):hover {
      color: var(--el-color-primary);
      background: var(--el-fill-color-light);
    }

    &.is-disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    &.is-danger {
      color: var(--el-color-danger);
    }

    &.is-divider {
      height: 1px;
      padding: 0;
      margin: 4px 0;
      background: var(--el-border-color-lighter);
    }

    .item-label {
      flex: 1;
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
