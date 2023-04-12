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
        :items="items"
        :items-per-page="params.size"
        :no-data-text="$root.$t('data.no_data')"
        :page.sync="params.page"
      >
        <template #[`item.reason`]="{ item }">
          {{ item.reason }}
        </template>
        <template #[`item.type`]="{ item }">
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
        <template #[`item.kind`]="{ item }">
          {{ item.involvedObject.kind }}
        </template>
        <template #[`item.firstAt`]="{ item, index }">
          <RealDatetimeTip
            :datetime="item.firstTimestamp || item.eventTime"
            :top="params.size - index <= 5 || (items.length <= 5 && index >= 1)"
          >
            <template #trigger>
              <span>
                {{
                  item.firstTimestamp
                    ? $moment(item.firstTimestamp, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                    : item.eventTime
                    ? $moment(item.eventTime, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                    : ''
                }}
              </span>
            </template>
          </RealDatetimeTip>
        </template>
        <template #[`item.lastAt`]="{ item, index }">
          <RealDatetimeTip
            :datetime="item.lastTimestamp"
            :top="params.size - index <= 5 || (items.length <= 5 && index >= 1)"
          >
            <template #trigger>
              <span>
                {{ item.lastTimestamp ? $moment(item.lastTimestamp, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() : '' }}
              </span>
            </template>
          </RealDatetimeTip>
        </template>
        <template #[`item.message`]="{ item }">
          {{ item.message }}
        </template>
      </v-data-table>
      <BasePagination
        v-if="pageCount >= 1"
        v-model="params.page"
        :page-count="pageCount"
        :size="params.size"
        @changepage="onPageIndexChange"
        @changesize="onPageSizeChange"
        @loaddata="eventList"
      />
    </v-card-text>
  </v-card>
</template>

<script>
  import { getEventList } from '@kubegems/api/direct';
  import RealDatetimeTip from '@kubegems/components/logicComponents/RealDatetimeTip';
  import { EVENT_STATUS_COLOR } from '@kubegems/libs/constants/resource';
  import BaseResource from '@kubegems/mixins/resource';

  import messages from '../i18n';
  import { convertResponse2Pagination } from '@/types/base';

  export default {
    name: 'EventList',
    i18n: {
      messages: messages,
    },
    components: {
      RealDatetimeTip,
    },
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      selector: {
        type: Object,
        default: () => ({}),
      },
    },
    data() {
      this.EVENT_STATUS_COLOR = EVENT_STATUS_COLOR;

      return {
        items: [],
        pageCount: 0,
        params: {
          page: 1,
          size: 10,
          noprocessing: true,
        },
      };
    },
    computed: {
      headers() {
        return [
          { text: 'Reason', value: 'reason', align: 'start' },
          { text: 'Kind', value: 'kind', align: 'start' },
          { text: this.$t('table.first_trigger_at'), value: 'firstAt', align: 'start', width: 120 },
          { text: this.$t('table.last_trigger_at'), value: 'lastAt', align: 'start', width: 120 },
          { text: this.$root.$t('resource.type'), value: 'type', align: 'start' },
          { text: this.$t('table.message'), value: 'message', align: 'start' },
        ];
      },
    },
    watch: {
      item: {
        handler: function () {
          if (this.item) {
            this.eventList();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async eventList() {
        const data = await getEventList(
          this.$route.query.cluster || this.ThisCluster,
          this.$route.query.namespace || '_all',
          Object.assign(this.selector, this.params),
        );
        const pagination = convertResponse2Pagination(data);
        this.items = pagination.items;
        this.pageCount = pagination.pageCount;
        this.params.page = pagination.page;
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
    },
  };
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
