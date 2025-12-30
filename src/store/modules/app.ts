/**
 * 应用状态管理模块
 *
 * 提供应用级别的全局状态管理
 *
 * ## 主要功能
 *
 * - 站点信息管理（版权、备案号等）
 * - 全局应用状态
 *
 * ## 使用场景
 *
 * - 页面底部版权信息展示
 * - 站点基础信息全局访问
 *
 * @module store/modules/app
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 应用状态管理
 */
export const useAppStore = defineStore(
  'appStore',
  () => {
    // 站点信息
    /** 版权声明 */
    const copyright = ref('')
    /** 备案号 */
    const beian = ref('')

    /**
     * 获取版权信息
     */
    const getCopyright = computed(() => copyright.value)

    /**
     * 获取备案号
     */
    const getBeian = computed(() => beian.value)

    /**
     * 获取完整页脚信息
     * 格式：版权 + 备案号（如果有）
     */
    const getFooterInfo = computed(() => {
      const parts: string[] = []
      if (copyright.value) {
        parts.push(copyright.value)
      }
      if (beian.value) {
        parts.push(beian.value)
      }
      return parts.join(' · ')
    })

    /**
     * 设置版权信息
     * @param value 版权文字
     */
    const setCopyright = (value: string) => {
      copyright.value = value
    }

    /**
     * 设置备案号
     * @param value 备案号
     */
    const setBeian = (value: string) => {
      beian.value = value
    }

    /**
     * 设置站点信息
     * @param info 包含 copyright 和 beian 的对象
     */
    const setSiteInfo = (info: { copyright?: string; beian?: string }) => {
      if (info.copyright !== undefined) {
        copyright.value = info.copyright
      }
      if (info.beian !== undefined) {
        beian.value = info.beian
      }
    }

    return {
      copyright,
      beian,
      getCopyright,
      getBeian,
      getFooterInfo,
      setCopyright,
      setBeian,
      setSiteInfo
    }
  },
  {
    persist: {
      key: 'app',
      storage: localStorage
    }
  }
)
