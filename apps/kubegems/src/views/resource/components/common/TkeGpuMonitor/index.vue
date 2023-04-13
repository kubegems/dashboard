<template>
  <div>
    <DashboardCard class="mt-3" :item="item" :type="type" />
    <v-card class="mt-3">
      <v-card-title class="py-1">
        <v-flex>
          <v-flex class="float-right">
            <v-sheet class="text-body-2 text--darken-1">
              <BaseDatetimePicker v-model="date" :default-value="30" @change="onDatetimeChange(undefined)" />
            </v-sheet>
          </v-flex>
          <div class="float-right logo kubegems__text"> tke-gpu-manager </div>
          <div class="float-right mr-1">
            <BaseLogo icon-name="tke" :ml="2" :width="20" />
          </div>
          <div class="float-right logo kubegems__text"> Provider By </div>
          <div class="kubegems__clear-float" />
        </v-flex>
      </v-card-title>
      <v-card-text :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`">
        <v-row>
          <v-col cols="6">
            <BaseAreaChart
              label="gpu"
              :metrics="gpu"
              :title="$t('tip.gpu_used_prcent', [$root.$t('resource.gpu')])"
              type="%"
            />
          </v-col>
          <v-col cols="6">
            <BaseAreaChart
              label="gpu_memory"
              :metrics="gpuMemory"
              :title="$t('tip.gpu_used', [$root.$t('resource.video_memory')])"
              unit="Mi"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
  import { getPodList } from '@kubegems/api/direct';
  import { convertResponse2List } from '@kubegems/api/utils';
  import { T_GPU_MEMORY_USAGE_PROMQL, T_GPU_USAGE_PROMQL } from '@kubegems/libs/constants/prometheus';
  import BasePermission from '@kubegems/mixins/permission';
  import BaseResource from '@kubegems/mixins/resource';
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import DashboardCard from './DashboardCard';

  export default {
    name: 'TkeGpuMonitor',
    i18n: {
      messages: messages,
    },
    components: {
      DashboardCard,
    },
    mixins: [BasePermission, BaseResource],
    props: {
      item: {
        type: Object,
        default: () => ({}),
      },
      type: {
        type: String,
        default: () => 'Pod',
      },
    },
    data() {
      return {
        gpu: [],
        gpuMemory: [],
        date: [],
        params: {
          start: '',
          end: '',
          noprocessing: true,
        },
        timeinterval: null,
        pods: [],
      };
    },
    computed: {
      ...mapState(['Scale']),
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    mounted() {
      this.$nextTick(async () => {
        if (this.type === 'Pod') {
          this.pods = [this.item.metadata.name];
        } else {
          await this.podList();
        }
        this.onDatetimeChange();
      });
    },
    methods: {
      async podList() {
        const data = await getPodList(this.ThisCluster, this.$route.query.namespace, {
          topkind: this.type,
          topname: this.item.metadata.name,
          size: 1000,
          noprocessing: true,
        });
        this.pods = convertResponse2List(data).map((d) => {
          return d.metadata.name;
        });
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
        this.gpuUsage();
        this.gpuMemoryUsage();
      },
      async gpuUsage() {
        const query = T_GPU_USAGE_PROMQL.replaceAll('$1', this.pods.join('|')).replaceAll(
          '$2',
          this.$route.query.namespace,
        );
        const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
        if (data) this.gpu = data;
      },
      async gpuMemoryUsage() {
        const query = T_GPU_MEMORY_USAGE_PROMQL.replaceAll('$1', this.pods.join('|')).replaceAll(
          '$2',
          this.$route.query.namespace,
        );
        const data = await this.m_permission_matrix(this.ThisCluster, Object.assign(this.params, { query: query }));
        if (data) this.gpuMemory = data;
      },
      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
        this.loadMetrics();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .logo {
    line-height: 28px;
    font-size: 13px;
  }
</style>
