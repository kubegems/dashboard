<template>
  <v-menu
    open-on-hover
    bottom
    left
    transition="scale-transition"
    max-width="200px"
    :close-on-content-click="false"
    nudge-bottom="5px"
    max-height="350px"
  >
    <template #activator="{ on }">
      <span
        style="cursor: pointer;"
        v-on="on"
      >
        <slot name="trigger" />
      </span>
    </template>
    <v-card flat>
      <v-list
        dense
        class="pa-0"
      >
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
        <v-list-item>
          <v-list-item-content>
            <v-list-item
              two-line
              class="float-left pa-0"
            >
              <v-list-item-content class="py-0">
                <v-list-item-title> 错误信息 </v-list-item-title>
                <v-list-item-content
                  class="text-caption kubegems__detail kubegems__break-all"
                >
                  {{ item.SyncMessage ? item.SyncMessage : '' }}
                </v-list-item-content>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  name: 'StatusTip',
  props: {
    item: {
      type: Object,
      default: () => {},
    },
  },
}
</script>

