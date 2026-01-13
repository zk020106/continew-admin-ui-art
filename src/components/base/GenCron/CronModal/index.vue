<template>
  <el-dialog
    v-model="visible"
    title="Cron表达式生成"
    top="32px"
    :width="780"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :body-style="{ padding: '4px 16px 8px 16px' }"
  >
    <!-- cron 输入框 -->
    <CronForm ref="cronInputRef" v-model="cronExpression" />
    <!-- 页脚 -->
    <template #footer>
      <el-button size="small" @click="handlerClose">关闭</el-button>
      <el-button size="small" type="primary" @click="handlerOk"> 确定 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { ref } from 'vue'
  import CronForm from '../CronForm/index.vue'

  defineOptions({ name: 'CronModal' })

  const emit = defineEmits<{
    (e: 'ok', value: string): void
  }>()

  const visible = ref(false)
  const cronInputRef = ref<InstanceType<typeof CronForm>>()
  const cronExpression = ref('')

  // 打开弹窗
  const open = (cron: string = '') => {
    cronExpression.value = cron
    visible.value = true
  }

  // 确定
  const handlerOk = () => {
    if (cronInputRef.value?.checkCron()) {
      ElMessage.error('日和周只能有一个为 [不设置]')
      return
    }
    visible.value = false
    emit('ok', cronExpression.value)
  }

  // 关闭
  const handlerClose = () => {
    visible.value = false
  }

  defineExpose({ open })
</script>

<style lang="scss" scoped></style>
