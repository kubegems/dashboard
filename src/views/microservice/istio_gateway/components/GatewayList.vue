<template>
  <v-flex>
    <v-data-table
      disable-sort
      :headers="headers"
      :items="items"
      no-data-text="暂无数据"
      hide-default-footer
      class="pb-4"
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
        <BaseCollapseChips
          v-if="item"
          :chips="item.spec.selector || {}"
          single-line
          icon="mdi-label"
        />
      </template>
      <template #[`item.ports`]="{ item }">
        <BaseCollapseChips
          v-if="item"
          :chips="servers || []"
          single-line
          icon="mdi-directions-fork"
        />
      </template>
      <template #[`item.createdAt`]="{ item }">
        {{
          item.metadata.creationTimestamp
            ? $moment(item.metadata.creationTimestamp).format('lll')
            : ''
        }}
      </template>
    </v-data-table>
  </v-flex>
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
    }
  },
  watch: {
    gateway: {
      handler() {
        if (this.gateway) {
          this.items = this.gateway.Gateways
          if (this.items) {
            this.items = this.gateway.Gateways.map((g) => {
              return {
                ...g,
                servers: g.spec.servers
                  ? g.spec.servers.map((server) => {
                      return `${server.port.number} | ${server.port.protocol}`
                    })
                  : [],
              }
            })
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
}
</script>
