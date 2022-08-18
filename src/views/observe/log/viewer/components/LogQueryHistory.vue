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
  <BaseFullScreenDialog v-model="visible" icon="mdi-history" :title="$t('tip.query_history')" @dispose="handleDispose">
    <template #action>
      <ProjectEnvSelectCascade
        :key="selectKey"
        v-model="environment"
        first
        reverse
        reverse-color
        :small="false"
        :tenant="tenant"
      />
    </template>
    <template #content>
      <v-card v-if="visible" class="log-history" flat>
        <v-data-table
          class="px-4"
          :headers="headers"
          hide-default-footer
          :items="items"
          :items-per-page="-1"
          :no-data-text="$root.$t('data.no_data')"
          :sort-by="['CreateAt']"
          :sort-desc="[true]"
        >
          <template #[`item.label`]="{ item }">
            <span v-for="(v, k) in item.LabelJSON" :key="k">
              <v-chip
                v-for="(labelValue, labelIndex) in v"
                :key="labelIndex"
                class="ma-1 font-weight-medium"
                color="success"
                small
              >
                <span class="pr-2">{{ $t('tip.label') }}({{ k }}):{{ labelValue }}</span>
              </v-chip>
            </span>
            <v-chip
              v-for="(it, index) in item.FilterJSON"
              :key="it + index"
              class="ma-1 font-weight-medium"
              color="success"
              small
            >
              <span class="pr-2">{{ $t('tip.regex') }}(regex):{{ it }}</span>
            </v-chip>
          </template>
          <template #[`item.createAt`]="{ item }">
            {{ item.CreateAt ? $moment(item.CreateAt).format('lll') : '' }}
          </template>
          <template #[`item.logQL`]="{ item }">{{ item.LogQL }}</template>
          <template #[`item.total`]="{ item }">{{ item.Total }}</template>
          <template #[`item.action`]="{ item }">
            <v-flex class="float-right">
              <v-btn class="my-1" color="primary" small text @click="handleQuery(item)">
                {{ $t('operate.query') }}
              </v-btn>
              <v-btn class="my-1" color="error" small text @click="handleDelete(item)">
                {{ $root.$t('operate.delete') }}
              </v-btn>
            </v-flex>
            <div class="kubegems__clear-float" />
          </template>
        </v-data-table>
      </v-card>
    </template>
  </BaseFullScreenDialog>
</template>

<script>
  import { mapGetters } from 'vuex';

  import messages from '../../i18n';
  import { deleteLogQueryHistory, getLogQueryHistoryList } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { randomString } from '@/utils/helpers';
  import ProjectEnvSelectCascade from '@/views/observe/components/ProjectEnvSelectCascade';

  export default {
    name: 'LogHistory',
    i18n: {
      messages: messages,
    },
    components: {
      ProjectEnvSelectCascade,
    },
    mixins: [BaseSelect],
    inject: ['reload'],
    data() {
      return {
        visible: false,
        clusterid: undefined,
        items: [],
        namespace: '',
        tenant: null,
        environment: undefined,
        selectKey: '',
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
      env() {
        const env = this.m_select_environmentItems.find((e) => {
          return e.value === this.namespace;
        });
        return env;
      },
      headers() {
        return [
          { text: 'LogQL', value: 'logQL', align: 'start', sortable: false },
          { text: this.$t('tip.label'), value: 'label', align: 'start', sortable: false },
          { text: this.$t('table.last_query_at'), value: 'createAt', align: 'start', width: 200 },
          { text: this.$t('table.count'), value: 'total', align: 'start', width: 100 },
          { text: '', value: 'action', align: 'end', width: 140, sortable: false },
        ];
      },
    },
    watch: {
      environment: {
        handler(newValue) {
          if (newValue) {
            this.clusterid = newValue.clusterid;
            this.getHistoryList();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      show() {
        this.visible = true;
        this.m_select_environmentSelectData();
        this.tenant = this.Tenant();
        this.selectKey = `history-${randomString(4)}`;
      },

      async getHistoryList() {
        const data = await getLogQueryHistoryList(this.clusterid);
        this.items = (data || []).map((item) => {
          return {
            ...item,
            LabelJSON: this.handleParseLabel(item.LogQL),
            FilterJSON: this.handleParseFilter(item.LogQL),
          };
        });
      },
      handleParseLabel(input) {
        const labelMatchArr = input.match(new RegExp('{(.*)}'));
        if (labelMatchArr && labelMatchArr.length > 1) {
          const labelArr = labelMatchArr[1].split(',');
          const labelValueObj = {};
          labelArr.forEach((item) => {
            if (item.indexOf('=~') !== -1) {
              const label = item.split('=~')[0];
              labelValueObj[label] = item.split('=~')[1].match(new RegExp('"(.*)"'))[1].split('|');
            } else {
              const label = item.split('=')[0];
              labelValueObj[label] = [item.split('=')[1].match(new RegExp('"(.*)"'))[1]];
            }
          });
          return labelValueObj;
        } else {
          return {};
        }
      },

      handleParseFilter(input) {
        const filterList = [];
        const matchedArr = input.match(new RegExp('{.*}(.*)'));
        if (matchedArr && matchedArr.length > 1) {
          const filterArr = matchedArr[1].trim().split('|~');
          filterArr.forEach((item) => {
            if (item !== '') {
              const match = item.match(new RegExp('`(.*)`'));
              if (match && match.length > 0) {
                filterList.push(match[1]);
              }
            }
          });
        }
        return filterList;
      },

      async handleQuery(item) {
        const ns = new RegExp('namespace="([\\w-#\\(\\)\\*\\.@\\?&^$!%<>\\/]+)"', 'g').exec(item.LogQL);
        if (ns) {
          this.namespace = ns[1];
        }
        const env = this.env;

        if (this.namespace && env) {
          await this.$router.replace({
            query: {
              query: item.LogQL,
              project: env.projectName,
              environment: env.text,
              cluster: env.clusterName,
              namespace: this.namespace,
              filters: item.FilterJSON,
            },
          });
          this.visible = false;
          this.reload();
        } else {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.parse_namespace_error'),
            color: 'warning',
          });
        }
      },

      async handleDelete(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$t('tip.query_history')]),
          content: {
            text: item.LogQL,
            type: 'confirm',
          },
          doFunc: async () => {
            const ids = item.Ids.split(',')
              .reduce((pre, current) => pre + `lid=${current}`, '')
              .slice(0, -1);
            await deleteLogQueryHistory(ids);
            this.getHistoryList();
          },
        });
      },

      handleDispose() {
        this.cluster = undefined;
        this.items = [];
      },
    },
  };
</script>

<style lang="scss" scoped>
  .log-histroy {
    position: absolute;
    top: 64px;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: auto;

    &::-webkit-scrollbar {
      display: block !important;
    }
    &::-webkit-scrollbar-thumb {
      width: 10px;
      border-radius: 5px;
      background: grey;
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    }
    &::-webkit-scrollbar:vertical {
      width: 10px;
    }
  }
</style>
