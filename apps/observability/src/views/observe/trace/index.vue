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
  <v-container class="search" fluid>
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <ProjectEnvSelectCascade v-model="env" first :offset-y="6" reverse :tenant="tenant" />
          <div class="text-subtitle-2 float-left font-weight-medium kubegems__text search__label primary--text">
            TraceId
          </div>
          <v-text-field
            v-model="traceid"
            dense
            flat
            full-width
            hide-details
            prepend-inner-icon="mdi-magnify"
            solo
            :style="{ width: `${traceIdSearchWidth}px` }"
            @blur="traceIdSearchWidth = 350"
            @focus="traceIdSearchWidth = 550"
            @keyup="searchByTraceId"
          />
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-card class="search__main" flat :height="height">
      <div class="search__header">
        <v-btn v-if="location === 'trace'" class="float-right" color="primary" small text @click="onBack">
          <v-icon left> mdi-share </v-icon>
          {{ $root.$t('operate.return') }}
        </v-btn>
      </div>

      <iframe
        v-if="cluster"
        v-show="show"
        :key="iframeKey"
        ref="iframe"
        allow
        class="search__iframe"
        :src="src"
        @load="onLoad"
      />
    </v-card>
  </v-container>
</template>

<script>
  import BasePermission from '@kubegems/mixins/permission';
  import { mapGetters, mapState } from 'vuex';

  import ProjectEnvSelectCascade from '../components/ProjectEnvSelectCascade';

  export default {
    name: 'TraceSearch',
    components: {
      ProjectEnvSelectCascade,
    },
    mixins: [BasePermission],
    data() {
      return {
        cluster: undefined,
        location: 'search',
        iframeKey: Date.now(),
        show: false,

        isTraceId: false,
        traceid: '',
        traceIdSearchWidth: 350,
        missingPlugins: [],
        tenant: null,
        env: undefined,
      };
    },
    computed: {
      ...mapState(['Scale']),
      ...mapGetters(['Tenant']),
      src() {
        if (this.isTraceId) {
          return `/api/v1/service-proxy/cluster/${this.cluster}/namespace/observability/service/jaeger-query/port/16686/trace/${this.traceid}?uiEmbed=v0`;
        } else if (this.$route.query.service) {
          let url = `/api/v1/service-proxy/cluster/${
            this.cluster
          }/namespace/observability/service/jaeger-query/port/16686/search?limit=${
            this.$route.query.limit || '20'
          }&lookback=${this.$route.query.lookback || '1h'}&service=${this.$route.query.service}&tags=${
            this.$route.query.tags || null
          }&maxDuration=${this.$route.query.maxDuration || ''}&minDuration=${this.$route.query.minDuration || ''}`;
          if (this.$route.query.operation) {
            url += `&operation=${this.$route.query.operation}`;
          }
          if (this.$route.query.start) {
            url += `&start=${this.$route.query.start}`;
          }
          if (this.$route.query.end) {
            url += `&end=${this.$route.query.end}`;
          }
          return url;
        } else {
          return `/api/v1/service-proxy/cluster/${this.cluster}/namespace/observability/service/jaeger-query/port/16686/search`;
        }
      },
      height() {
        return parseInt((window.innerHeight - 148) / this.Scale);
      },
    },
    watch: {
      env: {
        handler(newValue) {
          if (newValue) {
            if (this.$route.query.traceId) {
              this.isTraceId = true;
              this.traceid = this.$route.query.traceId;
            }
            this.loadData();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        if (!this.Tenant().ID) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.select_tenant'),
            color: 'warning',
          });
          return;
        }
        this.tenant = this.Tenant();
      });
    },
    beforeDestroy() {
      clearInterval(this.timer);
    },
    methods: {
      async loadData() {
        this.missingPlugins = await this.m_permission_plugin_pass(
          this.env.clusterName,
          this.$route.meta?.dependencies || [],
        );
        if (this.missingPlugins?.length === 0) {
          this.$store.commit('SET_PROGRESS', true);
          this.show = false;
          this.iframeKey = Date.now();
          this.cluster = this.env.clusterName;
        } else {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('plugin.cluster_missing', [this.missingPlugins.join(', ')]),
            color: 'warning',
          });
          return;
        }
      },
      onLoad() {
        this.onOverwriteStyle();
        this.show = true;
        this.$store.commit('SET_PROGRESS', false);
        clearInterval(this.timer);
        this.setLocation();
      },
      searchByTraceId(e) {
        if (e.keyCode === 13) {
          this.isTraceId = true;
        } else {
          this.isTraceId = false;
        }
      },
      // 样式覆盖
      onOverwriteStyle() {
        const styleCover = `
        .Page--topNav {
          display: none;
        }
        .Page--content {
          top: 0;
          height: 100%;
        }
        .SearchTracePage--row {
          opacity: 1;
        }
        .SearchTracePage--find {
          padding-top: 0;
        }
        .Tracepage--headerSection {
          padding: 12px;
        }
        .TraceTimelineViewer {
          margin: 0 12px;
        }
        .TimelineHeaderRow {
          width: auto;
          left: 12px;
          right: 12px;
        }
        body::-webkit-scrollbar {
          display: none;
        }
      `;
        const ele = document.createElement('style');
        ele.attributes.type = 'text/css';
        ele.innerHTML = styleCover;
        this.$refs.iframe.contentWindow.document.head.appendChild(ele);
      },
      onBack() {
        if (this.$route.query.traceId) {
          this.$router.replace({
            query: {},
          });
        } else {
          window.history.back();
        }
        this.isTraceId = false;
        this.traceid = '';
      },
      setLocation() {
        this.timer = setInterval(() => {
          if (this.$refs.iframe) {
            const href = this.$refs.iframe.contentWindow?.location?.pathname;
            if (href) this.location = href.search('/trace/') === -1 ? 'search' : 'trace';
          }
        }, 200);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .search {
    height: 100%;

    &__main {
      position: relative;
    }

    &__header {
      display: flex;
      justify-content: space-between;
      padding: 16px 16px 0;
    }

    &__iframe {
      width: 100%;
      height: calc(100% - 44px);
      border: none;
    }

    &__label {
      line-height: 38px;
      margin-right: 8px;
    }
  }
</style>
