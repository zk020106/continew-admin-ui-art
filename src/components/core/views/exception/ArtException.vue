<template>
  <div class="page-content !border-0 !bg-transparent min-h-screen flex-cc">
    <div class="flex-cc max-md:!block max-md:text-center">
      <ThemeSvg :src="data.imgUrl" size="100%" class="!w-100" />
      <div class="ml-15 w-75 max-md:mx-auto max-md:mt-10 max-md:w-full max-md:text-center">
        <p class="text-xl leading-7 text-g-600 max-md:text-lg">{{ data.desc }}</p>
        <ElButton v-ripple type="primary" size="large" class="mt-5" @click="backHome">
{{
          data.btnText
        }}
</ElButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCommon } from '@/hooks/core/useCommon'
import { RoutesAlias } from '@/router/routesAlias'

withDefaults(
  defineProps<{
    data: ExceptionData
  }>(),
  {}
)

const router = useRouter()

interface ExceptionData {
  /** 标题 */
  title: string
  /** 描述 */
  desc: string
  /** 按钮文本 */
  btnText: string
  /** 图片地址 */
  imgUrl: string
}

const { homePath } = useCommon()

const backHome = async () => {
  const targetPath = homePath.value?.trim() || RoutesAlias.Login

  try {
    await router.push(targetPath)
  } catch (error) {
    console.warn('[Exception] backHome navigation failed:', error)
    await router.push(RoutesAlias.Login)
    return
  }

  // 后端异常时，回首页可能再次被守卫重定向到 500，这里降级到登录页避免循环
  if (targetPath !== RoutesAlias.Login && router.currentRoute.value.name === 'Exception500') {
    await router.push(RoutesAlias.Login)
  }
}
</script>
