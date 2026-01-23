import type { LabelValueState } from '@/types/global'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type DictItem = LabelValueState

export const useDictStore = defineStore(
  'dict',
  () => {
    const dictMap = ref<Record<string, DictItem[]>>({})

    /**
     * 获取字典数据
     * @param code 字典编码
     */
    const getDict = (code: string): DictItem[] | undefined => {
      return dictMap.value[code]
    }

    /**
     * 设置字典数据
     * @param code 字典编码
     * @param data 字典数据
     */
    const setDict = (code: string, data: DictItem[]) => {
      dictMap.value[code] = data
    }

    return {
      dictMap,
      getDict,
      setDict
    }
  },
  {
    persist: false
  }
)
