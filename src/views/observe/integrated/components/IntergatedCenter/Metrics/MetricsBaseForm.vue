<template>
  <div class="pa-3 pt-0">
    <BaseSubTitle class="my-0" color="grey lighten-3" :divider="false" title="监控采集配置" />

    <v-form ref="form" v-model="valid" class="px-2" lazy-validation @submit.prevent>
      <ProjectEnvSelect v-model="env" class="mt-0" t="metrics" />

      <v-row>
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.service"
            class="my-0"
            color="primary"
            hide-selected
            :items="serviceItems"
            label="关联服务"
            no-data-text="暂无可选数据"
            :rules="objRules.serviceRules"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="6">
          <div :style="{ lineHeight: '66px' }">
            <v-icon small> mdi-help-circle </v-icon>
            没有服务？从 <a @click="toAppstore">应用商店</a> 创建exporter
          </div>
        </v-col>

        <v-col cols="6">
          <v-autocomplete
            v-model="obj.port"
            class="my-0"
            color="primary"
            hide-selected
            :items="portItems"
            label="采集器端口"
            no-data-text="暂无可选数据"
            :rules="objRules.portRules"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="6">
          <v-text-field v-model="obj.path" class="my-0" label="请求路径" required :rules="objRules.pathRules" />
        </v-col>
      </v-row>
    </v-form>

    <BaseSubTitle class="my-0 mt-3" color="grey lighten-3" :divider="false" title="指标" />
    <MetricsList />
  </div>
</template>

<script>
  import ProjectEnvSelect from '../ProjectEnvSelect';
  import MetricsList from './MetricsList';

  import { getServiceList, postServiceMonitor } from '@/api';
  import { required } from '@/utils/rules';

  export default {
    name: 'MetricsBaseForm',
    components: {
      MetricsList,
      ProjectEnvSelect,
    },
    data() {
      return {
        valid: false,
        env: undefined,
        serviceItems: [],
        obj: {
          path: undefined,
          port: undefined,
          service: undefined,
        },
        objRules: {
          pathRules: [required],
          portRules: [required],
          serviceRules: [required],
        },
      };
    },
    computed: {
      portItems() {
        const service = this.serviceItems.find((s) => {
          return s.value === this.obj.service;
        });
        if (service) {
          const ports = service.model.spec?.ports;
          if (ports) {
            return ports.map((p) => {
              return {
                text: `${p.name} (${p.port})`,
                value: p.name,
              };
            });
          }
          return [];
        }
        return [];
      },
    },
    watch: {
      env: {
        handler(newValue) {
          if (newValue) {
            this.serviceList();
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
      toAppstore() {
        this.$router.push({ name: 'appstore-center' });
      },
      async serviceList() {
        const data = await getServiceList(this.env.clusterName, this.env.namespace, { size: 1000 });
        this.serviceItems = data.List.map((s) => {
          return {
            text: s.metadata.name,
            value: s.metadata.name,
            model: s,
          };
        });
      },
      async addMetrics() {
        if (this.$refs.form.validate(true)) {
          if (this.env?.projectid && this.env?.value) {
            await postServiceMonitor(this.env.clusterName, this.env.namespace, this.obj);
            this.$emit('close');
          } else {
            this.$store.commit('SET_SNACKBAR', {
              text: '请先选择项目环境',
              color: 'warning',
            });
          }
        }
      },
      async addData() {
        await this.addMetrics();
      },
    },
  };
</script>
