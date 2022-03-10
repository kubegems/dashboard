<template>
  <v-flex>
    <v-data-table
      disable-sort
      :headers="headers"
      :items="items"
      no-data-text="暂无数据"
      :items-per-page="500"
      hide-default-footer
      class="pb-4"
    >
      <template #[`item.name`]="{ item }">
        {{ item.metadata.name }}
      </template>
      <template #[`item.status`]="{ item }">
        <v-flex :id="`e${item.metadata.resourceVersion}`" />

        <span
          :class="`v-avatar mr-2 ${
            [
              'ContainerCreating',
              'Pending',
              'Terminating',
              'PodInitializing',
            ].indexOf(m_resource_getPodStatus(item)) > -1
              ? 'kubegems__waiting-flashing'
              : ''
          }`"
          :style="`height: 10px; min-width: 10px; width: 10px; background-color: ${
            $POD_STATUS_COLOR[m_resource_getPodStatus(item)] || '#ff5252'
          };`"
        />
        <span> {{ m_resource_getPodStatus(item) }}</span>
        <span>
          ({{
            item.status && item.status.containerStatuses
              ? item.status.containerStatuses.filter((c) => {
                return c.ready
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
        {{
          item.status.startTime
            ? $moment(item.status.startTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
            : ''
        }}
      </template>
    </v-data-table>
  </v-flex>
</template>

<script>
import BaseResource from '@/mixins/resource'

export default {
  name: 'GatewayPodList',
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
      headers: [
        { text: '容器组', value: 'name', align: 'start' },
        { text: '状态', value: 'status', align: 'start', width: 250 },
        { text: '重启次数', value: 'restart', align: 'start', sortable: false },
        { text: 'Age', value: 'age', align: 'start' },
        { text: 'Pod IP', value: 'ip', align: 'start', sortable: false },
      ],
    }
  },
  watch: {
    gateway: {
      handler() {
        if (this.gateway) {
          this.items = this.gateway.Pods
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    getRestart(containerStatuses) {
      let sum = 0
      if (containerStatuses) {
        containerStatuses.forEach((con) => {
          sum += con.restartCount
        })
      }
      return sum
    },
  },
}
</script>

