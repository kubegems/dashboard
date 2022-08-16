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
  <BasePanel
    v-model="panel"
    icon="mdi-exclamation-thick"
    :title="$t('tip.vulnerability_report')"
    :width="`50%`"
    @dispose="dispose"
  >
    <template #header>
      <span class="ml-2 text-subtitle-1">
        {{ item ? item.ImageName : '' }}
      </span>
    </template>
    <template #content>
      <v-card>
        <v-card-text class="my-0 py-0 px-2">
          <v-data-table
            class="kubegems__table-row-pointer"
            disable-sort
            :headers="headers"
            :height="height"
            hide-default-footer
            item-key="index"
            :items="items"
            :items-per-page="1000"
            :no-data-text="$root.$t('data.no_data')"
            show-expand
            single-expand
            @click:row="onRowClick"
          >
            <template #[`item.id`]="{ item }">
              {{ item.id }}
            </template>
            <template #[`item.severity`]="{ item }">
              <v-chip
                v-if="item.ScanStatus !== ''"
                class="white--text"
                :color="severityDict[item.severity] ? severityDict[item.severity].Color : ''"
                label
                small
              >
                {{ severityDict[item.severity] ? severityDict[item.severity].CN : '' }}
              </v-chip>
            </template>
            <template #[`item.package`]="{ item }">
              {{ item.package }}
            </template>
            <template #[`item.version`]="{ item }">
              {{ item.version }}
            </template>
            <template #[`item.fixVersion`]="{ item }">
              {{ item.fix_version }}
            </template>
            <template #expanded-item="{ headers, item }">
              <td class="ma-2" :colspan="headers.length">
                <v-flex>
                  {{ $t('tip.description') }} :
                  <pre class="kubegems__word-all-break">{{ item.description }}</pre>
                </v-flex>
                <v-flex>
                  {{ $t('tip.link') }} :
                  <v-flex v-for="(link, index) in item.links" :key="index">
                    <a :href="link" target="blank">{{ link }}</a>
                  </v-flex>
                </v-flex>
              </td>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </template>
  </BasePanel>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import { getAppImageSecurityReportDetail } from '@/api';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'AppImageSecurityReportDetail',
    i18n: {
      messages: messages,
    },
    data: () => ({
      panel: false,
      item: null,
      items: [],
      app: null,
    }),
    computed: {
      ...mapState(['Scale']),
      ...mapGetters(['Tenant', 'Project']),
      height() {
        return parseInt((window.innerHeight - 64) / this.Scale);
      },
      headers() {
        return [
          { text: this.$t('table.id'), value: 'id', align: 'start' },
          { text: this.$t('table.severity'), value: 'severity', align: 'start' },
          { text: this.$t('table.component'), value: 'package', align: 'start' },
          { text: this.$t('table.version'), value: 'version', align: 'start' },
          { text: this.$t('table.fixed_version'), value: 'fixVersion', align: 'start' },
          { text: '', value: 'data-table-expand' },
        ];
      },
      severityDict() {
        return {
          Critical: {
            CN: this.$t('tip.severity'),
            Color: 'red',
          },
          High: {
            CN: this.$t('tip.high'),
            Color: 'deep-purple',
          },
          Medium: {
            CN: this.$t('tip.middle'),
            Color: 'warning',
          },
          Low: {
            CN: this.$t('tip.low'),
            Color: 'blue',
          },
          Unknown: {
            CN: this.$t('tip.none'),
            Color: 'success',
          },
        };
      },
    },
    methods: {
      open() {
        this.panel = true;
      },
      init(app, item) {
        this.item = deepCopy(item);
        this.app = deepCopy(app);
        this.appImageSecurityReportDetail();
      },
      async appImageSecurityReportDetail() {
        const data = await getAppImageSecurityReportDetail(this.app.TenantID, this.app.ProjectID, {
          image: this.item.image,
        });
        if (data.vulnerabilities) {
          this.items = data.vulnerabilities.map((item, index) => {
            return {
              index: index,
              ...item,
            };
          });
        }
      },
      dispose() {
        this.items = [];
      },
      onRowClick(item, { expand, isExpanded }) {
        expand(!isExpanded);
      },
    },
  };
</script>
