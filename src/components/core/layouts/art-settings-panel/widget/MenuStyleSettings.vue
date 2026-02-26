<template>
  <SectionTitle :title="$t('setting.menu.title')" />
  <div class="setting-box-wrap">
    <div
      v-for="item in menuThemeList"
      :key="item.theme"
      class="setting-item"
      @click="switchMenuStyles(item.theme)"
    >
      <div
        class="box"
        :class="{ 'is-active': item.theme === menuThemeType }"
        :style="{
          cursor: disabled ? 'no-drop' : 'pointer',
        }"
      >
        <img :src="item.img" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MenuThemeEnum } from '@/enums/appEnum'
import { useDark } from '@vueuse/core'
import AppConfig from '@/config'
import { MenuTypeEnum } from '@/enums/appEnum'
import { useSettingStore } from '@/store/modules/setting'
import SectionTitle from './SectionTitle.vue'

const menuThemeList = AppConfig.themeList
const settingStore = useSettingStore()
const { menuThemeType, menuType } = storeToRefs(settingStore)
const isDark = useDark()
const isTopMenu = computed(() => menuType.value === MenuTypeEnum.TOP)
const isDualMenu = computed(() => menuType.value === MenuTypeEnum.DUAL_MENU)

// 顶部/双栏布局下禁用菜单样式切换
const disabled = computed(() => isTopMenu.value || isDualMenu.value)

// 菜单样式切换
const switchMenuStyles = (theme: MenuThemeEnum) => {
  if (isDualMenu.value || isTopMenu.value || isDark.value) {
    return
  }
  settingStore.switchMenuStyles(theme)
}
</script>
