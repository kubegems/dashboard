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
  <v-card>
    <v-card-text>
      <v-data-table
        class="pb-4"
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="500"
        :no-data-text="$root.$t('data.no_data')"
      >
        <template #[`item.name`]="{ item }">
          {{ item.metadata.name }}
        </template>
        <template #[`item.status`]="{ item }">
          <v-flex :id="`e${item.metadata.resourceVersion}`" />

          <span
            :class="`v-avatar mr-2 ${
              ['ContainerCreating', 'Pending', 'Terminating', 'PodInitializing'].indexOf(
                m_resource_getPodStatus(item),
              ) > -1
                ? 'kubegems__waiting-flashing'
                : ''
            }`"
            :style="{
              height: '10px',
              minWidth: '10px',
              width: '10px',
              backgroundColor: `${$POD_STATUS_COLOR[m_resource_getPodStatus(item)] || '#ff5252'}`,
            }"
          />
          <span> {{ m_resource_getPodStatus(item) }}</span>
          <span>
            ({{
              item.status && item.status.containerStatuses
                ? item.status.containerStatuses.filter((c) => {
                    return c.ready;
                  }).length
                : 0
            }}/{{ item.spec.containers.length }})
          </span>
        </template>
        <template #[`item.ip`]="{ item }">
          {{ item.status.podIP }}
        </template>
        <template #[`item.restart`]="{ item }">
          {{ getRestart(item.status.containerStatuses) }}
        </template>
        <template #[`item.age`]="{ item }">
          {{ item.status.startTime ? $moment(item.status.startTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() : '' }}
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
  import messages from '../i18n';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'GatewayPodList',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      gateway: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        items: [],
      };
    },
    computed: {
      headers() {
        return [
          { text: this.$t('table.pods'), value: 'name', align: 'start' },
          { text: this.$t('table.status'), value: 'status', align: 'start', width: 250 },
          { text: this.$t('table.restart_count'), value: 'restart', align: 'start', sortable: false },
          { text: 'Age', value: 'age', align: 'start' },
          { text: 'Pod IP', value: 'ip', align: 'start', sortable: false },
        ];
      },
    },
    watch: {
      gateway: {
        handler() {
          if (this.gateway) {
            this.items = this.gateway.Pods;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      getRestart(containerStatuses) {
        let sum = 0;
        if (containerStatuses) {
          containerStatuses.forEach((con) => {
            sum += con.restartCount;
          });
        }
        return sum;
      },
    },
  };
</script>
