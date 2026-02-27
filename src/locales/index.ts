/**
 * 国际化配置
 *
 * 基于 vue-i18n 实现的多语言国际化解决方案。
 * 支持中文和英文切换，自动从本地存储恢复用户的语言偏好。
 *
 * ## 主要功能
 *
 * - 多语言支持 - 支持中文（简体）和英文两种语言
 * - 语言切换 - 运行时动态切换语言，无需刷新页面
 * - 持久化存储 - 自动保存和恢复用户的语言偏好
 * - 全局注入 - 在任何组件中都可以使用 $t 函数进行翻译
 * - 类型安全 - 提供 TypeScript 类型支持
 *
 * ## 支持的语言
 *
 * - zh: 简体中文
 * - en: English
 *
 * @module locales
 * @author Art Design Pro Team
 */

import type { I18n, I18nOptions } from 'vue-i18n'
import { createI18n } from 'vue-i18n'
import { LanguageEnum } from '@/enums/appEnum'
import { getSystemStorage } from '@/utils/storage'
import { StorageKeyManager } from '@/utils/storage/storage-key-manager'

// 同步导入语言文件
import enMessages from './langs/en.json'
import zhMessages from './langs/zh.json'

/**
 * 存储键管理器实例
 */
const storageKeyManager = new StorageKeyManager()

/**
 * 语言消息对象
 */
const messages = {
  [LanguageEnum.EN]: enMessages,
  [LanguageEnum.ZH]: zhMessages
}

/**
 * 判断是否为支持的语言值
 */
const isSupportedLanguage = (value: unknown): value is LanguageEnum => {
  return typeof value === 'string' && Object.values(LanguageEnum).includes(value as LanguageEnum)
}

/**
 * 从用户存储对象中提取语言
 * 兼容不同版本的数据结构
 */
const extractLanguage = (storeData: unknown): LanguageEnum | null => {
  if (!storeData || typeof storeData !== 'object') {
    return null
  }

  const typedStoreData = storeData as Record<string, any>
  const candidateLanguages = [
    typedStoreData.language,
    typedStoreData.user?.language,
    typedStoreData.state?.language
  ]

  const matchedLanguage = candidateLanguages.find(isSupportedLanguage)
  return matchedLanguage ?? null
}

/**
 * 从指定 localStorage 键中读取语言
 */
const getLanguageFromStorage = (storageKey: string): LanguageEnum | null => {
  const rawStore = localStorage.getItem(storageKey)
  if (!rawStore) {
    return null
  }

  const parsedStore = JSON.parse(rawStore)
  return extractLanguage(parsedStore)
}

/**
 * 语言选项列表
 * 用于语言切换下拉框
 */
export const languageOptions = [
  { value: LanguageEnum.ZH, label: '简体中文' },
  { value: LanguageEnum.EN, label: 'English' }
]

/**
 * 从存储中获取语言设置
 * @returns 语言设置，如果获取失败则返回默认语言
 */
const getDefaultLanguage = (): LanguageEnum => {
  // 尝试从版本化和旧版存储中获取语言设置
  try {
    const storageKeys = [storageKeyManager.getStorageKey('user'), 'user']

    for (const storageKey of storageKeys) {
      const lang = getLanguageFromStorage(storageKey)
      if (lang) {
        return lang
      }
    }
  } catch (error) {
    console.warn('[i18n] 从用户存储获取语言设置失败:', error)
  }

  // 尝试从系统存储中获取语言设置
  try {
    const sys = getSystemStorage()
    const lang = extractLanguage(typeof sys === 'string' ? JSON.parse(sys) : sys)
    if (lang) {
      return lang
    }
  } catch (error) {
    console.warn('[i18n] 从系统存储获取语言设置失败:', error)
  }

  // 返回默认语言
  console.debug('[i18n] 使用默认语言:', LanguageEnum.ZH)
  return LanguageEnum.ZH
}

/**
 * i18n 配置选项
 */
const i18nOptions: I18nOptions = {
  locale: getDefaultLanguage(),
  legacy: false,
  globalInjection: true,
  fallbackLocale: LanguageEnum.ZH,
  messages
}

/**
 * i18n 实例
 */
const i18n: I18n = createI18n(i18nOptions)

/**
 * 翻译函数类型
 */
interface Translation {
  (key: string): string
}

/**
 * 全局翻译函数
 * 可在任何地方使用，无需导入 useI18n
 */
export const $t = i18n.global.t as Translation

export default i18n
