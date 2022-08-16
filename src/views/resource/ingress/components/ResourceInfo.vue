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
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail :mt="0" :title="$root.$t('resource.gateway')">
          <template #content>
            {{ gateway ? gateway.metadata.name : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="Generation">
          <template #content>
            {{ ingress ? ingress.metadata.generation : '' }}
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="$t('tip.ingress_rule')" />
      <v-flex class="pl-4 kubegems__text py-2 text-subtitle-1">HTTP</v-flex>
      <v-data-table
        class="mx-2 pa-2 no-header-table"
        :headers="[
          { text: 'http', value: 'http', align: 'start' },
          { text: 'opp', value: 'opp', align: 'end' },
          { text: '', value: 'data-table-expand', align: 'end' },
        ]"
        hide-default-footer
        hide-default-header
        item-key="host"
        :items="
          ingress
            ? ingress.spec.rules.filter((item) => {
                return getHost(item, ingress) === 'http';
              })
            : []
        "
        :no-data-text="$root.$t('data.no_data')"
        show-expand
        single-expand
        @click:row="onHttpRowClick"
      >
        <template #[`item.http`]="{ item }">
          <v-flex v-for="(path, i) in item.http.paths" :key="i">
            http://{{ item.host }}{{ getGatewayPort('http') }}{{ path.path }}
          </v-flex>
        </template>
        <template #[`item.opp`]="{ item }">
          <v-flex v-for="(path, i) in item.http.paths" :key="i">
            <v-btn color="primary" text x-small @click.stop="toAddress(item, ingress, path.path)"> 访问 </v-btn>
          </v-flex>
        </template>
        <template #expanded-item="{ headers, item }">
          <td class="text-left" :colspan="headers.length">
            <v-chip
              v-for="(path, i) in item.http.paths"
              :key="i"
              class="mx-1 font-weight-medium"
              color="success"
              small
              text-color="white"
            >
              {{ path.backend.service.name }}｜{{ path.backend.service.port.name || path.backend.service.port.number }}
            </v-chip>
          </td>
        </template>
      </v-data-table>

      <v-flex class="pl-4 kubegems__text py-2 text-subtitle-1">HTTPS</v-flex>
      <v-data-table
        class="mx-2 pa-2 no-header-table"
        :headers="[
          { text: 'https', value: 'https', align: 'start' },
          { text: 'opp', value: 'opp', align: 'end' },
          {
            text: '',
            value: 'data-table-expand',
            align: 'end',
          },
        ]"
        hide-default-footer
        hide-default-header
        item-key="host"
        :items="
          ingress
            ? ingress.spec.rules.filter((item) => {
                return getHost(item, ingress) === 'https';
              })
            : []
        "
        :no-data-text="$root.$t('data.no_data')"
        show-expand
        single-expand
        @click:row="onHttpsRowClick"
      >
        <template #[`item.https`]="{ item }">
          <v-flex v-for="(path, i) in item.http.paths" :key="i">
            https://{{ item.host }}{{ getGatewayPort('https') }}{{ path.path }}
          </v-flex>
        </template>
        <template #[`item.opp`]="{ item }">
          <v-flex v-for="(path, i) in item.http.paths" :key="i">
            <v-btn color="primary" text x-small @click.stop="toAddress(item, ingress, path.path)"> 访问 </v-btn>
          </v-flex>
        </template>
        <template #expanded-item="{ headers, item }">
          <td class="text-left" :colspan="headers.length">
            <v-chip
              v-for="(path, i) in item.http.paths"
              :key="i"
              class="mx-1 font-weight-medium"
              color="success"
              small
              text-color="white"
            >
              {{ path.backend.service.name }} | {{ path.backend.service.port.name || path.backend.service.port.number }}
            </v-chip>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
  import messages from '../i18n';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ResourceInfo',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      gateway: {
        type: Object,
        default: () => null,
      },
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        ingress: null,
      };
    },
    watch: {
      item() {
        this.ingress = deepCopy(this.item);
      },
    },
    mounted() {
      if (this.item) this.ingress = deepCopy(this.item);
    },
    methods: {
      getHost(rule, item) {
        let prefix = 'http';
        if (item.spec.tls) {
          item.spec.tls.forEach((t) => {
            const i = t.hosts.findIndex((h) => {
              return h === rule.host;
            });
            if (i > -1) {
              prefix = 'https';
              return;
            }
          });
        }
        return prefix;
      },
      getGatewayPort(type) {
        if (this.gateway && this.gateway.status) {
          if (type === 'http') {
            const g = this.gateway.status.ports.find((g) => {
              return g.name === 'http';
            });
            if (g) return `:${g.nodePort}`;
            return '';
          } else if (type === 'https') {
            const g = this.gateway.status.ports.find((g) => {
              return g.name === 'https';
            });
            if (g) return `:${g.nodePort}`;
            return '';
          }
        }
        return '';
      },
      toAddress(rule, item, path) {
        const prefix = this.getHost(rule, item);
        if (this.gateway) {
          const port = this.getGatewayPort(prefix);
          window.open(`${prefix}://${rule.host}${port}${path}`);
        } else {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.gateway_not_found'),
            color: 'warning',
          });
        }
      },
      onHttpRowClick(item, { expand, isExpanded }) {
        expand(!isExpanded);
      },
      onHttpsRowClick(item, { expand, isExpanded }) {
        expand(!isExpanded);
      },
    },
  };
</script>

<style lang="scss">
  .no-header-table .text-end {
    width: 50px !important;
  }
</style>
