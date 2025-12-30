<template>
  <div class="security-config-wrapper">
    <div class="config-actions">
      <ElButton type="primary" @click="toggleDisabled">
        {{ isDisabled ? '启用编辑' : '修改默认禁用' }}
      </ElButton>
      <ElButton @click="resetToDefault">恢复默认</ElButton>
    </div>
    <ElForm :model="formData" label-position="left" label-width="180px" class="config-form">
      <ElFormItem label="密码错误锁定阈值">
        <ElInput
          type="number"
          v-model="formData.passwordErrorLockCount"
          :min="0"
          :max="20"
          :disabled="isDisabled"
        />
        <div class="form-tip">连续登录失败次数达到该值将锁定账号（0-10次，0表示禁用锁定）</div>
      </ElFormItem>

      <ElFormItem label="账号锁定时长（分钟）">
        <ElInput
          type="number"
          v-model="formData.passwordErrorLockMinutes"
          :min="1"
          :max="1440"
          :disabled="isDisabled"
        />
        <div class="form-tip">账号锁定后自动解锁的时间（1-1440分钟，即24小时）</div>
      </ElFormItem>

      <ElFormItem label="密码有效期（天）">
        <ElInput
          type="number"
          v-model="formData.passwordExpirationDays"
          :min="0"
          :max="365"
          :disabled="isDisabled"
        />
        <div class="form-tip">密码强制修改周期（0-999天，0表示永不过期）</div>
      </ElFormItem>

      <ElFormItem label="密码到期提醒（天）">
        <ElInput
          type="number"
          v-model="formData.passwordExpirationWarningDays"
          :min="0"
          :max="30"
          :disabled="isDisabled"
        />
        <div class="form-tip">密码过期前的提前提醒天数（0表示不提醒）</div>
      </ElFormItem>

      <ElFormItem label="历史密码重复校验次数">
        <ElInput
          type="number"
          v-model="formData.passwordRepetitionTimes"
          :min="0"
          :max="10"
          :disabled="isDisabled"
        />
        <div class="form-tip">新密码不能与最近N次使用过的密码相同</div>
      </ElFormItem>

      <ElFormItem label="密码最小长度">
        <ElInput
          type="number"
          v-model="formData.passwordMinLength"
          :min="8"
          :max="32"
          :disabled="isDisabled"
        />
        <div class="form-tip">密码最小字符长度要求（8-32个字符）</div>
      </ElFormItem>

      <ElFormItem label="是否允许密码包含用户名">
        <ElSwitch v-model="formData.passwordAllowContainUsername" :disabled="isDisabled" />
        <div class="form-tip">是否允许密码包含正序或倒序的用户名字符</div>
      </ElFormItem>

      <ElFormItem label="密码是否必须包含特殊字符">
        <ElSwitch v-model="formData.passwordRequireSymbols" :disabled="isDisabled" />
        <div class="form-tip">是否要求密码必须包含特殊字符（如：!@#$%）</div>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'

  const isDisabled = ref(false)

  const defaultData = {
    passwordErrorLockCount: 5,
    passwordErrorLockMinutes: 5,
    passwordExpirationDays: 0,
    passwordExpirationWarningDays: 0,
    passwordMinLength: 8,
    passwordRepetitionTimes: 3,
    passwordAllowContainUsername: true,
    passwordRequireSymbols: false
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
  .security-config-wrapper {
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

  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
