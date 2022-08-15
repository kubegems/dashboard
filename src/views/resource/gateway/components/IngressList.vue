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
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="items"
        :items-per-page="params.size"
        :no-data-text="$root.$t('data.no_data')"
        :page.sync="params.page"
      >
        <template #[`item.name`]="{ item }">
          {{ item.metadata.name }}
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
        </template>
        <template #[`item.address`]="{ item }">
          <div v-for="(rule, index) in item.spec.rules" :key="index">
            <div v-for="(path, i) in rule.http.paths" :key="i">
              <v-chip
                v-for="(rule, index) in item.spec.rules"
                :key="`c${index}http${i}`"
                class="mx-1"
                color="success"
                small
                text-color="white"
              >
                {{ getHost(rule, item) }}{{ getGatewayPort(getSchema(rule, item)) }}{{ path.path }}
              </v-chip>
              <v-btn
                :key="`i${index}http${i}`"
                icon
                small
                @click="toAddress(`${getHost(rule, item)}${getGatewayPort(getSchema(rule, item))}${path.path}`)"
              >
                <v-icon color="success" small> mdi-open-in-new </v-icon>
              </v-btn>
            </div>
          </div>
        </template>
        <template #[`item.createAt`]="{ item }">
          {{ item.metadata.creationTimestamp ? $moment(item.metadata.creationTimestamp).format('lll') : '' }}
        </template>
      </v-data-table>
      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @changepage="onPageIndexChange"
        @changesize="onPageSizeChange"
        @loaddata="ingressList"
      />
    </v-card-text>
  </v-card>
</template>

<script>
  import messages from '../i18n';
  import { getIngressList } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'IngressList',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      selector: {
        type: Object,
        default: () => {},
      },
    },
    data: () => ({
      items: [],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
        noprocessing: true,
      },
    }),
    computed: {
      headers() {
        return [
          { text: this.$t('table.name'), value: 'name', align: 'start' },
          { text: this.$root.$t('resource.namespace'), value: 'namespace', align: 'start' },
          { text: this.$t('table.address'), value: 'address', align: 'start' },
          { text: this.$root.$t('resource.create_at'), value: 'createAt', align: 'start' },
        ];
      },
    },
    watch: {
      item() {
        this.ingressList();
      },
    },
    mounted() {
      if (this.item) this.ingressList();
    },
    methods: {
      async ingressList() {
        const data = await getIngressList(
          this.ThisCluster,
          '_all',
          Object.assign(
            {
              [`labels[networking.kubegems.io/ingressClass]`]: this.selector.ingressClassName,
            },
            this.params,
          ),
        );
        this.items = data.List;
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
      },
      getSchema(rule, item) {
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
        return `${prefix}://${rule.host}`;
      },
      getGatewayPort(type) {
        const gateway = this.item;
        if (gateway && gateway.status) {
          if (type === 'http') {
            const g = gateway.status.ports.find((g) => {
              return g.name === 'http2';
            });
            if (g) return `:${g.nodePort}`;
            return '';
          } else if (type === 'https') {
            const g = gateway.status.ports.find((g) => {
              return g.name === 'https';
            });
            if (g) return `:${g.nodePort}`;
            return '';
          }
        }
        return '';
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
    },
  };
</script>
