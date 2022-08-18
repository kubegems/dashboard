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
  <v-card class="pa-3" :elevation="expand ? 3 : 0" flat>
    <div class="d-flex">
      <v-btn color="primary" text @click="handleExpand">
        {{ $root.$t('query') }}
        <v-icon>mdi-chevron-{{ expand ? 'up' : 'down' }}</v-icon>
      </v-btn>

      <!-- 标签查询 -->
      <v-combobox v-if="queryType === 'tag'" v-model="filter" dense flat full-width hide-details multiple solo>
        <template #prepend-inner>
          <v-chip
            v-for="tag in comboboxTags"
            :key="tag.text + tag.value"
            close
            close-icon="mdi-close-circle"
            color="primary"
            label
            small
            @click:close="handleRemoveTag(tag.text, tag.value)"
          >
            <span>{{ tag.text }}:{{ tag.value }}</span>
          </v-chip>
        </template>
        <template #selection="{ item }">
          <v-chip
            class="my-1"
            close
            close-icon="mdi-close-circle"
            color="primary"
            label
            small
            @click:close="handleRemoveRegexp(item)"
          >
            <span>{{ $t('tip.regex') }} : {{ item }}</span>
          </v-chip>
        </template>
      </v-combobox>
      <!-- 标签查询 -->

      <div :style="{ marginLeft: `auto` }">
        <v-btn color="primary" :disabled="disabled" text @click="search">
          <v-icon left>mdi-magnify</v-icon>
          {{ $t('operate.go') }}
        </v-btn>
        <v-btn v-if="queryType === 'tag'" color="primary" :disabled="disabled" text @click="handleSaveSnapshot">
          <v-icon left>mdi-content-save</v-icon>
          {{ $root.$t('operate.save') }}
        </v-btn>
        <v-btn v-if="queryType === 'tag'" color="primary" :disabled="disabled" text @click="handleHistory">
          <v-icon left>mdi-history</v-icon>
          {{ $t('operate.history') }}
        </v-btn>
        <v-btn v-if="queryType === 'tag'" color="primary" text @click="handleLiveQuerying">
          <v-icon left>{{ disabled ? 'mdi-stop-circle-outline' : 'mdi-play-circle-outline' }}</v-icon>
          {{ $t('operate.streaming') }}
        </v-btn>
        <v-btn color="primary" :disabled="disabled" text @click="handleChangeQueryType">
          <v-icon left>mdi-sync</v-icon>
          {{ queryType === 'tag' ? $t('operate.advanced_query') : $t('operate.label_query') }}
        </v-btn>
      </div>
    </div>

    <div v-show="expand" class="mt-3">
      <div class="my-2 kubegems__text text-body-2">{{ $root.$t('resource.environment') }}</div>
      <ProjectEnvSelect
        :loading="loading"
        :series="series"
        @clear="handlerClear"
        @clearProject="handleClearProject"
        @refresh="handlerRefresh"
        @setEnvironment="handleSetEnvironment"
      />
      <div class="my-2 kubegems__text text-body-2">
        {{ queryType === 'tag' ? $t('tip.selcet_label') : $t('tip.logql') }}
      </div>
      <LabelSelector v-if="queryType === 'tag'" v-model="selected" :cluster="cluster" :series="series" />
      <AdvancedTextare
        v-else-if="queryType === 'ql'"
        :cluster="cluster"
        :log-q-l="logQL"
        @replaceUrl="replaceUrl"
        @setQl="setQl"
      />
    </div>

    <p class="mt-2 text-body-2">logql : {{ advancedQl || logQL }}</p>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../i18n';
  import AdvancedTextare from './AdvancedTextare';
  import LabelSelector from './LabelSelector';
  import ProjectEnvSelect from './ProjectEnvSelect';
  import { getLogSeries } from '@/api';
  import BasePermission from '@/mixins/permission';

  export default {
    name: 'LogQuery',
    i18n: {
      messages: messages,
    },
    components: {
      AdvancedTextare,
      LabelSelector,
      ProjectEnvSelect,
    },
    mixins: [BasePermission],
    props: {
      dateTimestamp: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        expand: false,
        queryType: 'tag',
        selected: {},
        disabled: false,
        regexp: undefined,
        filter: null,

        websocket: null,
        advancedQl: '',
        series: [],
        cluster: {},

        projectName: '',
        environmentName: '',
        namespace: '',
        loading: false,
        missingPlugins: [],
      };
    },
    computed: {
      ...mapState(['AdminViewport', 'JWT']),
      comboboxTags() {
        const tags = [];
        Object.keys(this.selected).forEach((k) => {
          this.selected[k].forEach((v) => {
            tags.push({ text: k, value: v });
          });
        });
        return tags;
      },
      regexQL() {
        let filterQl = '';
        if (this.filter) {
          filterQl = this.filter
            .map((reg) => {
              return ` |~ \`${reg}\``;
            })
            .join('');
        }
        if (this.advancedQl) {
          filterQl = this.advancedQl
            .split('|~')
            .filter((reg, index) => {
              return index > 0;
            })
            .map((reg) => {
              return ` |~ \`${reg.replaceAll('`', '').trim()}\``;
            })
            .join('');
        }
        return filterQl;
      },
      logQL() {
        const pe = this.namespace ? `namespace="${this.namespace}"` : '';
        const obj = this.selected || {};
        const keys = Object.keys(obj).filter((k) => obj[k] && obj[k].length);
        const match = keys.reduce((pre, key) => pre + `,${key}=~"${obj[key].join('|')}"`, '');
        return `{ ${pe}${match} }${this.regexQL}`;
      },
    },
    destroyed() {
      if (this.websocket) {
        this.websocket.close();
        this.websocket = null;
        this.$emit('removeLoading');
      }
    },
    mounted() {
      this.$nextTick(() => {
        if (this.$route.query.query) {
          const keyArr = ['app', 'pod', 'container', 'stream', 'node', 'image'];
          const reg = new RegExp(
            '([\\u4e00-\\u9fa5\\w]+)=~?"([\\u4e00-\\u9fa5\\w-#\\(\\)\\*\\.@\\?&^$!%<>\\/\|]+)"',
            'g',
          );
          const selected = {};
          this.$route.query.query.match(reg).map((s) => {
            const l = s.split('=');
            if (l.length === 2) {
              if (keyArr.includes(l[0])) {
                this.$set(selected, l[0], l[1].replaceAll('"', '').replaceAll('~', '').split('|'));
              }
            }
          });
          this.selected = selected;
        } else {
          this.$router.replace({
            name: this.$route.name,
          });
          return;
        }
        if (this.$route.query.filters) {
          this.filter =
            typeof this.$route.query.filters === 'string' ? [this.$route.query.filters] : this.$route.query.filters;
        }
      });
    },
    methods: {
      // 获取Series并设置集群按钮徽标值
      async getSeriesList() {
        this.loading = true;
        const data = await getLogSeries(this.cluster.text, {
          match: `{ namespace="${this.namespace}" }`,
          start: this.dateTimestamp[0],
          end: this.dateTimestamp[1],
          noprocessing: true,
        });
        this.loading = false;
        this.series = data;
      },

      handleClearProject() {
        this.cluster = {};
        this.projectName = '';
        this.environmentName = '';
        this.namespace = '';
        this.selected = {};
        this.$emit('setCluster', this.cluster);
      },
      async handleSetEnvironment(env, projectName, triggerQuery = false) {
        if (env) {
          this.cluster = {
            text: env.clusterName,
            value: env.clusterid,
          };
          this.projectName = projectName;
          this.environmentName = env.environmentName;
          this.namespace = env.namespace;
          this.$emit('setCluster', this.cluster);

          this.missingPlugins = await this.m_permission_plugin_pass(
            env.clusterName,
            this.$route.meta?.dependencies || [],
          );
          if (this.missingPlugins?.length === 0) {
            await this.getSeriesList();
            if (triggerQuery) {
              this.search();
            } else {
              this.selected = {};
            }
          } else {
            this.$store.commit('SET_SNACKBAR', {
              text: this.$root.$t('plugin.environment_missing', [this.missingPlugins.join(', ')]),
              color: 'warning',
            });
            return;
          }
        }
      },

      handleExpand() {
        this.expand = !this.expand;
      },

      handleRemoveRegexp(item) {
        const index = this.filter.indexOf(item);
        this.filter.splice(index, 1);
        // this.search()
      },

      handleRemoveTag(key, value) {
        this.$set(
          this.selected,
          key,
          this.selected[key].filter((v) => v !== value),
        );
      },

      handleSaveSnapshot() {
        this.$emit('saveSnapshot');
      },

      handleHistory() {
        this.$emit('showHistroy');
      },
      handleParseLabel(input) {
        const labelMatchArr = input.match(new RegExp('{(.*)}'));
        if (labelMatchArr && labelMatchArr.length > 1) {
          const labelArr = labelMatchArr[1].split(',');
          const labelValueObj = {};
          labelArr.forEach((item) => {
            if (item.indexOf('=~') !== -1) {
              const label = item.split('=~')[0];
              labelValueObj[label] = item.split('=~')[1].match(new RegExp('"(.*)"'))[1].split('|');
            } else {
              const label = item.split('=')[0];
              labelValueObj[label] = [item.split('=')[1].match(new RegExp('"(.*)"'))[1]];
            }
          });
          return labelValueObj;
        } else {
          return {};
        }
      },
      handleParseFilter(input) {
        const filterList = [];
        const matchedArr = input.match(new RegExp('{.*}(.*)'));
        if (matchedArr && matchedArr.length > 1) {
          const filterArr = matchedArr[1].trim().split('|~');
          filterArr.forEach((item) => {
            if (item !== '') {
              const match = item.match(new RegExp('`(.*)`'));
              if (match && match.length > 0) {
                filterList.push(match[1]);
              }
            }
          });
        }
        return filterList;
      },

      // 生成日志告警
      replaceUrl() {
        this.$router.replace({
          name: this.$route.name,
          query: {
            ...this.$route.query,
            cluster: this.cluster.text,
            namespace: this.namespace,
          },
        });
      },

      search() {
        // 保证logQL和regexp 获取到最新值
        this.$nextTick(() => {
          this.expand = false;
          const _vue = this;
          setTimeout(() => {
            _vue.$emit('search', {
              logQL: this.advancedQl || this.logQL,
              regexp: this.regexQL,
              projectName: this.projectName,
              environmentName: this.environmentName,
            });
          }, 100);
        });
      },
      clear() {
        this.selected = {};
        this.regexp = undefined;
      },
      setSelectedValue(key, value, switchValue = false) {
        if (this.selected[key]) {
          if (this.selected[key].includes(value)) {
            switchValue && this.handleRemoveTag(key, value);
          } else {
            this.$set(this.selected, key, [...this.selected[key], value]);
          }
        } else {
          this.$set(this.selected, key, [value]);
        }
      },
      setRegexp(value) {
        this.regexp = value;
      },

      setQl(value) {
        this.advancedQl = value;
      },

      // 流式传输
      handleLiveQuerying() {
        if (!this.cluster.value) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.select_project_environment'),
            color: 'warning',
          });
          return;
        }

        if (!this.logQL && !this.advancedQl) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.input_query'),
            color: 'warning',
          });
          return;
        }
        if (!this.websocket) {
          this.initWebSocket();
        } else {
          this.websocket.close();
          this.websocket = null;
          this.disabled = false;
          this.$emit('removeLoading');
        }
      },
      constructParams() {
        const ql = this.advancedQl || this.logQL;

        const data = {
          start: Date.parse(new Date()).toString() + '000000',
          filter: this.filter ? this.filter.join(',') : [],
          query: encodeURIComponent(ql),
          stream: true,
        };
        const paramArray = [];
        for (var item in data) {
          paramArray.push(item + '=' + data[item]);
        }
        return paramArray.join('&');
      },
      initWebSocket() {
        const params = this.constructParams();
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.host;
        const wsuri = `${protocol}://${host}/api/v1/proxy/cluster/${this.cluster.text}/custom/loki/v1/tail?${params}&token=${this.JWT}`;
        this.websocket = new WebSocket(wsuri);
        this.websocket.binaryType = 'arraybuffer';
        this.websocket.onmessage = this.onWebsocketMessage;
        this.websocket.onopen = this.onWebsocketOpen;
        this.websocket.onerror = this.onWebsocketError;
        this.websocket.onclose = this.onWebsocketClose;
      },
      onWebsocketOpen() {
        this.disabled = true;
        this.$emit('initLoading');
      },
      onWebsocketError() {
        this.disabled = false;
        this.$store.commit('SET_SNACKBAR', {
          text: this.$t('tip.ws_connect_error'),
          color: 'warning',
        });
        this.websocket = null;
        this.$emit('removeLoading');
      },
      onWebsocketMessage(e) {
        this.$emit('receiveMessage', JSON.parse(e.data));
      },
      onWebsocketClose() {
        this.disabled = false;
        this.$emit('stopLogStream');
      },

      // 高级查询切换
      handleChangeQueryType() {
        if (this.queryType === 'tag') {
          this.queryType = 'ql';
          this.expand = true;
        } else {
          this.queryType = 'tag';
          this.selected = {};
          this.advancedQl = '';
          this.expand = false;
        }
      },

      handlerClear() {
        this.selected = {};
      },

      handlerRefresh() {
        this.selected = {};
        this.getSeriesList();
      },
    },
  };
</script>
