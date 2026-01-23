<template>
  <footer class="art-footer">
    <div class="art-footer__inner">
      <slot>
        <div v-if="footerInfo" class="art-footer__info">{{ footerInfo }}</div>
      </slot>
    </div>
  </footer>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'

defineOptions({ name: 'ArtFooter' })

const appStore = useAppStore()

const footerInfo = computed(() => appStore.getFooterInfo)
</script>

<style lang="scss" scoped>
  .art-footer {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 40px;
    padding: 8px 16px;
    background-color: var(--color-bg-1);
    border-top: 1px solid var(--color-neutral-3);

    &__inner {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    &__info {
      font-size: 13px;
      color: var(--color-text-3);
    }
  }
</style>
