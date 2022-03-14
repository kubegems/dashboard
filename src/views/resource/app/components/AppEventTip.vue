<template>
  <v-menu
    open-on-hover
    :disabled="disabled"
    left
    transition="scale-transition"
    max-width="300px"
    max-height="300px"
    :close-on-content-click="false"
    nudge-bottom="5px"
    :top="top"
    offset-y
    :origin="`${top ? 'bottom center' : 'top center'}`"
    :close-delay="200"
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
    <v-card
      flat
      :loading="eventLoad"
    >
      <v-list
        dense
        class="pa-0"
      >
        <v-flex class="text-body-2 text-center primary white--text py-2">
          <v-icon
            color="white"
            left
            small
          >
            mdi-bell-ring
          </v-icon>
          <span>事件</span>
        </v-flex>
        <v-list-item v-if="events.length > 0">
          <v-list-item-content>
            <v-list-item
              two-line
              class="float-left pa-0"
            >
              <v-list-item-content class="py-0">
                <template v-for="(event, index) in events">
                  <v-list-item-title :key="`t${index}`"> 事件 {{ index + 1 }} </v-list-item-title>
                  <v-list-item-content
                    :key="index"
                    class="text-caption kubegems__detail kubegems__break-all"
                  >
                    {{ event.kind }} {{ item.name }} :
                    {{ event.message }}
                  </v-list-item-content>
                </template>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-content>
        </v-list-item>
        <v-flex
          v-else
          class="text-caption kubegems__detail text-center pa-2"
        >
          暂无事件
        </v-flex>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
import { mapGetters } from 'vuex'
import { getAppRunningResourceDetail } from '@/api'
import BaseResource from '@/mixins/resource'

export default {
  name: 'AppEventTip',
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
    top: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      events: [],
      eventLoad: false,
      timeout: null,
    }
  },
  computed: {
    ...mapGetters(['Tenant', 'Project', 'Environment']),
  },
  methods: {
    async getLatestEvent() {
      if (!this.item.runtime.raw) return
      this.events = []
      this.timeout = window.setTimeout(async () => {
        this.eventLoad = true
        const data = await getAppRunningResourceDetail(
          this.Tenant().ID,
          this.Project().ID,
          this.Environment().ID,
          this.item.name,
          {
            group: 'argoproj.io',
            version: 'v1alpha1',
            kind: 'Application',
            namespace: this.item.runtime.raw.metadata.namespace,
            name: this.item.name,
            noprocessing: true,
          },
        )
        this.events = []
        if (
          data?.liveState?.status?.operationState?.syncResult?.resources
        ) {
          this.events = this.events.concat(
            data.liveState.status.operationState.syncResult.resources.filter(
              (s) => {
                return s.status !== 'Synced'
              },
            ),
          )
        }
        if (data && data.liveState && data.liveState.status.resources) {
          this.events = this.events.concat(
            data.liveState.status.resources
              .map((r) => {
                return {
                  ...r,
                  message: r.health ? r.health.message : '',
                }
              })
              .filter((r) => {
                return r.health && r.health.status !== 'Healthy'
              }),
          )
        }
        this.eventLoad = false
        clearTimeout(this.timeout)
      }, 200)
    },
    removeEvent() {
      if (this.timeout) clearTimeout(this.timeout)
    },
  },
}
</script>
