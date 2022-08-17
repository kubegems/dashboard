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
          <BaseApexAreaChart
            id="cpu"
            label="pod"
            :metrics="cpu"
            :title="$t('tip.used', [$root.$t('resource.cpu')])"
            type="cpu"
          />
        </v-col>
        <v-col cols="6">
          <BaseApexAreaChart
            id="memory"
            label="pod"
            :metrics="memory"
            :title="$t('tip.used', [$root.$t('resource.memory')])"
            type="memory"
          />
        </v-col>
      </v-row>
      <template v-if="hasGpu">
        <v-row>
          <v-col cols="6">
            <BaseApexAreaChart
              id="gpu"
              label="pod"
              :metrics="gpu"
              :title="$t('tip.used', [$root.$t('resource.gpu')])"
              type="%"
            />
          </v-col>
          <v-col cols="6">
            <BaseApexAreaChart
              id="gpuMemory"
              label="pod"
              :metrics="gpuMemory"
              :title="$t('tip.used', [$root.$t('resource.video_memory')])"
              type="memory"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6">
            <BaseApexAreaChart id="gpuTemp" label="pod" :metrics="gpuTemp" :title="$t('tip.gpu_temp')" type="°C" />
          </v-col>
          <v-col cols="6">
            <BaseApexAreaChart id="gpuPower" label="pod" :metrics="gpuPower" :title="$t('tip.gpu_power')" type="W" />
          </v-col>
        </v-row>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { getPodList } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import {
    GPU_MEMORY_USAGE,
    GPU_POWER,
    GPU_TEMP,
    GPU_USAGE,
    MODEL_WORKLOAD_CPU_USAGE_CORE_PROMQL,
    MODEL_WORKLOAD_MEMORY_USAGE_BYTE_PROMQL,
  } from '@/utils/prometheus';

  export default {
    name: 'ModelMonitor',
    i18n: {
      messages: messages,
    },
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
      gpuTemp: [],
      gpuPower: [],
      date: [],
      params: {
        start: '',
        end: '',
        noprocessing: true,
      },
      timeinterval: null,
      hasGpu: false,
      pods: '',
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
      this.$nextTick(async () => {
        await this.podList();
        this.onDatetimeChange();
      });
    },
    methods: {
      async podList() {
        const data = await getPodList(this.ThisCluster, this.ThisNamespace, {
          topkind: 'ModelDeployment',
          topname: this.item.metadata.name,
          size: 1000,
          noprocessing: true,
        });
        this.pods = data.List.map((d) => {
          return d.metadata.name;
        }).join('|');
      },
      async loadMetrics() {
        if (this.timeinterval) clearInterval(this.timeinterval);
        this.loadData();
        this.timeinterval = setInterval(() => {
          this.params.start = this.$moment(this.params.start).utc().add(30, 'seconds').format();
          this.params.end = this.$moment(this.params.end).utc().add(30, 'seconds').format();
          this.loadData();
        }, 1000 * 30);
      },
      async loadData() {
        this.modelCPUUsage();
        this.modelMemoryUsage();
        if (this.hasGpu) {
          this.modelGPUUsage();
          this.modelGpuMemoryUsage();
          this.modelGPUTemp();
          this.modelGpuPower();
        }
      },
      async modelCPUUsage() {
        const query = MODEL_WORKLOAD_CPU_USAGE_CORE_PROMQL.replaceAll('$1', this.pods).replaceAll(
          '$2',
          this.item.metadata.namespace,
        );
        const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
        if (data) this.cpu = data;
      },
      async modelMemoryUsage() {
        const query = MODEL_WORKLOAD_MEMORY_USAGE_BYTE_PROMQL.replaceAll('$1', this.pods).replaceAll(
          '$2',
          this.item.metadata.namespace,
        );
        const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
        if (data) this.memory = data;
      },

      async modelGPUUsage() {
        const query = GPU_USAGE.replaceAll('$1', this.pods).replaceAll('$2', this.item.metadata.namespace);
        const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
        if (data) this.gpu = data;
      },
      async modelGpuMemoryUsage() {
        const query = GPU_MEMORY_USAGE.replaceAll('$1', this.pods).replaceAll('$2', this.item.metadata.namespace);
        const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
        if (data) this.gpuMemory = data;
      },
      async modelGPUTemp() {
        const query = GPU_TEMP.replaceAll('$1', this.pods).replaceAll('$2', this.item.metadata.namespace);
        const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
        if (data) this.gpuTemp = data;
      },
      async modelGpuPower() {
        const query = GPU_POWER.replaceAll('$1', this.pods).replaceAll('$2', this.item.metadata.namespace);
        const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
        if (data) this.gpuPower = data;
      },
      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
        this.loadMetrics();
      },
    },
  };
</script>
