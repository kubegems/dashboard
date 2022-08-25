<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <BasePanel
    v-model="panel"
    icon="mdi-link-variant"
    :title="$t('tip.integrated_config')"
    :width="`50%`"
    @dispose="dispose"
  >
    <template #action>
      <v-btn
        v-if="type !== 'app' && !inDeploy"
        class="mt-n1 ml-2"
        color="white"
        :loading="Circular"
        text
        @click="addData"
      >
        {{ type === 'middleware' ? $root.$t('operate.next') : $root.$t('operate.save') }}
      </v-btn>
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
          <MiddlewareMetrics ref="middlewareMetrics" :chart-name="item.chart" @close="close" @deploying="deploying" />
        </template>
        <template v-else-if="type === 'monitor'">
          <Metrics
            v-if="item.name === 'Prometheus Exporter'"
            ref="metrics"
            component="MetricsBaseForm"
            @close="close"
          />
          <Logging v-else ref="logging" @close="close" />
        </template>
      </v-card-text>
    </template>
  </BasePanel>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import Logging from './Logging';
  import Metrics from './Metrics';
  import MiddlewareMetrics from './MiddlewareMetrics';
  import Trace from './Trace';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'DeployLive',
    i18n: {
      messages: messages,
    },
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
      inDeploy: false,
    }),
    computed: {
      ...mapState(['Scale', 'Circular']),
      ...mapGetters(['Tenant']),
    },
    methods: {
      open() {
        this.panel = true;
      },
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
        } else if (this.type === 'monitor') {
          if (this.$refs.logging) {
            await this.$refs.logging.addData();
          } else if (this.$refs.metrics) {
            await this.$refs.metrics.addData();
          }
        }
      },
      close() {
        this.panel = false;
        this.type = undefined;
      },
      getTitle(item) {
        if (this.type === 'app') {
          return this.$t('tip.config_metrics_and_trace', [item.name]);
        } else if (this.type === 'middleware') {
          return this.$t('tip.config_exporter', [item.name]);
        } else if (this.type === 'monitor') {
          return this.$t('tip.config_c', [item.name]);
        }
      },
      deploying() {
        this.inDeploy = true;
      },
    },
  };
</script>
