<template>
  <v-menu
    :close-delay="200"
    :close-on-content-click="false"
    :disabled="disabled"
    left
    max-width="200px"
    nudge-bottom="5px"
    offset-y
    open-on-hover
    :origin="`${top ? 'bottom center' : 'top center'}`"
    :top="top"
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <span
        class="kubegems__pointer kubegems__attach-position"
        v-on="on"
        @mouseenter.passive="getLatestEvent"
        @mouseout.passive="removeEvent"
      >
        <slot name="trigger" />
      </span>
    </template>
    <v-card flat :loading="eventLoad" width="100%">
      <v-flex class="text-body-2 text-center primary white--text py-2">
        <v-icon color="white" left small> mdi-bell-ring </v-icon>
        <span>事件</span>
      </v-flex>
      <v-list class="pa-0 kubegems__tip" dense>
        <v-list-item>
          <v-list-item-content v-if="event">
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title> 最新事件 </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                  {{ event.message }}
                </v-list-item-content>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title> 发生时间 </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                  {{
                    event.metadata.creationTimestamp
                      ? $moment(event.metadata.creationTimestamp, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                      : ''
                  }}
                </v-list-item-content>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-content>
          <v-flex v-else class="text-caption kubegems__text text-center"> 暂无事件 </v-flex>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
  import { getEventList } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'EventTip',
    mixins: [BaseResource],
    props: {
      disabled: {
        type: Boolean,
        default: () => false,
      },
      item: {
        type: Object,
        default: () => {},
      },
      kind: {
        type: String,
        default: () => 'Pod',
      },
      top: {
        type: Boolean,
        default: () => false,
      },
    },
    data() {
      return {
        event: null,
        eventLoad: false,
        timeout: null,
      };
    },
    methods: {
      async getLatestEvent() {
        this.event = null;
        this.timeout = setTimeout(async () => {
          this.eventLoad = true;
          const data = await getEventList(this.ThisCluster, this.item.metadata.namespace, {
            topkind: this.kind,
            topname: this.item.metadata.name,
            page: 1,
            size: 1,
            noprocessing: true,
          });
          if (data && data.List && data.List.length > 0) {
            this.event = data.List[0];
          }
          this.eventLoad = false;
          clearTimeout(this.timeout);
        }, 200);
      },
      removeEvent() {
        if (this.timeout) clearTimeout(this.timeout);
      },
    },
  };
</script>
