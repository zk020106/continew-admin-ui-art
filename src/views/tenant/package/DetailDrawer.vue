<template>
  <ElDrawer v-model="visible" :title="t('common.detail')" :size="width >= 600 ? 600 : '100%'">
    <CaDetail
      v-if="dataDetail"
      :data="dataDetail"
      :fields="fields"
      :column="1"
      size="large"
      :border="true"
    />
  </ElDrawer>
</template>

<script setup lang="ts">
import type { TenantPackageResp } from '@/apis/tenant/type'
import type { DetailField } from '@/components/base/CaDetail/type'
import { useWindowSize } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { getTenantPackage } from '@/apis/tenant/package'
import CaDetail from '@/components/base/CaDetail/index.vue'

defineOptions({ name: 'TenantPackageDetailDrawer' })

const { width } = useWindowSize()
const { t } = useI18n()

const dataId = ref('')
const dataDetail = ref<TenantPackageResp>()
const visible = ref(false)

/**
 * 套餐详情字段配置
 */
const fields = computed(
  () =>
    [
      {
        key: 'id',
        label: 'ID',
        type: 'text',
        copyable: true
      },
      {
        key: 'name',
        label: t('pages.tenantPackage.field.name'),
        type: 'text'
      },
      {
        key: 'sort',
        label: t('pages.tenantPackage.field.sort'),
        type: 'text'
      },
      {
        key: 'status',
        label: t('common.status'),
        type: 'enum',
        enum: {
          1: { label: t('common.statusEnabled'), type: 'success' },
          2: { label: t('common.statusDisabled'), type: 'danger' }
        }
      },
      {
        key: 'description',
        label: t('pages.tenantPackage.field.description'),
        type: 'text'
      },
      {
        key: 'createUserString',
        label: t('pages.tenantPackage.field.createUser'),
        type: 'text'
      },
      {
        key: 'createTime',
        label: t('common.createTime'),
        type: 'datetime'
      },
      {
        key: 'updateUserString',
        label: t('pages.tenantPackage.field.updateUser'),
        type: 'text'
      },
      {
        key: 'updateTime',
        label: t('common.updateTime'),
        type: 'datetime'
      }
    ] as DetailField[]
)

// 查询详情
const getDataDetail = async () => {
  dataDetail.value = await getTenantPackage(dataId.value)
}

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  await getDataDetail()
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
