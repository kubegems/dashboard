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
  <v-container id="log-viewer" fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <BaseDatetimePicker
            ref="dateRangePicker"
            v-model="date"
            :default-value="30"
            default-value-for-query
            query-end-time-key="end"
            query-start-time-key="start"
            @change="onDateChange"
          />
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-card>
      <LogQuery
        ref="logQuery"
        :date-timestamp="dateTimestamp"
        @initLoading="handleInitLoading"
        @receiveMessage="handleReceiveMessage"
        @removeLoading="handleRemoveLoading"
        @saveSnapshot="handleSaveSnapshot"
        @search="handleSearch"
        @setCluster="handleSetCluster"
        @showHistroy="handleShowHistroy"
        @stopLogStream="handleStopLogStream"
      />
    </v-card>

    <v-card class="pa-3 mt-3" flat>
      <div class="log-viewer__toolbar">
        <div v-if="view.resultType === 'streams'">
          <div class="d-inline-block">
            {{ $t('tip.limit') }} :
            <v-text-field
              v-model="params.limit"
              class="d-inline-block"
              dense
              flat
              hide-details
              solo
              :style="{ width: `100px` }"
              type="number"
            />
          </div>
          <div class="d-inline-block ml-3">{{ $t('tip.result') }} : {{ ItemsFilterByLevel.length }}</div>
          <LogLevelSelector v-model="params.levels" class="ml-3" />
          <div class="d-inline-block ml-4">
            {{ $t('tip.time') }}
            <v-switch v-model="view.timestamp" class="log-viewer__toolbar-switch" hide-details />
          </div>
          <div class="d-inline-block ml-3">
            {{ $t('tip.sort') }}
            <v-switch
              v-model="params.direction"
              class="log-viewer__toolbar-switch"
              false-value="forward"
              hide-details
              true-value="backward"
              @change="onLogQuery"
            />
          </div>
          <div class="d-inline-block ml-3">
            {{ $t('tip.chart') }}
            <v-switch v-model="view.chartShow" class="log-viewer__toolbar-switch" hide-details />
          </div>
        </div>

        <div :style="{ marginLeft: `auto` }">
          <v-menu left>
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon color="primary" v-on="on"> mdi-dots-vertical </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2">
                <v-flex>
                  <v-btn
                    color="primary"
                    :disabled="view.resultType !== 'streams'"
                    small
                    text
                    @click="handleDownloadLog"
                  >
                    {{ $t('operate.download_log') }}
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn color="primary" small text @click="handleShowSnapshot">
                    {{ $t('operate.view_snapshot') }}
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </div>
      </div>

      <v-flex>
        <v-expand-transition>
          <v-flex v-show="view.chartShow">
            <v-flex v-if="view.resultType === 'streams'">
              <LogBar :chart="view.chart" class="pb-1" />
            </v-flex>
            <v-flex v-else-if="view.resultType === 'matrix'">
              <LogLine :chart="view.chart" />
            </v-flex>
          </v-flex>
        </v-expand-transition>
      </v-flex>

      <LogTable
        v-if="view.resultType === 'streams'"
        :context="!!(params.regexp || params.levels.length)"
        :items="ItemsFilterByLevel"
        :loading="loading"
        :timestamp="view.timestamp"
        @clickPod="handleAddPod"
        @showContext="handleShowContext"
      />
    </v-card>

    <LogContext ref="logContext" />
    <LogSaveSnapshot ref="logSaveSnapshot" />
    <LogQueryHistory ref="logQueryHistory" @queryHistory="handleQueryHistroy" />
    <LogSnapshot ref="logSnapshot" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import LogBar from './components/LogBar';
  import LogContext from './components/LogContext';
  import LogLevelSelector from './components/LogLevelSelector';
  import LogLine from './components/LogLine';
  import LogQuery from './components/LogQuery';
  import LogQueryHistory from './components/LogQueryHistory';
  import LogSaveSnapshot from './components/LogSaveSnapshot';
  import LogSnapshot from './components/LogSnapshot';
  import LogTable from './components/LogTable';
  import { getLogExport, getLogQueryRange, postAddLogQueryHistory } from '@/api';

  export default {
    name: 'LogViewer',
    i18n: {
      messages: messages,
    },
    components: {
      LogBar,
      LogContext,
      LogLevelSelector,
      LogLine,
      LogQuery,
      LogQueryHistory,
      LogSaveSnapshot,
      LogSnapshot,
      LogTable,
    },
    data() {
      return {
        cluster: {},
        date: [],
        params: {
          limit: 1000,
          direction: 'backward',
          levels: [],
          logQL: '',
          regexp: '',
          pod: '',
        },
        items: [],
        view: {
          timestamp: false,
          chart: null,
          chartShow: false,
          resultType: 'streams',
        },
        loading: false,
      };
    },
    computed: {
      ...mapState(['Progress', 'JWT', 'User', 'AdminViewport']),
      ...mapGetters(['Cluster']),
      dateTimestamp() {
        return this.date.map((d) => `${d}000000`);
      },
      step() {
        const m = (this.date[1] - this.date[0]) / 1000;
        if (m / 60 < 5) {
          return '2s';
        } else if (m / 60 < 10) {
          return '4s';
        } else if (m / 60 < 30) {
          return '10s';
        } else if (m / 60 < 180) {
          return '1m';
        } else if (m / 60 < 360) {
          return '2m';
        } else if (m / 60 < 720) {
          return '5m';
        } else if (m / 60 < 1440) {
          return '10m';
        } else if (m / 60 < 2880) {
          return '20m';
        } else if (m / 60 < 7200) {
          return '30m';
        } else {
          return '1h';
        }
      },
      ItemsFilterByLevel() {
        const { levels } = this.params;
        if (levels.length === 0) {
          return this.items;
        } else {
          return this.items.filter((item) => levels.includes(item.info.level));
        }
      },
    },
    methods: {
      onDateChange() {
        if (this.cluster.value) {
          this.$refs.logQuery.getSeriesList();
          this.$refs.logQuery.search();
        }
      },

      handleSearch({ logQL, regexp, projectName, environmentName }) {
        this.params.logQL = logQL;
        this.params.regexp = regexp;
        this.onLogQuery(projectName, environmentName);
      },

      // 查询
      async onLogQuery(projectName = '', environmentName = '') {
        if (!this.params.logQL || this.params.logQL === '{  }') {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.input_query'),
            color: 'warning',
          });
          return;
        }

        this.$refs.dateRangePicker.refresh(false);
        const params = {
          ClusterID: this.cluster.value,
          ClusterName: this.cluster.text,
          start: this.dateTimestamp[0],
          end: this.dateTimestamp[1],
          limit: this.params.limit,
          direction: this.params.direction,
          filters: this.params.regexp
            ? this.params.regexp
                .split('|~')
                .filter((reg) => {
                  return reg.trim();
                })
                .map((reg) => {
                  return reg.trim().replaceAll('`', '').trim();
                })
            : '',
          query: encodeURIComponent(this.params.logQL),
          step: this.step,
        };
        this.items = [];
        this.params.levels = [];

        const data = await getLogQueryRange(params.ClusterName, params);

        if (data.resultType === '') {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.error_logql'),
            color: 'warning',
          });
          return;
        }

        this.items = (data.query || []).sort((a, b) => {
          if (this.params.direction === 'backward') {
            return b.info.timestamp - a.info.timestamp;
          } else {
            return a.info.timestamp - b.info.timestamp;
          }
        });
        this.view.resultType = data.resultType;
        this.chartData = data.chart;

        // 填充图表数据
        this.view.chart = data.chart;
        if (this.view.resultType === 'matrix') {
          this.view.chartShow = true;
        }

        // 数据过多提示
        if (this.items.length / this.limit > 0.8) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.too_much_result'),
            color: 'warning',
          });
        }
        if (data.chart && data.chart.long) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.limit_50'),
            color: 'warning',
          });
        }

        // 保存值查询历史
        this.saveLogQueryHistory();

        // 填充url
        if (this.view.resultType === 'streams') {
          this.$router.replace({
            name: this.$route.name,
            query: {
              ...this.$route.query,
              project: projectName,
              environment: environmentName,
              cluster: this.cluster.text,
              start: this.dateTimestamp[0]?.substr(0, 13),
              end: this.dateTimestamp[1]?.substr(0, 13),
              query: this.params.logQL,
              filters: params.filters,
            },
          });
        }
      },

      async saveLogQueryHistory() {
        await postAddLogQueryHistory({
          LogQL: this.params.logQL,
          CreateAt: new Date(),
          ClusterName: this.cluster.text,
          CreatorID: this.User.ID,
          ClusterID: this.cluster.value,
        });
      },

      async handleGetLogFilename() {
        if (this.Progress) return;

        const params = {
          ClusterID: this.cluster.value,
          ClusterName: this.cluster.text,
          start: this.dateTimestamp[0],
          end: this.dateTimestamp[1],
          level: this.params.levels.join(','),
          pod: this.params.pod,
          direction: this.params.direction,
          query: encodeURIComponent(this.params.logQL),
        };

        const data = await getLogExport(params.ClusterName, params);
        if (!data) return null;

        if (data.exist) {
          return data.filename;
        } else {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.no_data_period'),
            color: 'warning',
          });
          return null;
        }
      },

      // 保存日志快照
      async handleSaveSnapshot() {
        if (this.Progress) return;
        if (this.items.length === 0) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.no_data'),
            color: 'warning',
          });
          return;
        }

        this.$store.commit('SET_SNACKBAR', {
          text: this.$t('tip.generating_tmp_file'),
          color: 'success',
        });
        const filename = await this.handleGetLogFilename();
        if (filename) {
          this.$refs.logSaveSnapshot.show({
            StartTime: new Date(parseInt(this.dateTimestamp[0].slice(0, 13))),
            EndTime: new Date(parseInt(this.dateTimestamp[1].slice(0, 13))),
            SourceFile: filename,
            SnapshotName: '',
            ClusterName: this.cluster.text,
            ClusterID: this.cluster.value,
          });
        }
      },
      async handleDownloadLog() {
        if (!this.params.logQL) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.input_query'),
            color: 'warning',
          });
          return;
        }
        if (this.Progress) {
          return;
        }

        const getdata = {
          ClusterID: this.cluster.value,
          ClusterName: this.cluster.text,
          start: this.dateTimestamp[0],
          end: this.dateTimestamp[1],
          level: this.params.levels.join(','),
          pod: this.params.pod,
          direction: this.params.direction,
          query: encodeURIComponent(this.params.logQL),
        };
        const data = await getLogExport(getdata.ClusterName, getdata);
        if (data === null) {
          return null;
        }
        if (data.exist) {
          const filename = data.filename;
          const link = document.createElement('a');
          link.addEventListener('click', function () {
            link.download = filename;
            link.href = '/api/lokiExport/' + filename;
          });
          const e = document.createEvent('MouseEvents');
          e.initEvent('click', false, false);
          link.dispatchEvent(e);
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.export_success'),
            color: 'success',
          });
        } else {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.no_data_period'),
            color: 'warning',
          });
          return null;
        }
      },

      handleAddPod(pod) {
        this.$refs.logQuery.setSelectedValue('pod', pod);
      },

      handleShowHistroy() {
        this.$refs.logQueryHistory.show();
      },

      handleShowSnapshot() {
        this.$refs.logSnapshot.show();
      },

      handleQueryHistroy() {
        this.$refs.logQuery.getValuesByPathQuery();
      },

      handleShowContext(item) {
        const query =
          Object.keys(item.stream)
            .filter((l) => {
              return ['container', 'image', 'pod', 'namespace'].includes(l);
            })
            .reduce((pre, current) => `${pre}${current}="${item.stream[current]}",`, '{')
            .slice(0, -1) + '}';
        this.$refs.logContext.showContext(item, {
          ClusterID: this.cluster.value,
          ClusterName: this.cluster.text,
          query: encodeURIComponent(query),
          timestamp: item.info.timestamp,
        });
      },

      handleInitLoading() {
        this.loading = true;
      },

      handleRemoveLoading() {
        this.loading = false;
      },

      handleStopLogStream() {
        this.items.forEach((item) => {
          if (item.info !== undefined) item.info.animation = '';
        });
        this.loading = false;
      },

      handleReceiveMessage(data) {
        data.sort((a, b) => {
          return a.info.timestamp - b.info.timestamp;
        });
        const instance = this;
        data.forEach((item) => {
          this.items.unshift(item);
          if (this.items.length > this.limit) {
            this.items.pop();
          }
        });
        this.timeoutTimer = setTimeout(() => {
          for (var index = 0; index < data.length; index++) {
            instance.items[index].info.animation = 'transition: background-color 2s;';
          }
          clearTimeout(this.timeoutTimer);
        }, 5);
      },

      // handleScrollTo() {
      //   const container = document.getElementById('log-viewer')
      //   container.scrollTo({
      //     top: 0,
      //     behavior: 'smooth',
      //   })
      // },

      handleSetCluster(cluster) {
        this.cluster = cluster;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .log-viewer {
    &__toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      margin-bottom: 12px;

      &-switch {
        display: inline-block;
        position: relative;
        top: 3px;
      }
    }
  }
</style>
