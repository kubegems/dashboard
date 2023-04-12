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
  <v-card>
    <v-card-text>
      <v-data-table
        disable-sort
        :headers="headers"
        hide-default-footer
        :items="pagination.items"
        :items-per-page="pagination.size"
        :no-data-text="i18n.t('data.no_data')"
        :page.sync="pagination.page"
      >
        <template #item.reason="{ item }">
          {{ item.reason }}
        </template>
        <template #item.type="{ item }">
          <v-badge
            v-if="item.count > 1"
            bordered
            :color="EVENT_STATUS_COLOR[item.type]"
            :content="item.count > 99 ? '99+' : item.count"
            overlap
          >
            <v-chip
              class="white--text font-weight-medium chip-width"
              :color="EVENT_STATUS_COLOR[item.type]"
              label
              small
            >
              <span>{{ item.type }}</span>
            </v-chip>
          </v-badge>
          <v-chip
            v-else
            class="white--text font-weight-medium chip-width"
            :color="EVENT_STATUS_COLOR[item.type]"
            label
            small
          >
            <span>{{ item.type }}</span>
          </v-chip>
        </template>
        <template #item.kind="{ item }">
          {{ item.involvedObject.kind }}
        </template>
        <template #item.firstAt="{ item, index }">
          <RealDatetimeTip
            :datetime="item.firstTimestamp || item.eventTime"
            :top="pagination.size - index <= 5 || (pagination.items.length <= 5 && index >= 1)"
          >
            <template #trigger>
              <span>
                {{
                  item.firstTimestamp
                    ? moment(item.firstTimestamp, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                    : item.eventTime
                    ? moment(item.eventTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                    : ''
                }}
              </span>
            </template>
          </RealDatetimeTip>
        </template>
        <template #item.lastAt="{ item, index }">
          <RealDatetimeTip
            :datetime="item.lastTimestamp"
            :top="pagination.size - index <= 5 || (pagination.length <= 5 && index >= 1)"
          >
            <template #trigger>
              <span>
                {{ item.lastTimestamp ? moment(item.lastTimestamp, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() : '' }}
              </span>
            </template>
          </RealDatetimeTip>
        </template>
        <template #item.message="{ item }">
          {{ item.message }}
        </template>
      </v-data-table>
      <BasePagination
        v-if="pagination.pageCount >= 1"
        v-model="pagination.page"
        :page-count="pagination.pageCount"
        :size="pagination.size"
        @changepage="pageChange"
        @changesize="sizeChange"
        @loaddata="getEventList"
      />
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  import { useEventPagination } from '@kubegems/api/hooks/event';
  import { Event } from '@kubegems/api/typed/event';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useCluster } from '@kubegems/extension/resource';
  import { useQuery } from '@kubegems/extension/router';
  import { EVENT_STATUS_COLOR } from '@kubegems/libs/constants/resource';
  import moment from 'moment';
  import { reactive, watch } from 'vue';

  import { useI18n } from './i18n';
  import RealDatetimeTip from './RealDatetimeTip.vue';

  const props = withDefaults(
    defineProps<{
      item?: { [key: string]: any };
      selector?: { [key: string]: any };
    }>(),
    {
      item: undefined,
      selector: undefined,
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const query = useQuery();

  const headers = [
    { text: 'Reason', value: 'reason', align: 'start' },
    { text: 'Kind', value: 'kind', align: 'start' },
    { text: i18nLocal.t('table.first_trigger_at'), value: 'firstAt', align: 'start', width: 120 },
    { text: i18nLocal.t('table.last_trigger_at'), value: 'lastAt', align: 'start', width: 120 },
    { text: i18n.t('resource.type'), value: 'type', align: 'start' },
    { text: i18nLocal.t('table.message'), value: 'message', align: 'start' },
  ];

  let pagination: Pagination<Event> = reactive<Pagination<Event>>({
    page: 1,
    size: 10,
    pageCount: 0,
    items: [],
  });

  const getEventList = async (params: KubePaginationRequest = pagination): Promise<void> => {
    const data = await useEventPagination(
      new Event(),
      query.value.cluster || useCluster(),
      query.value.namespace || '_all',
      params.page,
      params.size,
      { ...(props.selector || {}), noprocessing: true },
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

  watch(
    () => props.item,
    async (newValue) => {
      if (!newValue) return;

      getEventList();
    },
    {
      immediate: true,
      deep: true,
    },
  );
</script>

<style lang="scss" scoped>
  .regular-width {
    width: 70px;
  }

  .chip-width {
    width: 70px;
    display: block;
    text-align: center;
  }
</style>
