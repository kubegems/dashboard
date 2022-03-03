<template>
  <div class="mx-n3">
    <Metrics
      ref="metrics"
      :metrics="data.metrics"
    />
    <Labels
      ref="labels"
      :labels="data.labels"
      :key-items="labelKeyItems"
    />
  </div>
</template>

<script>
import Metrics from './Metrics'
import Labels from '@/views/observe/log/operator/components/LabelsInput'

export default {
  name: 'Prometheus',
  components: {
    Metrics,
    Labels,
  },
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      labelKeyItems: ['container', 'namespace', 'node', 'pod'],
    }
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    getValue() {
      return {
        prometheus: {
          metrics: this.$refs.metrics.getValue(),
          labels: this.$refs.labels.getValue(),
        },
      }
    },
  },
}
</script>
