<template>
  <el-dialog
    v-model="visible"
    :title="t('components.genCron.title')"
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
      <el-button size="small" @click="handlerClose">{{ t('common.cancel') }}</el-button>
      <el-button size="small" type="primary" @click="handlerOk">{{
        t('common.confirm')
      }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { ref } from 'vue'
  import CronForm from '../CronForm/index.vue'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'CronModal' })

  const { t } = useI18n()

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
      ElMessage.error(t('components.genCron.tip.dayWeekOnlyOneUnset'))
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
