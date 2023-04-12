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
          <BaseAreaChart label="pod" :metrics="cpu" :title="$t('tip.used', [$root.$t('resource.cpu')])" type="cpu" />
        </v-col>
        <v-col cols="6">
          <BaseAreaChart
            label="pod"
            :metrics="memory"
            :title="$t('tip.used', [$root.$t('resource.memory')])"
            type="memory"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
  import { getPodList } from '@kubegems/api/direct';
  import {
    MODEL_WORKLOAD_CPU_USAGE_CORE_PROMQL,
    MODEL_WORKLOAD_MEMORY_USAGE_BYTE_PROMQL,
  } from '@kubegems/libs/constants/prometheus';
  import BasePermission from '@kubegems/mixins/permission';
  import BaseResource from '@kubegems/mixins/resource';
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { convertResponse2List } from '@kubegems/api/utils';

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
    data() {
      return {
        cpu: [],
        memory: [],
        date: [],
        params: {
          start: '',
          end: '',
          noprocessing: true,
        },
        timeinterval: null,
        pods: '',
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
        this.pods = convertResponse2List(data)
          .map((d) => {
            return d.metadata.name;
          })
          .join('|');
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

      onDatetimeChange() {
        this.params.start = this.$moment(this.date[0]).utc().format();
        this.params.end = this.$moment(this.date[1]).utc().format();
        this.loadMetrics();
      },
    },
  };
</script>
