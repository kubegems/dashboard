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
    <BaseSubTitle :divider="false" :title="$t('tip.top_10')">
      <template #selector>
        <v-sheet class="text-body-2 text--darken-1">
          <BaseDatetimePicker v-model="date" :default-value="1440" @change="onDatetimeChange(undefined)" />
        </v-sheet>
      </template>
    </BaseSubTitle>

    <div class="mx-3 mb-3">
      <BaseBarChart
        id="alert_top"
        :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
        colorful
        :label-show="false"
        :metrics="series"
      />
    </div>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../i18n';
  import { getAlertGroup } from '@/api';

  export default {
    name: 'AlertTopBar',
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
        date: [],
      };
    },
    computed: {
      ...mapState(['Scale']),
    },
    watch: {
      tenant: {
        handler: function () {
          if (this.tenant) {
            this.alertGroupMetrics();
          }
        },
        deep: true,
      },
    },
    methods: {
      async alertGroupMetrics() {
        const data = await getAlertGroup(this.tenant.ID, {
          groupby: 'project_name',
          start: this.$moment(parseInt(this.date[0])).utc().format(),
          end: this.$moment(parseInt(this.date[1])).utc().format(),
        });
        this.series = [
          {
            data: data.map((d) => {
              return {
                x: d.groupValue,
                y: d.count,
              };
            }),
          },
        ];
      },
      onDatetimeChange() {
        this.alertGroupMetrics();
      },
    },
  };
</script>
