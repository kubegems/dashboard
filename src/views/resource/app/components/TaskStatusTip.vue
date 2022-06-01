<template>
  <div>
    <span
      :class="`v-avatar mr-2 ${
        item.task &&
        (item.task.status.status === 'Running' ||
          item.task.status.status === 'Pending')
          ? 'kubegems__waiting-flashing'
          : ''
      }`"
      :style="`height: 10px; min-width: 10px; width: 10px; background-color: ${
        $APP_TASK_STATUS_COLOR[item.task ? item.task.status.status : '']
          ? $APP_TASK_STATUS_COLOR[item.task ? item.task.status.status : '']
          : 'grey'
      };`"
    />
    <template
      v-if="
        item.task &&
          (item.task.status.status === 'Running' ||
            item.task.status.status === 'Pending')
      "
    >
      <span> 执行中 </span>
    </template>
    <template
      v-else-if="item.task && item.task.status.status === 'Success'"
    >
      <span> 已完成 </span>
    </template>
    <template
      v-else-if="item.task && item.task.status.status === 'Error'"
    >
      <v-menu
        open-on-hover
        bottom
        left
        transition="scale-transition"
        max-width="200px"
        :close-on-content-click="false"
        nudge-bottom="5px"
        :top="
          size - index <= 5 || (items.length <= 5 && index >= 1)
        "
        offset-y
        :origin="`${
          size - index <= 5 || (items.length <= 5 && index >= 1)
            ? 'bottom center'
            : 'top center'
        }`"
      >
        <template #activator="{ on }">
          <span
            style="cursor: pointer;"
            v-on="on"
          > 执行失败 </span>
        </template>
        <v-card flat>
          <v-flex
            class="text-body-2 text-center primary white--text py-2"
          >
            <v-icon
              color="white"
              left
              small
            >
              mdi-alert
            </v-icon>
            <span>错误信息</span>
          </v-flex>
          <v-list
            dense
            class="pa-0 kubegems__tip"
          >
            <v-list-item>
              <v-list-item-content>
                <v-list-item
                  two-line
                  class="float-left pa-0"
                >
                  <v-list-item-content class="py-0">
                    <v-list-item-title> 错误信息 </v-list-item-title>
                    <v-list-item-content
                      class="text-caption kubegems__text kubegems__break-all"
                    >
                      {{ item.task ? item.task.status.message : '' }}
                    </v-list-item-content>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </template>
    <template v-else>暂无</template>
  </div>
</template>

<script>
export default {
  name: 'TaskStatusTip',
  props: {
    item: {
      type: Object,
      default: () => {},
    },
    size: {
      type: Number,
      default: () => 10,
    },
    index: {
      type: Number,
      default: () => 1,
    },
  },
}
</script>

