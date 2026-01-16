/**
 * 站点配置管理模块
 *
 * 负责管理站点基础配置信息，包括网站标题、LOGO、版权、备案号等
 *
 * ## 主要功能
 *
 * - 从后端获取站点配置字典数据
 * - 管理 favicon、logo、title、copyright、beian 等配置
 * - 提供配置初始化和设置方法
 */

import type { BasicConfig } from '@/apis/system/type'
import { listSiteOptionDict } from '@/apis/system/common'
import { useAppStore } from '@/store/modules/app'

/**
 * 站点配置对象
 */
const siteConfig: BasicConfig = {
  SITE_FAVICON: '',
  SITE_LOGO: '',
  SITE_TITLE: '',
  SITE_COPYRIGHT: '',
  SITE_BEIAN: ''
}

/**
 * 初始化系统配置
 * 从后端获取站点配置字典数据并更新到 siteConfig 和 appStore
 */
export async function initSiteConfig(): Promise<void> {
  try {
    const res = await listSiteOptionDict()
    const resMap = new Map<string, string>()

    res.data.forEach((item) => {
      resMap.set(item.label, item.value)
    })

    // 更新站点配置
    siteConfig.SITE_FAVICON = resMap.get('SITE_FAVICON') || ''
    siteConfig.SITE_LOGO = resMap.get('SITE_LOGO') || ''
    siteConfig.SITE_TITLE = resMap.get('SITE_TITLE') || ''
    siteConfig.SITE_COPYRIGHT = resMap.get('SITE_COPYRIGHT') || ''
    siteConfig.SITE_BEIAN = resMap.get('SITE_BEIAN') || ''

    // 更新页面标题和 favicon
    if (siteConfig.SITE_TITLE) {
      document.title = siteConfig.SITE_TITLE
    }
    const faviconEl = document.querySelector('link[rel="shortcut icon"]')
    if (faviconEl && siteConfig.SITE_FAVICON) {
      faviconEl.setAttribute('href', siteConfig.SITE_FAVICON)
    }

    // 更新 appStore 中的版权和备案号
    const appStore = useAppStore()
    appStore.setSiteInfo({
      copyright: siteConfig.SITE_COPYRIGHT,
      beian: siteConfig.SITE_BEIAN
    })
  } catch (error) {
    console.error('[SiteConfig] 初始化站点配置失败:', error)
  }
}

/**
 * 设置系统配置
 * @param config 配置对象
 */
export function setSiteConfig(config: Partial<BasicConfig>): void {
  Object.assign(siteConfig, config)

  // 更新页面标题和 favicon
  if (config.SITE_TITLE) {
    document.title = config.SITE_TITLE
  }
  if (config.SITE_FAVICON) {
    const faviconEl = document.querySelector('link[rel="shortcut icon"]')
    if (faviconEl) {
      faviconEl.setAttribute('href', config.SITE_FAVICON)
    }
  }

  // 更新 appStore 中的版权和备案号
  if (config.SITE_COPYRIGHT || config.SITE_BEIAN) {
    const appStore = useAppStore()
    appStore.setSiteInfo({
      copyright: config.SITE_COPYRIGHT,
      beian: config.SITE_BEIAN
    })
  }
}

/**
 * 获取站点配置
 */
export function getSiteConfig(): BasicConfig {
  return { ...siteConfig }
}

export default siteConfig
