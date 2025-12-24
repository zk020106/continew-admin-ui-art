<template>
  <ElSelect
    :model-value="modelValue"
    :placeholder="placeholder"
    :loading="loading"
    filterable
    clearable
    :disabled="disabled"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #prefix>
      <ArtSvgIcon icon="ri:file-code-line" style="font-size: 16px" />
    </template>
    <ElOptionGroup v-for="(items, group) in groupedOptions" :key="group" :label="group">
      <ElOption v-for="item in items" :key="item.value" :label="item.label" :value="item.value">
        <div class="component-option">
          <ArtSvgIcon icon="ri:file-vue-line" style="margin-right: 8px; font-size: 14px" />
          <span class="path">{{ item.value }}</span>
          <span class="desc">{{ item.desc }}</span>
        </div>
      </ElOption>
    </ElOptionGroup>
    <template #empty>
      <div class="component-empty">
        <ArtSvgIcon icon="ri:folder-open-line" style="margin-bottom: 8px; font-size: 32px" />
        <p>{{ t('components.component.noComponents') }}</p>
      </div>
    </template>
  </ElSelect>
</template>

<script setup lang="ts">
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'CaComponentPicker' })

  const { t } = useI18n()

  interface ComponentOption {
    value: string
    label: string
    desc: string
  }

  interface Props {
    modelValue: string
    placeholder?: string
    disabled?: boolean
  }

  withDefaults(defineProps<Props>(), {
    placeholder: '',
    disabled: false
  })

  defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const loading = ref(false)
  const componentOptions = ref<ComponentOption[]>([])

  // 按模块分组
  const groupedOptions = computed(() => {
    const groups: Record<string, ComponentOption[]> = {}
    componentOptions.value.forEach((item) => {
      const parts = item.value.split('/')
      const group = parts[1] || 'root'
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(item)
    })
    return groups
  })

  // 扫描 views 目录下的组件
  const scanComponents = async () => {
    loading.value = true
    try {
      const modules = import.meta.glob('@/views/**/*.vue')
      const options: ComponentOption[] = []

      for (const path in modules) {
        // 处理路径分隔符
        const normalizedPath = path.replace(/\\/g, '/')
        // 提取 views 之后的路径（支持 @ 别名和绝对路径）
        const viewsPathMatch = normalizedPath.match(/\/src\/views\/(.+)\.vue$/)
        if (!viewsPathMatch) continue
        const relativePath = viewsPathMatch[1]
        const componentPath = relativePath // 不加 / 前缀

        // 生成描述（从目录名推断）
        const parts = componentPath.split('/').filter(Boolean)
        const lastPart = parts[parts.length - 1] || ''
        const moduleName = parts[1] || ''

        // 跳过子组件（模块目录下的 modules、components、tree 等子目录）
        if (
          lastPart.startsWith('modules') ||
          lastPart.startsWith('components') ||
          lastPart.startsWith('tree') ||
          lastPart.startsWith('widgets')
        ) {
          continue
        }

        // 排除抽屉、弹窗等非页面组件
        const excludePatterns = [
          'AddDrawer',
          'DetailDrawer',
          'ImportDrawer',
          'Modal',
          'UpdateModal'
        ]
        if (excludePatterns.some((pattern) => lastPart.includes(pattern))) {
          continue
        }

        // 生成描述
        const descMap: Record<string, string> = {
          system: t('menus.system.index'),
          dashboard: t('menus.dashboard.title'),
          result: t('menus.result.title'),
          exception: t('menus.exception.title'),
          auth: t('menus.login.title'),
          outside: t('menus.outside.title'),
          menu: t('menus.system.menu'),
          role: t('menus.system.role'),
          user: t('menus.system.user'),
          'user-center': t('menus.system.user-center')
        }
        const desc = descMap[moduleName] || moduleName

        options.push({
          value: componentPath,
          label: componentPath,
          desc: desc
        })
      }

      componentOptions.value = options.sort((a, b) => a.value.localeCompare(b.value))
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    scanComponents()
  })
</script>

<style scoped lang="scss">
  .component-option {
    display: flex;
    align-items: center;
    width: 100%;

    .path {
      flex: 1;
      font-family: var(--el-font-family);
      font-size: 13px;
    }

    .desc {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .component-empty {
    padding: 20px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }
</style>
