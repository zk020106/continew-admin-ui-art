<template>
  <CaPageLayout>
    <CaTable
      row-key="token"
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1200 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      @refresh="search"
    >
      <template #top>
        <CaForm
          v-model="queryForm"
          search
          :columns="queryFormColumns"
          @search="search"
          @reset="reset"
        />
      </template>

      <template #nickname="{ row }">
        <span>{{ row.nickname || '-' }}({{ row.username || '-' }})</span>
      </template>

      <template #action="{ row }">
        <ElSpace>
          <ElPopconfirm
            :title="t('pages.onlineUser.message.confirmKickout')"
            :confirm-button-props="{ type: 'danger' }"
            @confirm="handleKickout(row.token)"
          >
            <template #reference>
              <ElButton
                v-auth="['monitor:online:kickout']"
                type="danger"
                link
                :disabled="currentToken === row.token"
              >
                {{ t('pages.onlineUser.button.kickout') }}
              </ElButton>
            </template>
          </ElPopconfirm>
        </ElSpace>
      </template>
    </CaTable>
  </CaPageLayout>
</template>

<script setup lang="ts">
import type { OnlineUserQuery, OnlineUserResp } from '@/apis/monitor'
import type { FormColumnItem } from '@/components/base/CaForm/type'
import type { TableColumnItem } from '@/components/base/CaTable/type'
import { ElButton, ElMessage, ElPopconfirm, ElSpace } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { kickout, listOnlineUser } from '@/apis/monitor'
import { useDevice, useResetReactive, useTable } from '@/hooks'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'MonitorOnline' })

const { t } = useI18n()
const { isMobile } = useDevice()
const userStore = useUserStore()
const currentToken = computed(() => userStore.accessToken)

const [queryForm, resetForm] = useResetReactive<OnlineUserQuery>({
  sort: ['loginTime,desc']
})

const queryFormColumns = computed(
  () =>
    [
      {
        type: 'input',
        label: t('pages.onlineUser.search.nickname'),
        field: 'nickname',
        gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
        props: {
          placeholder: t('pages.onlineUser.search.nicknamePlaceholder'),
          clearable: true
        }
      },
      {
        type: 'date-picker',
        label: t('pages.onlineUser.search.loginTime'),
        field: 'loginTime',
        gridItemProps: { span: { xs: 24, sm: 12, xxl: 8 } },
        props: {
          type: 'daterange',
          clearable: true
        }
      }
    ] as FormColumnItem<OnlineUserQuery>[]
)

const { tableData, loading, pagination, search } = useTable<OnlineUserResp>(
  (page) => listOnlineUser({ ...queryForm, ...page }),
  { immediate: true }
)

const columns = computed(
  () =>
    [
      {
        label: t('pages.onlineUser.field.index'),
        width: 66,
        align: 'center',
        render: ({ $index }) =>
          h('span', {}, $index + 1 + (pagination.current - 1) * pagination.pageSize),
        fixed: !isMobile.value ? 'left' : false
      },
      {
        label: t('pages.onlineUser.field.nickname'),
        prop: 'nickname',
        slotName: 'nickname',
        minWidth: 150,
        showOverflowTooltip: true
      },
      {
        label: t('pages.onlineUser.field.ip'),
        prop: 'ip',
        minWidth: 140,
        showOverflowTooltip: true
      },
      {
        label: t('pages.onlineUser.field.address'),
        prop: 'address',
        minWidth: 140,
        showOverflowTooltip: true
      },
      {
        label: t('pages.onlineUser.field.browser'),
        prop: 'browser',
        minWidth: 120,
        showOverflowTooltip: true
      },
      {
        label: t('pages.onlineUser.field.os'),
        prop: 'os',
        minWidth: 120,
        showOverflowTooltip: true
      },
      {
        label: t('pages.onlineUser.field.loginTime'),
        prop: 'loginTime',
        width: 180,
        showOverflowTooltip: true
      },
      {
        label: t('pages.onlineUser.field.lastActiveTime'),
        prop: 'lastActiveTime',
        width: 180,
        showOverflowTooltip: true
      },
      {
        label: t('pages.onlineUser.field.action'),
        prop: 'action',
        slotName: 'action',
        width: 100,
        align: 'center',
        fixed: !isMobile.value ? 'right' : false
      }
    ] as TableColumnItem[]
)

// 重置
const reset = () => {
  resetForm()
  search()
}

// 强退用户
const handleKickout = async (token: string) => {
  try {
    await kickout(token)
    ElMessage.success(t('pages.onlineUser.message.kickoutSuccess'))
    search()
  } catch (error) {
    console.error('强退失败:', error)
  }
}
</script>

<style scoped lang="scss"></style>
