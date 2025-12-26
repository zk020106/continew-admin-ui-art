<template>
  <div class="file-breadcrumb">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>
        <span class="breadcrumb-root" @click="$emit('navigate', '/')">
          <ArtSvgIcon icon="ri:home-4-line" /> {{ t('file.breadcrumb.root') }}
        </span>
      </el-breadcrumb-item>
      <template v-for="(item, index) in pathList" :key="index">
        <el-breadcrumb-item>
          <span
            :class="{
              'breadcrumb-current': index === pathList.length - 1,
              'breadcrumb-link': index < pathList.length - 1
            }"
            @click="index < pathList.length - 1 && $emit('navigate', item.path)"
          >
            {{ item.name }}
          </span>
        </el-breadcrumb-item>
      </template>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  interface BreadcrumbItem {
    name: string
    path: string
  }

  const props = defineProps<{
    path: string
  }>()

  defineEmits<{
    (e: 'navigate', path: string): void
  }>()

  // 将路径转换为面包屑列表
  const getPathList = (currentPath: string): BreadcrumbItem[] => {
    if (!currentPath || currentPath === '/') return []

    const parts = currentPath.split('/').filter(Boolean)
    let path = ''
    const result: BreadcrumbItem[] = []

    parts.forEach((name) => {
      path += `/${name}`
      result.push({ name, path })
    })

    return result
  }

  // 使用计算属性
  const pathList = computed(() => getPathList(props.path))
</script>

<style lang="scss" scoped>
  .file-breadcrumb {
    padding: 12px 16px;
    // background: var(--el-fill-color-light);
    // border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .breadcrumb-root {
    display: flex;
    gap: 4px;
    align-items: center;
    color: var(--el-text-color-primary);
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .breadcrumb-link {
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .breadcrumb-current {
    color: var(--el-text-color-regular);
    cursor: default;
  }
</style>
