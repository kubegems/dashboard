<template>
  <v-container
    fluid
    class="search"
  >
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card class="search__main">
      <div class="search__header">
        <ClusterSelect
          v-model="cluster"
          auto-select-first
        />
        <v-btn
          v-if="location === 'trace'"
          small
          text
          color="primary"
          class="float-right"
          @click="onBack"
        >
          <v-icon
            left
            small
          >
            fas fa-share-square
          </v-icon>
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
import ClusterSelect from '@/views/observe/components/ClusterSelect'

export default {
  name: 'TraceSearch',
  components: {
    ClusterSelect,
  },
  data() {
    this.breadcrumb = {
      title: '链路查询器',
      tip: '链路查询器(jaeger)是端到端分布式跟踪监控系统',
      icon: 'mdi-text-search',
    }

    return {
      cluster: undefined,
      location: 'search',
      iframeKey: Date.now(),
      show: false,
    }
  },
  computed: {
    src() {
      return `/api/v1/service-proxy/cluster/${this.cluster}/namespace/observability/service/jaeger-query/port/16686/search`
    },
  },
  watch: {
    cluster() {
      this.$store.commit('SET_PROGRESS', true)
      this.show = false
      this.iframeKey = Date.now()
    },
  },
  mounted() {
    this.$store.commit('SET_PROGRESS', true)
  },
  beforeDestroy() {
    clearTimeout(this.timer)
  },
  methods: {
    onLoad() {
      this.onOverwriteStyle()
      this.show = true
      this.$store.commit('SET_PROGRESS', false)
      clearTimeout(this.timer)
      this.setLocation()
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
      `
      const ele = document.createElement('style')
      ele.attributes.type = 'text/css'
      ele.innerHTML = styleCover
      this.$refs.iframe.contentWindow.document.head.appendChild(ele)
    },
    onBack() {
      window.history.back()
    },
    setLocation() {
      this.timer = setTimeout(() => {
        if (this.$refs.iframe) {
          const href = this.$refs.iframe.contentWindow.location.pathname
          this.location = href.search('/trace/') === -1 ? 'search' : 'trace'
        }
        this.setLocation()
      }, 200)
    },
  },
}
</script>

<style lang="scss" scoped>
.search {
  position: relative;
  height: 100%;

  &__main {
    position: absolute;
    top: 86px;
    right: 12px;
    bottom: 12px;
    left: 12px;
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
}
</style>
