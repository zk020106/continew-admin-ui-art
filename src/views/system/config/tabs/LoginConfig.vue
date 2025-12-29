<template>
  <ElForm :model="formData" label-width="180px" class="config-form">
    <ElFormItem label="开启验证码">
      <ElSwitch v-model="formData.captchaEnabled" />
      <div class="form-tip">登录时是否需要输入验证码</div>
    </ElFormItem>

    <ElFormItem label="最大登录数量">
      <ElInputNumber v-model="formData.maxLoginCount" :min="1" :max="10" />
      <div class="form-tip">同一账号最大同时在线数量</div>
    </ElFormItem>

    <ElFormItem label="强制下线">
      <ElSwitch v-model="formData.forceLogout" />
      <div class="form-tip">新登录是否踢掉之前的登录</div>
    </ElFormItem>
  </ElForm>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'

  const formData = reactive({
    captchaEnabled: true,
    maxLoginCount: 5,
    forceLogout: false
  })
</script>

<style scoped lang="scss">
  .config-form {
    max-width: 600px;
    padding-top: 20px;
  }

  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
