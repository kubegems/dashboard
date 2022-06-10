<template>
  <v-container fluid class="search">
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right" :style="{ width: `${traceIdSearchWidth}px` }">
          <div class="float-left search__label">TraceId</div>
          <v-text-field
            v-model="traceid"
            solo
            dense
            hide-details
            flat
            prepend-inner-icon="mdi-magnify"
            full-width
            @focus="traceIdSearchWidth = 500"
            @blur="traceIdSearchWidth = 250"
            @keyup.enter="onTraceIdSearch"
          />
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-card class="search__main" :height="height">
      <div class="search__header">
        <ClusterSelect v-model="cluster" auto-select-first />
        <v-btn v-if="location === 'trace'" small text color="primary" class="float-right" @click="onBack">
          <v-icon left small> fas fa-share-square </v-icon>
          返回
        </v-btn>
      </div>

      <iframe
        v-if="cluster"
        v-show="show"
        ref="iframe"
        :key="iframeKey"
        :src="src"
        allow
        class="search__iframe"
        @load="onLoad"
      />
    </v-card>
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';
  import ClusterSelect from '@/views/observe/components/ClusterSelect';

  export default {
    name: 'TraceSearch',
    components: {
      ClusterSelect,
    },
    data() {
      return {
        cluster: undefined,
        location: 'search',
        iframeKey: Date.now(),
        show: false,

        isTraceId: false,
        traceid: '',
        traceIdSearchWidth: 250,
      };
    },
    computed: {
      ...mapState(['Scale']),
      src() {
        if (this.isTraceId) {
          return `/api/v1/service-proxy/cluster/${this.cluster}/namespace/observability/service/jaeger-query/port/16686/trace/${this.traceid}?uiEmbed=v0`;
        } else {
          return `/api/v1/service-proxy/cluster/${this.cluster}/namespace/observability/service/jaeger-query/port/16686/search`;
        }
      },
      height() {
        return parseInt((window.innerHeight - 152) / this.Scale);
      },
    },
    watch: {
      cluster() {
        this.$store.commit('SET_PROGRESS', true);
        this.show = false;
        this.iframeKey = Date.now();
      },
    },
    mounted() {
      this.$store.commit('SET_PROGRESS', true);
    },
    beforeDestroy() {
      clearTimeout(this.timer);
    },
    methods: {
      onLoad() {
        this.onOverwriteStyle();
        this.show = true;
        this.$store.commit('SET_PROGRESS', false);
        clearTimeout(this.timer);
        this.setLocation();
      },
      onTraceIdSearch() {
        this.isTraceId = true;
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
      setLocation() {
        this.timer = setTimeout(() => {
          if (this.$refs.iframe) {
            const href = this.$refs.iframe.contentWindow.location.pathname;
            this.location = href.search('/trace/') === -1 ? 'search' : 'trace';
          }
          this.setLocation();
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
