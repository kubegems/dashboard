<template>
  <v-menu
    bottom
    :close-on-content-click="false"
    left
    max-height="350px"
    max-width="200px"
    nudge-bottom="5px"
    open-on-hover
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <span class="kubegems__pointer" v-on="on">
        <slot name="trigger" />
      </span>
    </template>
    <v-card flat>
      <v-list class="pa-0" dense>
        <v-flex class="text-body-2 text-center primary white--text py-2">
          <v-icon color="white" left small> mdi-alert </v-icon>
          <span>错误信息</span>
        </v-flex>
        <v-list-item>
          <v-list-item-content>
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title> 错误信息 </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
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
  };
</script>
