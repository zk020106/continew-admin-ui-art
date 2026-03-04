<template>
  <div class="art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>{{ t('pages.dashboardConsole.todoList.title') }}</h4>
        <p>{{ t('pages.dashboardConsole.todoList.pending') }}<span class="text-danger">3</span></p>
      </div>
    </div>

    <div class="h-[calc(100%-40px)] overflow-auto">
      <ElScrollbar>
        <div
          v-for="(item, index) in list"
          :key="index"
          class="flex-cb h-17.5 border-b border-g-300 text-sm last:border-b-0"
        >
          <div>
            <p class="text-sm">{{ t(item.taskKey) }}</p>
            <p class="text-g-500 mt-1">{{ t(item.timeKey) }}</p>
          </div>
          <ElCheckbox v-model="item.complate" />
        </div>
      </ElScrollbar>
    </div>
  </div>
</template>

/* eslint-disable ts/no-use-before-define */
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface TodoItem {
  taskKey: string
  timeKey: string
  complate: boolean
}
const { t } = useI18n()

/**
 * 待办事项列表
 * 记录每日工作任务及完成状态
 */
const list = reactive<TodoItem[]>([
  {
    taskKey: 'pages.dashboardConsole.todoList.tasks.todayWork',
    timeKey: 'pages.dashboardConsole.todoList.times.morning0930',
    complate: true
  },
  {
    taskKey: 'pages.dashboardConsole.todoList.tasks.replyEmail',
    timeKey: 'pages.dashboardConsole.todoList.times.morning1030',
    complate: true
  },
  {
    taskKey: 'pages.dashboardConsole.todoList.tasks.reportSummary',
    timeKey: 'pages.dashboardConsole.todoList.times.morning1100',
    complate: true
  },
  {
    taskKey: 'pages.dashboardConsole.todoList.tasks.productMeeting',
    timeKey: 'pages.dashboardConsole.todoList.times.afternoon0200',
    complate: false
  },
  {
    taskKey: 'pages.dashboardConsole.todoList.tasks.organizeMeeting',
    timeKey: 'pages.dashboardConsole.todoList.times.afternoon0330',
    complate: false
  },
  {
    taskKey: 'pages.dashboardConsole.todoList.tasks.tomorrowPlan',
    timeKey: 'pages.dashboardConsole.todoList.times.afternoon0630',
    complate: false
  }
])
</script>
