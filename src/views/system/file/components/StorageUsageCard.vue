<template>
  <div class="storage-usage-card">
    <div class="card-header">
      <ArtSvgIcon icon="ri:pie-chart-line" :size="16" />
      <span class="header-title">{{ t('file.statistics.title') }}</span>
    </div>

    <div class="card-body">
      <!-- 存储量和数量 -->
      <div class="summary-row">
        <div class="summary-item">
          <span class="summary-label">{{ t('file.statistics.totalUsageLabel') }}</span>
          <span class="summary-value">{{ formatSize(statistics.size) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">{{ t('file.statistics.totalFiles') }}</span>
          <span class="summary-value">{{ statistics.number }}</span>
        </div>
      </div>

      <!-- 扇形图 -->
      <ArtRingChart
        :data="chartData"
        height="180px"
        :radius="['0%', '70%']"
        :border-radius="0"
        :show-legend="true"
        legend-position="right"
        :colors="chartColors"
        :show-tooltip="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FileStatisticsResp } from '@/apis'
import { useI18n } from 'vue-i18n'
import ArtRingChart from '@/components/core/charts/art-ring-chart/index.vue'

const props = defineProps<{
  statistics: FileStatisticsResp
}>()

const { t } = useI18n()

// 文件类型枚举（使用数字，与 API 返回类型一致）
enum FileType {
  FOLDER = 0,
  IMAGE = 1,
  VIDEO = 2,
  AUDIO = 3,
  DOCUMENT = 5,
  ARCHIVE = 6,
  CODE = 7
}

// 类型配置
const typeConfig: Record<number, { label: string, color: string }> = {
  [FileType.IMAGE]: { label: t('file.statistics.image'), color: '#409EFF' },
  [FileType.VIDEO]: { label: t('file.statistics.video'), color: '#67C23A' },
  [FileType.AUDIO]: { label: t('file.statistics.audio'), color: '#E6A23C' },
  [FileType.DOCUMENT]: { label: t('file.statistics.document'), color: '#909399' },
  [FileType.ARCHIVE]: { label: t('file.statistics.archive'), color: '#F56C6C' },
  [FileType.CODE]: { label: t('file.statistics.code'), color: '#F7DF1E' },
  [FileType.FOLDER]: { label: t('file.statistics.folder'), color: '#FFA000' }
}

// 图表数据
const chartData = computed(() => {
  const config = props.statistics.data || []
  const total = props.statistics.number || 1

  const data = config
    .map((item) => {
      const typeConf = typeConfig[Number(item.type)]
      return {
        name: typeConf?.label || t('file.statistics.other'),
        value: item.number,
        itemStyle: { color: typeConf?.color }
      }
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
  return data
})

// 图表颜色
const chartColors = computed(() => {
  return chartData.value.map((item) => item.itemStyle?.color as string)
})

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}
</script>

<style lang="scss" scoped>
  .storage-usage-card {
    display: flex;
    flex-direction: column;
  }

  .card-header {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 12px;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  // 汇总行：存储量、数量
  .summary-row {
    display: flex;
    gap: 12px;
  }

  .summary-item {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    padding: 8px 12px;
    background: var(--el-fill-color-light);
    border-radius: 4px;

    .summary-label {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .summary-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
</style>
