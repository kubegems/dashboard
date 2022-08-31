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
          <ProjectEnvSelectCascade v-model="env" first :offset-y="0" reverse :tenant="tenant" />
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-card class="search__main" flat :height="height">
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
  import { mapGetters, mapState } from 'vuex';

  import BasePermission from '@/mixins/permission';
  import ProjectEnvSelectCascade from '@/views/observe/components/ProjectEnvSelectCascade';

  export default {
    name: 'TraceSearch',
    components: {
      ProjectEnvSelectCascade,
    },
    mixins: [BasePermission],
    data() {
      return {
        cluster: undefined,
        iframeKey: Date.now(),
        show: false,

        missingPlugins: [],
        tenant: null,
        env: undefined,
      };
    },
    computed: {
      ...mapState(['Scale']),
      ...mapGetters(['Tenant']),
      src() {
        return `/api/v1/service-proxy/cluster/${this.cluster}/namespace/observability/service/jaeger-query/port/16686/monitor?uiEmbed=v0`;
      },
      height() {
        return parseInt((window.innerHeight - 148) / this.Scale);
      },
    },
    watch: {
      env: {
        handler(newValue) {
          if (newValue) {
            this.cluster = newValue.clusterName;
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
    methods: {
      async loadData() {
        this.missingPlugins = await this.m_permission_plugin_pass(this.cluster, this.$route.meta?.dependencies || []);
        if (this.missingPlugins?.length === 0) {
          this.$store.commit('SET_PROGRESS', true);
          this.show = false;
          this.iframeKey = Date.now();
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
        window.history.back();
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
