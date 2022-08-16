<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

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
    <v-card flat :loading="eventLoad">
      <v-flex class="text-body-2 text-center primary white--text py-2">
        <v-icon color="white" left small> mdi-bell-ring </v-icon>
        <span>{{ $root.$t('resource.event') }}</span>
      </v-flex>
      <v-list class="pa-0 kubegems__tip" dense>
        <v-list-item v-if="events.length > 0">
          <v-list-item-content>
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <template v-for="(event, index) in events">
                  <v-list-item-title :key="`t${index}`">
                    {{ $root.$t('resource.event') }} {{ index + 1 }}
                  </v-list-item-title>
                  <v-list-item-content :key="index" class="text-caption kubegems__text kubegems__break-all">
                    {{ event.kind }} {{ item.name }} :
                    {{ event.message }}
                  </v-list-item-content>
                </template>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-content>
        </v-list-item>
        <v-flex v-else class="text-caption kubegems__text text-center pa-2"> {{ $root.$t('data.no_data') }} </v-flex>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
  import { mapGetters } from 'vuex';

  import { getAppRunningResourceDetail } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AppStatusTip',
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
      };
    },
    computed: {
      ...mapGetters(['Tenant', 'Project', 'Environment']),
    },
    methods: {
      async getLatestEvent() {
        if (!this.item.runtime.raw) return;
        this.events = [];
        this.timeout = setTimeout(async () => {
          this.eventLoad = true;
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
          );
          this.events = [];
          if (data?.liveState?.status?.operationState?.syncResult?.resources) {
            this.events = this.events.concat(
              data.liveState.status.operationState.syncResult.resources.filter((s) => {
                return s.status !== 'Synced';
              }),
            );
          }
          if (data?.liveState?.status?.resources) {
            this.events = this.events.concat(
              data.liveState.status.resources
                .map((r) => {
                  return {
                    ...r,
                    message: r.health ? r.health.message : '',
                  };
                })
                .filter((r) => {
                  return r.health && r.health.status !== 'Healthy';
                }),
            );
          }
          if (data?.liveState?.status?.operationState) {
            this.events = this.events.concat([
              {
                message: data?.liveState?.status?.operationState?.message,
              },
            ]);
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
