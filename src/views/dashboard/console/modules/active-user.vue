<template>
  <div class="art-card h-105 p-4 box-border mb-5 max-sm:mb-4">
    <ArtBarChart
      class="box-border p-2"
      bar-width="50%"
      height="13.7rem"
      :show-axis-line="false"
      :data="chartData"
      :x-axis-data="xAxisLabels"
    />
    <div class="ml-1">
      <h3 class="mt-5 text-lg font-medium">{{ t('pages.dashboardConsole.activeUser.title') }}</h3>
      <p class="mt-1 text-sm">
        {{ t('pages.dashboardConsole.activeUser.weekCompare') }}
        <span class="text-success font-medium">+23%</span>
      </p>
      <p class="mt-1 text-sm">{{ t('pages.dashboardConsole.activeUser.description') }}</p>
    </div>
    <div class="flex-b mt-2">
      <div v-for="(item, index) in list" :key="index" class="flex-1">
        <p class="text-2xl text-g-900">{{ item.num }}</p>
        <p class="text-xs text-g-500">{{ t(item.nameKey) }}</p>
      </div>
    </div>
  </div>
</template>

/* eslint-disable ts/no-use-before-define */
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface UserStatItem {
  nameKey: string
  num: string
}

const { t } = useI18n()
const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep']
const xAxisLabels = computed(() =>
  monthKeys.map((month) => t(`pages.dashboardConsole.months.${month}`))
)

// 每月活跃用户数
const chartData = [160, 100, 150, 80, 190, 100, 175, 120, 160]

/**
 * 用户统计数据列表
 * 包含总用户量、总访问量、日访问量和周同比等关键指标
 */
const list: UserStatItem[] = [
  { nameKey: 'pages.dashboardConsole.activeUser.stats.totalUsers', num: '32k' },
  { nameKey: 'pages.dashboardConsole.activeUser.stats.totalVisits', num: '128k' },
  { nameKey: 'pages.dashboardConsole.activeUser.stats.dailyVisits', num: '1.2k' },
  { nameKey: 'pages.dashboardConsole.activeUser.stats.weekOverWeek', num: '+5%' }
]
</script>
