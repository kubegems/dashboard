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
  <v-card class="kubegems__h-24" flat>
    <BaseSubTitle :divider="false" :title="$t('tip.alert_trend')" />
    <div class="mx-3 mb-3" :style="{ height: `100%` }">
      <BaseAreaChart
        chart-type="line"
        :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
        colorful
        :global-plugins-check="false"
        height="290px"
        :metrics="series"
        :precision="0"
        time-display="YYYY-MM-DD"
        title=""
        type=""
      />
    </div>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import { getAlertGraph } from '@/api';

  export default {
    name: 'AlertHistoryLine',
    i18n: {
      messages: messages,
    },
    props: {
      tenant: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        series: [],
      };
    },
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      tenant: {
        handler: function () {
          if (this.tenant) {
            this.alertGraphMetrics();
          }
        },
        deep: true,
      },
    },
    methods: {
      async alertGraphMetrics() {
        const data = await getAlertGraph(this.tenant.ID, {
          start: this.$moment().utc().add(-30, 'days').format(),
          end: this.$moment().utc().format(),
        });
        this.series = data;
      },
    },
  };
</script>
