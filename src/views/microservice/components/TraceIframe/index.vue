<template>
  <v-card flat>
    <v-sheet class="text-body-2 primary--text pa-2">
      <v-flex
        v-if="showBtn"
        class="float-left ml-2"
      >
        <v-btn
          small
          text
          color="primary"
          @click="returnIframePage"
        >
          返回
        </v-btn>
      </v-flex>
      <CountLimit
        class="float-right ml-2"
        @refreshLimit="refreshLimit"
      />
      <v-flex class="float-right">
        <span class="kubegems__detail text-subtitle-2 font-weight-medium">
          起止时间
        </span>
        <BaseDatetimePicker
          v-model="date"
          :default-value="30"
          @change="onDatetimeChange(undefined)"
        />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <v-card-text class="pa-2">
      <iframe
        v-if="show"
        id="trace"
        :key="iframeKey"
        :src="src"
        allow
        width="100%"
        :height="height"
        class="iframe"
        @load="loadDataComplete"
      />
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'
import CountLimit from './CountLimit'
import { randomString } from '@/utils/helpers'

export default {
  name: 'TraceIframe',
  components: {
    CountLimit,
  },
  props: {
    type: {
      type: String,
      default: () => 'workloads',
    },
    services: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      start: '',
      end: '',
      limit: 100,
      iframeKey: '',
      timeinterval: null,
      show: false,
      showBtn: false,
      date: [],
    }
  },
  computed: {
    ...mapState(['Scale']),
    height() {
      return window.innerHeight - 255 * this.Scale - 1
    },
    src() {
      let service = `${this.$route.params.name}.${this.$route.query.namespace}`
      if (this.type === 'workloads') {
        if (this.services.length > 0) {
          service = `${this.services[0].metadata.name}.${this.$route.query.namespace}`
        }
      }
      return `/api/v1/service-proxy/cluster/${this.$route.query.cluster}/namespace/observability/service/jaeger-query/port/16686/search?limit=${this.limit}&lookback=custom&maxDuration&minDuration&service=${service}&start=${this.start}&end=${this.end}&uiEmbed=v0`
    },
  },
  destroyed() {
    if (this.timeinterval) clearInterval(this.timeinterval)
  },
  mounted() {
    this.$nextTick(() => {
      this.$store.commit('SET_PROGRESS', true)
      this.onDatetimeChange()
    })
  },
  methods: {
    loadDataComplete() {
      this.$store.commit('SET_PROGRESS', false)
      this.timeinterval = setInterval(() => {
        const iframe = document.getElementById('trace')
        if (iframe) {
          const links =
            iframe.contentWindow.document.getElementsByClassName('u-tx-inherit')
          if (links) {
            this.removeBar()
          }
          const traces =
            iframe.contentWindow.document.getElementsByClassName(
              'TracePageHeader',
            )
          if (traces && traces.length > 0) {
            this.showBtn = true
          } else {
            this.showBtn = false
          }
        }
      }, 500)
    },
    removeBar() {
      const iframe = document.getElementById('trace')
      const links =
        iframe.contentWindow.document.getElementsByClassName('u-tx-inherit')
      if (links && links.length > 0) {
        const link = links[0]
        link.parentElement?.removeChild(link)
      }

      const searchs =
        iframe.contentWindow.document.getElementsByClassName(
          'TracePageSearchBar',
        )
      if (searchs && searchs.length > 0) {
        const search = searchs[0]
        search.parentElement?.removeChild(search)
      }
    },
    refreshLimit(limit) {
      this.limit = limit
      this.$store.commit('SET_PROGRESS', true)
      this.iframeKey = randomString(6)
    },
    onDatetimeChange() {
      this.start = Date.parse(this.$moment(this.date[0]).utc()) + '000'
      this.end = Date.parse(this.$moment(this.date[1]).utc()) + '000'
      this.show = true
      this.$store.commit('SET_PROGRESS', true)
      this.iframeKey = randomString(6)
    },
    returnIframePage() {
      window.history.go(-1)
    },
  },
}
</script>

<style lang="scss" scoped>
.iframe {
  border: none;
}
</style>
