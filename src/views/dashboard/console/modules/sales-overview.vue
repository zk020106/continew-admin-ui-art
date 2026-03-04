<template>
  <div class="art-card h-105 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>{{ t('pages.dashboardConsole.salesOverview.title') }}</h4>
        <p>{{ t('pages.dashboardConsole.salesOverview.growthThisYear') }}<span class="text-success">+15%</span></p>
      </div>
    </div>
    <ArtLineChart
      height="calc(100% - 56px)"
      :data="data"
      :x-axis-data="xAxisData"
      :show-area-color="true"
      :show-axis-line="false"
    />
  </div>
</template>

/* eslint-disable ts/no-use-before-define */
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

/**
 * 全年访问量数据
 * 记录每月的访问量统计
 */
const data = [50, 25, 40, 20, 70, 35, 65, 30, 35, 20, 40, 44]
const { t } = useI18n()

/**
 * X 轴月份标签
 */
const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const xAxisData = computed(() =>
  monthKeys.map((month) => t(`pages.dashboardConsole.months.${month}`))
)
</script>
