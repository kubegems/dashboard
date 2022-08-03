<template>
  <v-card>
    <v-card-title class="py-1">
      <v-flex>
        <v-flex class="float-right">
          <v-sheet class="text-body-2 text--darken-1">
            <BaseDatetimePicker v-model="date" :default-value="30" @change="onDatetimeChange(undefined)" />
          </v-sheet>
        </v-flex>
        <div class="kubegems__clear-float" />
      </v-flex>
    </v-card-title>
    <v-card-text :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
      <v-row>
        <v-col cols="6">
          <BaseApexAreaChart id="requestQps" label="pod" :metrics="requestQps" title="请求qps" type="" />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="requestDuration"
            label="pod"
            :metrics="requestDuration"
            title="请求耗时"
            type="timecost"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="6">
          <BaseApexAreaChart id="cpu" label="pod" :metrics="cpu" title="CPU使用量" type="cpu" />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart id="memory" label="pod" :metrics="memory" title="内存使用量" type="memory" />
        </v-col>
      </v-row>
      <template v-if="hasGpu">
        <v-row>
          <v-col cols="6">
            <BaseApexAreaChart id="gpu" label="pod" :metrics="gpu" title="GPU使用量" type="cpu" />
          </v-col>
          <v-col cols="6">
            <BaseApexAreaChart id="gpuMemory" label="pod" :metrics="gpuMemory" title="显存使用量" type="memory" />
          </v-col>
        </v-row>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex';

  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'ModelMonitor',
    mixins: [BasePermission, BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      cpu: [],
      memory: [],
      gpu: [],
      gpuMemory: [],
      requestDuration: [],
      requestQps: [],
      date: [],
      params: {
        start: '',
        end: '',
        noprocessing: true,
      },
      timeinterval: null,
      hasGpu: false,
    }),
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            if (newValue?.spec?.resources?.limits?.[`limits.nvidia.com/gpu`]) {
              this.hasGpu = true;
            }
            if (newValue?.spec?.resources?.limits?.[`tencent.com/vcuda-core`]) {
              this.hasGpu = true;
            }
          }
        },
        deep: true,
        immediate: true,
      },
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    mounted() {
      this.$nextTick(() => {
        this.onDatetimeChange();
      });
    },
    methods: {
      async loadMetrics() {
        if (this.timeinterval) clearInterval(this.timeinterval);
        this.loadData();
        this.timeinterval = setInterval(() => {
          this.params.start = this.$moment(this.params.start).utc().add(30, 'seconds').format();
          this.params.end = this.$moment(this.params.end).utc().add(30, 'seconds').format();
          this.loadData();
        }, 1000 * 30);
      },
      async loadData() {},

      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
        this.loadMetrics();
      },
    },
  };
</script>
