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
      <div class="pie-chart-wrapper">
        <div class="pie-chart" :style="{ background: pieGradient }">
          <div class="pie-center">
            <span class="total-count">{{ statistics.number }}</span>
          </div>
        </div>
        <!-- 图例 -->
        <div class="pie-legend">
          <div v-for="item in visibleTypeList" :key="item.type" class="legend-item">
            <span class="legend-color" :style="{ background: item.color }" />
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-value">{{ item.number }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { FileStatisticsResp } from '@/apis'
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const props = defineProps<{
    statistics: FileStatisticsResp
  }>()

  // 文件类型枚举
  enum FileType {
    IMAGE = '1',
    VIDEO = '2',
    AUDIO = '3',
    DOCUMENT = '5',
    ARCHIVE = '6',
    CODE = '7',
    FOLDER = '0'
  }

  // 类型配置：颜色预设
  const typeConfig: Record<string, { label: string; color: string }> = {
    [FileType.IMAGE]: { label: t('file.statistics.image'), color: '#409EFF' },
    [FileType.VIDEO]: { label: t('file.statistics.video'), color: '#67C23A' },
    [FileType.AUDIO]: { label: t('file.statistics.audio'), color: '#E6A23C' },
    [FileType.DOCUMENT]: { label: t('file.statistics.document'), color: '#909399' },
    [FileType.ARCHIVE]: { label: t('file.statistics.archive'), color: '#F56C6C' },
    [FileType.CODE]: { label: t('file.statistics.code'), color: '#F7DF1E' },
    [FileType.FOLDER]: { label: t('file.statistics.folder'), color: '#FFA000' }
  }

  // 所有文件类型值
  const allTypeValues: string[] = [
    FileType.IMAGE,
    FileType.VIDEO,
    FileType.AUDIO,
    FileType.DOCUMENT,
    FileType.ARCHIVE,
    FileType.CODE,
    FileType.FOLDER
  ]

  // 过滤出有数据的类型
  const visibleTypeList = computed(() => {
    const config = props.statistics.data

    return allTypeValues
      .map((type) => {
        const stat = config.find((item) => item.type === type)
        const typeConf = typeConfig[type]
        return {
          type,
          size: stat?.size || 0,
          number: stat?.number || 0,
          label: typeConf?.label || t('file.statistics.other'),
          color: typeConf?.color || '#C0C4CC'
        }
      })
      .filter((item) => item.number > 0)
      .sort((a, b) => b.number - a.number)
  })

  // 饼图渐变背景
  const pieGradient = computed(() => {
    const list = visibleTypeList.value
    if (list.length === 0) return 'conic-gradient(#E5E7EB 0deg, #E5E7EB 360deg)'

    let currentAngle = 0
    const gradients: string[] = []

    for (const item of list) {
      const angle = (item.number / props.statistics.number) * 360
      gradients.push(`${item.color} ${currentAngle}deg ${currentAngle + angle}deg`)
      currentAngle += angle
    }

    return `conic-gradient(${gradients.join(', ')})`
  })

  // 格式化文件大小
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
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

  // 扇形图
  .pie-chart-wrapper {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .pie-chart {
    position: relative;
    flex-shrink: 0;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    transition: background 0.3s ease;
  }

  .pie-center {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: var(--el-bg-color);
    border-radius: 50%;
    transform: translate(-50%, -50%);

    .total-count {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .pie-legend {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
  }

  .legend-item {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
  }

  .legend-color {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .legend-label {
    flex: 1;
    color: var(--el-text-color-secondary);
  }

  .legend-value {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
</style>
