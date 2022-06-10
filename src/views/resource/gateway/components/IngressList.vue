<template>
  <v-card>
    <v-card-text>
      <v-data-table
        disable-sort
        :headers="headers"
        :items="items"
        :page.sync="params.page"
        :items-per-page="params.size"
        no-data-text="暂无数据"
        hide-default-footer
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
                color="success"
                text-color="white"
                class="mx-1"
                small
              >
                {{ getHost(rule, item) }}{{ getGatewayPort(getSchema(rule, item)) }}{{ path.path }}
              </v-chip>
              <v-btn
                :key="`i${index}http${i}`"
                small
                icon
                @click="toAddress(`${getHost(rule, item)}${getGatewayPort(getSchema(rule, item))}${path.path}`)"
              >
                <v-icon small color="success"> mdi-open-in-new </v-icon>
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
        @loaddata="ingressList"
        @changesize="onPageSizeChange"
        @changepage="onPageIndexChange"
      />
    </v-card-text>
  </v-card>
</template>

<script>
  import { getIngressList } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'IngressList',
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
      headers: [
        { text: '名称', value: 'name', align: 'start' },
        { text: '命名空间', value: 'namespace', align: 'start' },
        { text: '访问地址', value: 'address', align: 'start' },
        { text: '创建时间', value: 'createAt', align: 'start' },
      ],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
        noprocessing: true,
      },
    }),
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
