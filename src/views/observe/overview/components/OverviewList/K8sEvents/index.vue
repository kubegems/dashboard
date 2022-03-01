<template>
  <BaseDrawer
    v-model="visible"
    title="Kubernetes事件"
    width="1200px"
    :footer="false"
  >
    <div class="d-flex flex-column justify-space-around kubegems__h-24">
      <div class="kubegems__h-8">
        <MessageLineChart />
      </div>
      <div class="d-flex justify-space-around kubegems__h-12">
        <div class="kubegems__h-24 kubegems__w-11">
          <EventPieChart />
        </div>
        <div class="kubegems__h-24 kubegems__w-11">
          <EventPieChart />
        </div>
      </div>
    </div>
  </BaseDrawer>
</template>

<script>
import MessageLineChart from './MessageLineChart.vue'
import EventPieChart from './EventPieChart.vue'

export default {
  name: 'K8sEvents',
  components: {
    MessageLineChart,
    EventPieChart,
  },
  data () {
    return {
      visible: false,
    }
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    show () {
      this.visible = true
    },
  },
}
</script>
