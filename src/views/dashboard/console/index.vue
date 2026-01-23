<!-- 工作台页面 -->
<template>
  <div>
    <CardList />

    <ElRow :gutter="20">
      <ElCol :sm="24" :md="12" :lg="10">
        <ActiveUser />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="14">
        <SalesOverview />
      </ElCol>
    </ElRow>

    <ElRow :gutter="20">
      <ElCol :sm="24" :md="24" :lg="12">
        <NewUser />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="6">
        <Dynamic />
      </ElCol>
      <ElCol :sm="24" :md="12" :lg="6">
        <TodoList />
      </ElCol>
    </ElRow>

    <AboutProject />
  </div>
</template>

/* eslint-disable ts/no-use-before-define */
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import CardList from './modules/card-list.vue'

defineOptions({ name: 'Console' })

// 懒加载非关键组件，提升首屏加载速度
const ActiveUser = defineAsyncComponent(() => import('./modules/active-user.vue'))
const SalesOverview = defineAsyncComponent(() => import('./modules/sales-overview.vue'))
const NewUser = defineAsyncComponent(() => import('./modules/new-user.vue'))
const Dynamic = defineAsyncComponent(() => import('./modules/dynamic-stats.vue'))
const TodoList = defineAsyncComponent(() => import('./modules/todo-list.vue'))
const AboutProject = defineAsyncComponent(() => import('./modules/about-project.vue'))
</script>
