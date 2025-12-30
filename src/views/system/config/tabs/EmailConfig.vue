<template>
  <div class="email-config-wrapper">
    <div class="config-actions">
      <ElButton type="primary" @click="toggleDisabled">
        {{ isDisabled ? '启用编辑' : '修改默认禁用' }}
      </ElButton>
      <ElButton @click="resetToDefault">恢复默认</ElButton>
    </div>
    <ElForm :model="formData" :rules="rules" label-width="140px" class="config-form">
      <ElFormItem label="邮件协议" prop="protocol">
        <ElSelect v-model="formData.protocol" placeholder="请选择协议" :disabled="isDisabled">
          <ElOption label="SMTP" value="smtp" />
        </ElSelect>
      </ElFormItem>

      <ElFormItem label="服务器地址" prop="host">
        <ElInput
          v-model="formData.host"
          placeholder="请输入邮件服务器地址"
          :disabled="isDisabled"
        />
      </ElFormItem>

      <ElFormItem label="端口号" prop="port">
        <ElInputNumber v-model="formData.port" :min="1" :max="65535" :disabled="isDisabled" />
      </ElFormItem>

      <ElFormItem label="邮箱账号" prop="username">
        <ElInput v-model="formData.username" placeholder="请输入邮箱账号" :disabled="isDisabled" />
      </ElFormItem>

      <ElFormItem label="授权码/密码" prop="password">
        <ElInput
          v-model="formData.password"
          type="password"
          show-password
          placeholder="请输入授权码或密码"
          :disabled="isDisabled"
        />
      </ElFormItem>

      <ElFormItem label="开启SSL">
        <ElSwitch v-model="formData.sslEnabled" :disabled="isDisabled" />
      </ElFormItem>

      <ElFormItem label="SSL端口" prop="sslPort" v-if="formData.sslEnabled">
        <ElInputNumber v-model="formData.sslPort" :min="1" :max="65535" :disabled="isDisabled" />
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'

  const formRef = ref()
  const isDisabled = ref(false)

  const defaultData = {
    protocol: 'smtp',
    host: '',
    port: 465,
    username: '',
    password: '',
    sslEnabled: true,
    sslPort: 465
  }

  const formData = reactive({
    ...defaultData
  })

  const rules = {
    host: [{ required: true, message: '请输入邮件服务器地址', trigger: 'blur' }],
    username: [{ required: true, message: '请输入邮箱账号', trigger: 'blur' }],
    password: [{ required: true, message: '请输入授权码或密码', trigger: 'blur' }]
  }

  const toggleDisabled = () => {
    isDisabled.value = !isDisabled.value
  }

  const resetToDefault = () => {
    Object.assign(formData, defaultData)
    isDisabled.value = false
  }
</script>

<style scoped lang="scss">
  .email-config-wrapper {
    padding: var(--page-content-padding);
  }

  .config-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .config-form {
    max-width: 600px;
    padding-top: 20px;
  }
</style>
