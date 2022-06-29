<template>
  <v-card class="pa-4">
    <div class="d-flex justify-space-between align-center">
      <ProjectSelect v-model="project" :tenant="tenant" />
      <Duration v-model="params.duration" />
    </div>

    <v-data-table
      class="px-2 mt-4"
      disable-sort
      :headers="headers"
      hide-default-footer
      item-key="value"
      :items="items"
      :items-per-page="params.size"
      no-data-text="暂无数据"
      no-results-text="暂无匹配租户"
      :page.sync="params.page"
    >
      <template #[`item.labels`]="{ item, index }">
        <BaseCollapseChips :id="`o_label_${index}`" :chips="item.labels || {}" icon="mdi-label" single-line />
      </template>
      <template #[`item.alertLiving`]="{ item }">
        {{ (item.errorAlertCount || 0) + (item.criticalAlertCount || 0) }}
        <BaseTipChips
          v-if="item.criticalAlertCount || item.errorAlertCount"
          :chips="{ error: item.errorAlertCount, critical: item.criticalAlertCount }"
          :color="item.criticalAlertCount > 0 ? 'error' : 'warning'"
          icon="mdi-fire-alert"
          single-line
        />
      </template>
      <template #[`item.alertRuleCount`]="{ item }">
        {{ item.alertRuleCount }}
        <BaseTipChips :chips="item.alertResourceMap || {}" color="primary" icon="mdi-ruler" single-line />
      </template>
      <template #[`item.status`]="{ item }">
        <StatusTag :l="item.logging" :m="item.monitoring" :s="item.serviceMesh" />
      </template>
      <template #[`item.eventCount`]="{ item }">
        {{ item.eventCount }}
        <v-icon color="primary" @click="onShowEvents(item)"> mdi-chart-pie </v-icon>
      </template>
    </v-data-table>

    <BasePagination
      v-if="pageCount >= 1"
      v-model="params.page"
      :front-page="true"
      :page-count="pageCount"
      :size="params.size"
      @changepage="onPageIndexChange"
      @changesize="onPageSizeChange"
    />

    <K8sEvents ref="k8sEvents" :env="env" />
  </v-card>
</template>

<script>
  import Duration from './Duration';
  import K8sEvents from './K8sEvents';
  import ProjectSelect from './ProjectSelect';
  import StatusTag from './StatusTag';
  import { getEnvironmentObservability } from '@/api';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'OverviewList',
    components: {
      Duration,
      K8sEvents,
      ProjectSelect,
      StatusTag,
    },
    mixins: [BaseSelect],
    props: {
      tenant: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      this.headers = [
        { text: '环境', value: 'environmentName', align: 'start' },
        { text: '标签', value: 'labels', align: 'start' },
        { text: '状态', value: 'status', align: 'start', width: 250 },
        { text: '容器重启(次)', value: 'containerRestartTotal', align: 'start' },
        { text: 'CPU', value: 'cpu', align: 'start' },
        { text: 'Mem', value: 'memory', align: 'start' },
        { text: '指标采集器', value: 'monitorCollectorCount', align: 'start' },
        { text: '告警规则', value: 'alertRuleCount', align: 'start', width: 80 },
        { text: '实时告警', value: 'alertLiving', align: 'start' },
        { text: '日志采集器', value: 'loggingCollectorCount', align: 'start' },
        { text: '错误日志', value: 'errorLogCount', align: 'start' },
        { text: '日志速率', value: 'logRate', align: 'start' },
        { text: '事件', value: 'eventCount', align: 'start' },
      ];

      return {
        params: {
          duration: '1h',
          page: 1,
          size: 10,
        },
        project: undefined,
        items: [],
        pageCount: 0,
        env: null,
      };
    },
    watch: {
      project: {
        async handler() {
          if (this.project) {
            this.items = [];
            await this.m_select_projectEnvironmentSelectData(this.project);
            this.m_select_projectEnvironmentItems.forEach((env) => {
              this.items.push({ environmentName: env.environmentName });
              this.environmentObservability(env.value);
            });
          }
        },
        deep: true,
      },
      'params.duration': {
        handler() {
          this.items = [];
          this.m_select_projectEnvironmentItems.forEach((env) => {
            this.items.push({ environmentName: env.environmentName });
            this.environmentObservability(env.value);
          });
        },
      },
    },
    methods: {
      async environmentObservability(envId) {
        const data = await getEnvironmentObservability(envId, { duration: this.params.duration });
        const index = this.items.findIndex((e) => {
          return e.environmentName === data.environmentName;
        });
        if (index > -1) {
          this.$set(this.items, index, data);
        }
        this.pageCount = parseInt(this.items.length / this.params.size + 1);
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
      onShowEvents(item) {
        this.env = item;
        this.$refs.k8sEvents.open();
      },
    },
  };
</script>
