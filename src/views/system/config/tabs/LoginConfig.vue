<template>
  <div class="login-config-wrapper">
    <div class="config-actions">
      <ElButton type="primary" @click="toggleDisabled">
        {{ isDisabled ? '启用编辑' : '修改默认禁用' }}
      </ElButton>
      <ElButton @click="resetToDefault">恢复默认</ElButton>
    </div>
    <ElForm :model="formData" label-width="180px" class="config-form">
      <ElFormItem label="是否启用验证码">
        <ElSwitch v-model="formData.captchaEnabled" :disabled="isDisabled" />
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'

  const isDisabled = ref(false)

  const defaultData = {
    captchaEnabled: true
  }

  const formData = reactive({
    ...defaultData
  })

  const toggleDisabled = () => {
    isDisabled.value = !isDisabled.value
  }

  const resetToDefault = () => {
    Object.assign(formData, defaultData)
    isDisabled.value = false
  }
</script>

<style scoped lang="scss">
  .login-config-wrapper {
    padding: var(--page-content-padding);
  }

  .config-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .config-form {
    max-width: 600px;
  }
</style>
