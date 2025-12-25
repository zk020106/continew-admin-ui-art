<template>
  <div class="storage-usage-card">
    <div class="card-header">
      <ArtSvgIcon icon="ri:pie-chart-line" :size="16" />
      <span class="header-title">{{ t('file.statistics.title') }}</span>
    </div>

    <div class="card-body">
      <!-- 饼图 -->
      <div class="pie-chart-wrapper">
        <div class="pie-chart" :style="{ background: pieGradient }">
          <div class="pie-center">
            <span class="total-count">{{ statistics.number }}</span>
            <span class="total-label">{{ t('file.statistics.totalFiles') }}</span>
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

      <!-- 总大小 -->
      <div class="total-size">{{
        t('file.statistics.totalUsage', { size: formatSize(statistics.size) })
      }}</div>
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

  // 类型配置
  const typeConfig = computed(() => ({
    '1': { label: t('file.statistics.image'), icon: 'file-image', color: '#409EFF' },
    '2': { label: t('file.statistics.video'), icon: 'file-video', color: '#67C23A' },
    '3': { label: t('file.statistics.audio'), icon: 'file-music', color: '#E6A23C' },
    '5': { label: t('file.statistics.document'), icon: 'file-txt', color: '#909399' },
    '6': { label: t('file.statistics.archive'), icon: 'file-zip', color: '#F56C6C' },
    '7': { label: t('file.statistics.code'), icon: 'file-js', color: '#F7DF1E' },
    '0': { label: t('file.statistics.folder'), icon: 'directory', color: '#FFA000' }
  }))

  // 过滤出有数据的类型并计算百分比
  const visibleTypeList = computed(() => {
    const config = props.statistics.data
    const allTypes = ['1', '2', '3', '5', '6', '7', '0'] as const

    return allTypes
      .map((type) => {
        const stat = config.find((item) => item.type === type)
        const typeConf = (
          typeConfig.value as Record<string, { label: string; icon: string; color: string }>
        )[type]
        return {
          type,
          size: stat?.size || 0,
          number: stat?.number || 0,
          label: typeConf?.label || t('file.statistics.other'),
          icon: typeConf?.icon || 'file-close',
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

    // 添加灰色背景（剩余部分）
    gradients.push(`#E5E7EB ${currentAngle}deg 360deg`)

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
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: var(--el-bg-color);
    border-radius: 50%;
    transform: translate(-50%, -50%);

    .total-count {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .total-label {
      font-size: 10px;
      color: var(--el-text-color-secondary);
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

  .total-size {
    padding-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-align: center;
    border-top: 1px solid var(--el-border-color-lighter);
  }
</style>
