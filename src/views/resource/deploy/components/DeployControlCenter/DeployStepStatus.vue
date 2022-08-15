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
  <BaseDialog v-model="dialog" icon="mdi-dots-circle" :title="$t('tip.step_status')" :width="1000" @reset="reset">
    <template #header>
      <span class="ml-3">
        {{ $route.params.name }}
      </span>
    </template>
    <template #content>
      <v-flex v-if="stages.length > 0" class="pa-1">
        <v-stepper v-model="step" non-linear vertical>
          <template v-for="(stage, index) in stages">
            <v-stepper-step
              :key="`s${index}`"
              class="text-subtitle-1 kubegems__text font-weight-medium"
              :complete="
                stage.data &&
                stage.data.findIndex((s) => {
                  return s.status && s.status.status !== 'Success';
                }) === -1
              "
              edit-icon="mdi-check"
              error-icon="mdi-close-circle"
              :rules="
                stage.data
                  ? [
                      () =>
                        stage.data.findIndex((s) => {
                          return s.status && s.status.status !== 'Error';
                        }) > -1,
                    ]
                  : []
              "
              :step="`${index + 1}`"
            >
              {{ $t('tip.step') }}{{ index + 1 }}: {{ stage.name }}
            </v-stepper-step>
            <v-stepper-content :key="`c${index}`" :step="`${index + 1}`">
              <v-card class="my-0" flat>
                <v-data-table
                  disable-sort
                  :headers="headers"
                  hide-default-footer
                  item-key="ID"
                  :items="stage.nodata ? [] : stage.data"
                  :items-per-page="100"
                  :no-data-text="$root.$t('data.no_data')"
                  show-expand
                  single-expand
                  @click:row="onRowClick"
                >
                  <template #[`item.task`]="{ item }">
                    {{ item.name }}
                  </template>
                  <template #[`item.startAt`]="{ item }">
                    {{
                      item.status && item.status.startTimestamp
                        ? $moment(item.status.startTimestamp).format('YYYY年MM月DD日 HH:mm:ss')
                        : ''
                    }}
                  </template>
                  <template #[`item.endAt`]="{ item }">
                    {{
                      item.status && item.status.finishTimestamp
                        ? $moment(item.status.finishTimestamp).format('YYYY年MM月DD日 HH:mm:ss')
                        : ''
                    }}
                  </template>
                  <template #[`item.status`]="{ item }">
                    <template v-if="item && item.status && item.status.status === 'Success'">
                      <v-icon color="success" small> mdi-check-circle </v-icon>
                      {{ $t('status.complete') }}
                    </template>
                    <template v-else-if="item && item.status && item.status.status === 'Error'">
                      <v-icon color="error" small> mdi-alert-circle </v-icon>
                      {{ $t('status.failed') }}
                    </template>
                    <template v-else-if="item && item.status && item.status.status === 'Running'">
                      <v-icon class="kubegems__waiting-circle-flashing" color="warning" small> mdi-sync </v-icon>
                      {{ $t('status.running') }}
                    </template>
                    <template v-else-if="item && item.status && item.status.status === 'Pending'">
                      <v-icon color="grey" small> mdi-timer-sand </v-icon>
                      {{ $t('status.pending') }}
                    </template>
                  </template>
                  <template #expanded-item="{ headers, item }">
                    <td class="my-2 py-2" :colspan="headers.length">
                      <span>{{ $t('tip.error_info') }} : </span>
                      <span>
                        {{
                          item.status && item.status.message && item.status.message.length > 0
                            ? item.status.message
                            : $root.$t('data.no_data')
                        }}
                      </span>
                    </td>
                  </template>
                </v-data-table>
              </v-card>
            </v-stepper-content>
          </template>
        </v-stepper>
      </v-flex>
      <v-flex v-else class="grey lighten-4 rounded ma-2 mt-3">
        <v-list-item two-line>
          <v-list-item-content class="py-2">
            <v-list-item-subtitle class="text-body-2 py-0 text-center">
              {{ $root.$t('data.no_data') }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-flex>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'DeployStepStatus',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    data() {
      return {
        dialog: false,
        statusSSE: null,
        step: 1,
        stages: [],
      };
    },
    computed: {
      ...mapState(['JWT', 'Scale']),
      ...mapGetters(['Tenant', 'Project', 'Environment']),
      headers() {
        return [
          { text: this.$t('table.task'), value: 'task', align: 'start', width: 200 },
          { text: this.$t('table.start_at'), value: 'startAt', align: 'start' },
          { text: this.$t('table.end_at'), value: 'endAt', align: 'start' },
          { text: this.$t('table.status'), value: 'status', align: 'start' },
          { text: '', value: 'data-table-expand' },
        ];
      },
    },
    created() {
      window.addEventListener('beforeunload', this.closeStatusSSE);
      window.addEventListener('unload', this.closeStatusSSE);
    },
    destroyed() {
      this.closeStatusSSE();
      window.removeEventListener('beforeunload', this.closeStatusSSE);
      window.removeEventListener('unload', this.closeStatusSSE);
    },
    methods: {
      open() {
        this.dialog = true;
      },
      init() {
        this.showDeployStepStatus();
        const interval = setInterval(() => {
          const eles = document.getElementsByClassName('v-stepper__wrapper');
          if (eles && eles.length > 0) {
            clearInterval(interval);
            for (const index in eles) {
              if (eles[index].style) eles[index].style.height = 'auto';
            }
          }
        }, 500);
      },
      showDeployStepStatus() {
        const url = `/api/v1/tenant/${this.Tenant().ID}/project/${this.Project().ID}/environment/${
          this.Environment().ID
        }/applications/${this.$route.params.name}/tasks?token=${this.JWT}&limit=1&watch=true`;
        const vue = this;
        this.statusSSE = new EventSource(url, { withCredentials: true });
        this.statusSSE.onopen = () => {};
        this.statusSSE.addEventListener(
          'data',
          function (event) {
            if (event.data && event.data.length > 0) {
              const data = JSON.parse(event.data);
              if (data.length > 0) {
                vue.stages = data[0].steps.map((s) => {
                  return {
                    name: s.name,
                    data: [{ ...s }],
                  };
                });
              } else {
                vue.stages = [];
              }
            }
          },
          false,
        );
        this.statusSSE.onerror = () => {
          // this.$store.commit('SET_SNACKBAR', {
          //   text: `建立连接失败`,
          //   color: 'error',
          // })
        };
        this.statusSSE.addEventListener(
          'err',
          function () {
            vue.closeStatusSSE();
          },
          false,
        );
      },
      closeStatusSSE() {
        if (this.statusSSE) {
          this.statusSSE.close();
        }
        this.stages = [];
      },
      reset() {
        this.closeStatusSSE();
      },
      onRowClick(item, { expand, isExpanded }) {
        expand(!isExpanded);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .v-stepper--vertical .v-stepper__content {
    padding: 0 60px 0 23px;
  }
</style>
