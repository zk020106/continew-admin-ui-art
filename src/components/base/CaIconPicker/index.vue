<template>
  <ElPopover
    placement="bottom-start"
    :width="460"
    trigger="click"
    popper-class="ca-icon-picker-popover"
  >
    <template #reference>
      <ElInput
        :model-value="modelValue"
        :placeholder="placeholder"
        readonly
        clearable
        @clear="$emit('update:modelValue', '')"
      >
        <template #prefix>
          <ArtSvgIcon v-if="modelValue" :icon="modelValue" style="font-size: 16px" />
          <ArtSvgIcon v-else icon="ri:add-line" style="font-size: 16px; color: #ccc" />
        </template>
        <template #suffix>
          <ElIcon class="el-input__icon">
            <component :is="visible ? ArrowUp : ArrowDown" />
          </ElIcon>
        </template>
      </ElInput>
    </template>

    <div class="ca-icon-picker">
      <!-- 搜索 -->
      <div class="icon-search">
        <ElInput
          v-model="searchKeyword"
          :placeholder="t('components.iconPicker.searchPlaceholder')"
          :prefix-icon="Search"
          clearable
          size="small"
        />
      </div>

      <!-- Tab 切换 -->
      <ElTabs v-model="activeTab" class="icon-tabs">
        <ElTabPane :label="t('components.icon.recent')" name="recent">
          <div v-if="recentIcons.length === 0" class="icon-empty">
            {{ t('components.icon.noRecent') }}
          </div>
          <div v-else class="icon-grid">
            <ElTooltip v-for="icon in recentIcons" :key="icon" :content="icon" placement="top">
              <div
                class="icon-item"
                :class="{ active: icon === modelValue }"
                @click="selectIcon(icon)"
              >
                <ArtSvgIcon :icon="icon" />
              </div>
            </ElTooltip>
          </div>
        </ElTabPane>

        <ElTabPane :label="t('components.icon.local')" name="local">
          <div v-if="filteredLocalIcons.length === 0" class="icon-empty">
            {{ t('components.iconPicker.noResult') }}
          </div>
          <div v-else class="icon-grid">
            <ElTooltip
              v-for="icon in filteredLocalIcons"
              :key="icon"
              :content="icon"
              placement="top"
            >
              <div
                class="icon-item"
                :class="{ active: icon === modelValue }"
                @click="selectIcon(icon)"
              >
                <ArtSvgIcon :icon="icon" />
              </div>
            </ElTooltip>
          </div>
        </ElTabPane>

        <ElTabPane :label="t('components.icon.online')" name="online">
          <div v-if="filteredOnlineIcons.length === 0" class="icon-empty">
            {{ t('components.iconPicker.noResult') }}
          </div>
          <div v-else class="icon-grid">
            <ElTooltip
              v-for="icon in filteredOnlineIcons"
              :key="icon"
              :content="icon"
              placement="top"
            >
              <div
                class="icon-item"
                :class="{ active: icon === modelValue }"
                @click="selectIcon(icon)"
              >
                <ArtSvgIcon :icon="icon" />
              </div>
            </ElTooltip>
          </div>
        </ElTabPane>
      </ElTabs>
    </div>
  </ElPopover>
</template>

<script setup lang="ts">
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { ArrowDown, ArrowUp, Search } from '@element-plus/icons-vue'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'CaIconPicker' })

  const { t } = useI18n()

  interface Props {
    modelValue: string
    placeholder?: string
  }

  withDefaults(defineProps<Props>(), {
    placeholder: ''
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const visible = ref(false)
  const activeTab = ref('local')
  const searchKeyword = ref('')

  // 本地 SVG 图标
  const localIcons = import.meta.glob<string>('@/assets/images/icons/*.svg', {
    eager: true,
    import: 'default'
  })

  const localIconList = computed(() =>
    Object.keys(localIcons).map((path) => path.split('/').pop()?.replace('.svg', '') || '')
  )

  // 在线图标（Iconify 预设常用图标）
  const onlineIconList = [
    'ri:home-line',
    'ri:home-fill',
    'ri:dashboard-line',
    'ri:dashboard-fill',
    'ri:settings-line',
    'ri:settings-fill',
    'ri:user-line',
    'ri:user-fill',
    'ri:menu-line',
    'ri:menu-fill',
    'ri:list-check',
    'ri:add-line',
    'ri:edit-line',
    'ri:delete-bin-line',
    'ri:eye-line',
    'ri:search-line',
    'ri:refresh-line',
    'ri:download-line',
    'ri:upload-line',
    'ri:export-line',
    'ri:import-line',
    'ri:file-line',
    'ri:file-copy-line',
    'ri:folder-line',
    'ri:folder-open-line',
    'ri:database-line',
    'ri:server-line',
    'ri:lock-line',
    'ri:unlock-line',
    'ri:key-line',
    'ri:shield-line',
    'ri:safe-line',
    'ri:notification-line',
    'ri:bell-line',
    'ri:message-line',
    'ri:mail-line',
    'ri:calendar-line',
    'ri:time-line',
    'ri:arrow-left-line',
    'ri:arrow-right-line',
    'ri:arrow-up-line',
    'ri:arrow-down-line',
    'ri:external-link-line',
    'ri:link',
    'ri:share-line',
    'ri:check-line',
    'ri:close-line',
    'ri:checkbox-circle-line',
    'ri:checkbox-line',
    'ri:radio-button-line',
    'ri:toggle-line',
    'ri:sort-asc',
    'ri:sort-desc',
    'ri:filter-line',
    'ri:filter-off-line',
    'ri:login-box-line',
    'ri:logout-box-line',
    'ri:restart-line'
  ]

  // 最近使用的图标（从 localStorage 读取）
  const recentIcons = ref<string[]>([])

  // 过滤后的图标列表
  const filteredLocalIcons = computed(() => {
    if (!searchKeyword.value) return localIconList.value
    return localIconList.value.filter((icon) =>
      icon.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  })

  const filteredOnlineIcons = computed(() => {
    if (!searchKeyword.value) return onlineIconList
    return onlineIconList.filter((icon) =>
      icon.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  })

  // 加载最近使用的图标
  const loadRecentIcons = () => {
    try {
      const stored = localStorage.getItem('ca_icon_picker_recent')
      if (stored) {
        recentIcons.value = JSON.parse(stored)
      }
    } catch {
      recentIcons.value = []
    }
  }

  // 保存最近使用的图标
  const saveRecentIcons = () => {
    try {
      localStorage.setItem('ca_icon_picker_recent', JSON.stringify(recentIcons.value.slice(0, 20)))
    } catch {
      // 忽略存储失败
    }
  }

  // 选择图标
  const selectIcon = (icon: string) => {
    emit('update:modelValue', icon)

    // 添加到最近使用
    const index = recentIcons.value.indexOf(icon)
    if (index > -1) {
      recentIcons.value.splice(index, 1)
    }
    recentIcons.value.unshift(icon)
    if (recentIcons.value.length > 20) {
      recentIcons.value = recentIcons.value.slice(0, 20)
    }
    saveRecentIcons()

    visible.value = false
    searchKeyword.value = ''
  }

  onMounted(() => {
    loadRecentIcons()
  })
</script>

<style scoped lang="scss">
  .ca-icon-picker {
    .icon-search {
      margin-bottom: 12px;
    }

    .icon-tabs {
      :deep(.el-tabs__header) {
        margin-bottom: 12px;
      }

      :deep(.el-tabs__nav-wrap::after) {
        height: 1px;
      }
    }

    .icon-empty {
      padding: 20px;
      color: var(--el-text-color-secondary);
      text-align: center;
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 8px;
      max-height: 280px;
      padding: 4px;
      overflow-y: auto;
    }

    .icon-item {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      cursor: pointer;
      border: 1px solid transparent;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        background-color: var(--el-fill-color-light);
        border-color: var(--el-border-color-light);
      }

      &.active {
        background-color: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary);
      }
    }
  }
</style>

<style>
  .ca-icon-picker-popover {
    padding: 12px 16px !important;
  }
</style>
