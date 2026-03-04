<template>
  <div class="art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>{{ t('pages.dashboardConsole.dynamic.title') }}</h4>
        <p>{{ t('pages.dashboardConsole.dynamic.newlyAdded') }}<span class="text-success">+6</span></p>
      </div>
    </div>

    <div class="h-9/10 mt-2 overflow-hidden">
      <ElScrollbar>
        <div
          v-for="(item, index) in list"
          :key="index"
          class="h-17.5 leading-17.5 border-b border-g-300 text-sm overflow-hidden last:border-b-0"
        >
          <span class="text-g-800 font-medium">{{ t(item.usernameKey) }}</span>
          <span class="mx-2 text-g-600">{{ t(item.typeKey) }}</span>
          <span class="text-theme">{{ t(item.targetKey) }}</span>
        </div>
      </ElScrollbar>
    </div>
  </div>
</template>

/* eslint-disable ts/no-use-before-define */
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface DynamicItem {
  usernameKey: string
  typeKey: string
  targetKey: string
}
const { t } = useI18n()

/**
 * 用户动态列表
 * 记录用户的关注、发文、提问、兑换等各类活动
 */
const list = reactive<DynamicItem[]>([
  {
    usernameKey: 'pages.dashboardConsole.dynamic.users.fish',
    typeKey: 'pages.dashboardConsole.dynamic.actions.followed',
    targetKey: 'pages.dashboardConsole.dynamic.targets.sui'
  },
  {
    usernameKey: 'pages.dashboardConsole.dynamic.users.he',
    typeKey: 'pages.dashboardConsole.dynamic.actions.publishedArticle',
    targetKey: 'pages.dashboardConsole.dynamic.targets.vueArticle'
  },
  {
    usernameKey: 'pages.dashboardConsole.dynamic.users.fish',
    typeKey: 'pages.dashboardConsole.dynamic.actions.followed',
    targetKey: 'pages.dashboardConsole.dynamic.targets.sui'
  },
  {
    usernameKey: 'pages.dashboardConsole.dynamic.users.he',
    typeKey: 'pages.dashboardConsole.dynamic.actions.publishedArticle',
    targetKey: 'pages.dashboardConsole.dynamic.targets.vueArticle'
  },
  {
    usernameKey: 'pages.dashboardConsole.dynamic.users.sui',
    typeKey: 'pages.dashboardConsole.dynamic.actions.askedQuestion',
    targetKey: 'pages.dashboardConsole.dynamic.targets.themeQuestion'
  },
  {
    usernameKey: 'pages.dashboardConsole.dynamic.users.dai',
    typeKey: 'pages.dashboardConsole.dynamic.actions.exchangedItem',
    targetKey: 'pages.dashboardConsole.dynamic.targets.strangeLife'
  },
  {
    usernameKey: 'pages.dashboardConsole.dynamic.users.cone',
    typeKey: 'pages.dashboardConsole.dynamic.actions.closedQuestion',
    targetKey: 'pages.dashboardConsole.dynamic.targets.dai'
  },
  {
    usernameKey: 'pages.dashboardConsole.dynamic.users.moon',
    typeKey: 'pages.dashboardConsole.dynamic.actions.exchangedItem',
    targetKey: 'pages.dashboardConsole.dynamic.targets.sevenHabits'
  }
])
</script>
