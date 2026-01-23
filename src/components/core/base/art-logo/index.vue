<!-- 系统logo -->
<template>
  <div class="flex-cc">
    <img :style="logoStyle" src="/logo.svg" alt="logo" class="w-full h-full" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ArtLogo' })

const props = withDefaults(defineProps<Props>(), {
  size: 36
})

interface Props {
  /** logo 大小 */
  size?: number | string
}

const logoStyle = computed(() => ({ width: `${props.size}px` }))
</script>
