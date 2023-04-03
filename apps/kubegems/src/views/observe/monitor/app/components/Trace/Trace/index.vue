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
  <v-row>
    <v-col cols="2" :style="{ marginTop: '50px', position: 'relative' }">
      <label>{{ i18nLocal.t('tip.duration') }}</label>
      <v-row class="pa-3">
        <v-col class="py-0" cols="12">
          <label>min</label>
          <v-text-field v-model="pagination.minDuration" dense flat hide-details required solo />
        </v-col>
        <v-col class="py-0" cols="12">
          <label>max</label>
          <v-text-field v-model="pagination.maxDuration" dense flat hide-details required solo />
        </v-col>
      </v-row>
      <label>{{ i18nLocal.t('tip.limit') }}</label>
      <v-row class="pa-3">
        <v-col class="py-0" cols="12">
          <label>limit</label>
          <v-text-field v-model.number="pagination.limit" dense flat hide-details required solo />
        </v-col>
      </v-row>
      <v-btn class="mt-2 float-right mr-4" color="primary" small @click="query">{{ i18nLocal.t('tip.query') }}</v-btn>
      <v-divider class="divider" vertical />
    </v-col>
    <v-col cols="10">
      <v-data-table
        class="mx-1"
        disable-sort
        :headers="headers"
        hide-default-footer
        item-key="traceID"
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
        show-expand
        single-expand
      >
        <template #item.startTime="{ item }">
          {{ getStartTime(item) }}
        </template>
        <template #item.duration="{ item }">
          {{ beautifyTime(getDuration(item).toString()) }}
        </template>
        <template #item.traceID="{ item }">
          {{ item.traceID }}
          <v-btn color="primary" icon small @click.stop="toQueryTraceId(item)">
            <v-icon color="primary" small>mdi-chart-timeline</v-icon>
          </v-btn>
          <v-btn color="primary" icon small @click.stop="toQueryLog(item)">
            <v-icon color="primary" small>mdi-text-box-outline</v-icon>
          </v-btn>
        </template>
        <template #item.spanCount="{ item }">
          <div :class="{ 'error--text': getErrorSpanCount(item) > 0 }">
            {{ `${item.spans.length} (${getErrorSpanCount(item)}) errors` }}
          </div>
        </template>
        <template #expanded-item="{ headers, item }">
          <td class="my-2 py-2" :colspan="headers.length">
            <div class="text-subtitle-2 kubegems--text">Span</div>
            <v-simple-table dense>
              <template #default>
                <thead>
                  <tr>
                    <th class="text-left" :style="{ width: `120px` }">{{ i18nLocal.t('table.start_time') }}</th>
                    <th class="text-left" :style="{ width: `180px` }">SpanID</th>
                    <th class="text-left">Service</th>
                    <th class="text-left">Operation</th>
                    <th class="text-left">{{ i18nLocal.t('table.duration') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="span in item.spans" :key="span.spanID">
                    <td>{{ moment(span.startTime / 1000).format('HH:mm:ss.SSS') }}</td>
                    <td>{{ span.spanID }}</td>
                    <td>{{ item.processes[span.processID].serviceName }}</td>
                    <td :class="{ 'error--text': isErrorSpan(span) }">
                      <div class="operation">
                        {{ span.operationName }}
                        <SpanWarnTip v-if="span.warnings" :warnings="span.warnings">
                          <template #trigger>
                            <v-icon color="orange" small>mdi-alert-circle</v-icon>
                          </template>
                        </SpanWarnTip>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div
                          class="timeline float-left text-end text-body-2 pr-1"
                          :style="{ width: `${getLeft(item, span)}px` }"
                        >
                          {{
                            getTimeline(item, span) < 100 && getLeft(item, span) >= 100
                              ? beautifyTime(span.duration)
                              : ''
                          }}
                        </div>
                        <div
                          :class="{
                            'float-left': true,
                            timeline: true,
                            error: isErrorSpan(span) && !span.warnings,
                            primary: !isErrorSpan(span) && !span.warnings,
                            orange: span.warnings,
                            'text-center': true,
                            'white--text': true,
                            'text-body-2': true,
                          }"
                          :style="{ width: `${getTimeline(item, span)}px` }"
                        >
                          {{ getTimeline(item, span) < 100 ? '' : beautifyTime(span.duration) }}
                        </div>
                        <div class="timeline float-left text-start text-body-2 pl-1">
                          {{
                            getTimeline(item, span) < 100 && getLeft(item, span) < 100
                              ? beautifyTime(span.duration)
                              : ''
                          }}
                        </div>
                        <div class="kubegems__clear-float" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </td>
        </template>
      </v-data-table>

      <BasePagination
        v-if="pagination.pageCount >= 1"
        v-model="pagination.page"
        :page-count="pagination.pageCount"
        :size="pagination.size"
        @changepage="pageChange"
        @changesize="sizeChange"
        @loaddata="getTrace"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useRouter } from '@kubegems/extension/proxy';
  import { beautifyTime } from '@kubegems/libs/utils/helpers';
  import moment from 'moment';
  import { nextTick, reactive, watch } from 'vue';

  import { useI18n } from '../../../../i18n';
  import SpanWarnTip from './SpanWarnTip.vue';
  import { useTracePagination } from '@/composition/telemetry';
  import { Telemetry } from '@/types/opentelemetry';

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();
  const router = useRouter();

  type Env = {
    clusterName: string;
    namespace: string;
    projectName: string;
    environmentName: string;
  };

  const props = withDefaults(
    defineProps<{
      env?: Env;
      date?: string[];
      service?: string;
    }>(),
    {
      env: undefined,
      date: undefined,
      service: undefined,
    },
  );

  watch(
    () => props.env,
    async (newValue) => {
      if (newValue && newValue.clusterName && newValue.namespace && props.service) {
        nextTick(() => {
          if (props.date.length === 2) {
            pagination.start = moment(props.date[0]).utc().format();
            pagination.end = moment(props.date[1]).utc().format();
          }
          getTrace();
        });
      }
    },
    {
      deep: true,
    },
  );

  watch(
    () => props.date,
    async (newValue) => {
      if (newValue && newValue.length === 2 && props.env.clusterName && props.service) {
        pagination.start = moment(props.date[0]).utc().format();
        pagination.end = moment(props.date[1]).utc().format();
        nextTick(() => {
          getTrace();
        });
      }
    },
    {
      deep: true,
    },
  );

  watch(
    () => props.service,
    async (newValue) => {
      if (newValue && props.env.clusterName) {
        nextTick(() => {
          if (props.date.length === 2) {
            pagination.start = moment(props.date[0]).utc().format();
            pagination.end = moment(props.date[1]).utc().format();
          }
          pagination.page = 1;
          getTrace();
        });
      }
    },
    {
      deep: true,
      immediate: true,
    },
  );

  const headers = [
    { text: i18nLocal.t('table.start_time'), value: 'startTime', align: 'start' },
    { text: 'TraceId', value: 'traceID', align: 'start' },
    { text: i18nLocal.t('table.span_count'), value: 'spanCount', align: 'start' },
    { text: i18nLocal.t('table.duration'), value: 'duration', align: 'start' },
    { text: '', value: 'data-table-expand' },
  ];

  let pagination: Pagination<Telemetry> = reactive<Pagination<Telemetry>>({
    page: 1,
    size: 20,
    pageCount: 0,
    items: [],
    start: '',
    end: '',
    maxDuration: '100ms',
    minDuration: '0ms',
    limit: 100,
  });
  const getTrace = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data: Pagination<Telemetry> = await useTracePagination(
      new Telemetry(),
      props.env.clusterName,
      props.env.namespace,
      props.service,
      params,
    );
    pagination = Object.assign(pagination, data);
  };

  const pageChange = (page: number): void => {
    pagination.page = page;
  };

  const sizeChange = (size: number): void => {
    pagination.page = 1;
    pagination.size = size;
  };

  const query = (): void => {
    pagination.page = 1;
    getTrace();
  };

  const getStartTime = (item: Telemetry): string => {
    if (item.spans?.length > 0) {
      const startTime = moment(item.spans[0].startTime / 1000).format('YYYY-MM-DD HH:mm:ss.SSS');
      return startTime;
    }
    return '-';
  };
  const getDuration = (item: Telemetry): number => {
    if (item.spans?.length > 0) {
      const ends = item.spans.map((span) => {
        return span.startTime + span.duration;
      });
      return Math.max(...ends) - item.spans[0].startTime;
    }
    return 0;
  };

  const getLeft = (item: Telemetry, span: any): number => {
    const perDeg = 400 / getDuration(item);
    const firstSpan = item.spans[0];
    return (span.startTime - firstSpan.startTime) * perDeg;
  };

  const getTimeline = (item: Telemetry, span: any): number => {
    const perDeg = 400 / getDuration(item);
    return span.duration * perDeg;
  };

  const getErrorSpanCount = (item: Telemetry): number => {
    const errorSpans = item.spans.filter((span) => {
      return span.tags.some((tag) => {
        return tag.key === 'error' && tag.value === true;
      });
    });
    return errorSpans.length;
  };

  const isErrorSpan = (span: any): boolean => {
    return span.tags.some((tag) => {
      return tag.key === 'error' && tag.value === true;
    });
  };

  const toQueryTraceId = (item: Telemetry): void => {
    const href = router.resolve({
      name: 'observe-trace-search',
      query: {
        traceId: item.traceID,
        project: props.env.projectName,
        environment: props.env.environmentName,
      },
    }).href;
    window.open(href);
  };

  const toQueryLog = (item: Telemetry): void => {
    const href = router.resolve({
      name: 'log-viewer',
      query: {
        project: props.env.projectName,
        environment: props.env.environmentName,
        cluster: props.env.clusterName,
        query: `{ namespace="${props.env.namespace}" } |~ \`${item.traceID}\``,
        filters: `${item.traceID}`,
      },
    }).href;
    window.open(href);
  };
</script>

<style lang="scss" scoped>
  .divider {
    position: absolute;
    right: 0;
    top: 20px;
    min-height: 88%;
  }

  .operation {
    text-overflow: ellipsis;
    // width: 400px;
    white-space: nowrap;
    overflow-x: auto;
  }

  .timeline {
    height: 20px;
  }
</style>
