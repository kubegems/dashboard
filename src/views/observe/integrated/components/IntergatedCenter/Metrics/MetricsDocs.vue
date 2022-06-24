<template>
  <v-form class="pb-4 metrics" lazy-validation @submit.prevent>
    <div class="markdown-body px-4" :style="{ height: `${height}px`, overflowY: 'auto' }">
      <Metrics />
    </div>
  </v-form>
</template>

<script>
  import { mapState } from 'vuex';

  import Metrics from './docs/metrics.mdx';

  export default {
    name: 'MetricsDocs',
    components: {
      Metrics,
    },
    computed: {
      ...mapState(['Scale']),
      height() {
        return parseInt((window.innerHeight - 208) / this.Scale);
      },
    },
    methods: {
      async addData() {
        this.$emit('close');
      },
    },
  };
</script>
