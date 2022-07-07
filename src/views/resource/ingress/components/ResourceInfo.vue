<template>
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail :mt="0" title="网关">
          <template #content>
            {{ gateway ? gateway.metadata.name : '' }}
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="generation">
          <template #content>
            {{ ingress ? ingress.metadata.generation : '' }}
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>

    <v-card class="mt-3">
      <BaseSubTitle class="pt-2" :divider="false" title="路由规则" />
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
        no-data-text="暂无数据"
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
        no-data-text="暂无数据"
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
              {{ path.backend.service.name }}｜{{ path.backend.service.port.name || path.backend.service.port.number }}
            </v-chip>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ResourceInfo',
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
            text: `找不到对应网关`,
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
