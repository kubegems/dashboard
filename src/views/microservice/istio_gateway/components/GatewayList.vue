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
        :no-data-text="$root.$t('data.no_data')"
      >
        <template #[`item.name`]="{ item }">
          <a class="text-subtitle-2 kubegems__inline_flex">
            {{ item.metadata.name }}
          </a>
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
        </template>
        <template #[`item.selector`]="{ item, index }">
          <BaseCollapseChips
            v-if="item"
            :id="`g_selector_${index}`"
            :chips="item.spec.selector || {}"
            icon="mdi-label"
            single-line
          />
        </template>
        <template #[`item.ports`]="{ item, index }">
          <BaseCollapseChips
            v-if="item"
            :id="`g_port_${index}`"
            :chips="servers || []"
            icon="mdi-directions-fork"
            single-line
          />
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ item.metadata.creationTimestamp ? $moment(item.metadata.creationTimestamp).format('lll') : '' }}
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
  import messages from '../i18n';

  export default {
    name: 'GatewayList',
    i18n: {
      messages: messages,
    },
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
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$root.$t('resource.namespace'), value: 'namespace', align: 'start' },
          { text: this.$t('table.selector'), value: 'selector', align: 'start', width: 300 },
          { text: this.$t('table.port'), value: 'ports', align: 'start' },
          { text: this.$root.$t('resource.create_at'), value: 'createdAt', align: 'start' },
        ];
      },
    },
    watch: {
      gateway: {
        handler() {
          if (this.gateway) {
            this.items = this.gateway.Gateways;
            if (this.items) {
              this.items = this.gateway.Gateways.map((g) => {
                return {
                  ...g,
                  servers: g.spec.servers
                    ? g.spec.servers.map((server) => {
                        return `${server.port.number} | ${server.port.protocol}`;
                      })
                    : [],
                };
              });
            }
          }
        },
        deep: true,
        immediate: true,
      },
    },
  };
</script>
