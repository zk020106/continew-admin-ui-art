<template>
  <ElForm :model="formData" label-width="180px" class="config-form">
    <ElFormItem label="密码错误锁定次数">
      <ElInputNumber v-model="formData.passwordErrorLockCount" :min="0" :max="20" />
      <div class="form-tip">密码错误多少次后锁定账号</div>
    </ElFormItem>

    <ElFormItem label="密码错误锁定时间">
      <ElInputNumber v-model="formData.passwordErrorLockMinutes" :min="1" :max="1440" />
      <div class="form-tip">锁定时间（分钟）</div>
    </ElFormItem>

    <ElFormItem label="密码有效期">
      <ElInputNumber v-model="formData.passwordExpirationDays" :min="0" :max="365" />
      <div class="form-tip">0表示不限制有效期（天）</div>
    </ElFormItem>

    <ElFormItem label="密码最小长度">
      <ElInputNumber v-model="formData.passwordMinLength" :min="6" :max="32" />
    </ElFormItem>

    <ElFormItem label="密码重复次数限制">
      <ElInputNumber v-model="formData.passwordRepetitionTimes" :min="0" :max="10" />
      <div class="form-tip">新密码不能与最近N次使用过的密码相同</div>
    </ElFormItem>

    <ElFormItem label="允许包含用户名">
      <ElSwitch v-model="formData.passwordAllowContainUsername" />
    </ElFormItem>

    <ElFormItem label="需要特殊字符">
      <ElSwitch v-model="formData.passwordRequireSymbols" />
    </ElFormItem>
  </ElForm>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'

  const formData = reactive({
    passwordErrorLockCount: 5,
    passwordErrorLockMinutes: 30,
    passwordExpirationDays: 90,
    passwordMinLength: 6,
    passwordRepetitionTimes: 3,
    passwordAllowContainUsername: false,
    passwordRequireSymbols: false
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
