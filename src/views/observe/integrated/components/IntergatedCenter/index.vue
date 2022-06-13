<template>
  <BasePanel v-model="panel" icon="fas fa-link" :title="`接入配置`" :width="`50%`" @dispose="dispose">
    <template #action>
      <v-btn class="mt-n1 ml-2" color="white" :loading="Circular" text @click="addData"> 保存 </v-btn>
    </template>
    <template #content>
      <v-card-text class="ma-0 pa-0">
        <v-list-item>
          <v-list-item-avatar class="mb-0" size="80" tile>
            <BaseLogo :icon-name="item.name" :width="72" />
          </v-list-item-avatar>
          <span class="text-subtitle-1 kubegems__text">
            {{ getTitle(item) }}
          </span>
        </v-list-item>
        <v-divider />
        <template v-if="type === 'app'">
          <v-tabs v-model="tab" class="rounded-t pa-0 v-tabs--default" fixed-tabs height="45">
            <v-tab v-for="t in tabItems" :key="t.value">
              {{ t.text }}
            </v-tab>
          </v-tabs>

          <component :is="tabItems[tab].value" :ref="tabItems[tab].value" :v="item.value || item.name" @close="close" />
        </template>
        <template v-else-if="type === 'middleware'">
          <MiddlewareMetrics ref="middlewareMetrics" :chart-name="item.chart" @close="close" />
        </template>
        <template v-else-if="type === 'logging'">
          <Logging ref="logging" @close="close" />
        </template>
      </v-card-text>
    </template>
  </BasePanel>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import Logging from './Logging';
  import Metrics from './Metrics';
  import MiddlewareMetrics from './MiddlewareMetrics';
  import Trace from './Trace';

  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'DeployLive',
    components: {
      Logging,
      Metrics,
      MiddlewareMetrics,
      Trace,
    },
    data: () => ({
      panel: false,
      tab: 0,
      item: {},
      tabItems: [
        { text: 'Trace', value: 'Trace' },
        { text: 'Metrics', value: 'Metrics' },
      ],
      type: undefined,
    }),
    computed: {
      ...mapState(['Scale', 'Circular']),
      ...mapGetters(['Tenant']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.panel = true;
      },
      // eslint-disable-next-line vue/no-unused-properties
      init(item, type) {
        this.item = deepCopy(item);
        this.type = type;
      },
      dispose() {
        this.tab = 0;
        this.type = undefined;
      },
      async addData() {
        if (this.type === 'app') {
          await this.$refs[this.tabItems[this.tab].value].addData();
        } else if (this.type === 'middleware') {
          await this.$refs.middlewareMetrics.addData();
        } else if (this.type === 'logging') {
          await this.$refs.logging.addData();
        }
      },
      close() {
        this.panel = false;
        this.type = undefined;
      },
      getTitle(item) {
        if (this.type === 'app') {
          return `配置 ${item.name} 应用的Trace, Metrics`;
        } else if (this.type === 'middleware') {
          return `配置 ${item.name} 中间件的Exporter`;
        } else if (this.type === 'logging') {
          return `配置 ${item.name} 中间件的Logging`;
        }
      },
    },
  };
</script>
