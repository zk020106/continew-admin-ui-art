<!-- 个人中心页面 -->
<template>
  <div class="w-full h-full p-0 bg-transparent border-none shadow-none">
    <div class="relative flex-b mt-2.5 max-md:block max-md:mt-1">
      <div class="w-112 mr-5 max-md:w-full max-md:mr-0">
        <div class="art-card-sm relative p-9 pb-6 overflow-hidden text-center">
          <img class="absolute top-0 left-0 w-full h-50 object-cover" src="@imgs/user/bg.webp" />
          <img
            class="relative z-10 w-20 h-20 mt-30 mx-auto object-cover border-2 border-white rounded-full"
            src="@imgs/user/avatar.webp"
          />
          <h2 class="mt-5 text-xl font-normal">{{ userInfo.username }}</h2>
          <p class="mt-5 text-sm">{{ t('pages.userCenter.profile.tagline') }}</p>

          <div class="w-75 mx-auto mt-7.5 text-left">
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:mail-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ t('pages.userCenter.profile.email') }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:user-3-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ t('pages.userCenter.profile.role') }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:map-pin-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ t('pages.userCenter.profile.location') }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:dribbble-fill" class="text-g-700" />
              <span class="ml-2 text-sm">{{ t('pages.userCenter.profile.organization') }}</span>
            </div>
          </div>

          <div class="mt-10">
            <h3 class="text-sm font-medium">{{ t('pages.userCenter.profile.labelsTitle') }}</h3>
            <div class="flex flex-wrap justify-center mt-3.5">
              <div
                v-for="item in lableList"
                :key="item"
                class="py-1 px-1.5 mr-2.5 mb-2.5 text-xs border border-g-300 rounded"
              >
                {{ t(item) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-hidden max-md:w-full max-md:mt-3.5">
        <div class="art-card-sm">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">
            {{ t('pages.userCenter.sections.basicSettings') }}
          </h1>

          <ElForm
            ref="ruleFormRef"
            :model="form"
            class="box-border p-5 [&>.el-row_.el-form-item]:w-[calc(50%-10px)] [&>.el-row_.el-input]:w-full [&>.el-row_.el-select]:w-full"
            :rules="rules"
            label-width="86px"
            label-position="top"
          >
            <ElRow>
              <ElFormItem :label="t('user.field.nickname')" prop="nikeName">
                <ElInput v-model="form.nikeName" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem :label="t('user.field.gender')" prop="sex" class="ml-5">
                <ElSelect v-model="form.sex" :placeholder="t('common.placeholder.select')" :disabled="!isEdit">
                  <ElOption
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem :label="t('pages.userCenter.form.realName')" prop="realName">
                <ElInput v-model="form.realName" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem :label="t('user.field.email')" prop="email" class="ml-5">
                <ElInput v-model="form.email" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem :label="t('user.field.phone')" prop="mobile">
                <ElInput v-model="form.mobile" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem :label="t('pages.userCenter.form.address')" prop="address" class="ml-5">
                <ElInput v-model="form.address" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElFormItem :label="t('pages.userCenter.form.introduction')" prop="des" class="h-32">
              <ElInput v-model="form.des" type="textarea" :rows="4" :disabled="!isEdit" />
            </ElFormItem>

            <div class="flex-c justify-end [&_.el-button]:!w-27.5">
              <ElButton v-ripple type="primary" class="w-22.5" @click="edit">
                {{ isEdit ? t('common.save') : t('common.edit') }}
              </ElButton>
            </div>
          </ElForm>
        </div>

        <div class="art-card-sm my-5">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">
            {{ t('pages.userCenter.sections.changePassword') }}
          </h1>

          <ElForm :model="pwdForm" class="box-border p-5" label-width="86px" label-position="top">
            <ElFormItem :label="t('pages.userCenter.form.currentPassword')" prop="password">
              <ElInput
                v-model="pwdForm.password"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem :label="t('pages.userCenter.form.newPassword')" prop="newPassword">
              <ElInput
                v-model="pwdForm.newPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem :label="t('pages.userCenter.form.confirmNewPassword')" prop="confirmPassword">
              <ElInput
                v-model="pwdForm.confirmPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <div class="flex-c justify-end [&_.el-button]:!w-27.5">
              <ElButton v-ripple type="primary" class="w-22.5" @click="editPwd">
                {{ isEditPwd ? t('common.save') : t('common.edit') }}
              </ElButton>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'UserCenter' })

const userStore = useUserStore()
const userInfo = computed(() => userStore.getUserInfo)
const { t } = useI18n()

const isEdit = ref(false)
const isEditPwd = ref(false)
const date = ref('')
const ruleFormRef = ref<FormInstance>()

/**
 * 用户信息表单
 */
const form = reactive({
  realName: t('pages.userCenter.defaults.realName'),
  nikeName: t('pages.userCenter.defaults.nickName'),
  email: t('pages.userCenter.defaults.email'),
  mobile: t('pages.userCenter.defaults.mobile'),
  address: t('pages.userCenter.defaults.address'),
  sex: '2',
  des: t('pages.userCenter.defaults.introduction')
})

/**
 * 密码修改表单
 */
const pwdForm = reactive({
  password: '123456',
  newPassword: '123456',
  confirmPassword: '123456'
})

/**
 * 表单验证规则
 */
const rules = reactive<FormRules>({
  realName: [
    {
      required: true,
      message: t('common.placeholder.inputWithLabel', { label: t('pages.userCenter.form.realName') }),
      trigger: 'blur'
    },
    { min: 2, max: 50, message: t('pages.userCenter.validate.lengthRange', { min: 2, max: 50 }), trigger: 'blur' }
  ],
  nikeName: [
    {
      required: true,
      message: t('common.placeholder.inputWithLabel', { label: t('user.field.nickname') }),
      trigger: 'blur'
    },
    { min: 2, max: 50, message: t('pages.userCenter.validate.lengthRange', { min: 2, max: 50 }), trigger: 'blur' }
  ],
  email: [{ required: true, message: t('common.placeholder.inputWithLabel', { label: t('user.field.email') }), trigger: 'blur' }],
  mobile: [{ required: true, message: t('common.placeholder.inputWithLabel', { label: t('user.field.phone') }), trigger: 'blur' }],
  address: [{ required: true, message: t('common.placeholder.inputWithLabel', { label: t('pages.userCenter.form.address') }), trigger: 'blur' }],
  sex: [{ required: true, message: t('common.placeholder.selectWithLabel', { label: t('user.field.gender') }), trigger: 'blur' }]
})

/**
 * 性别选项
 */
const options = [
  { value: '1', label: t('common.genderMale') },
  { value: '2', label: t('common.genderFemale') }
]

/**
 * 用户标签列表
 */
const lableList: Array<string> = [
  'pages.userCenter.labels.focusDesign',
  'pages.userCenter.labels.creative',
  'pages.userCenter.labels.passionate',
  'pages.userCenter.labels.tall',
  'pages.userCenter.labels.sichuanGirl',
  'pages.userCenter.labels.openMind'
]

/**
 * 根据当前时间获取问候语
 */
const getDate = () => {
  const h = new Date().getHours()

  if (h >= 6 && h < 9) date.value = t('pages.userCenter.greetings.earlyMorning')
  else if (h >= 9 && h < 11) date.value = t('pages.userCenter.greetings.morning')
  else if (h >= 11 && h < 13) date.value = t('pages.userCenter.greetings.noon')
  else if (h >= 13 && h < 18) date.value = t('pages.userCenter.greetings.afternoon')
  else if (h >= 18 && h < 24) date.value = t('pages.userCenter.greetings.evening')
  else date.value = t('pages.userCenter.greetings.lateNight')
}

onMounted(() => {
  getDate()
})

/**
 * 切换用户信息编辑状态
 */
const edit = () => {
  isEdit.value = !isEdit.value
}

/**
 * 切换密码编辑状态
 */
const editPwd = () => {
  isEditPwd.value = !isEditPwd.value
}
</script>
