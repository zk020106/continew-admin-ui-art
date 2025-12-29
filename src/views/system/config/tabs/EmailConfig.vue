<template>
  <ElForm :model="formData" :rules="rules" label-width="140px" class="config-form">
    <ElFormItem label="邮件协议" prop="protocol">
      <ElSelect v-model="formData.protocol" placeholder="请选择协议">
        <ElOption label="SMTP" value="smtp" />
      </ElSelect>
    </ElFormItem>

    <ElFormItem label="服务器地址" prop="host">
      <ElInput v-model="formData.host" placeholder="请输入邮件服务器地址" />
    </ElFormItem>

    <ElFormItem label="端口号" prop="port">
      <ElInputNumber v-model="formData.port" :min="1" :max="65535" />
    </ElFormItem>

    <ElFormItem label="邮箱账号" prop="username">
      <ElInput v-model="formData.username" placeholder="请输入邮箱账号" />
    </ElFormItem>

    <ElFormItem label="授权码/密码" prop="password">
      <ElInput
        v-model="formData.password"
        type="password"
        show-password
        placeholder="请输入授权码或密码"
      />
    </ElFormItem>

    <ElFormItem label="开启SSL">
      <ElSwitch v-model="formData.sslEnabled" />
    </ElFormItem>

    <ElFormItem label="SSL端口" prop="sslPort" v-if="formData.sslEnabled">
      <ElInputNumber v-model="formData.sslPort" :min="1" :max="65535" />
    </ElFormItem>
  </ElForm>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'

  const formRef = ref()

  const formData = reactive({
    protocol: 'smtp',
    host: '',
    port: 465,
    username: '',
    password: '',
    sslEnabled: true,
    sslPort: 465
  })

  const rules = {
    host: [{ required: true, message: '请输入邮件服务器地址', trigger: 'blur' }],
    username: [{ required: true, message: '请输入邮箱账号', trigger: 'blur' }],
    password: [{ required: true, message: '请输入授权码或密码', trigger: 'blur' }]
  }
</script>

<style scoped lang="scss">
  .config-form {
    max-width: 600px;
    padding-top: 20px;
  }
</style>
