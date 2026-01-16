# 配置管理模块实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 在系统管理菜单下实现配置管理模块，包含站点配置、安全配置、登录配置、邮件配置、短信配置、存储配置、客户端配置7个子模块

**架构:** 使用 CaPageLayout 的 header 插槽放置 ElTabs 标签页，各配置子模块作为动态组件加载；表单类配置（站点/安全/登录/邮件）采用查看/编辑双模式；列表类配置（短信/存储/客户端）使用 CaTable + 弹窗/抽屉

**技术栈:** Vue 3 + Element Plus 2.13 + TypeScript + Vite + CaPageLayout + CaTable + CaForm + Pinia

---

## 前置检查

### Task 0: 验证依赖和环境

**检查文件:**

- `src/apis/system/option.ts` - 系统参数配置 API
- `src/apis/system/storage.ts` - 存储配置 API
- `src/apis/system/smsConfig.ts` - 短信配置 API
- `src/apis/system/client.ts` - 客户端配置 API
- `src/apis/system/type.ts` - 类型定义
- `src/components/base/CaPageLayout/index.vue` - 页面布局组件
- `src/locales/langs/zh.json` - 中文语言包
- `src/locales/langs/en.json` - 英文语言包

**验证步骤:**

1. 确认所有 API 文件存在并导出正确
2. 确认类型定义包含 `SiteConfig`、`SecurityConfig`、`MailConfig`、`LoginConfig`、`SmsConfigResp`、`StorageResp`、`ClientResp` 等
3. 确认 `CaPageLayout`、`CaTable`、`CaForm` 组件可用

---

## 阶段一：国际化文本

### Task 1: 添加中文国际化文本

**文件:**

- 修改: `src/locales/langs/zh.json`

**步骤 1: 在 zh.json 中添加配置管理模块文本**

在 `zh.json` 中找到合适的位置（如 `system` 对象下），添加以下内容：

```json
{
  "system": {
    "config": {
      "title": "配置管理",
      "tabs": {
        "site": "网站配置",
        "security": "安全配置",
        "login": "登录配置",
        "mail": "邮件配置",
        "sms": "短信配置",
        "storage": "存储配置",
        "client": "客户端配置"
      },
      "site": {
        "siteLogo": "站点Logo",
        "siteLogoHint": "建议尺寸 50x50px",
        "siteFavicon": "站点图标",
        "siteFaviconHint": "建议尺寸 46x46px",
        "siteTitle": "系统名称",
        "siteTitlePlaceholder": "请输入系统名称",
        "siteTitleMax": "系统名称最多18个字符",
        "siteDescription": "系统描述",
        "siteDescriptionPlaceholder": "请输入系统描述",
        "siteCopyright": "版权声明",
        "siteCopyrightPlaceholder": "请输入版权声明",
        "siteBeian": "备案号",
        "siteBeianPlaceholder": "请输入备案号",
        "siteBeianMax": "备案号最多30个字符",
        "resetConfirm": "确认恢复基础配置为默认值吗？"
      },
      "security": {
        "passwordErrorLockCount": "密码错误次数",
        "passwordErrorLockCountUnit": "次",
        "passwordErrorLockCountRange": "密码错误多少次后锁定",
        "passwordErrorLockMinutes": "锁定时长",
        "passwordErrorLockMinutesUnit": "分钟",
        "passwordExpirationDays": "密码有效期",
        "passwordExpirationDaysUnit": "天",
        "passwordExpirationWarningDays": "密码到期提醒",
        "passwordExpirationWarningDaysUnit": "天",
        "passwordRepetitionTimes": "密码重复次数",
        "passwordRepetitionTimesUnit": "次",
        "passwordRepetitionTimesDesc": "新密码不能与最近N次密码重复",
        "passwordMinLength": "密码最小长度",
        "passwordAllowContainUsername": "允许密码包含用户名",
        "passwordRequireSymbols": "密码必须包含特殊字符",
        "resetConfirm": "确认恢复安全配置为默认值吗？",
        "warningLessThanExpiry": "密码到期提醒时间应小于密码有效期"
      },
      "login": {
        "loginCaptchaEnabled": "登录验证码开关",
        "resetConfirm": "确认恢复登录配置为默认值吗？"
      },
      "mail": {
        "mailProtocol": "邮件协议",
        "mailHost": "SMTP服务器地址",
        "mailHostPlaceholder": "请输入SMTP服务器地址",
        "mailPort": "SMTP端口",
        "mailUsername": "发件人邮箱",
        "mailUsernamePlaceholder": "请输入发件人邮箱",
        "mailPassword": "发件人密码",
        "mailPasswordPlaceholder": "请输入发件人密码",
        "mailSslEnabled": "启用SSL",
        "mailSslPort": "SSL端口",
        "resetConfirm": "确认恢复邮件配置为默认值吗？"
      },
      "sms": {
        "name": "名称",
        "namePlaceholder": "请输入名称",
        "supplier": "厂商",
        "supplierPlaceholder": "请选择厂商",
        "accessKey": "Access Key",
        "accessKeyPlaceholder": "请输入Access Key",
        "secretKey": "Secret Key",
        "signature": "短信签名",
        "signaturePlaceholder": "请输入短信签名",
        "templateId": "模板 ID",
        "templateIdPlaceholder": "请输入模板ID",
        "weight": "负载均衡权重",
        "retryInterval": "重试间隔",
        "retryIntervalUnit": "秒",
        "maxRetries": "重试次数",
        "maximum": "发送上限",
        "supplierConfig": "厂商配置",
        "isDefault": "是否默认",
        "searchName": "搜索名称",
        "searchAccessKey": "搜索Access Key",
        "deleteConfirm": "是否确定删除短信配置「{name}」？",
        "setDefaultConfirm": "是否确定将短信配置「{name}」设为默认配置？",
        "addTitle": "新增短信配置",
        "editTitle": "修改短信配置",
        "sendRecord": "发送记录"
      },
      "storage": {
        "name": "名称",
        "code": "编码",
        "type": "存储类型",
        "accessKey": "Access Key",
        "endpoint": "Endpoint",
        "bucketName": "Bucket/存储路径",
        "domain": "域名/访问路径",
        "recycleBinEnabled": "启用回收站",
        "recycleBinPath": "回收站路径",
        "isDefault": "默认存储",
        "localStorage": "本地存储",
        "objectStorage": "对象存储",
        "all": "全部",
        "searchPlaceholder": "搜索名称/编码",
        "enableConfirm": "是否确定启用{type}「{name}({code})」？",
        "disableConfirm": "是否确定禁用{type}「{name}({code})」？",
        "setDefaultConfirm": "是否确定将{type}「{name}({code})」设为默认存储？",
        "deleteConfirm": "是否确定删除存储「{name}({code})」？",
        "addLocalTitle": "新增本地存储",
        "addOssTitle": "新增对象存储",
        "editLocalTitle": "修改本地存储",
        "editOssTitle": "修改对象存储",
        "createLocalStorage": "点击创建本地存储",
        "createOssStorage": "点击创建对象存储"
      },
      "client": {
        "clientId": "客户端 ID",
        "clientType": "客户端类型",
        "authType": "认证类型",
        "activeTimeout": "Token 最低活跃频率",
        "activeTimeoutUnit": "秒",
        "activeTimeoutUnlimited": "不限制永不冻结",
        "timeout": "Token 有效期",
        "timeoutUnit": "秒",
        "timeoutUnlimited": "永不过期",
        "isConcurrent": "是否允许同一账号多地同时登录",
        "replacedRange": "顶人下线的范围",
        "maxLoginCount": "同一账号最大登录数量",
        "maxLoginCountUnit": "个",
        "maxLoginCountUnlimited": "不限制",
        "overflowLogoutMode": "溢出人数的下线方式",
        "detailTitle": "客户端详情",
        "addTitle": "新增客户端",
        "editTitle": "修改客户端",
        "deleteConfirm": "是否确定删除客户端「{clientId}」？",
        "detail": {
          "id": "ID",
          "clientId": "客户端 ID",
          "clientType": "客户端类型",
          "authType": "认证类型",
          "activeTimeout": "Token 最低活跃频率",
          "timeout": "Token 有效期",
          "status": "状态",
          "isConcurrent": "多地登录",
          "replacedRange": "下线范围",
          "maxLoginCount": "登录数量",
          "overflowLogoutMode": "溢出处理",
          "createUser": "创建人",
          "createTime": "创建时间",
          "updateUser": "更新人",
          "updateTime": "更新时间"
        }
      }
    }
  }
}
```

**步骤 2: 保存文件**

确保 JSON 格式正确，注意逗号和花括号匹配。

---

### Task 2: 添加英文国际化文本

**文件:**

- 修改: `src/locales/langs/en.json`

**步骤 1: 在 en.json 中添加配置管理模块文本**

添加对应的英文翻译：

```json
{
  "system": {
    "config": {
      "title": "Configuration Management",
      "tabs": {
        "site": "Site Config",
        "security": "Security Config",
        "login": "Login Config",
        "mail": "Mail Config",
        "sms": "SMS Config",
        "storage": "Storage Config",
        "client": "Client Config"
      },
      "site": {
        "siteLogo": "Site Logo",
        "siteLogoHint": "Recommended size 50x50px",
        "siteFavicon": "Site Favicon",
        "siteFaviconHint": "Recommended size 46x46px",
        "siteTitle": "System Name",
        "siteTitlePlaceholder": "Please enter system name",
        "siteTitleMax": "System name max 18 characters",
        "siteDescription": "System Description",
        "siteDescriptionPlaceholder": "Please enter system description",
        "siteCopyright": "Copyright",
        "siteCopyrightPlaceholder": "Please enter copyright",
        "siteBeian": "ICP License",
        "siteBeianPlaceholder": "Please enter ICP license",
        "siteBeianMax": "ICP license max 30 characters",
        "resetConfirm": "Confirm to restore site configuration to default?"
      },
      "security": {
        "passwordErrorLockCount": "Password Error Count",
        "passwordErrorLockCountUnit": "times",
        "passwordErrorLockCountRange": "Lock account after how many wrong passwords",
        "passwordErrorLockMinutes": "Lock Duration",
        "passwordErrorLockMinutesUnit": "minutes",
        "passwordExpirationDays": "Password Validity Period",
        "passwordExpirationDaysUnit": "days",
        "passwordExpirationWarningDays": "Password Expiry Warning",
        "passwordExpirationWarningDaysUnit": "days",
        "passwordRepetitionTimes": "Password Repetition Times",
        "passwordRepetitionTimesUnit": "times",
        "passwordRepetitionTimesDesc": "New password cannot repeat last N passwords",
        "passwordMinLength": "Password Min Length",
        "passwordAllowContainUsername": "Allow Password Contain Username",
        "passwordRequireSymbols": "Password Require Special Characters",
        "resetConfirm": "Confirm to restore security configuration to default?",
        "warningLessThanExpiry": "Password expiry warning time should be less than validity period"
      },
      "login": {
        "loginCaptchaEnabled": "Login Captcha Switch",
        "resetConfirm": "Confirm to restore login configuration to default?"
      },
      "mail": {
        "mailProtocol": "Mail Protocol",
        "mailHost": "SMTP Server Address",
        "mailHostPlaceholder": "Please enter SMTP server address",
        "mailPort": "SMTP Port",
        "mailUsername": "Sender Email",
        "mailUsernamePlaceholder": "Please enter sender email",
        "mailPassword": "Sender Password",
        "mailPasswordPlaceholder": "Please enter sender password",
        "mailSslEnabled": "Enable SSL",
        "mailSslPort": "SSL Port",
        "resetConfirm": "Confirm to restore mail configuration to default?"
      },
      "sms": {
        "name": "Name",
        "namePlaceholder": "Please enter name",
        "supplier": "Supplier",
        "supplierPlaceholder": "Please select supplier",
        "accessKey": "Access Key",
        "accessKeyPlaceholder": "Please enter Access Key",
        "secretKey": "Secret Key",
        "signature": "SMS Signature",
        "signaturePlaceholder": "Please enter SMS signature",
        "templateId": "Template ID",
        "templateIdPlaceholder": "Please enter template ID",
        "weight": "Load Balance Weight",
        "retryInterval": "Retry Interval",
        "retryIntervalUnit": "seconds",
        "maxRetries": "Max Retries",
        "maximum": "Send Limit",
        "supplierConfig": "Supplier Config",
        "isDefault": "Is Default",
        "searchName": "Search name",
        "searchAccessKey": "Search Access Key",
        "deleteConfirm": "Confirm to delete SMS config \"{name}\"?",
        "setDefaultConfirm": "Confirm to set SMS config \"{name}\" as default?",
        "addTitle": "Add SMS Config",
        "editTitle": "Edit SMS Config",
        "sendRecord": "Send Record"
      },
      "storage": {
        "name": "Name",
        "code": "Code",
        "type": "Storage Type",
        "accessKey": "Access Key",
        "endpoint": "Endpoint",
        "bucketName": "Bucket/Storage Path",
        "domain": "Domain/Access Path",
        "recycleBinEnabled": "Enable Recycle Bin",
        "recycleBinPath": "Recycle Bin Path",
        "isDefault": "Default Storage",
        "localStorage": "Local Storage",
        "objectStorage": "Object Storage",
        "all": "All",
        "searchPlaceholder": "Search name/code",
        "enableConfirm": "Confirm to enable {type} \"{name}({code})\"?",
        "disableConfirm": "Confirm to disable {type} \"{name}({code})\"?",
        "setDefaultConfirm": "Confirm to set {type} \"{name}({code})\" as default storage?",
        "deleteConfirm": "Confirm to delete storage \"{name}({code})\"?",
        "addLocalTitle": "Add Local Storage",
        "addOssTitle": "Add Object Storage",
        "editLocalTitle": "Edit Local Storage",
        "editOssTitle": "Edit Object Storage",
        "createLocalStorage": "Click to create local storage",
        "createOssStorage": "Click to create object storage"
      },
      "client": {
        "clientId": "Client ID",
        "clientType": "Client Type",
        "authType": "Auth Type",
        "activeTimeout": "Token Min Active Frequency",
        "activeTimeoutUnit": "seconds",
        "activeTimeoutUnlimited": "Unlimited never freeze",
        "timeout": "Token Validity Period",
        "timeoutUnit": "seconds",
        "timeoutUnlimited": "Never expires",
        "isConcurrent": "Allow Same Account Login From Multiple Places",
        "replacedRange": "Replace Logout Range",
        "maxLoginCount": "Same Account Max Login Count",
        "maxLoginCountUnit": "",
        "maxLoginCountUnlimited": "Unlimited",
        "overflowLogoutMode": "Overflow Logout Mode",
        "detailTitle": "Client Detail",
        "addTitle": "Add Client",
        "editTitle": "Edit Client",
        "deleteConfirm": "Confirm to delete client \"{clientId}\"?",
        "detail": {
          "id": "ID",
          "clientId": "Client ID",
          "clientType": "Client Type",
          "authType": "Auth Type",
          "activeTimeout": "Token Min Active Frequency",
          "timeout": "Token Validity Period",
          "status": "Status",
          "isConcurrent": "Multi-Login",
          "replacedRange": "Logout Range",
          "maxLoginCount": "Login Count",
          "overflowLogoutMode": "Overflow Mode",
          "createUser": "Create User",
          "createTime": "Create Time",
          "updateUser": "Update User",
          "updateTime": "Update Time"
        }
      }
    }
  }
}
```

**步骤 2: 保存文件**

确保 JSON 格式正确。

---

## 阶段二：主入口文件

### Task 3: 创建配置管理主入口文件

**文件:**

- 创建: `src/views/system/config/index.vue`

**步骤 1: 创建主入口组件**

```vue
<template>
  <CaPageLayout>
    <template #header>
      <ElTabs v-model="activeKey" @tab-click="handleTabClick">
        <ElTabPane v-for="item in configTabs" :key="item.key" :name="item.key" :tab="item.name" />
      </ElTabs>
    </template>

    <component :is="activeComponent" />
  </CaPageLayout>
</template>

<script setup lang="ts">
  import { computed, markAsync, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import CaPageLayout from '@/components/base/CaPageLayout/index.vue'
  import { ElTabPane, ElTabs } from 'element-plus'

  defineOptions({ name: 'SystemConfig' })

  const route = useRoute()
  const { t } = useI18n()

  // 配置项标签页列表
  const configTabs = computed(() => [
    { key: 'site', name: t('system.config.tabs.site') },
    { key: 'security', name: t('system.config.tabs.security') },
    { key: 'login', name: t('system.config.tabs.login') },
    { key: 'mail', name: t('system.config.tabs.mail') },
    { key: 'sms', name: t('system.config.tabs.sms') },
    { key: 'storage', name: t('system.config.tabs.storage') },
    { key: 'client', name: t('system.config.tabs.client') }
  ])

  // 当前激活的标签页 key
  const activeKey = ref('site')

  // 标签页点击事件
  const handleTabClick = () => {
    // 更新路由 query 参数（可选）
  }

  // 动态组件映射
  const components = {
    site: markAsync(() => import('./site/index.vue')),
    security: markAsync(() => import('./security/index.vue')),
    login: markAsync(() => import('./login/index.vue')),
    mail: markAsync(() => import('./mail/index.vue')),
    sms: markAsync(() => import('./sms/index.vue')),
    storage: markAsync(() => import('./storage/index.vue')),
    client: markAsync(() => import('./client/index.vue'))
  }

  // 当前激活的组件
  const activeComponent = computed(() => components[activeKey.value])
</script>

<style scoped lang="scss">
  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 16px;
  }
</style>
```

**步骤 2: 保存文件**

---

## 阶段三：表单类配置模块

### Task 4: 创建站点配置模块

**文件:**

- 创建: `src/views/system/config/site/index.vue`

**步骤 1: 创建站点配置组件**

```vue
<template>
  <div class="config-form-container">
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      class="config-form"
    >
      <!-- 站点Logo -->
      <ElFormItem :label="t('system.config.site.siteLogo')" prop="SITE_LOGO">
        <div v-if="!isEditing" class="image-preview">
          <ElImage
            v-if="formData.SITE_LOGO"
            :src="formData.SITE_LOGO"
            fit="contain"
            style="width: 50px; height: 50px"
          />
          <span v-else>{{ t('common.empty') }}</span>
        </div>
        <CaUpload
          v-else
          v-model="formData.SITE_LOGO"
          :limit="1"
          list-type="picture-card"
          :show-file-list="false"
        >
          <ElIcon><Plus /></ElIcon>
        </CaUpload>
        <span class="form-item-hint">{{ t('system.config.site.siteLogoHint') }}</span>
      </ElFormItem>

      <!-- 站点图标 -->
      <ElFormItem :label="t('system.config.site.siteFavicon')" prop="SITE_FAVICON">
        <div v-if="!isEditing" class="image-preview">
          <ElImage
            v-if="formData.SITE_FAVICON"
            :src="formData.SITE_FAVICON"
            fit="contain"
            style="width: 46px; height: 46px"
          />
          <span v-else>{{ t('common.empty') }}</span>
        </div>
        <CaUpload
          v-else
          v-model="formData.SITE_FAVICON"
          :limit="1"
          list-type="picture-card"
          :show-file-list="false"
        >
          <ElIcon><Plus /></ElIcon>
        </CaUpload>
        <span class="form-item-hint">{{ t('system.config.site.siteFaviconHint') }}</span>
      </ElFormItem>

      <!-- 系统名称 -->
      <ElFormItem :label="t('system.config.site.siteTitle')" prop="SITE_TITLE">
        <ElInput
          v-if="isEditing"
          v-model="formData.SITE_TITLE"
          :placeholder="t('system.config.site.siteTitlePlaceholder')"
          maxlength="18"
          show-word-limit
        />
        <span v-else>{{ formData.SITE_TITLE || t('common.empty') }}</span>
      </ElFormItem>

      <!-- 系统描述 -->
      <ElFormItem :label="t('system.config.site.siteDescription')" prop="SITE_DESCRIPTION">
        <ElInput
          v-if="isEditing"
          v-model="formData.SITE_DESCRIPTION"
          type="textarea"
          :placeholder="t('system.config.site.siteDescriptionPlaceholder')"
          :autosize="{ minRows: 2, maxRows: 6 }"
        />
        <span v-else>{{ formData.SITE_DESCRIPTION || t('common.empty') }}</span>
      </ElFormItem>

      <!-- 版权声明 -->
      <ElFormItem :label="t('system.config.site.siteCopyright')" prop="SITE_COPYRIGHT">
        <ElInput
          v-if="isEditing"
          v-model="formData.SITE_COPYRIGHT"
          :placeholder="t('system.config.site.siteCopyrightPlaceholder')"
        />
        <span v-else>{{ formData.SITE_COPYRIGHT || t('common.empty') }}</span>
      </ElFormItem>

      <!-- 备案号 -->
      <ElFormItem :label="t('system.config.site.siteBeian')" prop="SITE_BEIAN">
        <ElInput
          v-if="isEditing"
          v-model="formData.SITE_BEIAN"
          :placeholder="t('system.config.site.siteBeianPlaceholder')"
          maxlength="30"
          show-word-limit
        />
        <span v-else>{{ formData.SITE_BEIAN || t('common.empty') }}</span>
      </ElFormItem>

      <!-- 操作按钮 -->
      <ElFormItem>
        <ElSpace v-if="!isEditing">
          <ElButton type="primary" @click="handleEdit">{{ t('common.button.edit') }}</ElButton>
        </ElSpace>
        <ElSpace v-else>
          <ElButton type="primary" @click="handleSave">{{ t('common.confirm') }}</ElButton>
          <ElButton @click="handleReset">{{ t('common.button.reset') }}</ElButton>
          <ElButton type="warning" @click="handleRestoreDefault">{{
            t('system.config.site.resetConfirm')
          }}</ElButton>
          <ElButton @click="handleCancel">{{ t('common.cancel') }}</ElButton>
        </ElSpace>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import { listOption, resetOptionValue, updateOption } from '@/apis/system/option'
  import type { SiteConfig } from '@/apis/system/type'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'SiteConfig' })

  const { t } = useI18n()

  const formRef = ref()
  const isEditing = ref(false)
  const originalData = ref<SiteConfig>({})

  // 表单数据
  const formData = ref<SiteConfig>({
    SITE_FAVICON: '',
    SITE_LOGO: '',
    SITE_TITLE: '',
    SITE_DESCRIPTION: '',
    SITE_COPYRIGHT: '',
    SITE_BEIAN: ''
  })

  // 表单验证规则
  const formRules = computed(() => ({
    SITE_TITLE: [
      { required: true, message: t('system.config.site.siteTitlePlaceholder'), trigger: 'blur' },
      { max: 18, message: t('system.config.site.siteTitleMax'), trigger: 'blur' }
    ],
    SITE_BEIAN: [{ max: 30, message: t('system.config.site.siteBeianMax'), trigger: 'blur' }]
  }))

  // 查询配置
  const fetchConfig = async () => {
    try {
      const res = await listOption({ category: 'SITE' })
      const configMap: Record<string, string> = {}
      res.forEach((item) => {
        configMap[item.code] = item.value
      })
      formData.value = {
        SITE_FAVICON: configMap.SITE_FAVICON || '',
        SITE_LOGO: configMap.SITE_LOGO || '',
        SITE_TITLE: configMap.SITE_TITLE || '',
        SITE_DESCRIPTION: configMap.SITE_DESCRIPTION || '',
        SITE_COPYRIGHT: configMap.SITE_COPYRIGHT || '',
        SITE_BEIAN: configMap.SITE_BEIAN || ''
      }
      originalData.value = { ...formData.value }
    } catch (error) {
      console.error('Failed to fetch site config:', error)
    }
  }

  // 编辑
  const handleEdit = () => {
    isEditing.value = true
  }

  // 保存
  const handleSave = async () => {
    await formRef.value?.validate()
    try {
      const data = Object.entries(formData.value).map(([code, value]) => ({ code, value }))
      await updateOption(data)
      ElMessage.success(t('common.success'))
      isEditing.value = false
      originalData.value = { ...formData.value }
    } catch (error) {
      console.error('Failed to update site config:', error)
    }
  }

  // 重置
  const handleReset = () => {
    formData.value = { ...originalData.value }
  }

  // 恢复默认
  const handleRestoreDefault = () => {
    ElMessageBox.confirm(t('system.config.site.resetConfirm'), t('common.tips'), {
      type: 'warning'
    })
      .then(async () => {
        await resetOptionValue({ category: 'SITE' })
        ElMessage.success(t('common.success'))
        await fetchConfig()
        isEditing.value = false
      })
      .catch(() => {})
  }

  // 取消
  const handleCancel = () => {
    formData.value = { ...originalData.value }
    isEditing.value = false
  }

  onMounted(() => {
    fetchConfig()
  })
</script>

<style scoped lang="scss">
  .config-form-container {
    padding: 20px;
  }

  .config-form {
    max-width: 600px;
  }

  .image-preview {
    display: flex;
    align-items: center;
  }

  .form-item-hint {
    margin-left: 10px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
</style>
```

**步骤 2: 保存文件**

---

### Task 5: 创建安全配置模块

**文件:**

- 创建: `src/views/system/config/security/index.vue`

**步骤 1: 创建安全配置组件**

```vue
<template>
  <div class="config-form-container">
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="180px"
      class="config-form"
    >
      <!-- 密码错误次数 -->
      <ElFormItem
        :label="t('system.config.security.passwordErrorLockCount')"
        prop="PASSWORD_ERROR_LOCK_COUNT"
      >
        <ElInputNumber
          v-if="isEditing"
          v-model="formData.PASSWORD_ERROR_LOCK_COUNT"
          :min="0"
          :max="10"
          :controls-position="'right'"
        />
        <span v-else>{{ formData.PASSWORD_ERROR_LOCK_COUNT }}</span>
        <span class="unit">{{ t('system.config.security.passwordErrorLockCountUnit') }}</span>
        <span class="hint">{{ t('system.config.security.passwordErrorLockCountRange') }}</span>
      </ElFormItem>

      <!-- 锁定时长 -->
      <ElFormItem
        :label="t('system.config.security.passwordErrorLockMinutes')"
        prop="PASSWORD_ERROR_LOCK_MINUTES"
      >
        <ElInputNumber
          v-if="isEditing"
          v-model="formData.PASSWORD_ERROR_LOCK_MINUTES"
          :min="1"
          :max="1440"
          :controls-position="'right'"
        />
        <span v-else>{{ formData.PASSWORD_ERROR_LOCK_MINUTES }}</span>
        <span class="unit">{{ t('system.config.security.passwordErrorLockMinutesUnit') }}</span>
      </ElFormItem>

      <!-- 密码有效期 -->
      <ElFormItem
        :label="t('system.config.security.passwordExpirationDays')"
        prop="PASSWORD_EXPIRATION_DAYS"
      >
        <ElInputNumber
          v-if="isEditing"
          v-model="formData.PASSWORD_EXPIRATION_DAYS"
          :min="0"
          :max="999"
          :controls-position="'right'"
        />
        <span v-else>{{ formData.PASSWORD_EXPIRATION_DAYS }}</span>
        <span class="unit">{{ t('system.config.security.passwordExpirationDaysUnit') }}</span>
      </ElFormItem>

      <!-- 密码到期提醒 -->
      <ElFormItem
        :label="t('system.config.security.passwordExpirationWarningDays')"
        prop="PASSWORD_EXPIRATION_WARNING_DAYS"
      >
        <ElInputNumber
          v-if="isEditing"
          v-model="formData.PASSWORD_EXPIRATION_WARNING_DAYS"
          :min="0"
          :max="998"
          :controls-position="'right'"
        />
        <span v-else>{{ formData.PASSWORD_EXPIRATION_WARNING_DAYS }}</span>
        <span class="unit">{{
          t('system.config.security.passwordExpirationWarningDaysUnit')
        }}</span>
      </ElFormItem>

      <!-- 密码重复次数 -->
      <ElFormItem
        :label="t('system.config.security.passwordRepetitionTimes')"
        prop="PASSWORD_REPETITION_TIMES"
      >
        <ElInputNumber
          v-if="isEditing"
          v-model="formData.PASSWORD_REPETITION_TIMES"
          :min="3"
          :max="32"
          :controls-position="'right'"
        />
        <span v-else>{{ formData.PASSWORD_REPETITION_TIMES }}</span>
        <span class="unit">{{ t('system.config.security.passwordRepetitionTimesUnit') }}</span>
        <span class="hint">{{ t('system.config.security.passwordRepetitionTimesDesc') }}</span>
      </ElFormItem>

      <!-- 密码最小长度 -->
      <ElFormItem :label="t('system.config.security.passwordMinLength')" prop="PASSWORD_MIN_LENGTH">
        <ElInputNumber
          v-if="isEditing"
          v-model="formData.PASSWORD_MIN_LENGTH"
          :min="8"
          :max="32"
          :controls-position="'right'"
        />
        <span v-else>{{ formData.PASSWORD_MIN_LENGTH }}</span>
      </ElFormItem>

      <!-- 允许密码包含用户名 -->
      <ElFormItem
        :label="t('system.config.security.passwordAllowContainUsername')"
        prop="PASSWORD_ALLOW_CONTAIN_USERNAME"
      >
        <ElSwitch v-if="isEditing" v-model="formData.PASSWORD_ALLOW_CONTAIN_USERNAME" />
        <span v-else>{{
          formData.PASSWORD_ALLOW_CONTAIN_USERNAME ? t('common.true') : t('common.false')
        }}</span>
      </ElFormItem>

      <!-- 密码必须包含特殊字符 -->
      <ElFormItem
        :label="t('system.config.security.passwordRequireSymbols')"
        prop="PASSWORD_REQUIRE_SYMBOLS"
      >
        <ElSwitch v-if="isEditing" v-model="formData.PASSWORD_REQUIRE_SYMBOLS" />
        <span v-else>{{
          formData.PASSWORD_REQUIRE_SYMBOLS ? t('common.true') : t('common.false')
        }}</span>
      </ElFormItem>

      <!-- 操作按钮 -->
      <ElFormItem>
        <ElSpace v-if="!isEditing">
          <ElButton type="primary" @click="handleEdit">{{ t('common.button.edit') }}</ElButton>
        </ElSpace>
        <ElSpace v-else>
          <ElButton type="primary" @click="handleSave">{{ t('common.confirm') }}</ElButton>
          <ElButton @click="handleReset">{{ t('common.button.reset') }}</ElButton>
          <ElButton type="warning" @click="handleRestoreDefault">{{
            t('system.config.security.resetConfirm')
          }}</ElButton>
          <ElButton @click="handleCancel">{{ t('common.cancel') }}</ElButton>
        </ElSpace>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { listOption, resetOptionValue, updateOption } from '@/apis/system/option'
  import type { SecurityConfig } from '@/apis/system/type'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'SecurityConfig' })

  const { t } = useI18n()

  const formRef = ref()
  const isEditing = ref(false)
  const originalData = ref<SecurityConfig>({})

  // 表单数据
  const formData = ref<SecurityConfig>({
    PASSWORD_ERROR_LOCK_COUNT: 0,
    PASSWORD_ERROR_LOCK_MINUTES: 1,
    PASSWORD_EXPIRATION_DAYS: 0,
    PASSWORD_EXPIRATION_WARNING_DAYS: 0,
    PASSWORD_REPETITION_TIMES: 3,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_ALLOW_CONTAIN_USERNAME: false,
    PASSWORD_REQUIRE_SYMBOLS: false
  })

  // 表单验证规则
  const formRules = computed(() => ({
    PASSWORD_EXPIRATION_WARNING_DAYS: [
      {
        validator: (_rule: any, value: number, callback: any) => {
          if (value >= formData.value.PASSWORD_EXPIRATION_DAYS) {
            callback(new Error(t('system.config.security.warningLessThanExpiry')))
          } else {
            callback()
          }
        },
        trigger: 'change'
      }
    ]
  }))

  // 查询配置
  const fetchConfig = async () => {
    try {
      const res = await listOption({ category: 'PASSWORD' })
      const configMap: Record<string, any> = {}
      res.forEach((item) => {
        configMap[item.code] =
          item.value === 'true' ? true : item.value === 'false' ? false : item.value
      })
      formData.value = {
        PASSWORD_ERROR_LOCK_COUNT: Number(configMap.PASSWORD_ERROR_LOCK_COUNT) || 0,
        PASSWORD_ERROR_LOCK_MINUTES: Number(configMap.PASSWORD_ERROR_LOCK_MINUTES) || 1,
        PASSWORD_EXPIRATION_DAYS: Number(configMap.PASSWORD_EXPIRATION_DAYS) || 0,
        PASSWORD_EXPIRATION_WARNING_DAYS: Number(configMap.PASSWORD_EXPIRATION_WARNING_DAYS) || 0,
        PASSWORD_REPETITION_TIMES: Number(configMap.PASSWORD_REPETITION_TIMES) || 3,
        PASSWORD_MIN_LENGTH: Number(configMap.PASSWORD_MIN_LENGTH) || 8,
        PASSWORD_ALLOW_CONTAIN_USERNAME: Boolean(configMap.PASSWORD_ALLOW_CONTAIN_USERNAME),
        PASSWORD_REQUIRE_SYMBOLS: Boolean(configMap.PASSWORD_REQUIRE_SYMBOLS)
      }
      originalData.value = { ...formData.value }
    } catch (error) {
      console.error('Failed to fetch security config:', error)
    }
  }

  // 编辑
  const handleEdit = () => {
    isEditing.value = true
  }

  // 保存
  const handleSave = async () => {
    await formRef.value?.validate()
    try {
      const data = Object.entries(formData.value).map(([code, value]) => ({
        code,
        value: String(value)
      }))
      await updateOption(data)
      ElMessage.success(t('common.success'))
      isEditing.value = false
      originalData.value = { ...formData.value }
    } catch (error) {
      console.error('Failed to update security config:', error)
    }
  }

  // 重置
  const handleReset = () => {
    formData.value = { ...originalData.value }
  }

  // 恢复默认
  const handleRestoreDefault = () => {
    ElMessageBox.confirm(t('system.config.security.resetConfirm'), t('common.tips'), {
      type: 'warning'
    })
      .then(async () => {
        await resetOptionValue({ category: 'PASSWORD' })
        ElMessage.success(t('common.success'))
        await fetchConfig()
        isEditing.value = false
      })
      .catch(() => {})
  }

  // 取消
  const handleCancel = () => {
    formData.value = { ...originalData.value }
    isEditing.value = false
  }

  onMounted(() => {
    fetchConfig()
  })
</script>

<style scoped lang="scss">
  .config-form-container {
    padding: 20px;
  }

  .config-form {
    max-width: 600px;
  }

  .unit {
    margin-left: 8px;
    color: var(--el-text-color-regular);
  }

  .hint {
    margin-left: 8px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
</style>
```

**步骤 2: 保存文件**

---

### Task 6: 创建登录配置模块

**文件:**

- 创建: `src/views/system/config/login/index.vue`

**步骤 1: 创建登录配置组件**

```vue
<template>
  <div class="config-form-container">
    <ElForm ref="formRef" :model="formData" label-width="180px" class="config-form">
      <!-- 登录验证码开关 -->
      <ElFormItem
        :label="t('system.config.login.loginCaptchaEnabled')"
        prop="LOGIN_CAPTCHA_ENABLED"
      >
        <ElSwitch v-if="isEditing" v-model="formData.LOGIN_CAPTCHA_ENABLED" />
        <span v-else>{{
          formData.LOGIN_CAPTCHA_ENABLED ? t('common.true') : t('common.false')
        }}</span>
      </ElFormItem>

      <!-- 操作按钮 -->
      <ElFormItem>
        <ElSpace v-if="!isEditing">
          <ElButton type="primary" @click="handleEdit">{{ t('common.button.edit') }}</ElButton>
        </ElSpace>
        <ElSpace v-else>
          <ElButton type="primary" @click="handleSave">{{ t('common.confirm') }}</ElButton>
          <ElButton @click="handleReset">{{ t('common.button.reset') }}</ElButton>
          <ElButton type="warning" @click="handleRestoreDefault">{{
            t('system.config.login.resetConfirm')
          }}</ElButton>
          <ElButton @click="handleCancel">{{ t('common.cancel') }}</ElButton>
        </ElSpace>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { listOption, resetOptionValue, updateOption } from '@/apis/system/option'
  import type { LoginConfig } from '@/apis/system/type'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'LoginConfig' })

  const { t } = useI18n()

  const formRef = ref()
  const isEditing = ref(false)
  const originalData = ref<LoginConfig>({})

  // 表单数据
  const formData = ref<LoginConfig>({
    LOGIN_CAPTCHA_ENABLED: false
  })

  // 查询配置
  const fetchConfig = async () => {
    try {
      const res = await listOption({ category: 'LOGIN' })
      const configMap: Record<string, any> = {}
      res.forEach((item) => {
        configMap[item.code] =
          item.value === 'true' ? true : item.value === 'false' ? false : item.value
      })
      formData.value = {
        LOGIN_CAPTCHA_ENABLED: Boolean(configMap.LOGIN_CAPTCHA_ENABLED)
      }
      originalData.value = { ...formData.value }
    } catch (error) {
      console.error('Failed to fetch login config:', error)
    }
  }

  // 编辑
  const handleEdit = () => {
    isEditing.value = true
  }

  // 保存
  const handleSave = async () => {
    try {
      const data = Object.entries(formData.value).map(([code, value]) => ({
        code,
        value: String(value)
      }))
      await updateOption(data)
      ElMessage.success(t('common.success'))
      isEditing.value = false
      originalData.value = { ...formData.value }
    } catch (error) {
      console.error('Failed to update login config:', error)
    }
  }

  // 重置
  const handleReset = () => {
    formData.value = { ...originalData.value }
  }

  // 恢复默认
  const handleRestoreDefault = () => {
    ElMessageBox.confirm(t('system.config.login.resetConfirm'), t('common.tips'), {
      type: 'warning'
    })
      .then(async () => {
        await resetOptionValue({ category: 'LOGIN' })
        ElMessage.success(t('common.success'))
        await fetchConfig()
        isEditing.value = false
      })
      .catch(() => {})
  }

  // 取消
  const handleCancel = () => {
    formData.value = { ...originalData.value }
    isEditing.value = false
  }

  onMounted(() => {
    fetchConfig()
  })
</script>

<style scoped lang="scss">
  .config-form-container {
    padding: 20px;
  }

  .config-form {
    max-width: 600px;
  }
</style>
```

**步骤 2: 保存文件**

---

### Task 7: 创建邮件配置模块

**文件:**

- 创建: `src/views/system/config/mail/index.vue`

**步骤 1: 创建邮件配置组件**

```vue
<template>
  <div class="config-form-container">
    <ElForm
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="140px"
      class="config-form"
    >
      <!-- 邮件协议 -->
      <ElFormItem :label="t('system.config.mail.mailProtocol')" prop="MAIL_PROTOCOL">
        <ElSelect v-if="isEditing" v-model="formData.MAIL_PROTOCOL" style="width: 200px">
          <ElOption label="SMTP" value="SMTP" />
        </ElSelect>
        <span v-else>{{ formData.MAIL_PROTOCOL }}</span>
      </ElFormItem>

      <!-- SMTP服务器地址 -->
      <ElFormItem :label="t('system.config.mail.mailHost')" prop="MAIL_HOST">
        <ElInput
          v-if="isEditing"
          v-model="formData.MAIL_HOST"
          :placeholder="t('system.config.mail.mailHostPlaceholder')"
        />
        <span v-else>{{ formData.MAIL_HOST || t('common.empty') }}</span>
      </ElFormItem>

      <!-- SMTP端口 -->
      <ElFormItem :label="t('system.config.mail.mailPort')" prop="MAIL_PORT">
        <ElInputNumber v-if="isEditing" v-model="formData.MAIL_PORT" :min="1" :max="65535" />
        <span v-else>{{ formData.MAIL_PORT }}</span>
      </ElFormItem>

      <!-- 发件人邮箱 -->
      <ElFormItem :label="t('system.config.mail.mailUsername')" prop="MAIL_USERNAME">
        <ElInput
          v-if="isEditing"
          v-model="formData.MAIL_USERNAME"
          :placeholder="t('system.config.mail.mailUsernamePlaceholder')"
        />
        <span v-else>{{ formData.MAIL_USERNAME || t('common.empty') }}</span>
      </ElFormItem>

      <!-- 发件人密码 -->
      <ElFormItem :label="t('system.config.mail.mailPassword')" prop="MAIL_PASSWORD">
        <ElInput
          v-if="isEditing"
          v-model="formData.MAIL_PASSWORD"
          type="password"
          :placeholder="t('system.config.mail.mailPasswordPlaceholder')"
          show-password
        />
        <span v-else>{{ formData.MAIL_PASSWORD ? '******' : t('common.empty') }}</span>
      </ElFormItem>

      <!-- 启用SSL -->
      <ElFormItem :label="t('system.config.mail.mailSslEnabled')" prop="MAIL_SSL_ENABLED">
        <ElSwitch v-if="isEditing" v-model="formData.MAIL_SSL_ENABLED" />
        <span v-else>{{
          formData.MAIL_SSL_ENABLED ? t('common.statusEnabled') : t('common.statusDisabled')
        }}</span>
      </ElFormItem>

      <!-- SSL端口 -->
      <ElFormItem
        v-if="formData.MAIL_SSL_ENABLED"
        :label="t('system.config.mail.mailSslPort')"
        prop="MAIL_SSL_PORT"
      >
        <ElInputNumber v-if="isEditing" v-model="formData.MAIL_SSL_PORT" :min="1" :max="65535" />
        <span v-else>{{ formData.MAIL_SSL_PORT }}</span>
      </ElFormItem>

      <!-- 操作按钮 -->
      <ElFormItem>
        <ElSpace v-if="!isEditing">
          <ElButton type="primary" @click="handleEdit">{{ t('common.button.edit') }}</ElButton>
        </ElSpace>
        <ElSpace v-else>
          <ElButton type="primary" @click="handleSave">{{ t('common.confirm') }}</ElButton>
          <ElButton @click="handleReset">{{ t('common.button.reset') }}</ElButton>
          <ElButton type="warning" @click="handleRestoreDefault">{{
            t('system.config.mail.resetConfirm')
          }}</ElButton>
          <ElButton @click="handleCancel">{{ t('common.cancel') }}</ElButton>
        </ElSpace>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { listOption, resetOptionValue, updateOption } from '@/apis/system/option'
  import type { MailConfig } from '@/apis/system/type'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'MailConfig' })

  const { t } = useI18n()

  const formRef = ref()
  const isEditing = ref(false)
  const originalData = ref<MailConfig>({})

  // 表单数据
  const formData = ref<MailConfig>({
    MAIL_PROTOCOL: 'SMTP',
    MAIL_HOST: '',
    MAIL_PORT: 25,
    MAIL_USERNAME: '',
    MAIL_PASSWORD: '',
    MAIL_SSL_ENABLED: false,
    MAIL_SSL_PORT: 465
  })

  // 表单验证规则
  const formRules = computed(() => ({
    MAIL_HOST: [
      { required: true, message: t('system.config.mail.mailHostPlaceholder'), trigger: 'blur' }
    ],
    MAIL_USERNAME: [
      { required: true, message: t('system.config.mail.mailUsernamePlaceholder'), trigger: 'blur' }
    ],
    MAIL_PASSWORD: [
      { required: true, message: t('system.config.mail.mailPasswordPlaceholder'), trigger: 'blur' }
    ]
  }))

  // 查询配置
  const fetchConfig = async () => {
    try {
      const res = await listOption({ category: 'MAIL' })
      const configMap: Record<string, any> = {}
      res.forEach((item) => {
        configMap[item.code] =
          item.value === 'true' ? true : item.value === 'false' ? false : item.value
      })
      formData.value = {
        MAIL_PROTOCOL: configMap.MAIL_PROTOCOL || 'SMTP',
        MAIL_HOST: configMap.MAIL_HOST || '',
        MAIL_PORT: Number(configMap.MAIL_PORT) || 25,
        MAIL_USERNAME: configMap.MAIL_USERNAME || '',
        MAIL_PASSWORD: configMap.MAIL_PASSWORD || '',
        MAIL_SSL_ENABLED: Boolean(configMap.MAIL_SSL_ENABLED),
        MAIL_SSL_PORT: Number(configMap.MAIL_SSL_PORT) || 465
      }
      originalData.value = { ...formData.value }
    } catch (error) {
      console.error('Failed to fetch mail config:', error)
    }
  }

  // 编辑
  const handleEdit = () => {
    isEditing.value = true
  }

  // 保存
  const handleSave = async () => {
    await formRef.value?.validate()
    try {
      const data = Object.entries(formData.value).map(([code, value]) => ({
        code,
        value: String(value)
      }))
      await updateOption(data)
      ElMessage.success(t('common.success'))
      isEditing.value = false
      originalData.value = { ...formData.value }
    } catch (error) {
      console.error('Failed to update mail config:', error)
    }
  }

  // 重置
  const handleReset = () => {
    formData.value = { ...originalData.value }
  }

  // 恢复默认
  const handleRestoreDefault = () => {
    ElMessageBox.confirm(t('system.config.mail.resetConfirm'), t('common.tips'), {
      type: 'warning'
    })
      .then(async () => {
        await resetOptionValue({ category: 'MAIL' })
        ElMessage.success(t('common.success'))
        await fetchConfig()
        isEditing.value = false
      })
      .catch(() => {})
  }

  // 取消
  const handleCancel = () => {
    formData.value = { ...originalData.value }
    isEditing.value = false
  }

  onMounted(() => {
    fetchConfig()
  })
</script>

<style scoped lang="scss">
  .config-form-container {
    padding: 20px;
  }

  .config-form {
    max-width: 600px;
  }
</style>
```

**步骤 2: 保存文件**

---

## 阶段四：列表类配置模块

### Task 8: 创建短信配置列表模块

**文件:**

- 创建: `src/views/system/config/sms/index.vue`

**步骤 1: 创建短信配置列表组件**

```vue
<template>
  <CaTable
    row-key="id"
    :data="tableData"
    :columns="columns"
    :loading="loading"
    :pagination="pagination"
    @refresh="search"
  >
    <template #top>
      <CaQueryForm v-model="queryForm" mode="click-search" :columns="queryFormColumns" />
    </template>
    <template #toolbar-left>
      <CaButton type="add" @click="onAdd" />
    </template>
    <template #accessKey="{ row }">
      <CellCopy :text="row.accessKey" />
    </template>
    <template #supplier="{ row }">
      <CaCellDict :dict="row.supplier" dict-type="sms_supplier" />
    </template>
    <template #isDefault="{ row }">
      <ElTag v-if="row.isDefault" type="success" size="small">{{ t('common.true') }}</ElTag>
      <ElTag v-else type="info" size="small">{{ t('common.false') }}</ElTag>
    </template>
    <template #status="{ row }">
      <CaCellStatus :status="row.status" />
    </template>
    <template #action="{ row }">
      <ElSpace>
        <ElLink type="primary" @click="onUpdate(record)">{{ t('common.button.edit') }}</ElLink>
        <ElDropdown>
          <ElButton text>
            <ElIcon><MoreFilled /></ElIcon>
          </ElButton>
          <template #dropdown>
            <ElDropdownMenu>
              <ElDropdownItem @click="onSetDefault(row)">
                {{ t('system.config.sms.isDefault') }}
              </ElDropdownItem>
              <ElDropdownItem @click="onDelete(row)">
                <ElLink type="danger" :underline="false">{{ t('common.button.delete') }}</ElLink>
              </ElDropdownItem>
            </ElDropdownMenu>
          </template>
        </ElDropdown>
      </ElSpace>
    </template>
  </CaTable>
  <AddModal ref="AddModalRef" @save-success="search" />
</template>

<script setup lang="ts">
  import { SmsConfigQuery, SmsConfigResp } from '@/apis'
  import { deleteSmsConfig, listSmsConfig, setDefaultSmsConfig } from '@/apis/system/smsConfig'
  import { FormColumnItem } from '@/components/base/CaForm/type'
  import CaQueryForm from '@/components/base/CaQueryForm'
  import { TableColumnItem } from '@/components/base/CaTable/type'
  import { useResetReactive, useTable } from '@/hooks'
  import { MoreFilled } from '@element-plus/icons-vue'
  import { useI18n } from 'vue-i18n'
  import AddModal from './AddModal.vue'

  defineOptions({ name: 'SmsConfig' })

  const { t } = useI18n()
  const [queryForm, resetForm] = useResetReactive<SmsConfigQuery>({
    sort: ['create_time,desc']
  })

  const queryFormColumns = computed(
    () =>
      [
        {
          type: 'input',
          label: t('system.config.sms.name'),
          field: 'name',
          gridItemProps: { span: { xs: 24, sm: 8 } },
          props: { placeholder: t('system.config.sms.searchName') }
        },
        {
          type: 'input',
          label: t('system.config.sms.accessKey'),
          field: 'accessKey',
          gridItemProps: { span: { xs: 24, sm: 8 } },
          props: { placeholder: t('system.config.sms.searchAccessKey') }
        },
        {
          type: 'select',
          label: t('system.config.sms.supplier'),
          field: 'supplier',
          gridItemProps: { span: { xs: 24, sm: 8 } },
          props: { placeholder: t('system.config.sms.supplierPlaceholder'), dict: 'sms_supplier' }
        }
      ] as FormColumnItem<SmsConfigQuery>[]
  )

  const { tableData, loading, pagination, search, handleDelete } = useTable<SmsConfigResp>(
    (page) => listSmsConfig({ ...queryForm, ...page }),
    { immediate: true }
  )

  const columns = computed(
    () =>
      [
        {
          label: t('common.index'),
          width: 66,
          align: 'center',
          render: ({ $index }) =>
            h('span', {}, $index + 1 + (pagination.current - 1) * pagination.pageSize)
        },
        {
          label: t('system.config.sms.name'),
          prop: 'name',
          minWidth: 120,
          showOverflowTooltip: true
        },
        {
          label: t('system.config.sms.supplier'),
          prop: 'supplier',
          slotName: 'supplier',
          align: 'center',
          width: 120
        },
        {
          label: t('system.config.sms.isDefault'),
          prop: 'isDefault',
          slotName: 'isDefault',
          align: 'center',
          width: 100
        },
        {
          label: t('system.config.sms.accessKey'),
          prop: 'accessKey',
          slotName: 'accessKey',
          minWidth: 150
        },
        { label: t('system.config.sms.secretKey'), prop: 'secretKey', minWidth: 150 },
        {
          label: t('system.config.sms.signature'),
          prop: 'signature',
          minWidth: 120,
          showOverflowTooltip: true
        },
        {
          label: t('system.config.sms.templateId'),
          prop: 'templateId',
          minWidth: 120,
          showOverflowTooltip: true
        },
        {
          label: t('common.status'),
          prop: 'status',
          slotName: 'status',
          align: 'center',
          width: 80
        },
        { label: t('system.config.sms.weight'), prop: 'weight', align: 'center', width: 100 },
        {
          label: t('system.config.sms.retryInterval'),
          prop: 'retryInterval',
          align: 'center',
          width: 100
        },
        {
          label: t('system.config.sms.maxRetries'),
          prop: 'maxRetries',
          align: 'center',
          width: 100
        },
        { label: t('system.config.sms.maximum'), prop: 'maximum', align: 'center', width: 100 },
        { label: t('common.createTime'), prop: 'createTime', width: 180 },
        {
          label: t('common.action'),
          prop: 'action',
          slotName: 'action',
          width: 120,
          align: 'center',
          fixed: 'right'
        }
      ] as TableColumnItem[]
  )

  const reset = () => {
    resetForm()
    search()
  }

  const onDelete = (row: SmsConfigResp) => {
    return handleDelete(() => deleteSmsConfig(row.id), {
      content: t('system.config.sms.deleteConfirm', { name: row.name })
    })
  }

  const onSetDefault = async (row: SmsConfigResp) => {
    try {
      await setDefaultSmsConfig(row.id)
      ElMessage.success(t('common.success'))
      search()
    } catch (error) {
      console.error('Failed to set default SMS config:', error)
    }
  }

  const AddModalRef = ref<InstanceType<typeof AddModal>>()
  const onAdd = () => {
    AddModalRef.value?.onAdd()
  }
  const onUpdate = (record: SmsConfigResp) => {
    AddModalRef.value?.onUpdate(record.id)
  }
</script>
```

**步骤 2: 保存文件**

---

### Task 9: 创建短信配置新增/编辑弹窗

**文件:**

- 创建: `src/views/system/config/sms/AddModal.vue`

**步骤 1: 创建新增/编辑弹窗组件**

```vue
<template>
  <CaModal
    ref="ModalRef"
    :title="modalTitle"
    :width="600"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <ElFormItem :label="t('system.config.sms.name')" prop="name">
        <ElInput
          v-model="formData.name"
          :placeholder="t('system.config.sms.namePlaceholder')"
          maxlength="100"
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.supplier')" prop="supplier">
        <CaSelect
          v-model="formData.supplier"
          dict="sms_supplier"
          :placeholder="t('system.config.sms.supplierPlaceholder')"
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.accessKey')" prop="accessKey">
        <ElInput
          v-model="formData.accessKey"
          :placeholder="t('system.config.sms.accessKeyPlaceholder')"
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.secretKey')" prop="secretKey">
        <ElInput v-model="formData.secretKey" type="password" show-password />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.signature')" prop="signature">
        <ElInput
          v-model="formData.signature"
          :placeholder="t('system.config.sms.signaturePlaceholder')"
          maxlength="100"
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.templateId')" prop="templateId">
        <ElInput
          v-model="formData.templateId"
          :placeholder="t('system.config.sms.templateIdPlaceholder')"
          maxlength="50"
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.weight')" prop="weight">
        <ElInputNumber v-model="formData.weight" :min="1" :max="100" />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.retryInterval')" prop="retryInterval">
        <ElInputNumber v-model="formData.retryInterval" :min="0" />
        <span class="unit">{{ t('system.config.sms.retryIntervalUnit') }}</span>
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.maxRetries')" prop="maxRetries">
        <ElInputNumber v-model="formData.maxRetries" :min="0" />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.maximum')" prop="maximum">
        <ElInputNumber v-model="formData.maximum" :min="1" />
      </ElFormItem>
      <ElFormItem :label="t('system.config.sms.supplierConfig')" prop="supplierConfig">
        <ElInput
          v-model="formData.supplierConfig"
          type="textarea"
          :rows="3"
          placeholder='{"sdkAppId":""}'
        />
      </ElFormItem>
      <ElFormItem :label="t('common.status')" prop="status">
        <ElSwitch v-model="formData.status" :active-value="1" :inactive-value="2" />
      </ElFormItem>
    </ElForm>
  </CaModal>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { addSmsConfig, getSmsConfig, updateSmsConfig } from '@/apis/system/smsConfig'
  import type { SmsConfigReq, SmsConfigResp } from '@/apis/system/type'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'SmsConfigAddModal' })

  const props = defineProps<{
    id?: string
  }>()

  const emit = defineEmits<{
    'save-success': []
  }>()

  const { t } = useI18n()
  const ModalRef = ref()
  const formRef = ref()
  const isEdit = ref(false)
  const currentId = ref('')

  const modalTitle = computed(() =>
    isEdit.value ? t('system.config.sms.editTitle') : t('system.config.sms.addTitle')
  )

  const formData = ref<SmsConfigReq>({
    name: '',
    supplier: '',
    accessKey: '',
    secretKey: '',
    signature: '',
    templateId: '',
    weight: '10',
    retryInterval: '60',
    maxRetries: '3',
    maximum: '1000',
    supplierConfig: '',
    status: 1,
    isDefault: false
  })

  const formRules = computed(() => ({
    name: [{ required: true, message: t('system.config.sms.namePlaceholder'), trigger: 'blur' }],
    supplier: [
      { required: true, message: t('system.config.sms.supplierPlaceholder'), trigger: 'change' }
    ],
    accessKey: [
      { required: true, message: t('system.config.sms.accessKeyPlaceholder'), trigger: 'blur' }
    ],
    secretKey: [{ required: true, message: t('system.config.sms.secretKey'), trigger: 'blur' }],
    templateId: [
      { required: true, message: t('system.config.sms.templateIdPlaceholder'), trigger: 'blur' }
    ]
  }))

  const onAdd = () => {
    isEdit.value = false
    currentId.value = ''
    resetForm()
    ModalRef.value?.onOpen()
  }

  const onUpdate = async (id: string) => {
    isEdit.value = true
    currentId.value = id
    try {
      const res = await getSmsConfig(id)
      formData.value = { ...res }
      ModalRef.value?.onOpen()
    } catch (error) {
      console.error('Failed to fetch SMS config detail:', error)
    }
  }

  const resetForm = () => {
    formData.value = {
      name: '',
      supplier: '',
      accessKey: '',
      secretKey: '',
      signature: '',
      templateId: '',
      weight: '10',
      retryInterval: '60',
      maxRetries: '3',
      maximum: '1000',
      supplierConfig: '',
      status: 1,
      isDefault: false
    }
    formRef.value?.clearValidate()
  }

  const handleConfirm = async () => {
    await formRef.value?.validate()
    try {
      if (isEdit.value) {
        await updateSmsConfig(formData.value, currentId.value)
      } else {
        await addSmsConfig(formData.value)
      }
      ElMessage.success(t('common.success'))
      ModalRef.value?.onClose()
      emit('save-success')
    } catch (error) {
      console.error('Failed to save SMS config:', error)
    }
  }

  const handleCancel = () => {
    ModalRef.value?.onClose()
  }

  defineExpose({
    onAdd,
    onUpdate
  })
</script>

<style scoped lang="scss">
  .unit {
    margin-left: 8px;
    color: var(--el-text-color-regular);
  }
</style>
```

**步骤 2: 保存文件**

---

### Task 10: 创建存储配置模块

**文件:**

- 创建: `src/views/system/config/storage/index.vue`

**步骤 1: 创建存储配置容器组件**

```vue
<template>
  <div class="storage-config-container">
    <ElTabs v-model="activeTab" @tab-change="handleTabChange">
      <ElTabPane :name="StorageTabType.ALL" :label="t('system.config.storage.all')" />
      <ElTabPane :name="StorageTabType.LOCAL" :label="t('system.config.storage.localStorage')" />
      <ElTabPane :name="StorageTabType.OSS" :label="t('system.config.storage.objectStorage')" />
    </ElTabs>

    <div class="search-bar">
      <ElInput
        v-model="searchText"
        :placeholder="t('system.config.storage.searchPlaceholder')"
        clearable
        style="width: 300px"
        @input="handleSearch"
      >
        <template #prefix>
          <ElIcon><Search /></ElIcon>
        </template>
      </ElInput>
    </div>

    <div v-loading="loading" class="storage-list">
      <ElRow :gutter="16">
        <ElCol v-for="item in filteredList" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
          <StorageCard
            :data="item"
            @status-change="handleStatusChange"
            @set-default="handleSetDefault"
            @edit="onUpdate"
            @delete="handleDelete"
          />
        </ElCol>
        <ElCol :xs="24" :sm="12" :md="8" :lg="6">
          <StorageAddCard @add-local="onAddLocal" @add-oss="onAddOss" />
        </ElCol>
      </ElRow>
    </div>

    <AddModal ref="AddModalRef" @save-success="fetchData" />
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { Search } from '@element-plus/icons-vue'
  import {
    deleteStorage,
    listStorage,
    setDefaultStorage,
    updateStorageStatus
  } from '@/apis/system/storage'
  import type { StorageResp } from '@/apis/system/type'
  import { useI18n } from 'vue-i18n'

  enum StorageTabType {
    ALL = 'all',
    LOCAL = 'local',
    OSS = 'oss'
  }

  defineOptions({ name: 'StorageConfig' })

  const { t } = useI18n()
  const activeTab = ref(StorageTabType.ALL)
  const searchText = ref('')
  const loading = ref(false)
  const storageList = ref<StorageResp[]>([])

  const filteredList = computed(() => {
    let list = storageList.value

    // 根据标签页过滤
    if (activeTab.value === StorageTabType.LOCAL) {
      list = list.filter((item) => item.type === 1)
    } else if (activeTab.value === StorageTabType.OSS) {
      list = list.filter((item) => item.type === 2)
    }

    // 根据搜索文本过滤
    if (searchText.value) {
      const keyword = searchText.value.toLowerCase()
      list = list.filter(
        (item) =>
          item.name?.toLowerCase().includes(keyword) ||
          item.code?.toLowerCase().includes(keyword) ||
          item.description?.toLowerCase().includes(keyword)
      )
    }

    return list
  })

  const fetchData = async () => {
    loading.value = true
    try {
      const res = await listStorage({ sort: ['isDefault,desc', 'sort,asc'] })
      storageList.value = res || []
    } catch (error) {
      console.error('Failed to fetch storage list:', error)
    } finally {
      loading.value = false
    }
  }

  const handleTabChange = () => {
    searchText.value = ''
  }

  const handleSearch = () => {
    // 搜索由 computed 自动处理
  }

  const handleStatusChange = async (item: StorageResp, enable: boolean) => {
    const typeText =
      item.type === 1
        ? t('system.config.storage.localStorage')
        : t('system.config.storage.objectStorage')
    const actionText = enable ? t('common.statusEnabled') : t('common.statusDisabled')
    const confirmMsg = enable
      ? t('system.config.storage.enableConfirm', {
          type: typeText,
          name: item.name,
          code: item.code
        })
      : t('system.config.storage.disableConfirm', {
          type: typeText,
          name: item.name,
          code: item.code
        })

    try {
      await ElMessageBox.confirm(confirmMsg, t('common.tips'), { type: 'warning' })
      await updateStorageStatus({ status: enable ? 1 : 2 }, item.id)
      ElMessage.success(t('common.success'))
      fetchData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Failed to update storage status:', error)
      }
    }
  }

  const handleSetDefault = async (item: StorageResp) => {
    const typeText =
      item.type === 1
        ? t('system.config.storage.localStorage')
        : t('system.config.storage.objectStorage')
    const confirmMsg = t('system.config.storage.setDefaultConfirm', {
      type: typeText,
      name: item.name,
      code: item.code
    })

    try {
      await ElMessageBox.confirm(confirmMsg, t('common.tips'), { type: 'warning' })
      await setDefaultStorage(item.id)
      ElMessage.success(t('common.success'))
      fetchData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Failed to set default storage:', error)
      }
    }
  }

  const handleDelete = async (item: StorageResp) => {
    const confirmMsg = t('system.config.storage.deleteConfirm', {
      name: item.name,
      code: item.code
    })

    try {
      await ElMessageBox.confirm(confirmMsg, t('common.tips'), { type: 'warning' })
      await deleteStorage(item.id)
      ElMessage.success(t('common.success'))
      fetchData()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Failed to delete storage:', error)
      }
    }
  }

  const AddModalRef = ref<InstanceType<typeof AddModal>>()

  const onAddLocal = () => {
    AddModalRef.value?.onAdd(1)
  }

  const onAddOss = () => {
    AddModalRef.value?.onAdd(2)
  }

  const onUpdate = (item: StorageResp) => {
    AddModalRef.value?.onUpdate(item.id)
  }

  onMounted(() => {
    fetchData()
  })
</script>

<style scoped lang="scss">
  .storage-config-container {
    padding: 20px;
  }

  .search-bar {
    margin-bottom: 16px;
  }

  .storage-list {
    min-height: 200px;
  }
</style>
```

**步骤 2: 保存文件**

---

### Task 11: 创建存储配置卡片组件

**文件:**

- 创建: `src/views/system/config/storage/StorageCard.vue`

**步骤 1: 创建存储卡片组件**

```vue
<template>
  <ElCard class="storage-card" :class="{ 'is-default': data.isDefault }">
    <template #header>
      <div class="card-header">
        <span class="card-title">{{ data.name }} ({{ data.code }})</span>
        <ElTag v-if="data.isDefault" type="success" size="small">{{
          t('system.config.storage.isDefault')
        }}</ElTag>
      </div>
    </template>

    <div class="card-body">
      <!-- 本地存储 -->
      <template v-if="data.type === 1">
        <div class="card-row">
          <span class="label">{{ t('system.config.storage.bucketName') }}:</span>
          <span class="value">{{ data.bucketName }}</span>
        </div>
        <div class="card-row">
          <span class="label">{{ t('system.config.storage.domain') }}:</span>
          <span class="value">{{ data.domain }}</span>
        </div>
      </template>

      <!-- 对象存储 -->
      <template v-else>
        <div class="card-row">
          <span class="label">{{ t('system.config.storage.accessKey') }}:</span>
          <span class="value">
            <CellCopy :text="data.accessKey" />
          </span>
        </div>
        <div class="card-row">
          <span class="label">{{ t('system.config.storage.endpoint') }}:</span>
          <span class="value">{{ data.endpoint }}</span>
        </div>
        <div class="card-row">
          <span class="label">{{ t('system.config.storage.bucketName') }}:</span>
          <span class="value">{{ data.bucketName }}</span>
        </div>
        <div v-if="data.domain" class="card-row">
          <span class="label">{{ t('system.config.storage.domain') }}:</span>
          <span class="value">{{ data.domain }}</span>
        </div>
      </template>

      <!-- 共通字段 -->
      <div class="card-row">
        <span class="label">{{ t('system.config.storage.recycleBinEnabled') }}:</span>
        <span class="value">{{
          data.recycleBinEnabled ? t('common.statusEnabled') : t('common.statusDisabled')
        }}</span>
      </div>
      <div v-if="data.recycleBinEnabled" class="card-row">
        <span class="label">{{ t('system.config.storage.recycleBinPath') }}:</span>
        <span class="value">{{ data.recycleBinPath }}</span>
      </div>

      <div class="card-row">
        <span class="label">{{ t('common.createTime') }}:</span>
        <span class="value">{{ data.createTime }}</span>
      </div>
    </div>

    <template #footer>
      <div class="card-footer">
        <ElSpace>
          <ElSwitch
            :model-value="data.status === 1"
            :disabled="data.isDefault"
            @change="(val) => $emit('statusChange', data, val)"
          />
          <ElDropdown @command="handleCommand">
            <ElButton text>
              <ElIcon><MoreFilled /></ElIcon>
            </ElButton>
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem :disabled="data.isDefault" command="setDefault">
                  {{ t('system.config.storage.isDefault') }}
                </ElDropdownItem>
                <ElDropdownItem command="edit">
                  {{ t('common.button.edit') }}
                </ElDropdownItem>
                <ElDropdownItem :disabled="data.isDefault" command="delete">
                  <ElLink type="danger" :underline="false">{{ t('common.button.delete') }}</ElLink>
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </ElSpace>
      </div>
    </template>
  </ElCard>
</template>

<script setup lang="ts">
  import { MoreFilled } from '@element-plus/icons-vue'
  import type { StorageResp } from '@/apis/system/type'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'StorageCard' })

  defineProps<{
    data: StorageResp
  }>()

  const emit = defineEmits<{
    statusChange: [data: StorageResp, enable: boolean]
    setDefault: [data: StorageResp]
    edit: [data: StorageResp]
    delete: [data: StorageResp]
  }>()

  const { t } = useI18n()

  const handleCommand = (command: string) => {
    switch (command) {
      case 'setDefault':
        emit('setDefault', props.data)
        break
      case 'edit':
        emit('edit', props.data)
        break
      case 'delete':
        emit('delete', props.data)
        break
    }
  }
</script>

<style scoped lang="scss">
  .storage-card {
    &.is-default {
      border-color: var(--el-color-success);
    }

    :deep(.el-card__header) {
      padding: 12px 16px;
    }

    :deep(.el-card__body) {
      padding: 12px 16px;
    }

    :deep(.el-card__footer) {
      padding: 12px 16px;
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-title {
    font-weight: 500;
  }

  .card-body {
    .card-row {
      display: flex;
      margin-bottom: 8px;
      font-size: 13px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        flex-shrink: 0;
        color: var(--el-text-color-secondary);
        margin-right: 8px;
      }

      .value {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .card-footer {
    display: flex;
    justify-content: flex-end;
  }
</style>
```

**步骤 2: 保存文件**

---

### Task 12: 创建存储配置新增卡片组件

**文件:**

- 创建: `src/views/system/config/storage/StorageAddCard.vue`

**步骤 1: 创建新增卡片组件**

```vue
<template>
  <ElCard class="storage-add-card" shadow="hover">
    <div class="add-card-content" @click="handleAddLocal">
      <ElIcon :size="32" color="var(--el-text-color-secondary)">
        <Plus />
      </ElIcon>
      <div class="add-text">{{ t('system.config.storage.createLocalStorage') }}</div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { Plus } from '@element-plus/icons-vue'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'StorageAddCard' })

  const emit = defineEmits<{
    addLocal: []
    addOss: []
  }>()

  const { t } = useI18n()

  const handleAddLocal = () => {
    emit('addLocal')
  }
</script>

<style scoped lang="scss">
  .storage-add-card {
    height: 100%;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: var(--el-color-primary);
    }

    :deep(.el-card__body) {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 160px;
    }
  }

  .add-card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .add-text {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
</style>
```

**步骤 2: 保存文件**

---

### Task 13: 创建存储配置新增/编辑弹窗

**文件:**

- 创建: `src/views/system/config/storage/AddModal.vue`

**步骤 1: 创建新增/编辑弹窗组件**

```vue
<template>
  <CaModal
    ref="ModalRef"
    :title="modalTitle"
    :width="600"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="140px">
      <ElFormItem :label="t('system.config.storage.name')" prop="name">
        <ElInput
          v-model="formData.name"
          :placeholder="
            t('components.form.placeholder.input', { label: t('system.config.storage.name') })
          "
          maxlength="100"
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.storage.code')" prop="code">
        <ElInput
          v-model="formData.code"
          :placeholder="
            t('components.form.placeholder.input', { label: t('system.config.storage.code') })
          "
          maxlength="30"
          :disabled="isEdit"
        />
      </ElFormItem>

      <!-- 对象存储字段 -->
      <template v-if="formData.type === 2">
        <ElFormItem :label="t('system.config.storage.accessKey')" prop="accessKey">
          <ElInput v-model="formData.accessKey" />
        </ElFormItem>
        <ElFormItem :label="t('system.config.storage.endpoint')" prop="endpoint">
          <ElInput v-model="formData.endpoint" />
        </ElFormItem>
      </template>

      <ElFormItem :label="t('system.config.storage.bucketName')" prop="bucketName">
        <ElInput v-model="formData.bucketName" />
      </ElFormItem>

      <ElFormItem :label="t('system.config.storage.domain')" prop="domain">
        <ElInput v-model="formData.domain" />
      </ElFormItem>

      <ElFormItem :label="t('system.config.storage.recycleBinEnabled')" prop="recycleBinEnabled">
        <ElSwitch v-model="formData.recycleBinEnabled" :disabled="isEdit" />
      </ElFormItem>

      <ElFormItem
        v-if="formData.recycleBinEnabled"
        :label="t('system.config.storage.recycleBinPath')"
        prop="recycleBinPath"
      >
        <ElInput v-model="formData.recycleBinPath" :disabled="isEdit" />
      </ElFormItem>

      <ElFormItem :label="t('common.sort')" prop="sort">
        <ElInputNumber v-model="formData.sort" :min="1" />
      </ElFormItem>

      <ElFormItem :label="t('common.description')" prop="description">
        <ElInput v-model="formData.description" type="textarea" :rows="3" />
      </ElFormItem>

      <ElFormItem :label="t('common.status')" prop="status">
        <ElSwitch v-model="formData.status" :active-value="1" :inactive-value="2" />
      </ElFormItem>
    </ElForm>
  </CaModal>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { addStorage, getStorage, updateStorage } from '@/apis/system/storage'
  import type { StorageReq, StorageResp } from '@/apis/system/type'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'StorageAddModal' })

  const emit = defineEmits<{
    'save-success': []
  }>()

  const { t } = useI18n()
  const ModalRef = ref()
  const formRef = ref()
  const isEdit = ref(false)
  const currentId = ref('')

  const modalTitle = computed(() => {
    const type = formData.value.type === 1 ? 'Local' : 'Oss'
    const action = isEdit.value ? 'Edit' : 'Add'
    return t(`system.config.storage.${action}${type}Title`)
  })

  const formData = ref<StorageReq>({
    name: '',
    code: '',
    type: 1,
    accessKey: '',
    secretKey: '',
    endpoint: '',
    bucketName: '',
    domain: '',
    recycleBinEnabled: false,
    recycleBinPath: '',
    description: '',
    isDefault: false,
    sort: 1,
    status: 1
  })

  const formRules = computed(() => ({
    name: [
      {
        required: true,
        message: t('components.form.validate.required', { label: t('system.config.storage.name') }),
        trigger: 'blur'
      }
    ],
    code: [
      {
        required: true,
        message: t('components.form.validate.required', { label: t('system.config.storage.code') }),
        trigger: 'blur'
      }
    ],
    accessKey: [
      {
        required: formData.value.type === 2,
        message: t('components.form.validate.required', {
          label: t('system.config.storage.accessKey')
        }),
        trigger: 'blur'
      }
    ],
    endpoint: [
      {
        required: formData.value.type === 2,
        message: t('components.form.validate.required', {
          label: t('system.config.storage.endpoint')
        }),
        trigger: 'blur'
      }
    ],
    bucketName: [
      {
        required: true,
        message: t('components.form.validate.required', {
          label: t('system.config.storage.bucketName')
        }),
        trigger: 'blur'
      }
    ],
    domain: [
      {
        required: formData.value.type === 1,
        message: t('components.form.validate.required', {
          label: t('system.config.storage.domain')
        }),
        trigger: 'blur'
      }
    ],
    recycleBinPath: [
      {
        required: formData.value.recycleBinEnabled,
        message: t('components.form.validate.required', {
          label: t('system.config.storage.recycleBinPath')
        }),
        trigger: 'blur'
      }
    ]
  }))

  const onAdd = (type: 1 | 2) => {
    isEdit.value = false
    currentId.value = ''
    formData.value = {
      name: '',
      code: '',
      type,
      accessKey: '',
      secretKey: '',
      endpoint: '',
      bucketName: '',
      domain: '',
      recycleBinEnabled: false,
      recycleBinPath: '',
      description: '',
      isDefault: false,
      sort: 1,
      status: 1
    }
    ModalRef.value?.onOpen()
  }

  const onUpdate = async (id: string) => {
    isEdit.value = true
    currentId.value = id
    try {
      const res = await getStorage(id)
      formData.value = {
        name: res.name,
        code: res.code,
        type: res.type,
        accessKey: res.accessKey,
        secretKey: '',
        endpoint: res.endpoint,
        bucketName: res.bucketName,
        domain: res.domain,
        recycleBinEnabled: res.recycleBinEnabled,
        recycleBinPath: res.recycleBinPath,
        description: res.description,
        isDefault: res.isDefault,
        sort: res.sort,
        status: res.status
      }
      ModalRef.value?.onOpen()
    } catch (error) {
      console.error('Failed to fetch storage detail:', error)
    }
  }

  const handleConfirm = async () => {
    await formRef.value?.validate()
    try {
      if (isEdit.value) {
        await updateStorage(formData.value, currentId.value)
      } else {
        await addStorage(formData.value)
      }
      ElMessage.success(t('common.success'))
      ModalRef.value?.onClose()
      emit('save-success')
    } catch (error) {
      console.error('Failed to save storage:', error)
    }
  }

  const handleCancel = () => {
    ModalRef.value?.onClose()
  }

  defineExpose({
    onAdd,
    onUpdate
  })
</script>
```

**步骤 2: 保存文件**

---

### Task 14: 创建客户端配置列表模块

**文件:**

- 创建: `src/views/system/config/client/index.vue`

**步骤 1: 创建客户端配置列表组件**

```vue
<template>
  <CaTable
    row-key="id"
    :data="tableData"
    :columns="columns"
    :loading="loading"
    :pagination="pagination"
    @refresh="search"
  >
    <template #top>
      <CaQueryForm v-model="queryForm" mode="click-search" :columns="queryFormColumns" />
    </template>
    <template #toolbar-left>
      <CaButton type="add" @click="onAdd" />
    </template>
    <template #clientId="{ row }">
      <CellCopy :text="row.clientId" />
    </template>
    <template #clientType="{ row }">
      <CaCellDict :dict="row.clientType" dict-type="client_type" />
    </template>
    <template #authType="{ row }">
      <CaCellTags :data="JSON.parse(row.authType || '[]')" />
    </template>
    <template #isConcurrent="{ row }">
      <ElTag :type="row.isConcurrent ? 'success' : 'info'" size="small">
        {{ row.isConcurrent ? t('common.true') : t('common.false') }}
      </ElTag>
    </template>
    <template #status="{ row }">
      <CaCellStatus :status="row.status" />
    </template>
    <template #action="{ row }">
      <ElSpace>
        <ElLink type="primary" @click="onDetail(row)">{{ t('common.detail') }}</ElLink>
        <ElLink type="primary" @click="onUpdate(row)">{{ t('common.button.edit') }}</ElLink>
        <ElLink type="danger" @click="onDelete(row)">{{ t('common.button.delete') }}</ElLink>
      </ElSpace>
    </template>
  </CaTable>
  <AddModal ref="AddModalRef" @save-success="search" />
  <DetailDrawer ref="DetailDrawerRef" />
</template>

<script setup lang="ts">
  import { ClientQuery, ClientResp } from '@/apis'
  import { deleteClient, listClient } from '@/apis/system/client'
  import { FormColumnItem } from '@/components/base/CaForm/type'
  import CaQueryForm from '@/components/base/CaQueryForm'
  import { TableColumnItem } from '@/components/base/CaTable/type'
  import { useResetReactive, useTable } from '@/hooks'
  import { useI18n } from 'vue-i18n'
  import AddModal from './AddModal.vue'
  import DetailDrawer from './DetailDrawer.vue'

  defineOptions({ name: 'ClientConfig' })

  const { t } = useI18n()
  const [queryForm, resetForm] = useResetReactive<ClientQuery>({
    sort: ['create_time,desc']
  })

  const queryFormColumns = computed(
    () =>
      [
        {
          type: 'select',
          label: t('system.config.client.clientType'),
          field: 'clientType',
          gridItemProps: { span: { xs: 24, sm: 12 } },
          props: { dict: 'client_type' }
        },
        {
          type: 'select',
          label: t('common.status'),
          field: 'status',
          gridItemProps: { span: { xs: 24, sm: 12 } },
          props: { options: DisEnableStatusList }
        }
      ] as FormColumnItem<ClientQuery>[]
  )

  const { tableData, loading, pagination, search, handleDelete } = useTable<ClientResp>(
    (page) => listClient({ ...queryForm, ...page }),
    { immediate: true }
  )

  const columns = computed(
    () =>
      [
        {
          label: t('common.index'),
          width: 66,
          align: 'center',
          render: ({ $index }) =>
            h('span', {}, $index + 1 + (pagination.current - 1) * pagination.pageSize)
        },
        {
          label: t('system.config.client.clientId'),
          prop: 'clientId',
          slotName: 'clientId',
          minWidth: 180
        },
        {
          label: t('system.config.client.clientType'),
          prop: 'clientType',
          slotName: 'clientType',
          width: 120
        },
        {
          label: t('system.config.client.authType'),
          prop: 'authType',
          slotName: 'authType',
          minWidth: 150
        },
        {
          label: t('system.config.client.activeTimeout'),
          prop: 'activeTimeout',
          align: 'center',
          width: 140
        },
        { label: t('system.config.client.timeout'), prop: 'timeout', align: 'center', width: 120 },
        {
          label: t('common.status'),
          prop: 'status',
          slotName: 'status',
          align: 'center',
          width: 80
        },
        {
          label: t('system.config.client.isConcurrent'),
          prop: 'isConcurrent',
          slotName: 'isConcurrent',
          align: 'center',
          width: 120
        },
        {
          label: t('system.config.client.replacedRange'),
          prop: 'replacedRange',
          align: 'center',
          width: 120
        },
        {
          label: t('system.config.client.maxLoginCount'),
          prop: 'maxLoginCount',
          align: 'center',
          width: 120
        },
        {
          label: t('system.config.client.overflowLogoutMode'),
          prop: 'overflowLogoutMode',
          align: 'center',
          width: 120
        },
        { label: t('common.createTime'), prop: 'createTime', width: 180 },
        {
          label: t('common.action'),
          prop: 'action',
          slotName: 'action',
          width: 200,
          align: 'center',
          fixed: 'right'
        }
      ] as TableColumnItem[]
  )

  const reset = () => {
    resetForm()
    search()
  }

  const onDelete = (row: ClientResp) => {
    return handleDelete(() => deleteClient(row.id), {
      content: t('system.config.client.deleteConfirm', { clientId: row.clientId })
    })
  }

  const AddModalRef = ref<InstanceType<typeof AddModal>>()
  const onAdd = () => {
    AddModalRef.value?.onAdd()
  }
  const onUpdate = (record: ClientResp) => {
    AddModalRef.value?.onUpdate(record.id)
  }

  const DetailDrawerRef = ref<InstanceType<typeof DetailDrawer>>()
  const onDetail = (record: ClientResp) => {
    DetailDrawerRef.value?.onOpen(record.id)
  }
</script>
```

**步骤 2: 保存文件**

---

### Task 15: 创建客户端配置新增/编辑弹窗

**文件:**

- 创建: `src/views/system/config/client/AddModal.vue`

**步骤 1: 创建新增/编辑弹窗组件**

```vue
<template>
  <CaModal
    ref="ModalRef"
    :title="modalTitle"
    :width="600"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="180px">
      <ElFormItem :label="t('system.config.client.clientType')" prop="clientType">
        <CaSelect
          v-model="formData.clientType"
          dict="client_type"
          :placeholder="
            t('components.form.placeholder.select', { label: t('system.config.client.clientType') })
          "
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.client.authType')" prop="authType">
        <CaSelect
          v-model="formData.authType"
          dict="auth_type_enum"
          multiple
          :placeholder="
            t('components.form.placeholder.select', { label: t('system.config.client.authType') })
          "
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.client.activeTimeout')" prop="activeTimeout">
        <ElInputNumber v-model="formData.activeTimeout" :min="-1" />
        <span class="unit">{{ t('system.config.client.activeTimeoutUnit') }}</span>
        <span class="hint">{{ t('system.config.client.activeTimeoutUnlimited') }}</span>
      </ElFormItem>
      <ElFormItem :label="t('system.config.client.timeout')" prop="timeout">
        <ElInputNumber v-model="formData.timeout" :min="-1" />
        <span class="unit">{{ t('system.config.client.timeoutUnit') }}</span>
        <span class="hint">{{ t('system.config.client.timeoutUnlimited') }}</span>
      </ElFormItem>
      <ElFormItem :label="t('system.config.client.isConcurrent')" prop="isConcurrent">
        <ElSwitch v-model="isConcurrent" @change="handleConcurrentChange" />
      </ElFormItem>
      <ElFormItem :label="t('system.config.client.replacedRange')" prop="replacedRange">
        <CaSelect
          v-model="formData.replacedRange"
          dict="replaced_range_enum"
          :disabled="isConcurrent"
          :placeholder="
            t('components.form.placeholder.select', {
              label: t('system.config.client.replacedRange')
            })
          "
        />
      </ElFormItem>
      <ElFormItem :label="t('system.config.client.maxLoginCount')" prop="maxLoginCount">
        <ElInputNumber v-model="formData.maxLoginCount" :min="-1" :disabled="!isConcurrent" />
        <span class="unit">{{ t('system.config.client.maxLoginCountUnit') }}</span>
        <span class="hint">{{ t('system.config.client.maxLoginCountUnlimited') }}</span>
      </ElFormItem>
      <ElFormItem :label="t('system.config.client.overflowLogoutMode')" prop="overflowLogoutMode">
        <CaSelect
          v-model="formData.overflowLogoutMode"
          dict="logout_mode_enum"
          :disabled="!isConcurrent || formData.maxLoginCount === 0 || formData.maxLoginCount === -1"
          :placeholder="
            t('components.form.placeholder.select', {
              label: t('system.config.client.overflowLogoutMode')
            })
          "
        />
      </ElFormItem>
      <ElFormItem :label="t('common.status')" prop="status">
        <ElSwitch v-model="formData.status" :active-value="'1'" :inactive-value="'2'" />
      </ElFormItem>
    </ElForm>
  </CaModal>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { addClient, getClient, updateClient } from '@/apis/system/client'
  import type { ClientReq } from '@/apis/system/type'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'ClientAddModal' })

  const emit = defineEmits<{
    'save-success': []
  }>()

  const { t } = useI18n()
  const ModalRef = ref()
  const formRef = ref()
  const isEdit = ref(false)
  const currentId = ref('')
  const isConcurrent = ref(false)

  const modalTitle = computed(() =>
    isEdit.value ? t('system.config.client.editTitle') : t('system.config.client.addTitle')
  )

  const formData = ref<ClientReq>({
    clientId: '',
    clientType: '',
    authType: '',
    activeTimeout: '1800',
    timeout: '7200',
    status: '1',
    isConcurrent: 0,
    isShare: 0,
    maxLoginCount: -1,
    replacedRange: '',
    overflowLogoutMode: ''
  })

  const formRules = computed(() => ({
    clientType: [
      {
        required: true,
        message: t('components.form.placeholder.select', {
          label: t('system.config.client.clientType')
        }),
        trigger: 'change'
      }
    ],
    authType: [
      {
        required: true,
        message: t('components.form.placeholder.select', {
          label: t('system.config.client.authType')
        }),
        trigger: 'change'
      }
    ],
    activeTimeout: [{ required: true, trigger: 'blur' }],
    timeout: [{ required: true, trigger: 'blur' }]
  }))

  const handleConcurrentChange = (val: boolean) => {
    if (val) {
      // 允许多地登录
      formData.value.replacedRange = ''
      formData.value.maxLoginCount = 1
    } else {
      // 不允许多地登录
      formData.value.maxLoginCount = -1
      formData.value.overflowLogoutMode = ''
    }
  }

  const onAdd = () => {
    isEdit.value = false
    currentId.value = ''
    isConcurrent.value = false
    resetForm()
    ModalRef.value?.onOpen()
  }

  const onUpdate = async (id: string) => {
    isEdit.value = true
    currentId.value = id
    try {
      const res = await getClient(id)
      formData.value = {
        clientId: res.clientId,
        clientType: res.clientType,
        authType: res.authType,
        activeTimeout: res.activeTimeout,
        timeout: res.timeout,
        status: res.status,
        isConcurrent: res.isConcurrent,
        isShare: res.isShare,
        maxLoginCount: res.maxLoginCount,
        replacedRange: res.replacedRange,
        overflowLogoutMode: res.overflowLogoutMode
      }
      isConcurrent.value = res.isConcurrent === 1
      ModalRef.value?.onOpen()
    } catch (error) {
      console.error('Failed to fetch client detail:', error)
    }
  }

  const resetForm = () => {
    formData.value = {
      clientId: '',
      clientType: '',
      authType: '',
      activeTimeout: '1800',
      timeout: '7200',
      status: '1',
      isConcurrent: 0,
      isShare: 0,
      maxLoginCount: -1,
      replacedRange: '',
      overflowLogoutMode: ''
    }
    formRef.value?.clearValidate()
  }

  const handleConfirm = async () => {
    await formRef.value?.validate()
    try {
      const submitData = {
        ...formData.value,
        authType: Array.isArray(formData.value.authType)
          ? JSON.stringify(formData.value.authType)
          : formData.value.authType,
        isConcurrent: isConcurrent.value ? 1 : 0
      }
      if (isEdit.value) {
        await updateClient(submitData, currentId.value)
      } else {
        await addClient(submitData)
      }
      ElMessage.success(t('common.success'))
      ModalRef.value?.onClose()
      emit('save-success')
    } catch (error) {
      console.error('Failed to save client:', error)
    }
  }

  const handleCancel = () => {
    ModalRef.value?.onClose()
  }

  defineExpose({
    onAdd,
    onUpdate
  })
</script>

<style scoped lang="scss">
  .unit {
    margin-left: 8px;
    color: var(--el-text-color-regular);
  }

  .hint {
    margin-left: 8px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
</style>
```

**步骤 2: 保存文件**

---

### Task 16: 创建客户端配置详情抽屉

**文件:**

- 创建: `src/views/system/config/client/DetailDrawer.vue`

**步骤 1: 创建详情抽屉组件**

```vue
<template>
  <ElDrawer ref="DrawerRef" :title="t('system.config.client.detailTitle')" :size="600">
    <ElDescriptions :column="1" border>
      <ElDescriptionsItem :label="t('system.config.client.detail.id')">
        {{ detailData.id }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.clientId')">
        <CellCopy :text="detailData.clientId" />
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.clientType')">
        <CaCellDict :dict="detailData.clientType" dict-type="client_type" />
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.authType')">
        <CaCellTags :data="JSON.parse(detailData.authType || '[]')" />
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.activeTimeout')">
        {{ detailData.activeTimeout }} {{ t('system.config.client.activeTimeoutUnit') }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.timeout')">
        {{ detailData.timeout }} {{ t('system.config.client.timeoutUnit') }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.status')">
        <CaCellStatus :status="detailData.status" />
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.isConcurrent')">
        {{ detailData.isConcurrent ? t('common.true') : t('common.false') }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.replacedRange')">
        <CaCellDict :dict="detailData.replacedRange" dict-type="replaced_range_enum" />
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.maxLoginCount')">
        {{
          detailData.maxLoginCount === -1
            ? t('system.config.client.maxLoginCountUnlimited')
            : detailData.maxLoginCount
        }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.overflowLogoutMode')">
        <CaCellDict :dict="detailData.overflowLogoutMode" dict-type="logout_mode_enum" />
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.createUser')">
        {{ detailData.createUserString }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.createTime')">
        {{ detailData.createTime }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.updateUser')">
        {{ detailData.updateUserString }}
      </ElDescriptionsItem>
      <ElDescriptionsItem :label="t('system.config.client.detail.updateTime')">
        {{ detailData.updateTime }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDrawer>
</template>

<script setup lang="ts">
  import { getClient } from '@/apis/system/client'
  import type { ClientDetailResp } from '@/apis/system/type'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'ClientDetailDrawer' })

  const { t } = useI18n()
  const DrawerRef = ref()
  const detailData = ref<ClientDetailResp>({} as ClientDetailResp)

  const onOpen = async (id: string) => {
    try {
      const res = await getClient(id)
      detailData.value = res
      DrawerRef.value?.open()
    } catch (error) {
      console.error('Failed to fetch client detail:', error)
    }
  }

  defineExpose({
    onOpen
  })
</script>
```

**步骤 2: 保存文件**

---

## 阶段五：完成与验证

### Task 17: 检查所有组件导入和依赖

**检查清单:**

1. 确认所有组件都正确导入了所需的 API、类型和工具
2. 确认所有国际化 key 都正确定义
3. 确认所有组件的 `defineOptions` 设置了正确的 `name`
4. 确认所有弹窗和抽屉都正确暴露了 `onAdd`、`onUpdate`、`onOpen` 等方法

---

### Task 18: 添加路由配置（如需要）

**文件:**

- 修改: `src/router/routes/asyncRoutes.ts` (或对应路由文件)

**步骤 1: 添加配置管理路由**

在系统管理模块下添加配置管理路由：

```typescript
{
  path: '/system/config',
  name: 'SystemConfig',
  component: () => import('@/views/system/config/index.vue'),
  meta: {
    title: 'system.config.title',
    icon: 'Setting',
    hidden: false
  }
}
```

**步骤 2: 保存文件**

---

### Task 19: 验证功能

**验证步骤:**

1. 启动开发服务器
2. 导航到配置管理页面
3. 依次测试每个配置模块：
   - 站点配置：查看、编辑、保存、恢复默认
   - 安全配置：查看、编辑、保存、恢复默认
   - 登录配置：查看、编辑、保存、恢复默认
   - 邮件配置：查看、编辑、保存、恢复默认
   - 短信配置：列表查询、新增、编辑、删除、设为默认
   - 存储配置：列表查询、新增本地存储、新增对象存储、编辑、删除、设为默认、启用/禁用
   - 客户端配置：列表查询、新增、编辑、删除、详情
4. 验证所有国际化文本正确显示
5. 验证表单验证规则正常工作

---

## 完成条件

实现完成后应满足：

1. 所有7个配置子模块均可正常访问和使用
2. 所有 API 调用正常工作
3. 所有国际化文本正确显示（中英文）
4. 表单验证规则正常工作
5. 权限控制正常（如有需要）
6. 代码符合项目既有风格和规范

---

## 注意事项

1. **组件依赖**: 确保项目中存在 `CaUpload`、`CaSelect`、`CaModal`、`CellCopy`、`CaCellDict`、`CaCellTags`、`CaCellStatus` 等组件，如不存在需要替换为项目中实际使用的组件

2. **API 类型确认**: 使用前请确认 `src/apis/system/type.ts` 中的类型定义与实际 API 响应一致

3. **字典类型**: 确保后端返回的字典类型（如 `client_type`、`auth_type_enum`、`sms_supplier` 等）与系统中配置的字典类型一致

4. **权限标识**: 如需要权限控制，请在路由和组件中添加对应的权限检查

5. **图片上传**: 站点配置中的 Logo 和 Favicon 上传功能需要项目中存在图片上传组件或 API
