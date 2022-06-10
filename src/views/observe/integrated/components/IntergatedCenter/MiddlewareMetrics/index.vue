<template>
  <div class="pa-2">
    <BaseSubTitle title="监控采集配置" color="grey lighten-3" class="my-0 mt-1" :divider="false" />

    <v-form v-model="valid" lazy-validation @submit.prevent>
      <ProjectEnvSelect v-model="env" class="px-2 mt-0" />
      <JsonSchema
        ref="jsonSchema"
        :app-values="appValues"
        :params="params"
        :cluster-name="env ? env.clusterName : ''"
      />
    </v-form>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import { postDeployAppStore } from '@/api';
  import ProjectEnvSelect from '../ProjectEnvSelect';
  import JsonSchema from '@/views/appstore/components/DeployWizard/JsonSchema';

  export default {
    name: 'MiddlewareMetrics',
    components: {
      ProjectEnvSelect,
      JsonSchema,
    },
    props: {
      chart: {
        type: String,
        default: () => '',
      },
    },
    data() {
      return {
        valid: false,
        env: undefined,
        appValues: {},
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
    },
    methods: {
      // async middlewareChartInfo() {},
      async deployMiddlewareMetricsServiceMonitor() {
        if (this.$refs.jsonSchema.validate()) {
          const data = {
            name: '',
            project_id: this.env?.projectid,
            environment_id: this.env?.value,
            repoURL: '',
            chart: this.chart,
            chartVersion: '',
            tenant_id: this.Tenant().ID,
            values: this.appValues,
          };
          await postDeployAppStore(this.Tenant().ID, this.env?.projectid, this.env?.value, data);
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      async addData() {
        await this.deployMiddlewareMetricsServiceMonitor();
      },
    },
  };
</script>
