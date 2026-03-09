<template>
  <div class="px-4 py-3">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item>
        <span
          class="inline-flex cursor-pointer items-center gap-1 text-(--el-text-color-primary) hover:text-(--el-color-primary)"
          @click="$emit('navigate', '/')"
        >
          <ArtSvgIcon icon="ri:home-4-line" /> {{ t('file.breadcrumb.root') }}
        </span>
      </el-breadcrumb-item>
      <template v-for="(item, index) in pathList" :key="index">
        <el-breadcrumb-item>
          <span
            :class="
              index === pathList.length - 1
                ? 'cursor-default text-(--el-text-color-regular)'
                : 'cursor-pointer hover:text-(--el-color-primary)'
            "
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

const props = defineProps<{
  path: string
}>()

defineEmits<{
  (e: 'navigate', path: string): void
}>()

const { t } = useI18n()

interface BreadcrumbItem {
  name: string
  path: string
}

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
