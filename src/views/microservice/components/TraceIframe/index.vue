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
  <v-card flat>
    <v-sheet class="text-body-2 primary--text pa-2">
      <v-flex v-if="showBtn" class="float-left ml-2">
        <v-btn color="primary" small text @click="returnIframePage"> {{ $root.$t('operate.return') }} </v-btn>
      </v-flex>
      <CountLimit class="float-right ml-2" @refreshLimit="refreshLimit" />
      <v-flex class="float-right">
        <span class="kubegems__text text-subtitle-2 font-weight-medium"> {{ $t('tip.start_end_time') }} </span>
        <BaseDatetimePicker v-model="date" :default-value="30" @change="onDatetimeChange(undefined)" />
      </v-flex>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <v-card-text class="pa-2">
      <iframe
        v-if="show"
        id="trace"
        :key="iframeKey"
        allow
        class="iframe"
        :height="height"
        :src="src"
        width="100%"
        @load="loadDataComplete"
      />
    </v-card-text>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import CountLimit from './CountLimit';
  import { randomString } from '@/utils/helpers';

  export default {
    name: 'TraceIframe',
    i18n: {
      messages: messages,
    },
    components: {
      CountLimit,
    },
    props: {
      services: {
        type: Array,
        default: () => [],
      },
      type: {
        type: String,
        default: () => 'workloads',
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
      };
    },
    computed: {
      ...mapState(['Scale']),
      height() {
        return window.innerHeight - 255 * this.Scale - 1;
      },
      src() {
        let service = `${this.$route.params.name}.${this.$route.query.namespace}`;
        if (this.type === 'workloads') {
          if (this.services.length > 0) {
            service = `${this.services[0].metadata.name}.${this.$route.query.namespace}`;
          }
        }
        return `/api/v1/service-proxy/cluster/${this.$route.query.cluster}/namespace/observability/service/jaeger-query/port/16686/search?limit=${this.limit}&lookback=custom&maxDuration&minDuration&service=${service}&start=${this.start}&end=${this.end}&uiEmbed=v0`;
      },
    },
    destroyed() {
      if (this.timeinterval) clearInterval(this.timeinterval);
    },
    mounted() {
      this.$nextTick(() => {
        this.$store.commit('SET_PROGRESS', true);
        this.onDatetimeChange();
      });
    },
    methods: {
      loadDataComplete() {
        this.$store.commit('SET_PROGRESS', false);
        this.timeinterval = setInterval(() => {
          const iframe = document.getElementById('trace');
          if (iframe) {
            const links = iframe.contentWindow.document.getElementsByClassName('u-tx-inherit');
            if (links) {
              this.removeBar();
            }
            const traces = iframe.contentWindow.document.getElementsByClassName('TracePageHeader');
            if (traces && traces.length > 0) {
              this.showBtn = true;
            } else {
              this.showBtn = false;
            }
          }
        }, 500);
      },
      removeBar() {
        const iframe = document.getElementById('trace');
        const links = iframe.contentWindow.document.getElementsByClassName('u-tx-inherit');
        if (links && links.length > 0) {
          const link = links[0];
          link.parentElement?.removeChild(link);
        }

        const searchs = iframe.contentWindow.document.getElementsByClassName('TracePageSearchBar');
        if (searchs && searchs.length > 0) {
          const search = searchs[0];
          search.parentElement?.removeChild(search);
        }
      },
      refreshLimit(limit) {
        this.limit = limit;
        this.$store.commit('SET_PROGRESS', true);
        this.iframeKey = randomString(6);
      },
      onDatetimeChange() {
        this.start = Date.parse(this.$moment(this.date[0]).utc()) + '000';
        this.end = Date.parse(this.$moment(this.date[1]).utc()) + '000';
        this.show = true;
        this.$store.commit('SET_PROGRESS', true);
        this.iframeKey = randomString(6);
      },
      returnIframePage() {
        window.history.go(-1);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .iframe {
    border: none;
  }
</style>
