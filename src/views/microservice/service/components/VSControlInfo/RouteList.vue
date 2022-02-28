<template>
  <v-data-table
    disable-sort
    :headers="headers"
    :items="routes"
    no-data-text="暂无数据"
    hide-default-footer
  >
    <template #[`item.destination`]="{ item }">
      {{ item.destination.host }}
    </template>
  </v-data-table>
</template>

<script>
import BaseResource from '@/mixins/resource'

export default {
  name: 'RouteList',
  mixins: [BaseResource],
  props: {
    routes: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      headers: [
        {
          text: '目标负载',
          value: 'destination',
          align: 'start',
          width: '50%',
        },
        { text: '流量权重', value: 'weight', align: 'start' },
      ],
    }
  },
}
</script>
