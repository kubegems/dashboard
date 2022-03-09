<template>
  <v-container
    fluid
    class="trace"
  >
    <BaseBreadcrumb :breadcrumb="breadcrumb" />
    <v-card class="pa-4">
      <ClusterSelect
        v-model="cluster"
        auto-select-first
        class="mb-3"
      />
      <div class="trace__input">
        <span class="mr-4">TraceId</span>
        <v-text-field
          v-model="traceId"
          solo
          flat
          dense
          label="请输入TraceId查询"
          prepend-inner-icon="mdi-magnify"
          @keydown.enter="onSearch"
        />
        <v-btn
          text
          color="primary"
          class="ml-4"
          :disabled="!traceId"
          @click="onSearch"
        >
          查询
        </v-btn>
      </div>
    </v-card>

    <div class="trace__main">
      <iframe
        v-if="src"
        v-show="show"
        ref="iframe"
        class="trace__iframe"
        allow
        :src="src"
        @load="onLoad"
      />
    </div>
  </v-container>
</template>

<script>
import ClusterSelect from '@/views/observe/components/ClusterSelect'

export default {
  name: 'Trace',
  components: {
    ClusterSelect,
  },
  data() {
    this.breadcrumb = {
      title: 'TraceId',
      tip: '根据TraceId查询相关链路详细信息',
      icon: 'mdi-details',
    }

    return {
      traceId: undefined,
      cluster: undefined,
      src: '',
      show: false,
    }
  },
  methods: {
    onSearch() {
      if (this.traceId) {
        this.$store.commit('SET_PROGRESS', true)
        this.src = `/api/v1/service-proxy/cluster/${this.cluster}/namespace/observability/service/jaeger-query/port/16686/trace/${this.traceId}`
      } else {
        this.src = ''
      }
    },
    onLoad() {
      this.onOverwriteStyle()
      this.show = true
      this.$store.commit('SET_PROGRESS', false)
      clearTimeout(this.timer)
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
          opacity: 0;
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
  },
}
</script>

<style lang="scss" scoped>
.trace {
  position: relative;
  height: 100%;

  &__input {
    display: flex;
    align-items: center;
    width: 100%;
    height: 64px;

    ::v-deep {
      .v-input__slot {
        margin-bottom: 0 !important;
      }
      .v-text-field__details {
        display: none;
      }
    }
  }

  &__main {
    position: absolute;
    top: 236px;
    right: 12px;
    bottom: 12px;
    left: 12px;
  }

  &__iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
}
</style>
