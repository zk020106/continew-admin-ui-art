<!-- 视频播放器组件：https://h5player.bytedance.com/ -->
<template>
  <div :id="playerId" />
</template>

<script setup lang="ts">
import Player from 'xgplayer'
import 'xgplayer/dist/index.min.css'

defineOptions({ name: 'ArtVideoPlayer' })

const props = withDefaults(defineProps<Props>(), {
  playerId: '',
  videoUrl: '',
  posterUrl: '',
  autoplay: false,
  volume: 1,
  loop: false,
  muted: false
})

interface Props {
  /** 播放器容器 ID */
  playerId: string
  /** 视频源URL */
  videoUrl: string
  /** 视频封面图URL */
  posterUrl: string
  /** 是否自动播放 */
  autoplay?: boolean
  /** 音量大小(0-1) */
  volume?: number
  /** 可选的播放速率 */
  playbackRates?: number[]
  /** 是否循环播放 */
  loop?: boolean
  /** 是否静音 */
  muted?: boolean
  commonStyle?: VideoPlayerStyle
}

interface VideoPlayerStyle {
  progressColor?: string
  playedColor?: string
  cachedColor?: string
  sliderBtnStyle?: Record<string, string>
  volumeColor?: string
}

const defaultStyle: VideoPlayerStyle = {
  progressColor: 'rgba(255, 255, 255, 0.3)',
  playedColor: '#00AEED',
  cachedColor: 'rgba(255, 255, 255, 0.6)',
  sliderBtnStyle: {
    width: '10px',
    height: '10px',
    backgroundColor: '#00AEED'
  },
  volumeColor: '#00AEED'
}

let playerInstance: any = null

onMounted(() => {
  playerInstance = new Player({
    id: props.playerId,
    lang: 'zh',
    volume: props.volume,
    autoplay: props.autoplay,
    screenShot: true,
    url: props.videoUrl,
    poster: props.posterUrl,
    fluid: true,
    playbackRate: props.playbackRates,
    loop: props.loop,
    muted: props.muted,
    commonStyle: {
      ...defaultStyle,
      ...props.commonStyle
    }
  })

  playerInstance.on('error', (error: any) => {
    console.error('Error occurred:', error)
  })
})

onBeforeUnmount(() => {
  if (playerInstance) {
    playerInstance.destroy()
  }
})
</script>
