import type { DictItem } from '@/store/modules/dict'
import { computed, ref, shallowRef } from 'vue'
import { listCommonDict } from '@/apis/system'
import { useDictStore } from '@/store/modules/dict'

const pendingRequests = new Map<string, Promise<DictItem[]>>()

/**
 * 字典项类型
 */
export type UseDictReturn<T extends string> = {
  [K in T]: Ref<DictItem[]>
} & { loading: Ref<boolean, boolean> }

/**
 * 创建字典 Hook
 * @param codes 字典编码（支持多个）
 */
export function useDict<T extends string>(...codes: T[]): UseDictReturn<T> {
  const dictStore = useDictStore()
  const data = shallowRef<Record<string, DictItem[]>>({})
  const loading = ref(false)

  const loadDict = async (code: string) => {
    // 先从缓存读取
    const cached = dictStore.getDict(code)
    if (cached) {
      data.value[code] = cached
      return
    }

    // 防止重复请求
    if (!pendingRequests.has(code)) {
      const request = listCommonDict(code)
        .then((data) => {
          dictStore.setDict(code, data)
          return data
        })
        .catch(() => [])
        .finally(() => {
          pendingRequests.delete(code)
        })

      pendingRequests.set(code, request)
    }

    const result = await pendingRequests.get(code)!
    data.value[code] = result
  }

  // 加载所有字典
  if (codes.length > 0) {
    loading.value = true
    Promise.all(codes.map((code) => loadDict(code))).finally(() => {
      loading.value = false
    })
  }

  // 构建返回值
  const result: Record<string, Ref<DictItem[]>> = {}
  codes.forEach((code) => {
    result[code] = computed({
      get: () => data.value[code] || [],
      set: (val) => {
        data.value[code] = val
      }
    }) as Ref<DictItem[]>
  })

  return {
    ...result,
    loading
  } as UseDictReturn<T>
}

/**
 * 批量获取字典（返回对象形式）
 */
export function useDictList(codes: string[]) {
  const dictStore = useDictStore()
  const data = shallowRef<Record<string, DictItem[]>>({})
  const loading = ref(false)

  const loadDict = async (code: string) => {
    const cached = dictStore.getDict(code)
    if (cached) {
      data.value[code] = cached
      return
    }

    if (!pendingRequests.has(code)) {
      const request = listCommonDict(code)
        .then((data) => {
          dictStore.setDict(code, data)
          return data
        })
        .catch(() => [])
        .finally(() => {
          pendingRequests.delete(code)
        })

      pendingRequests.set(code, request)
    }

    const result = await pendingRequests.get(code)!
    data.value[code] = result
  }

  if (codes.length > 0) {
    loading.value = true
    Promise.all(codes.map((code) => loadDict(code))).finally(() => {
      loading.value = false
    })
  }

  return { data, loading }
}
