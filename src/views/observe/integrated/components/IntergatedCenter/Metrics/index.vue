<template>
  <div class="pa-3">
    <BaseSubTitle title="监控采集配置" color="grey lighten-3" class="my-0" :divider="false" />

    <v-form ref="form" v-model="valid" class="px-2" lazy-validation @submit.prevent>
      <ProjectEnvSelect v-model="env" class="mt-0" />

      <v-row>
        <v-col cols="6">
          <v-autocomplete
            v-model="obj.service"
            :items="serviceItems"
            :rules="objRules.serviceRules"
            color="primary"
            label="关联服务"
            hide-selected
            class="my-0"
            no-data-text="暂无可选数据"
          >
            <template #selection="{ item }">
              <v-chip color="primary" small class="mx-1">
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
            :items="portItems"
            :rules="objRules.portRules"
            color="primary"
            label="采集器端口"
            hide-selected
            class="my-0"
            no-data-text="暂无可选数据"
          >
            <template #selection="{ item }">
              <v-chip color="primary" small class="mx-1">
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="6">
          <v-text-field v-model="obj.path" :rules="objRules.pathRules" class="my-0" required label="请求路径" />
        </v-col>
      </v-row>
    </v-form>

    <BaseSubTitle title="指标" color="grey lighten-3" class="my-0 mt-1" :divider="false" />
    <MetricsList />
  </div>
</template>

<script>
  import MetricsList from './MetricsList';
  import ProjectEnvSelect from '../ProjectEnvSelect';
  import { getServiceList, postServiceMonitor } from '@/api';
  import { required } from '@/utils/rules';

  export default {
    name: 'Metrics',
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
          await postServiceMonitor(this.env.clusterName, this.env.namespace, this.obj);
          this.$emit('close');
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      async addData() {
        await this.addMetrics();
      },
    },
  };
</script>
