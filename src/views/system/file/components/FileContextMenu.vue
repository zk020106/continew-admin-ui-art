<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999]"
        @click="handleClickOutside"
      >
        <div
          class="absolute z-[10000] min-w-[180px] max-w-[240px] rounded-md border border-(--el-border-color-lighter) bg-(--el-bg-color) py-1 shadow-[0_2px_12px_rgb(0_0_0_/_10%)]"
          :style="{ left: `${position.x}px`, top: `${position.y}px` }"
          @click.stop
        >
          <div
            v-for="item in menuItems"
            :key="item.action"
            :class="
              item.divider
                ? 'my-1 h-px bg-(--el-border-color-lighter)'
                : [
                    'flex items-center gap-2 px-4 py-2 text-[13px] text-(--el-text-color-primary) transition-all duration-200',
                    item.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-(--el-fill-color-light) hover:text-(--el-color-primary)',
                    item.danger ? 'text-(--el-color-danger)' : ''
                  ]
            "
            @click="handleItemClick(item)"
          >
            <template v-if="!item.divider">
              <ArtSvgIcon :icon="item.icon" :size="16" />
              <span class="flex-1">{{ item.label }}</span>
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
  position: { x: number, y: number }
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
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.15s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
