<template>
  <div class="pa-3">
    <BaseSubTitle class="my-0" color="grey lighten-3" :divider="false" title="日志采集配置" />

    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <ProjectEnvSelect v-model="env" class="px-2 mt-0" t="logging" />

      <v-row class="px-2">
        <v-col cols="12">
          <v-switch
            v-model="sampleMode"
            class="mt-5"
            hide-details
            label="一键开启（精简模式）"
            @change="onSampleModeChange"
          />
        </v-col>
      </v-row>

      <v-row class="px-2">
        <v-col cols="12">
          <v-switch v-model="customConfig" class="mt-5" hide-details label="自定义配置" />
        </v-col>
      </v-row>

      <template v-if="customConfig">
        <BaseSubTitle class="mt-6" title="自定义配置" />

        <v-row class="mt-0 px-2">
          <v-col cols="6">
            <v-autocomplete
              v-model="application"
              class="my-0"
              color="primary"
              hide-selected
              :items="applicationItems"
              label="关联应用"
              no-data-text="暂无可选数据"
              :rules="objRules.appRules"
              @change="onApplicationChange"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>

          <v-col cols="6">
            <v-autocomplete
              v-model="outputName"
              class="my-0"
              color="primary"
              hide-selected
              :items="outputItems"
              label="关联日志路由"
              :menu-props="{
                bottom: true,
                left: true,
                origin: `top center`,
              }"
              multiple
              no-data-text="暂无可选数据"
              :rules="objRules.outputRules"
              @change="onOutputChange"
            >
              <template #selection="{ item }">
                <v-chip class="mx-1" color="primary" :disabled="item.disabled" small>
                  {{ item['text'] }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>

          <v-col cols="12">
            <v-switch v-model="throttle" class="mt-5" hide-details label="启用限速" />
          </v-col>

          <v-col v-if="throttle" cols="6">
            <v-text-field
              v-model.number="obj.throttle"
              class="my-0"
              label="限速"
              required
              :rules="objRules.throttleRules"
              type="number"
            />
          </v-col>

          <v-col cols="12">
            <v-switch v-model="obj.enableMetrics" class="mt-5" hide-details label="启用日志状态监控" />
          </v-col>
        </v-row>
      </template>
    </v-form>
  </div>
</template>

<script>
  import { mapState, mapGetters } from 'vuex';

  import ProjectEnvSelect from './ProjectEnvSelect';

  import {
    getClusterOutputsData,
    getOutputsData,
    getOutputsDataByTenant,
    getLoggingAppList,
    postLoggingFlow,
    putLoggingNsFlow,
  } from '@/api';
  import { required, integer } from '@/utils/rules';

  export default {
    name: 'Logging',
    components: {
      ProjectEnvSelect,
    },
    data() {
      return {
        valid: false,
        env: undefined,
        throttle: false,
        sampleMode: false,
        customConfig: false,
        outputItems: [],
        outputName: undefined,
        applicationItems: [],
        application: undefined,
        applicationStatus: {},
        obj: {
          apps: {},
          clusterOutputs: [],
          enableMetrics: false,
          outputs: [],
          geoIPLookupKeys: [],
          throttle: 0,
        },
        objRules: {
          appRules: [required],
          outputRules: [required],
          throttleRules: [integer],
        },
      };
    },
    computed: {
      ...mapState(['AdminViewport']),
      ...mapGetters(['Tenant']),
      output() {
        return this.outputItems.find((o) => {
          return o.value === this.outputName;
        });
      },
    },
    watch: {
      env: {
        handler(newValue) {
          if (newValue) {
            this.loggingAppList();
            this.logOutputList();
          }
        },
        deep: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.obj = this.$options.data().obj;
        this.$refs.form?.resetValidation();
      });
    },
    methods: {
      async loggingAppList() {
        const data = await getLoggingAppList(this.env.clusterName, this.env.namespace);
        this.applicationItems = Object.keys(data).map((d) => {
          return {
            text: `${d}${data[d].collectedBy ? '(已添加采集)' : ''}`,
            value: d,
            disabled: data[d].collectedBy,
          };
        });
        this.applicationStatus = data;
      },
      async logOutputList() {
        let list = [];
        let res = [];
        const params = [this.env.clusterName, '_all', { page: 1, size: 1000 }];
        const outputFunc = this.AdminViewport ? getOutputsData : getOutputsDataByTenant;
        const funcParams = this.AdminViewport ? params : [this.env.clusterName, this.Tenant().TenantName];
        res = await Promise.all([outputFunc(...funcParams), getClusterOutputsData(...params)]);
        list = res.reduce((pre, current) => pre.concat(current.List || current), []);

        this.outputItems = list.map((op) => {
          return {
            text: `${op.metadata.name} (${this.getOutputKind(op.spec)})`,
            value: op.metadata.name,
            kind: op.kind,
          };
        });
      },
      getOutputKind(spec) {
        if (spec.loki) {
          return 'Loki';
        }
        if (spec.elasticsearch) {
          return 'Elasticsearch';
        }
        if (spec.kafka) {
          return 'Kafka';
        }
      },
      onApplicationChange() {
        this.obj.apps[this.application] = this.applicationStatus[this.application]?.appLabel;
      },
      onOutputChange() {
        if (this.output?.kind === 'Output') {
          this.obj.outputs = [this.outputName];
        } else if (this.output?.kind === 'ClusterOutput') {
          this.obj.clusterOutputs = [this.outputName];
        }
      },
      async addLoggingFlow() {
        if (this.$refs.form.validate(true)) {
          await postLoggingFlow(this.env.clusterName, this.env.namespace, this.obj);
          this.$emit('close');
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      async addData() {
        await this.addLoggingFlow();
      },
      onSampleModeChange() {
        if (!this.env) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请先选择项目环境',
            color: 'warning',
          });
          const vue = this;
          const timeout = setTimeout(() => {
            vue.sampleMode = !vue.sampleMode;
            clearTimeout(timeout);
          }, 200);
          return;
        }
        this.$store.commit('SET_CONFIRM', {
          title: '精简模式',
          content: {
            text: `${this.sampleMode ? '开启' : '关闭'} 精简模式`,
            type: 'confirm',
          },
          param: {},
          doFunc: async () => {
            this.toggleLoggingNsFlow();
          },
          doClose: () => {
            this.sampleMode = !this.sampleMode;
          },
        });
      },
      async toggleLoggingNsFlow() {
        await putLoggingNsFlow(this.env.clusterName, this.env.namespace, {
          enable: this.sampleMode,
        });
      },
    },
  };
</script>
