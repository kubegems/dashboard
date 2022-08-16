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
  <BaseFullScreenDialog v-model="dialog" icon="mdi-list-box" :title="$t('tip.history')" @dispose="dispose">
    <template #header>
      <div>
        {{ $root.$t('resource.tenant') }}: {{ historyItem.tenant }} {{ $root.$t('resource.project') }}:
        {{ historyItem.project }} {{ $root.$t('resource.environment') }}: {{ historyItem.environment }}
        {{ $root.$t('resource.app') }}: {{ historyItem.application }} Key:
        {{ historyItem.key }}
      </div>
    </template>
    <template #content>
      <v-card class="px-3" flat>
        <v-data-iterator disable-filtering disable-pagination hide-default-footer :items="history">
          <template #default="props">
            <v-simple-table :height="height">
              <thead>
                <tr>
                  <th class="text-center" width="200"> {{ $t('table.version') }} </th>
                  <th class="text-left"> {{ $t('table.update_at') }} </th>
                  <th class="text-end" width="230" />
                </tr>
              </thead>
              <tbody>
                <template v-for="(item, idx) in props.items">
                  <tr :key="idx">
                    <td class="text-center">{{ item.rev }} </td>
                    <td>{{ $moment(item.last_update_time).format('lll') }}</td>
                    <td>
                      <v-row>
                        <v-col>
                          <v-btn
                            class="ma-md-2"
                            :color="item.expanded ? 'green' : 'primary'"
                            small
                            text
                            @click="expandItem(idx)"
                          >
                            <v-icon small>mdi-vector-difference</v-icon>
                            diff
                          </v-btn>
                        </v-col>
                        <v-col>
                          <v-btn class="ma-md-2" color="primary" small text @click="rollback(item)">
                            <v-icon small>mdi-backup-restore</v-icon>
                            {{ $t('operate.rollback') }}
                          </v-btn>
                        </v-col>
                      </v-row>
                    </td>
                  </tr>
                  <tr v-show="item.expanded" :key="idx + 'content'">
                    <td class="px-0" colspan="3">
                      <CodeDiff
                        :file-name="item.key"
                        is-show-no-change
                        :new-string="item.value"
                        :old-string="latestContent"
                        output-format="side-by-side"
                      />
                    </td>
                  </tr>
                </template>
              </tbody>
            </v-simple-table>
          </template>
        </v-data-iterator>
      </v-card>
    </template>
  </BaseFullScreenDialog>
</template>

<script>
  import { CodeDiff } from 'v-code-diff';
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { itemDetail, itemHistory, pubConfigItems } from '@/api';

  export default {
    name: 'HistoryView',
    i18n: {
      messages: messages,
    },
    components: {
      CodeDiff,
    },
    props: {
      showHistoryDialog: {
        type: Boolean,
        default: false,
      },
      historyItem: {
        type: Object,
        default: () => {
          return {
            tenant: '',
            project: '',
            environment: '',
            application: '',
            key: '',
            value: '',
          };
        },
      },
    },
    data() {
      return {
        dialog: false,
        history: [],
        latestContent: '',
      };
    },
    computed: {
      ...mapState(['JWT', 'Scale']),
      height() {
        return parseInt((window.innerHeight - 64) / this.Scale);
      },
    },
    watch: {
      showHistoryDialog(val) {
        if (val) {
          this.dialog = true;
        } else {
          this.dialog = false;
        }
      },
      historyItem() {
        this.getHistory();
      },
    },
    methods: {
      close() {
        this.$emit('close');
      },
      async getHistory() {
        if (this.historyItem && this.historyItem.key) {
          const histories = await itemHistory(
            this.historyItem.tenant,
            this.historyItem.project,
            this.historyItem.application,
            this.historyItem.environment,
            this.historyItem.key,
          );
          histories.forEach((item) => {
            item.value = '';
            item.expanded = false;
          });
          this.latestContent = this.historyItem.value;
          this.history = histories;
        } else {
          this.history = [];
        }
      },
      async getHistoryDetail(rev) {
        const detail = await itemDetail(
          this.historyItem.tenant,
          this.historyItem.project,
          this.historyItem.application,
          this.historyItem.environment,
          this.historyItem.key,
          rev,
        );
        return detail.value;
      },
      async expandItem(idx) {
        if (this.history[idx].expanded) {
          this.history[idx].expanded = false;
        } else {
          this.history[idx].expanded = true;
          const detail = await this.getHistoryDetail(this.history[idx].rev);
          this.history[idx].value = detail;
        }
      },
      async rollback(item) {
        let content = item.value;
        if (!content || content.length === 0) {
          content = await this.getHistoryDetail(item.rev);
        }
        this.$store.commit('SET_CONFIRM', {
          title: this.$t('operate.rollback'),
          content: {
            text: this.$t('tip.rollback_tip', [this.historyItem.key, item.rev]),
            type: 'confirm',
          },
          param: { content },
          doFunc: async (param) => {
            const res = await pubConfigItems(
              this.historyItem.tenant,
              this.historyItem.project,
              this.historyItem.application,
              this.historyItem.environment,
              this.historyItem.key,
              param.content,
            );
            if (res.ErrorData) {
              this.$store.commit('SET_SNACKBAR', {
                text: `${this.$t('status.rollback_failed')} ${res.ErrorData}`,
                color: 'warning',
              });
            } else {
              this.$store.commit('SET_SNACKBAR', {
                text: this.$t('status.rollback_success'),
                color: 'green',
              });
              this.$emit('rollback', res);
            }
          },
        });
      },
      dispose() {
        this.close();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .card {
    &__title {
      background-color: #f6f6f6;
    }
  }
  td {
    position: relative;
  }
</style>
