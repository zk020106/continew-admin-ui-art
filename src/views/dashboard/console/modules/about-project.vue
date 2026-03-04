<template>
  <div class="art-card p-5 flex-b mb-5 max-sm:mb-4">
    <div>
      <h2 class="text-2xl font-medium">{{ t('pages.dashboardConsole.aboutProject.title') }}</h2>
      <p class="text-g-700 mt-1">
        {{ t('pages.dashboardConsole.aboutProject.description1', { systemName }) }}
      </p>
      <p class="text-g-700 mt-1">{{ t('pages.dashboardConsole.aboutProject.description2') }}</p>

      <div class="flex flex-wrap gap-3.5 max-w-150 mt-9">
        <div
          v-for="link in linkList"
          :key="link.labelKey"
          class="w-60 flex-cb h-12.5 px-3.5 border border-g-300 c-p rounded-lg text-sm bg-g-100 duration-300 hover:-translate-y-1 max-sm:w-full"
          @click="goPage(link.url)"
        >
          <span class="text-g-700">{{ t(link.labelKey) }}</span>
          <ArtSvgIcon icon="ri:arrow-right-s-line" class="text-lg text-g-600" />
        </div>
      </div>
    </div>
    <img class="w-75 max-md:!hidden" src="@imgs/draw/draw1.png" alt="draw1" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AppConfig from '@/config'
import { WEB_LINKS } from '@/utils/constants'

const systemName = AppConfig.systemInfo.name
const { t } = useI18n()

const linkList = [
  { labelKey: 'pages.dashboardConsole.aboutProject.links.website', url: WEB_LINKS.DOCS },
  { labelKey: 'pages.dashboardConsole.aboutProject.links.docs', url: WEB_LINKS.INTRODUCE },
  { labelKey: 'pages.dashboardConsole.aboutProject.links.github', url: WEB_LINKS.GITHUB_HOME },
  { labelKey: 'pages.dashboardConsole.aboutProject.links.bilibili', url: WEB_LINKS.BILIBILI }
]

/**
 * 在新标签页中打开指定 URL
 * @param url 要打开的网页地址
 */
const goPage = (url: string): void => {
  window.open(url, '_blank', 'noopener,noreferrer')
}
</script>
