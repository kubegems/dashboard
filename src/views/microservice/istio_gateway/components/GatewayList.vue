<template>
  <v-card>
    <v-card-text>
      <v-data-table
        class="pb-4"
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="items"
        no-data-text="暂无数据"
      >
        <template #[`item.name`]="{ item }">
          <a class="text-subtitle-2">
            {{ item.metadata.name }}
          </a>
        </template>
        <template #[`item.namespace`]="{ item }">
          {{ item.metadata.namespace }}
        </template>
        <template #[`item.selector`]="{ item }">
          <BaseCollapseChips v-if="item" :chips="item.spec.selector || {}" icon="mdi-label" single-line />
        </template>
        <template #[`item.ports`]="{ item }">
          <BaseCollapseChips v-if="item" :chips="servers || []" icon="mdi-directions-fork" single-line />
        </template>
        <template #[`item.createdAt`]="{ item }">
          {{ item.metadata.creationTimestamp ? $moment(item.metadata.creationTimestamp).format('lll') : '' }}
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
  export default {
    name: 'GatewayList',
    props: {
      gateway: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        items: [],
        headers: [
          { text: '名称', value: 'name', align: 'start' },
          { text: '命名空间', value: 'namespace', align: 'start' },
          { text: 'Selector', value: 'selector', align: 'start', width: 300 },
          { text: 'Ports', value: 'ports', align: 'start' },
          { text: '创建时间', value: 'createdAt', align: 'start' },
        ],
      };
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
